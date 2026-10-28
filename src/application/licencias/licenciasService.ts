// Acciones del módulo Licencias y vacaciones: cada una hace la llamada, muestra los avisos del portal y refresca los stores.
// Port de Portal-Austral-Dev -> useNuevaLicencia, useLicenciasStore.solicitudLicencia / aprobarRechazarLicencia,
// useSolicitudesStore.cargarAdjuntoSolicitud, ModalLicencias.enviarCertificado, useCancelarLicencia,
// useCancelarVacacion, useSolicitarVacaciones y useAprobarVacacion.
//
// Todas devuelven true si la acción se completó (para que la pantalla cierre el modal) y false si no.
//
// DIFERENCIAS CONSCIENTES respecto del portal (ver docs/DECISIONES.md):
//  - Certificado: el portal, si la carga del archivo falla, igual llama a marcaradjuntocargado (porque cargarAdjuntoSolicitud
//    no relanza el error). Acá solo se marca el adjunto como cargado si el archivo se cargó.
//  - Cancelar una vacación también refresca la lista de solicitudes (el portal solo refresca los períodos y el calendario).
//  - Cancelar una licencia: el portal no muestra aviso de éxito y, si falla, muestra lo que devuelva la API (sin texto
//    por defecto). Acá, si la API no devuelve texto, se muestra MSG_ERROR_CANCELAR.
import { mensajeDeErrorApi } from '../../config/api/apiError';
import { ESTADO, puedeAdjuntarCertificado } from '../../domain/licencias/estados';
import { hoyCrm } from '../../domain/licencias/fechasCrm';
import type { DatosSolicitudLicencia } from '../../domain/licencias/payload';
import type { Licencia, PeriodoVacaciones, SolicitudDeEquipo, TipoDeLicencia } from '../../domain/licencias/tipos';
import { MSG_ARCHIVO_MUY_PESADO, hayArchivoQueSupera } from '../../domain/licencias/validaciones';
import type { ArchivoElegido } from '../../infrastructure/archivos/seleccionArchivos';
import { aprobarRechazarVacacion as apiAprobarRechazarVacacion } from '../../infrastructure/licencias/equipoApi';
import {
  aprobarRechazarLicencia as apiAprobarRechazarLicencia,
  cancelarSolicitud,
  cargarAdjuntosDeSolicitud,
  marcarAdjuntoCargadoLicencia,
  solicitarLicencia as apiSolicitarLicencia,
} from '../../infrastructure/licencias/licenciasApi';
import { solicitarVacaciones as apiSolicitarVacaciones } from '../../infrastructure/licencias/vacacionesApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useEquipoStore } from '../../presentation/stores/equipoStore';
import { useLicenciasStore } from '../../presentation/stores/licenciasStore';
import { toast } from '../../presentation/utils/toast';

export const MSG_DATOS_FALTANTES = 'Datos o token faltantes';
export const MSG_ERROR_CANCELAR = 'No se pudo cancelar la solicitud';
export const MSG_SIN_TIPO_VACACIONES = 'No se pudo obtener el tipo de licencia de vacaciones';

const DURACION_AVISO_MS = 2500;
const DURACION_AVISO_ERROR_MS = 3500;

const empleadoActual = (): string | null => useAuthStore.getState().user?.empleadoid || null;

// ---------------------------------------------------------------------------
// Carga de datos
// ---------------------------------------------------------------------------

/** Todo lo que necesita la pantalla del módulo (tipos, licencias, vacaciones, calendario y feriados). */
export const cargarModulo = async (): Promise<void> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) return;
  const s = useLicenciasStore.getState();
  await Promise.all([
    s.cargarTipos(empleadoId),
    s.cargarLicencias(empleadoId),
    s.cargarPeriodos(empleadoId),
    s.cargarVacaciones(empleadoId),
    s.cargarCalendario(empleadoId),
    s.cargarFeriados(),
  ]);
};

/** Si el empleado es líder y, de serlo, su bandeja (licencias, vacaciones y días pendientes del equipo). */
export const cargarGestionDelLider = async (): Promise<void> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) return;
  const e = useEquipoStore.getState();
  await e.cargarEsLider(empleadoId);
  if (!useEquipoStore.getState().esLider.datos) return;
  await Promise.all([e.cargarLicencias(empleadoId), e.cargarVacaciones(empleadoId), e.cargarPendientes(empleadoId)]);
};

const refrescarLicenciasYCalendario = async (): Promise<void> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) return;
  const s = useLicenciasStore.getState();
  await Promise.all([s.cargarLicencias(empleadoId), s.cargarCalendario(empleadoId)]);
};

const refrescarCalendario = async (): Promise<void> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) return;
  await useLicenciasStore.getState().cargarCalendario(empleadoId);
};

// ---------------------------------------------------------------------------
// Adjuntos (cargarAdjuntoSolicitud del portal)
// ---------------------------------------------------------------------------

