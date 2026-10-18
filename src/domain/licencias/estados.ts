// Estados (statuscode) de new_licencia y su agrupación en pestañas.
// Port de Portal-Austral-Dev: etiquetaEstadoLicencia / getEstadoVacacion (src/columns), licencias/licencias/page.tsx,
// licencias/vacaciones/page.tsx (pestañas) y src/hooks/useSolicitudesEquipo.ts (conjuntos de la gestión del líder).

export const ESTADO = {
  SOLICITADA: 1,
  APROBADA: 100000000,
  NO_APROBADA: 100000001,
  CANCELADA: 100000002,
  GOZADA: 100000003,
  VIGENTE: 100000004,
  EN_CURSO: 100000005,
  PENDIENTE_VALIDACION: 100000006,
  PENDIENTE_CERTIFICADO: 100000007,
  VALIDADA_DOC_PENDIENTE: 100000008,
} as const;

/** new_segmento del tipo de licencia que identifica a las vacaciones. */
export const SEGMENTO_VACACIONES = 100000004;

const ETIQUETAS_LICENCIA: Record<number, string> = {
  [ESTADO.SOLICITADA]: 'Solicitada',
  [ESTADO.APROBADA]: 'Aprobada',
  [ESTADO.NO_APROBADA]: 'No Aprobada',
  [ESTADO.CANCELADA]: 'Cancelada',
  [ESTADO.GOZADA]: 'Gozada',
  [ESTADO.VIGENTE]: 'Vigente',
  [ESTADO.EN_CURSO]: 'En curso',
  [ESTADO.PENDIENTE_VALIDACION]: 'Pendiente de validación por Dirección de Personas',
  [ESTADO.PENDIENTE_CERTIFICADO]: 'Solicitada. Pendiente Certificado',
  [ESTADO.VALIDADA_DOC_PENDIENTE]: 'Validada, documentación pendiente',
};

// getEstadoVacacion del portal (src/columns/columnsVacaciones.tsx): solo estos ocho estados tienen
// etiqueta; cualquier otro (por ejemplo 100000007 y 100000008) es "Desconocido".
const ETIQUETAS_VACACION: Record<number, string> = {
  [ESTADO.SOLICITADA]: 'Solicitada',
  [ESTADO.PENDIENTE_VALIDACION]: 'Pendiente de validación por Dirección de Personas',
  [ESTADO.VIGENTE]: 'Vigente',
  [ESTADO.APROBADA]: 'Aprobada',
  [ESTADO.GOZADA]: 'Gozada',
  [ESTADO.NO_APROBADA]: 'No aprobada',
  [ESTADO.CANCELADA]: 'Cancelada',
  [ESTADO.EN_CURSO]: 'En Curso',
};

export const ETIQUETA_ESTADO_DESCONOCIDO = 'Desconocido';

export const etiquetaEstadoLicencia = (estado: number | null | undefined): string =>
  (estado === null || estado === undefined ? undefined : ETIQUETAS_LICENCIA[estado]) ?? '';

export const etiquetaEstadoVacacion = (estado: number | null | undefined): string =>
  (estado === null || estado === undefined ? undefined : ETIQUETAS_VACACION[estado]) ?? ETIQUETA_ESTADO_DESCONOCIDO;

export type PestaniaSolicitudes = 'ingresadas' | 'aprobadas' | 'rechazadas' | 'canceladas';

/** Mis licencias: pestañas Ingresadas / Aprobadas / Rechazadas / Canceladas. */
export const ESTADOS_LICENCIAS_POR_PESTANIA: Record<PestaniaSolicitudes, number[]> = {
  ingresadas: [ESTADO.SOLICITADA, ESTADO.PENDIENTE_VALIDACION, ESTADO.PENDIENTE_CERTIFICADO, ESTADO.VALIDADA_DOC_PENDIENTE],
  aprobadas: [ESTADO.APROBADA, ESTADO.GOZADA, ESTADO.EN_CURSO],
  rechazadas: [ESTADO.NO_APROBADA],
  canceladas: [ESTADO.CANCELADA],
};

