// Cuerpos que el portal manda a la API en licencias y vacaciones. Port de Portal-Austral-Dev:
// useLicenciasStore.solicitudLicencia / aprobarRechazarLicencia, useVacacionesStore.solicitudVacaciones y useAprobarVacacion.
import { aFechaApi } from '../legajo/fechas';
import { ESTADO } from './estados';
import type { ValoresDomicilio } from './validaciones';

export interface DatosSolicitudLicencia {
  tipoId: string;
  desde: Date | null;
  hasta: Date | null;
  comentarios?: string;
  /** Solo en licencias por mudanza. */
  domicilio?: ValoresDomicilio | null;
}

/**
 * Solicitud de licencia. Con certificado "obligatorio pero puede cargarse después" (modo 2) y sin archivos,
 * la licencia nace en "Solicitada. Pendiente Certificado" (statuscode 100000007).
 */
export const armarPayloadLicencia = (
  empleadoId: string,
  datos: DatosSolicitudLicencia,
  certificadoObligatorioModo: number | null,
  cantidadArchivos: number,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    new_empleado: empleadoId,
    new_tipodelicencia: datos.tipoId,
    new_descripcion: datos.comentarios,
    new_fechadesde: datos.desde ? aFechaApi(datos.desde) : '',
    new_fechahasta: datos.hasta ? aFechaApi(datos.hasta) : '',
  };

  const domicilio = datos.domicilio;
  if (domicilio) {
    Object.assign(payload, {
      new_calle: domicilio.calle.trim(),
      // El portal valida un número y manda su toString().
      new_nro: String(Number(domicilio.nroCalle)),
      new_piso: domicilio.piso.trim() || undefined,
      new_depto: domicilio.depto.trim() || undefined,
      new_codigopostal: domicilio.codigoPostal.toUpperCase(),
      new_pais: domicilio.pais?.value,
      new_provincia: domicilio.provincia?.value,
      new_localidad: domicilio.localidad?.value || undefined,
    });
  }

  if (certificadoObligatorioModo === 2 && cantidadArchivos === 0) {
    payload.statuscode = ESTADO.PENDIENTE_CERTIFICADO;
  }
  return payload;
};

/** Solicitud de vacaciones. `hoy` es yyyy-MM-dd; `periodoCuentaId` es el id de la cuenta new_vacaciones del período. */
export const armarPayloadVacaciones = (
  empleadoId: string,
  tipoVacacionesId: string,
  periodoCuentaId: string,
  desde: Date,
  hasta: Date,
  comentarios: string,
  hoy: string,
): Record<string, unknown> => ({
  new_tipodelicencia: tipoVacacionesId,
  new_empleado: empleadoId,
  new_fechadesolicitud: hoy,
  new_fechadesde: aFechaApi(desde),
  new_fechahasta: aFechaApi(hasta),
  new_comentarios: comentarios || '',
  new_vacaciones: periodoCuentaId,
});

/** El líder aprueba o rechaza una licencia. */
export const armarPayloadAprobarLicencia = (
  licenciaId: string,
  idAprobador1: string | null,
  aprobar: boolean,
  motivoRechazo: string,
): Record<string, unknown> => ({
  new_licenciaId: licenciaId,
  new_licenciaprolongada: undefined,
  new_motivoderechazo: motivoRechazo,
  new_aprobador1: idAprobador1,
  new_aprobacionsupervisor: aprobar ? 1 : 0,
});

/** El líder aprueba o rechaza unas vacaciones. */
export const armarPayloadAprobarVacacion = (
  licenciaId: string,
  tipoDeLicenciaId: string | null,
  aprobar: boolean,
  motivoRechazo: string,
): Record<string, unknown> => ({
  new_licenciaId: licenciaId,
  new_tipodelicencia: tipoDeLicenciaId,
  new_aprobacionsupervisor: aprobar ? 1 : 0,
  new_motivoderechazo: motivoRechazo || '',
});
