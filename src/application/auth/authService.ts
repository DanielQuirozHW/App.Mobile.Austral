// Flujos de autenticación. Port de Portal-Austral-Dev -> src/context/AuthContext.tsx
// La navegación NO se hace acá (el portal usa router.replace): el navegador reacciona al estado de authStore.
//
// NO están el registro ni la recuperación de contraseña: las cuentas con usuario y contraseña las crea Austral
// directamente desde Firebase (decisión 36).
//
// DIFERENCIAS CONSCIENTES respecto del portal (documentadas en docs/DECISIONES.md y PENDIENTES.md):
//  - Microsoft: signInWithRedirect del SDK nativo con OAuthProvider('microsoft.com') en vez de signInWithPopup + provider SAML.
//  - `recordar`: el portal solo guarda userData cifrado en localStorage; la persistencia de sesión es del SDK de Firebase.
//    En la app no hay nada equivalente que guardar: Firebase persiste la sesión por sí mismo.
//  - Se evita enviar `undefined` a Firestore (photoURL/photoPORTADA ausentes se guardan como '').
//  - Mientras corre un login la escucha de sesión NO publica el usuario (ver `autenticando`).
//    En el portal esa carrera lo mandaba a la pantalla principal antes de validar al empleado en el BO.
//  - Al cerrar (o perder) la sesión se vacían los datos del legajo, la familia, los catálogos, los de licencias y
//    vacaciones (propios y del equipo) y los de Perfil (formación, trayectoria, extensión, gestión académica, docencia,
//    afiliaciones, actividad I+D y proyectos) que quedan en memoria.
import {
  OAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from '@react-native-firebase/auth';
import { env } from '../../config/env';
import { detenerRenovacionPeriodica, iniciarRenovacionPeriodica, useTokenStore } from '../../config/api/tokenStore';
import { MSG_CUENTA_INEXISTENTE_O_DESHABILITADA, MSG_ERROR_TRANSITORIO } from '../../domain/auth/authError';
import type { LoginParams, ResultadoLogin, UserData } from '../../domain/auth/tipos';
import {
  buscarEmpleadoHabilitado,
  buscarEmpleadoParaRevalidar,
  funcionesDesdeTodasLasPosiciones,
  obtenerTokenDeServicio,
  puestoDesdeEmpleado,
  type EmpleadoBO,
  type VarianteConsulta,
} from '../../infrastructure/auth/empleadoApi';
import {
  actualizarUsuario,
  buscarUsuarioPorUid,
  crearUsuarioConId,
  leerUsuarioPorId,
  type UsuarioDoc,
} from '../../infrastructure/auth/usuariosFirestore';
import { CLAVE_ROL_SELECCIONADO, borrarTexto } from '../../infrastructure/storage/almacenamiento';
import { useActividadStore } from '../../presentation/stores/actividadStore';
import { useAfiliacionesStore } from '../../presentation/stores/afiliacionesStore';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useCatalogosStore } from '../../presentation/stores/catalogosStore';
import { useDocenciaStore } from '../../presentation/stores/docenciaStore';
import { useEquipoStore } from '../../presentation/stores/equipoStore';
import { useExtensionStore } from '../../presentation/stores/extensionStore';
import { useFamiliaStore } from '../../presentation/stores/familiaStore';
import { useFormacionStore } from '../../presentation/stores/formacionStore';
import { useGestionAcademicaStore } from '../../presentation/stores/gestionAcademicaStore';
import { useLegajoStore } from '../../presentation/stores/legajoStore';
import { useLicenciasStore } from '../../presentation/stores/licenciasStore';
import { useProyectosStore } from '../../presentation/stores/proyectosStore';
import { useRolStore } from '../../presentation/stores/rolStore';
import { useTrayectoriaStore } from '../../presentation/stores/trayectoriaStore';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

// true mientras corre un login. La escucha de sesión no publica el usuario en ese lapso:
// lo publica el propio flujo cuando terminó de validar (o no lo publica si la validación falla).
let autenticando = false;

const conAutenticacion = async <T>(accion: () => Promise<T>): Promise<T> => {
  autenticando = true;
  try {
    return await accion();
  } finally {
    autenticando = false;
  }
};

