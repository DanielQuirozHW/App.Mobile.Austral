// Flujos de Datos personales que combinan varias llamadas. El orden de las llamadas es el del portal:
//  - guardar legajo: Portal-Austral-Dev -> datos-personales/page.tsx (guardarLegajo)
//  - cónyuge: ModalConyuge.tsx; hijos/as: ModalHijos.tsx; bajas: columnsConyuge.tsx / columnsHijos.tsx
//  - adjuntos: useEnviarArchivos.ts + useAdjuntosHandler.ts
// Las notificaciones (toasts) las muestra la pantalla; acá se devuelve el resultado o se lanza el error.
import { mapearAdjunto } from '../../domain/legajo/mapeo';
import type { FormularioDatosPersonales } from '../../domain/legajo/formulario';
import type { DatosFamiliar } from '../../domain/legajo/payload';
import type { Adjunto } from '../../domain/legajo/tipos';
import {
  actualizarFamiliar,
  cargarAdjuntosDeDocumento,
  crearFamiliar,
  eliminarFamiliar,
  leerAdjuntosDeDocumento,
  type ArchivoParaCarga,
} from '../../infrastructure/legajo/familiaresApi';
import { actualizarLegajo } from '../../infrastructure/legajo/legajoApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useFamiliaStore } from '../../presentation/stores/familiaStore';
import { useLegajoStore } from '../../presentation/stores/legajoStore';

/** El portal espera 5 s antes de pedir la documentación de un familiar recién creado (el CRM la genera luego). */
const DEMORA_DOCUMENTACION_NUEVA_MS = 5000;
/** Y 500 ms después de una baja. */
const DEMORA_TRAS_BAJA_MS = 500;

const pausa = (ms: number) => new Promise<void>((resolver) => setTimeout(resolver, ms));

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

// ---------------------------------------------------------------------------
// Lecturas
// ---------------------------------------------------------------------------

export const cargarLegajo = (): Promise<void> => useLegajoStore.getState().cargar(empleadoIdActual());

export const cargarFamilia = (): Promise<void> => useFamiliaStore.getState().cargarFamiliares(empleadoIdActual());

export const cargarDocumentosFamiliares = (): Promise<void> =>
  useFamiliaStore.getState().cargarDocumentos(empleadoIdActual());

/** Lo que lee la pantalla al abrirse: legajo, familiares y documentación. */
export const cargarDatosPersonales = async (): Promise<void> => {
  const id = empleadoIdActual();
  await Promise.all([
    useLegajoStore.getState().cargar(id),
    useFamiliaStore.getState().cargarFamiliares(id),
    useFamiliaStore.getState().cargarDocumentos(id),
  ]);
};

const programarRecargaDeDocumentos = (): void => {
  setTimeout(() => {
    void cargarDocumentosFamiliares();
  }, DEMORA_DOCUMENTACION_NUEVA_MS);
};

/**
 * Archivos de un documento de familiar, con su contenido en base64 (para abrirlos). A diferencia del portal, que
 * trae el contenido de todos los adjuntos al cargar la pantalla, acá se pide solo al abrir "Ver adjuntos".
 */
export const obtenerAdjuntosDeDocumento = async (documentacionId: string): Promise<Adjunto[]> => {
  const filas = await leerAdjuntosDeDocumento(empleadoIdActual(), documentacionId);
  return Array.isArray(filas) ? filas.map(mapearAdjunto) : [];
};

// ---------------------------------------------------------------------------
// Legajo
// ---------------------------------------------------------------------------

/**
 * Guarda el legajo. Si viene `eliminarConyugeId` (el usuario confirmó la baja por cambio de estado civil), primero
 * se elimina al cónyuge y después se guarda el legajo, igual que el portal.
 * Devuelve false si la API respondió sin cuerpo (el portal lo trata como "Hubo un error al actualizar los datos
 * del legajo"); lanza si la llamada falló.
 */
