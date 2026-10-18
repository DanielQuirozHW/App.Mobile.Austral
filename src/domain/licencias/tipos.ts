// Tipos del módulo Licencias y vacaciones. La forma sale de los hooks del portal
// (useGetLicencias, useGetLicenciasEquipo, useVacaciones, useVacacionesGestion, useLicenciasCalendario,
// useGetFeriados, useSolicitudesEquipo, VacacionesEquipoPendientes).

export type Fila = Record<string, any>;

/** Domicilio declarado en una licencia por mudanza. Los textos son los del CRM (FormattedValue). */
export interface DomicilioLicencia {
  calle: string;
  nro: string;
  piso: string;
  depto: string;
  codigoPostal: string;
  pais: string;
  provincia: string;
  localidad: string;
}

/** Fila de new_tipodelicencia. */
export interface TipoDeLicencia {
  /** new_tipodelicenciaid */
  value: string;
  /** new_name */
  label: string;
  segmento: number | null;
  /** 1: certificado obligatorio al solicitar. 2: obligatorio pero puede cargarse después. */
  certificadoObligatorio: number | null;
  tieneLimiteAnual: boolean | null;
  /** new_cantidaddiascorrespleyanuales */
  diasAnuales: number;
  /** new_cantdiashabilescorrespporley */
  maxDiasCorridos: number;
  /** Mes (texto) desde el que se puede tomar, o null. */
  mesDesdeTexto: string | null;
  mesHastaTexto: string | null;
  raw: Fila;
}

/** Licencia (no vacaciones), propia o de un integrante del equipo. */
export interface Licencia {
  id: string;
  nombre: string;
  tipoLicencia: string;
  tipoLicenciaId: string | null;
  empleado: string;
  empleadoId: string | null;
  legajo: string;
  fechaSolicitud: string;
  fechaDesde: string;
  fechaHasta: string;
  /** yyyy-MM-dd o null. */
  desdeIso: string | null;
  hastaIso: string | null;
  diasSolicitados: number;
  estado: number;
  motivoRechazo: string;
  comentarios: string;
  idAprobador1: string | null;
  certificadoObligatorio: number | null;
  requiereValidacion: number | null;
  domicilio: DomicilioLicencia;
  esMudanza: boolean;
}

/** Cuenta de vacaciones del empleado con los datos de su período (useVacaciones). */
export interface PeriodoVacaciones {
  id: string;
  periodo: string;
  diasAGozar: number;
  diasCorrespondientes: number;
  diasAdicionales: number;
  periodoId: string | null;
  diasSolicitados: number;
  diasGozados: number;
  diasPendientes: number;
  penalidadesAplicadas: number;
  diasFraccionadosAcum: number;
  diasPendientesTotales: number;
  diasPendientesDelPeriodoAnterior: number;
  fechaDesdePeriodo: string;
  fechaHastaPeriodo: string;
  fechaAperturaPeriodo: string;
  fechaVencimientoPeriodo: string;
  /** Fechas crudas yyyy-MM-dd del período (para comparar). */
  aperturaIso: string | null;
  vencimientoIso: string | null;
  desdeGoceIso: string | null;
  hastaGoceIso: string | null;
}

/** Solicitud de vacaciones propia (useVacacionesGestion). */
export interface VacacionPropia {
  id: string;
  name: string;
  fechaSolicitud: string;
  fechaDesde: string;
  fechaHasta: string;
  desdeIso: string | null;
  hastaIso: string | null;
  diasSolicitados: number;
  penalidadesGeneradas: number;
  estado: number;
  motivoRechazo: string;
  periodoVacacional: string;
}

/** Licencia o vacaciones de una persona, para el calendario y para la gestión del líder. */
export interface SolicitudDeEquipo {
  id: string;
  name: string;
  empleadoName: string;
  empleadoId: string | null;
  tipoDeLicencia: { value: string | null; label: string };
  fechaSolicitud: string;
  fechaDesde: string;
  fechaHasta: string;
  desdeIso: string | null;
  hastaIso: string | null;
  diasSolicitados: number;
  motivoRechazo: string;
  estado: number;
  estadoName: string;
  /** new_empleadoid de quien aprueba (reportaA). */
  reportaA: string | null;
  vacaciones: string | null;
  comentarios: string;
}

export interface Feriado {
  id: string;
  nombre: string;
  /** yyyy-MM-dd */
  dia: string | null;
}

/** Fila de la pestaña "Días pendientes" de la gestión del líder. */
export interface DiasPendientesEquipo {
  id: string;
  empleado: string;
  diasPendientes: string;
  fechaDesde: string;
  fechaHasta: string;
  periodo: string;
}