/** Mis vacaciones (useVacacionesGestion). Las interrupciones (100000007) no tienen pestaña. */
export const ESTADOS_VACACIONES_POR_PESTANIA: Record<PestaniaSolicitudes, number[]> = {
  ingresadas: [ESTADO.PENDIENTE_VALIDACION, ESTADO.SOLICITADA],
  aprobadas: [ESTADO.APROBADA, ESTADO.GOZADA, ESTADO.EN_CURSO],
  rechazadas: [ESTADO.NO_APROBADA],
  canceladas: [ESTADO.CANCELADA],
};

/** Gestión de solicitudes del líder (INGRESADAS / APROBADAS / RECHAZADAS de useSolicitudesEquipo). */
export const ESTADOS_GESTION: Record<'ingresadas' | 'aprobadas' | 'rechazadas', number[]> = {
  ingresadas: [ESTADO.SOLICITADA, ESTADO.PENDIENTE_VALIDACION, ESTADO.PENDIENTE_CERTIFICADO, ESTADO.VALIDADA_DOC_PENDIENTE],
  aprobadas: [ESTADO.APROBADA, ESTADO.GOZADA, ESTADO.VIGENTE, ESTADO.EN_CURSO],
  rechazadas: [ESTADO.NO_APROBADA],
};

/** ESTADOS_EN_BANDEJA del portal: la unión de los tres conjuntos de la gestión. */
export const ESTADOS_EN_BANDEJA: number[] = Array.from(
  new Set([...ESTADOS_GESTION.ingresadas, ...ESTADOS_GESTION.aprobadas, ...ESTADOS_GESTION.rechazadas]),
);

/** Estados en los que el líder puede aprobar o rechazar una licencia. */
export const ESTADOS_LICENCIA_A_RESPONDER: number[] = [ESTADO.SOLICITADA, ESTADO.PENDIENTE_CERTIFICADO];

/** Estados en los que el empleado puede adjuntar el certificado a su licencia. */
export const ESTADOS_PUEDE_ADJUNTAR: number[] = [
  ESTADO.SOLICITADA,
  ESTADO.PENDIENTE_VALIDACION,
  ESTADO.PENDIENTE_CERTIFICADO,
  ESTADO.VALIDADA_DOC_PENDIENTE,
];

export const puedeAdjuntarCertificado = (estado: number): boolean => ESTADOS_PUEDE_ADJUNTAR.includes(estado);

/**
 * Cancelar una licencia propia: no en No aprobada, Cancelada, Gozada ni En curso, y tampoco una
 * Aprobada cuya fecha desde ya llegó (isAprobadaConFechaVigente del portal). Las fechas se comparan
 * como texto yyyy-MM-dd, sin pasar por UTC.
 */
export const puedeCancelarLicencia = (estado: number, desdeIso: string | null, hoy: string): boolean => {
  if ([ESTADO.CANCELADA, ESTADO.NO_APROBADA, ESTADO.GOZADA, ESTADO.EN_CURSO].includes(estado as never)) return false;
  const aprobadaConFechaVigente = estado === ESTADO.APROBADA && desdeIso !== null && hoy >= desdeIso;
  return !aprobadaConFechaVigente;
};

/**
 * Cancelar una solicitud de vacaciones: el portal (RowOptionsVerVacacion, columnsVacaciones.tsx) oculta el botón
 * solo en Gozada, En curso y No aprobada. En Cancelada, Vigente, etc. sí se ofrece.
 */
export const puedeCancelarVacacion = (estado: number): boolean =>
  ![ESTADO.GOZADA, ESTADO.EN_CURSO, ESTADO.NO_APROBADA].includes(estado as never);

/** En vacaciones, Ver se oculta para las que todavía están en trámite (Solicitada y Pendiente de validación). */
export const puedeVerVacacion = (estado: number): boolean =>
  estado !== ESTADO.SOLICITADA && estado !== ESTADO.PENDIENTE_VALIDACION;
