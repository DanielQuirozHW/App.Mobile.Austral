// Flujos de autenticación. Port de Portal-Austral-Dev -> src/context/AuthContext.tsx
// La navegación NO se hace acá (el portal usa router.replace): el navegador reacciona al estado de authStore.
//
// DIFERENCIAS CONSCIENTES respecto del portal (todas documentadas en docs/DECISIONES.md y PENDIENTES.md):
//  - Microsoft: signInWithRedirect del SDK nativo con OAuthProvider('microsoft.com') en vez de signInWithPopup + provider SAML.
//  - `recordar`: el portal solo guarda userData cifrado en localStorage; la persistencia de sesión es del SDK de Firebase.
//    En la app no hay nada equivalente que guardar: Firebase persiste la sesión por sí mismo.
//  - Recuperar contraseña: sin actionCodeSettings (en el portal la URL de continuación es el origin web + /login).
//  - Se evita enviar `undefined` a Firestore (photoURL/photoPORTADA ausentes se guardan como '').
import {
  OAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from '@react-native-firebase/auth';
import { env } from '../../config/env';
import { detenerRenovacionPeriodica, iniciarRenovacionPeriodica, useTokenStore } from '../../config/api/tokenStore';
import {
  MSG_CUENTA_INEXISTENTE,
  MSG_CUENTA_INEXISTENTE_O_DESHABILITADA,
  MSG_ERROR_TRANSITORIO,
} from '../../domain/auth/authError';
import type { LoginParams, RegisterParams, ResultadoLogin, UserData } from '../../domain/auth/tipos';
import {
  buscarEmpleadoHabilitado,
  buscarEmpleadoParaRegistro,
  buscarEmpleadoParaRevalidar,
  funcionesDesdeTodasLasPosiciones,
  obtenerTokenDeServicio,
  puestoDesdeEmpleado,
  type EmpleadoBO,
  type VarianteConsulta,
} from '../../infrastructure/auth/empleadoApi';
import {
  actualizarUsuario,
  agregarUsuario,
  buscarUsuarioPorUid,
  crearUsuarioConId,
  leerUsuarioPorId,
  referenciaUsuarioPorId,
  type UsuarioDoc,
} from '../../infrastructure/auth/usuariosFirestore';
import { CLAVE_ROL_SELECCIONADO, borrarTexto } from '../../infrastructure/storage/almacenamiento';
import { useAuthStore } from '../../presentation/stores/authStore';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Valida al empleado contra el BO. Cierra la sesión de Firebase SOLO si la cuenta realmente no existe. */
const validarEmpleado = async (email: string, variante: VarianteConsulta) => {
  const token = await obtenerTokenDeServicio();
  const consulta = await buscarEmpleadoHabilitado(email, token, variante);

  if (consulta.tipo === 'inexistente') {
    await signOut(getAuth());
    throw new Error(MSG_CUENTA_INEXISTENTE_O_DESHABILITADA);
  }
  if (consulta.tipo === 'transitorio') throw new Error(MSG_ERROR_TRANSITORIO);

  const empleado = consulta.empleado;
  const funciones = await funcionesDesdeTodasLasPosiciones(empleado.new_empleadoid, token);
  return { empleado, funciones, puesto: puestoDesdeEmpleado(empleado) };
};

const usuarioDesdeDoc = (data: Record<string, any>): UserData => ({
  empleadoid: data.empleadoid,
  usuarioPortalRh: data.usuarioPortalRh,
  photoURL: data.photoURL,
  photoPORTADA: data.photoPORTADA,
  puesto: data.puesto,
  funcionNombramientos: data.funcionNombramientos ?? null,
  funcionPromocion: data.funcionPromocion ?? null,
  uid: data.uid,
  email: data.correoElectronico ?? data.email,
  fullname: data.fullname,
});

// ---------------------------------------------------------------------------
// Login con email y contraseña (handleLogin)
// ---------------------------------------------------------------------------

export const loginConEmail = async ({ email, password }: LoginParams): Promise<ResultadoLogin> => {
  const credencial = await signInWithEmailAndPassword(getAuth(), email, password);
  const { empleado, funciones, puesto } = await validarEmpleado(email, 'email');

  const uid = credencial.user.uid;
  const usuario = await buscarUsuarioPorUid(uid);
  // Igual que el portal: si no hay documento en `usuarios`, no se hace nada más.
  if (!usuario) return { requiereSeleccionDePuesto: false };

  const datos = usuario.data;
  // El nombre sale del BO (fresco), no del documento.
  const fullname = empleado.new_name || datos.fullname;

  await actualizarUsuario(usuario.ref, {
    puesto,
    funcionNombramientos: funciones.nombramientos,
    funcionPromocion: funciones.promocion,
    fullname,
  });

  const roles = Array.isArray(puesto) ? puesto : [puesto];
  const comunes: UserData = {
    empleadoid: datos.empleadoid,
    usuarioPortalRh: datos.usuarioPortalRh,
    photoURL: datos.photoURL,
    photoPORTADA: datos.photoPORTADA,
    puesto: roles,
    funcionNombramientos: funciones.nombramientos,
    funcionPromocion: funciones.promocion,
    uid,
    email: datos.correoElectronico,
    fullname,
  };

  if (roles.length > 1) {
    useAuthStore.getState().setUser({ ...comunes, puesto: roles });
    return { requiereSeleccionDePuesto: true };
  }
  useAuthStore.getState().setUser({ ...comunes, puesto: roles[0] });
  return { requiereSeleccionDePuesto: false };
};

// ---------------------------------------------------------------------------
// Login con cuenta Microsoft @austral (handleLoginSAML)
// ---------------------------------------------------------------------------

/** Error que no debe mostrarse: el usuario canceló el flujo de Microsoft. */
export class LoginCanceladoError extends Error {
  constructor() {
    super('login-cancelado');
  }
}

const MSG_CUENTAS_DISTINTAS =
  'Ya existe una cuenta con diferentes credenciales. Si te registraste con correo y contraseña, debes usar ese metodo.';
const MSG_PROVEEDOR_DESHABILITADO =
  'El ingreso con usuario Austral no está disponible en este entorno. Usá tu correo y contraseña.';
const MSG_ERROR_GENERICO_LOGIN = 'Hubo un error al iniciar sesión, por favor intente más tarde';

const mensajeDeErrorMicrosoft = (error: any): string => {
  if (error?.code === 'auth/account-exists-with-different-credential') return MSG_CUENTAS_DISTINTAS;
  if (error?.code === 'auth/operation-not-allowed') return MSG_PROVEEDOR_DISTINTO_O_DESHABILITADO();
  return MSG_ERROR_GENERICO_LOGIN;
};
// (función auxiliar para mantener el mensaje del portal en un solo lugar)
function MSG_PROVEEDOR_DISTINTO_O_DESHABILITADO(): string {
  return MSG_PROVEEDOR_DESHABILITADO;
}

// Códigos que el portal trata como "el usuario cerró el popup" (no se muestra nada).
// A VERIFICAR: el código que devuelve el SDK nativo al cancelar (ver docs/PENDIENTES.md).
const CODIGOS_CANCELACION = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

export const loginConMicrosoft = async (): Promise<ResultadoLogin> => {
  let usuarioFirebase;
  try {
    const proveedor = new OAuthProvider('microsoft.com');
    if (env.microsoftTenant) proveedor.setCustomParameters({ tenant: env.microsoftTenant });
    const resultado = await signInWithRedirect(getAuth(), proveedor);
    usuarioFirebase = resultado.user;
  } catch (error: any) {
    if (CODIGOS_CANCELACION.includes(error?.code)) throw new LoginCanceladoError();
    throw new Error(mensajeDeErrorMicrosoft(error));
  }

  try {
    const { empleado, funciones, puesto } = await validarEmpleado(usuarioFirebase.email ?? '', 'microsoft');
    const uid = usuarioFirebase.uid;
    const existente = await leerUsuarioPorId(uid);

    const nuevo: UserData = {
      empleadoid: empleado.new_empleadoid ?? '',
      usuarioPortalRh: empleado.new_correoelectronicoportal ?? '',
      fullname: empleado.new_name ?? '',
      photoURL: existente?.data.photoURL ?? '',
      photoPORTADA: existente?.data.photoPORTADA ?? '',
      puesto,
      funcionNombramientos: funciones.nombramientos,
      funcionPromocion: funciones.promocion,
      uid,
      email: empleado.new_correoelectronicoportal ?? '',
    };

    if (existente) await actualizarUsuario(existente.ref, nuevo);
    else await crearUsuarioConId(uid, nuevo);

    useAuthStore.getState().setUser(nuevo);
    return { requiereSeleccionDePuesto: Array.isArray(puesto) && puesto.length > 1 };
  } catch (error: any) {
    // Los errores de validación ya traen su mensaje final; el resto es el genérico del portal.
    const conocido = [MSG_ERROR_TRANSITORIO, MSG_CUENTA_INEXISTENTE_O_DESHABILITADA];
    if (conocido.includes(error?.message)) throw error;
    throw new Error('Hubo un error al iniciar sesión, por favor intente más tarde');
  }
};

// ---------------------------------------------------------------------------
// Registro (handleRegister)
// ---------------------------------------------------------------------------

export const registrar = async ({ email, password }: RegisterParams): Promise<void> => {
  // El portal usa el token ya cargado al arrancar; acá se asegura (single-flight, no duplica el POST).
  await useTokenStore.getState().loginToken();
  const token = useTokenStore.getState().token?.token ?? '';

  const datos = await buscarEmpleadoParaRegistro(email, token);
  if (!datos) throw new Error(MSG_CUENTA_INEXISTENTE);

  const credencial = await createUserWithEmailAndPassword(getAuth(), email, password);
  const uid = credencial.user.uid;

  await agregarUsuario({
    correoElectronico: email,
    empleadoid: datos.new_empleadoid,
    fullname: datos.new_name,
    ownerid: datos._ownerid_value,
    uid,
    usuarioPortalRh: email,
    puesto: datos._new_puesto_value ?? '',
    photoURL: '',
    photoPORTADA: '',
  });

  // La escucha de sesión se dispara al crear la cuenta, antes de que exista el documento: se recarga el usuario.
  const usuario = await buscarUsuarioPorUid(uid);
  if (usuario) useAuthStore.getState().setUser(usuarioDesdeDoc(usuario.data));
};

// ---------------------------------------------------------------------------
// Recuperar contraseña (handleForgotPassword)
// ---------------------------------------------------------------------------

export const recuperarContrasena = async (email: string): Promise<void> => {
  // Se normaliza el correo: con la protección de enumeración activa, un correo mal escrito no lanza error y el mail nunca llega.
  const correo = email.trim().toLowerCase();
  await sendPasswordResetEmail(getAuth(), correo);
};

// ---------------------------------------------------------------------------
// Cierre de sesión (handleLogout)
// ---------------------------------------------------------------------------

export const cerrarSesion = async (): Promise<void> => {
  const store = useAuthStore.getState();
  store.setCerrandoSesion(true);
  try {
    await signOut(getAuth());
    store.setUser(null);
    await borrarTexto(CLAVE_ROL_SELECCIONADO);
    setTimeout(() => useAuthStore.getState().setCerrandoSesion(false), 1500);
  } catch (error) {
    store.setCerrandoSesion(false);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Escucha de sesión + revalidación del puesto (useEffect de AuthProvider)
// ---------------------------------------------------------------------------

// Revalida el puesto contra el CRM SIN bloquear el render inicial: el usuario ya se mostró con lo guardado
// en Firestore y acá solo se corrige si el CRM devuelve algo distinto.
const revalidarPuestoEnBackground = async (ref: UsuarioDoc['ref'], correo: string): Promise<void> => {
  try {
    await useTokenStore.getState().loginToken();
    const token = useTokenStore.getState().token?.token;
    if (!token) return;

    const empleado: EmpleadoBO | null = await buscarEmpleadoParaRevalidar(correo, token);
    if (!empleado) return;

    const funciones = await funcionesDesdeTodasLasPosiciones(empleado.new_empleadoid, token);
    const puesto = puestoDesdeEmpleado(empleado);
    // La identidad sale del BO (fuente de verdad); el documento de Firestore la cachea y puede quedar viejo.
    const nombreActual = empleado.new_name || null;
    const empleadoidBO = empleado.new_empleadoid || null;
    const correoPortalBO = empleado.new_correoelectronicoportal || null;

    useAuthStore.getState().setUser((prev) => {
      if (
        !prev ||
        (JSON.stringify(prev.puesto) === JSON.stringify(puesto) &&
          JSON.stringify(prev.funcionNombramientos ?? []) === JSON.stringify(funciones.nombramientos) &&
          JSON.stringify(prev.funcionPromocion ?? []) === JSON.stringify(funciones.promocion) &&
          (!nombreActual || prev.fullname === nombreActual) &&
          (!empleadoidBO || prev.empleadoid === empleadoidBO) &&
          (!correoPortalBO || prev.usuarioPortalRh === correoPortalBO))
      ) {
        return prev;
      }
      return {
        ...prev,
        puesto,
        funcionNombramientos: funciones.nombramientos,
        funcionPromocion: funciones.promocion,
        ...(nombreActual ? { fullname: nombreActual } : {}),
        ...(empleadoidBO ? { empleadoid: empleadoidBO } : {}),
        ...(correoPortalBO ? { usuarioPortalRh: correoPortalBO } : {}),
      };
    });

    await actualizarUsuario(ref, {
      puesto,
      funcionNombramientos: funciones.nombramientos,
      funcionPromocion: funciones.promocion,
      ...(nombreActual ? { fullname: nombreActual } : {}),
      ...(empleadoidBO ? { empleadoid: empleadoidBO } : {}),
      ...(correoPortalBO ? { usuarioPortalRh: correoPortalBO } : {}),
    });
  } catch {
    // Si falla el CRM se usa el puesto guardado en Firestore.
  }
};

/**
 * Escucha el estado de Firebase Auth. Devuelve la función para dejar de escuchar.
 * Se llama una sola vez al arrancar la app (ver AppProviders).
 */
export const escucharSesion = (): (() => void) => {
  // El portal pide el token de servicio al montar el provider.
  void useTokenStore.getState().loginToken();

  const cancelar = onAuthStateChanged(getAuth(), async (usuarioFirebase) => {
    const store = useAuthStore.getState();
    if (usuarioFirebase) {
      try {
        const usuario = await buscarUsuarioPorUid(usuarioFirebase.uid);
        if (usuario) {
          store.setUser(usuarioDesdeDoc(usuario.data));
          void revalidarPuestoEnBackground(usuario.ref, usuario.data.correoElectronico);
        }
      } catch {
        // Sin documento legible el usuario queda sin cargar; no debe quedar la app en "cargando" para siempre.
      }
      void useTokenStore.getState().loginToken();
      iniciarRenovacionPeriodica();
    } else {
      store.setUser(null);
      useTokenStore.getState().limpiar();
      detenerRenovacionPeriodica();
    }
    useAuthStore.getState().setLoading(false);
  });

  return () => {
    cancelar();
    detenerRenovacionPeriodica();
  };
};

export { referenciaUsuarioPorId };