/** Datos del empleado en memoria: no deben verse en la sesión de otra persona. */
const reiniciarDatosDelEmpleado = (): void => {
  useLegajoStore.getState().reiniciar();
  useFamiliaStore.getState().reiniciar();
  useCatalogosStore.getState().reiniciar();
  useLicenciasStore.getState().reiniciar();
  useEquipoStore.getState().reiniciar();
  // Perfil
  useFormacionStore.getState().reiniciar();
  useTrayectoriaStore.getState().reiniciar();
  useExtensionStore.getState().reiniciar();
  useGestionAcademicaStore.getState().reiniciar();
  useDocenciaStore.getState().reiniciar();
  useAfiliacionesStore.getState().reiniciar();
  useActividadStore.getState().reiniciar();
  useProyectosStore.getState().reiniciar();
};

/** Publica el usuario. Si tiene dos puestos, marca la selección pendiente ANTES, para que no se vea la pantalla de inicio. */
const publicarUsuario = (user: UserData, puestos: string | string[]): ResultadoLogin => {
  const variosPuestos = Array.isArray(puestos) && puestos.length > 1;
  if (variosPuestos) useRolStore.getState().marcarSeleccionPendiente();
  useAuthStore.getState().setUser(user);
  return { requiereSeleccionDePuesto: variosPuestos };
};

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

export const loginConEmail = ({ email, password }: LoginParams): Promise<ResultadoLogin> =>
  conAutenticacion(async () => {
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

    // Dos puestos: array. Uno solo: el valor suelto (como el portal).
    if (roles.length > 1) return publicarUsuario({ ...comunes, puesto: roles }, roles);
    return publicarUsuario({ ...comunes, puesto: roles[0] }, roles[0]);
  });

// ---------------------------------------------------------------------------
// Login con cuenta Microsoft @austral (handleLoginSAML)
// ---------------------------------------------------------------------------

/** Error que no debe mostrarse: el usuario canceló el flujo de Microsoft. */
export class LoginCanceladoError extends Error {
  constructor() {
    super('login-cancelado');
  }
}

// Textos de handleError del portal.
const MSG_CUENTAS_DISTINTAS =
  'Ya existe una cuenta con diferentes credenciales. Si te registraste con correo y contraseña, debes usar ese metodo.';
const MSG_PROVEEDOR_DESHABILITADO =
  'El ingreso con usuario Austral no está disponible en este entorno. Usá tu correo y contraseña.';
const MSG_ERROR_GENERICO_LOGIN = 'Hubo un error al iniciar sesión, por favor intente más tarde';

const mensajeDeErrorMicrosoft = (error: any): string => {
  if (error?.code === 'auth/account-exists-with-different-credential') return MSG_CUENTAS_DISTINTAS;
  if (error?.code === 'auth/operation-not-allowed') return MSG_PROVEEDOR_DESHABILITADO;
  return MSG_ERROR_GENERICO_LOGIN;
};

// Códigos que el portal trata como "el usuario cerró el popup" (no se muestra nada).
// A VERIFICAR: el código que devuelve el SDK nativo al cancelar (ver docs/PENDIENTES.md).
const CODIGOS_CANCELACION = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

export const loginConMicrosoft = (): Promise<ResultadoLogin> =>
  conAutenticacion(async () => {
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

      return publicarUsuario(nuevo, puesto);
    } catch (error: any) {
      // Los errores de validación ya traen su mensaje final; el resto es el genérico del portal.
      const conocidos = [MSG_ERROR_TRANSITORIO, MSG_CUENTA_INEXISTENTE_O_DESHABILITADA];
      if (conocidos.includes(error?.message)) throw error;
      throw new Error(MSG_ERROR_GENERICO_LOGIN);
    }
  });

// ---------------------------------------------------------------------------
// Cierre de sesión (handleLogout)
// ---------------------------------------------------------------------------

export const cerrarSesion = async (): Promise<void> => {
  const store = useAuthStore.getState();
  store.setCerrandoSesion(true);
  try {
    await signOut(getAuth());
    store.setUser(null);
    reiniciarDatosDelEmpleado();
    useRolStore.getState().reiniciar();
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
 * Se llama una sola vez al arrancar la app (ver RootNavigator).
 */
export const escucharSesion = (): (() => void) => {
  // El portal pide el token de servicio al montar el provider.
  void useTokenStore.getState().loginToken();

  const cancelar = onAuthStateChanged(getAuth(), async (usuarioFirebase) => {
    const store = useAuthStore.getState();
    if (usuarioFirebase) {
      try {
        const usuario = await buscarUsuarioPorUid(usuarioFirebase.uid);
        // Si hay un login en curso, el usuario lo publica el propio flujo (ver `autenticando`).
        if (usuario && !autenticando) {
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
      reiniciarDatosDelEmpleado();
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