/** Sube los archivos con los avisos del portal. Devuelve true si se cargaron. */
const subirAdjuntos = async (licenciaId: string, archivos: ArchivoElegido[]): Promise<boolean> => {
  const idAviso = toast.loading('Cargando adjunto...');
  try {
    // Solo uri, name y type viajan en el multipart; el peso es dato local.
    await cargarAdjuntosDeSolicitud(
      'licencia_id',
      licenciaId,
      archivos.map((a) => ({ uri: a.uri, name: a.name, type: a.type })),
    );
    toast.dismiss(idAviso);
    toast.success('Archivo adjunto cargado con éxito', DURACION_AVISO_MS);
    return true;
  } catch (error) {
    toast.dismiss(idAviso);
    toast.error(mensajeDeErrorApi(error, 'Error al cargar archivo'), DURACION_AVISO_MS);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Mis licencias
// ---------------------------------------------------------------------------

const mensajeDeCreacion = (error: unknown): string => {
  const e = error as { response?: { data?: any }; message?: string } | null;
  const data = e?.response?.data;
  const candidatos = [data?.message, data?.error, data, e?.message];
  const texto = candidatos.find((c) => typeof c === 'string' && c.trim() !== '');
  return texto ?? 'Error al crear la licencia';
};

/** Solicita una licencia (useNuevaLicencia + solicitudLicencia). `archivos` son los certificados elegidos. */
export const solicitarLicencia = async (
  datos: DatosSolicitudLicencia,
  tipo: TipoDeLicencia,
  archivos: ArchivoElegido[],
): Promise<boolean> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) {
    toast.error(MSG_DATOS_FALTANTES, DURACION_AVISO_MS);
    return false;
  }
  const idAviso = toast.loading('Procesando...');
  let licenciaId = '';
  try {
    licenciaId = await apiSolicitarLicencia(empleadoId, datos, tipo.certificadoObligatorio, archivos.length);
    toast.dismiss(idAviso);
    toast.success('Licencia creada con éxito', DURACION_AVISO_MS);
  } catch (error) {
    toast.dismiss(idAviso);
    toast.error(mensajeDeCreacion(error), DURACION_AVISO_MS);
    return false;
  }

  if (archivos.length > 0 && licenciaId.length > 0) await subirAdjuntos(licenciaId, archivos);
  await refrescarLicenciasYCalendario();
  return true;
};

/**
 * Envía el certificado de una licencia propia (ModalLicencias.enviarCertificado).
 * Estado 100000007: sube el archivo y marca el adjunto como cargado (la licencia vuelve a Solicitada).
 * Estado 100000008: solo sube el archivo; marcar el adjunto la volvería a Solicitada y le borraría la aprobación.
 * Estados 1 y 100000006: solo sube el archivo.
 */
export const enviarCertificado = async (licencia: Licencia, archivos: ArchivoElegido[]): Promise<boolean> => {
  if (!puedeAdjuntarCertificado(licencia.estado)) return false;
  if (archivos.length === 0) {
    toast.error('El archivo adjunto es requerido!');
    return false;
  }
  if (hayArchivoQueSupera(archivos)) {
    toast.error(MSG_ARCHIVO_MUY_PESADO, DURACION_AVISO_MS);
    return false;
  }

  const cargado = await subirAdjuntos(licencia.id, archivos);
  if (!cargado) return false;

  if (licencia.estado === ESTADO.PENDIENTE_CERTIFICADO) {
    try {
      await marcarAdjuntoCargadoLicencia(licencia.id);
    } catch {
      // El archivo ya se subió. El portal tampoco muestra aviso si esta llamada falla.
    }
    await refrescarLicenciasYCalendario();
  } else if (licencia.estado === ESTADO.VALIDADA_DOC_PENDIENTE) {
    // Relee la lista por si el BO cambió el estado al recibir el archivo.
    await refrescarLicenciasYCalendario();
  } else {
    await refrescarCalendario();
  }
  return true;
};

/** Cancela una licencia propia (useCancelarLicencia). Sin aviso de éxito, como el portal. */
export const cancelarLicencia = async (licenciaId: string): Promise<boolean> => {
  const idAviso = toast.loading('Procesando...');
  try {
    await cancelarSolicitud(licenciaId);
  } catch (error) {
    toast.dismiss(idAviso);
    toast.error(mensajeDeErrorApi(error, MSG_ERROR_CANCELAR), DURACION_AVISO_MS);
    return false;
  }
  toast.dismiss(idAviso);
  await refrescarLicenciasYCalendario();
  return true;
};

// ---------------------------------------------------------------------------
// Mis vacaciones
// ---------------------------------------------------------------------------

export interface DatosSolicitudVacaciones {
  desde: Date;
  hasta: Date;
  comentarios: string;
}