export const guardarDatosPersonales = async (
  datos: FormularioDatosPersonales,
  eliminarConyugeId?: string,
): Promise<boolean> => {
  const id = empleadoIdActual();
  if (eliminarConyugeId) await eliminarFamiliar(eliminarConyugeId);

  const resultado = await actualizarLegajo(id, datos);
  if (!resultado) return false;

  await Promise.all([useLegajoStore.getState().cargar(id), useFamiliaStore.getState().cargarFamiliares(id)]);
  return true;
};

// ---------------------------------------------------------------------------
// Cónyuge
// ---------------------------------------------------------------------------

/**
 * Alta del cónyuge. Si el modal se abrió desde el formulario (estado civil sin guardar), `legajoPrevio` trae los
 * datos del formulario: el portal primero guarda el legajo con el nuevo estado civil (ignorando sus errores) y
 * después crea al cónyuge. Devuelve true si el alta tuvo cuerpo de respuesta.
 */
export const crearConyuge = async (
  conyuge: DatosFamiliar,
  legajoPrevio?: FormularioDatosPersonales,
): Promise<boolean> => {
  const id = empleadoIdActual();
  if (legajoPrevio) {
    try {
      await actualizarLegajo(id, legajoPrevio);
    } catch {
      // El portal ignora el error de este paso.
    }
  }
  const resultado = await crearFamiliar(id, conyuge);
  if (!resultado) return false;
  await useFamiliaStore.getState().cargarFamiliares(id);
  programarRecargaDeDocumentos();
  return true;
};

/** Edición del cónyuge: PUT, luego familiares y legajo en paralelo, luego documentos. */
export const actualizarConyuge = async (conyuge: DatosFamiliar): Promise<boolean> => {
  const id = empleadoIdActual();
  const resultado = await actualizarFamiliar(id, conyuge);
  if (!resultado) return false;
  await Promise.all([useFamiliaStore.getState().cargarFamiliares(id), useLegajoStore.getState().cargar(id)]);
  await useFamiliaStore.getState().cargarDocumentos(id);
  return true;
};

// ---------------------------------------------------------------------------
// Hijos/as
// ---------------------------------------------------------------------------

export const crearHijo = async (hijo: DatosFamiliar): Promise<boolean> => {
  const id = empleadoIdActual();
  const resultado = await crearFamiliar(id, hijo);
  if (!resultado) return false;
  await useFamiliaStore.getState().cargarFamiliares(id);
  programarRecargaDeDocumentos();
  return true;
};

export const actualizarHijo = async (hijo: DatosFamiliar): Promise<boolean> => {
  const id = empleadoIdActual();
  const resultado = await actualizarFamiliar(id, hijo);
  if (!resultado) return false;
  await useFamiliaStore.getState().cargarFamiliares(id);
  await useFamiliaStore.getState().cargarDocumentos(id);
  return true;
};

// ---------------------------------------------------------------------------
// Baja de un familiar (cónyuge o hijo/a) desde la lista
// ---------------------------------------------------------------------------

export const eliminarFamiliarDeLista = async (familiarId: string): Promise<void> => {
  const id = empleadoIdActual();
  await eliminarFamiliar(familiarId);
  await useFamiliaStore.getState().cargarFamiliares(id);
  await pausa(DEMORA_TRAS_BAJA_MS);
  await useFamiliaStore.getState().cargarDocumentos(id);
};

// ---------------------------------------------------------------------------
// Adjuntos
// ---------------------------------------------------------------------------

/**
 * Sube archivos a un documento de familiar. Marca el check temporal antes de subir (como el portal) y, si la
 * respuesta viene vacía, lo trata como error. Después recarga la documentación.
 */
export const subirAdjuntosDeFamiliar = async (
  documentacionId: string,
  archivos: ArchivoParaCarga[],
): Promise<void> => {
  const id = empleadoIdActual();
  useFamiliaStore.getState().marcarCheckTemporal(documentacionId);
  const resultado = await cargarAdjuntosDeDocumento(documentacionId, archivos);
  if (!resultado) throw new Error('Error al cargar adjunto');
  await useFamiliaStore.getState().cargarDocumentos(id);
};