/** Solicita vacaciones sobre un período (useSolicitarVacaciones). */
export const solicitarVacaciones = async (
  periodo: PeriodoVacaciones,
  datos: DatosSolicitudVacaciones,
): Promise<boolean> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) {
    toast.error(MSG_DATOS_FALTANTES, DURACION_AVISO_MS);
    return false;
  }

  // El tipo de vacaciones sale de la lista de tipos; si todavía no se leyó, se lee ahora.
  let tipoId = useLicenciasStore.getState().tipos.datos.tipoVacacionesId;
  if (!tipoId) {
    await useLicenciasStore.getState().cargarTipos(empleadoId);
    tipoId = useLicenciasStore.getState().tipos.datos.tipoVacacionesId;
  }
  if (!tipoId) {
    toast.error(MSG_SIN_TIPO_VACACIONES, DURACION_AVISO_ERROR_MS);
    return false;
  }

  const idAviso = toast.loading('Procesando...');
  try {
    await apiSolicitarVacaciones(empleadoId, tipoId, periodo.id, datos.desde, datos.hasta, datos.comentarios, hoyCrm());
  } catch (error) {
    toast.dismiss(idAviso);
    toast.error(mensajeDeErrorApi(error, 'No se pudo cargar la solicitud'), DURACION_AVISO_ERROR_MS);
    return false;
  }
  toast.dismiss(idAviso);
  toast.success('Solicitud cargada con éxito', DURACION_AVISO_MS);

  const s = useLicenciasStore.getState();
  await Promise.all([s.cargarPeriodos(empleadoId), s.cargarVacaciones(empleadoId), s.cargarCalendario(empleadoId)]);
  return true;
};

/** Cancela una solicitud de vacaciones propia (useCancelarVacacion). */
export const cancelarVacacion = async (solicitudId: string): Promise<boolean> => {
  const empleadoId = empleadoActual();
  const idAviso = toast.loading('Procesando...');
  try {
    await cancelarSolicitud(solicitudId);
  } catch (error) {
    toast.dismiss(idAviso);
    toast.error(mensajeDeErrorApi(error, MSG_ERROR_CANCELAR), DURACION_AVISO_MS);
    return false;
  }
  toast.dismiss(idAviso);
  toast.success('Solicitud cancelada con éxito', DURACION_AVISO_MS);

  if (empleadoId) {
    const s = useLicenciasStore.getState();
    await Promise.all([s.cargarPeriodos(empleadoId), s.cargarVacaciones(empleadoId), s.cargarCalendario(empleadoId)]);
  }
  return true;
};

// ---------------------------------------------------------------------------
// Gestión del líder
// ---------------------------------------------------------------------------

/**
 * Aprueba o rechaza una licencia del equipo (useLicenciasStore.aprobarRechazarLicencia).
 * El motivo de rechazo viaja con trim; al aprobar viaja vacío.
 */
export const responderLicencia = async (
  licencia: Licencia,
  aprobar: boolean,
  motivoRechazo: string,
): Promise<boolean> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) {
    toast.error(MSG_DATOS_FALTANTES, DURACION_AVISO_MS);
    return false;
  }
  const idAviso = toast.loading('Procesando...');
  try {
    await apiAprobarRechazarLicencia(licencia.id, licencia.idAprobador1, aprobar, aprobar ? '' : motivoRechazo.trim());
  } catch (error) {
    toast.dismiss(idAviso);
    toast.error(mensajeDeErrorApi(error, 'No se pudo procesar la licencia'));
    return false;
  }
  toast.dismiss(idAviso);
  toast.success(aprobar ? 'Licencia aprobada con éxito' : 'Licencia rechazada con éxito');

  await Promise.all([
    useEquipoStore.getState().cargarLicencias(empleadoId),
    useLicenciasStore.getState().cargarCalendario(empleadoId),
  ]);
  return true;
};

/** Aprueba o rechaza unas vacaciones del equipo (useAprobarVacacion). */
export const responderVacacion = async (
  solicitud: SolicitudDeEquipo,
  aprobar: boolean,
  motivoRechazo: string,
): Promise<boolean> => {
  const empleadoId = empleadoActual();
  if (!empleadoId) {
    toast.error(MSG_DATOS_FALTANTES, DURACION_AVISO_MS);
    return false;
  }
  const idAviso = toast.loading('Procesando...');
  try {
    await apiAprobarRechazarVacacion(solicitud.id, solicitud.tipoDeLicencia.value, aprobar, aprobar ? '' : motivoRechazo);
  } catch (error) {
    toast.dismiss(idAviso);
    toast.error(mensajeDeErrorApi(error, 'No se pudo procesar la solicitud'), DURACION_AVISO_ERROR_MS);
    return false;
  }
  toast.dismiss(idAviso);
  toast.success(aprobar ? 'Solicitud aprobada' : 'Solicitud rechazada', DURACION_AVISO_MS);

  await Promise.all([
    useEquipoStore.getState().cargarVacaciones(empleadoId),
    useLicenciasStore.getState().cargarCalendario(empleadoId),
  ]);
  return true;
};
