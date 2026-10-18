// Mapeo de las filas del CRM a los objetos del módulo. Port de Portal-Austral-Dev:
// useGetLicencias, useGetLicenciasEquipo, useVacaciones, useVacacionesGestion, useLicenciasCalendario,
// useGetFeriados, useSolicitudesEquipo y VacacionesEquipoPendientes.
import { etiquetaEstadoLicencia } from './estados';
import { diaAVisible, diaCrm, diasInclusivos } from './fechasCrm';
import { esLicenciaPorMudanza } from './mudanza';
import type {
  DiasPendientesEquipo,
  DomicilioLicencia,
  Feriado,
  Fila,
  Licencia,
  PeriodoVacaciones,
  SolicitudDeEquipo,
  TipoDeLicencia,
  VacacionPropia,
} from './tipos';

// El CRM devuelve el texto de los OptionSet y de los lookups con esta anotación.
const FV = '@OData.Community.Display.V1.FormattedValue';

/** Alias de los link-entity de las consultas (son los del portal). */
export const ALIAS_TIPO_PROPIAS = 'a_a88c8d1fb4c5e911a811000d3ac022de';
export const ALIAS_TIPO_EQUIPO = 'tipodelicencia';
export const ALIAS_LEGAJO = 'a_64419f07b4c5e911a811000d3ac022de';

const fv = (fila: Fila, campo: string): string => {
  const valor = fila?.[`${campo}${FV}`];
  return valor === null || valor === undefined ? '' : String(valor);
};

const texto = (valor: unknown): string => (valor === null || valor === undefined ? '' : String(valor));

const numero = (valor: unknown, porDefecto = 0): number => {
  if (valor === null || valor === undefined || valor === '') return porDefecto;
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
};

/** Fecha para mostrar: dd/MM/yyyy armada del texto crudo; si no es un día, el texto formateado del CRM. */
const fechaVisible = (fila: Fila, campo: string): string => diaAVisible(diaCrm(fila?.[campo])) || fv(fila, campo);

// ---------------------------------------------------------------------------
// Tipos de licencia
// ---------------------------------------------------------------------------

export const mapearTipoDeLicencia = (fila: Fila): TipoDeLicencia => ({
  value: texto(fila?.new_tipodelicenciaid),
  label: texto(fila?.new_name),
  segmento: fila?.new_segmento ?? null,
  certificadoObligatorio: fila?.new_certificadoobligatorio ?? null,
  tieneLimiteAnual: typeof fila?.new_tienelimiteanual === 'boolean' ? fila.new_tienelimiteanual : null,
  diasAnuales: numero(fila?.new_cantidaddiascorrespleyanuales),
  maxDiasCorridos: numero(fila?.new_cantdiashabilescorrespporley),
  mesDesdeTexto: fv(fila, 'new_fechadesde') || null,
  mesHastaTexto: fv(fila, 'new_fechahasta') || null,
  raw: fila,
});

// ---------------------------------------------------------------------------
// Licencias
// ---------------------------------------------------------------------------

/** useDomicilioDeLicencia / domicilioDeLicencia del portal. */
export const domicilioDeFila = (fila: Fila): DomicilioLicencia => ({
  calle: texto(fila?.new_calle),
  nro: texto(fila?.new_nro),
  piso: texto(fila?.new_piso),
  depto: texto(fila?.new_depto),
  codigoPostal: texto(fila?.new_codigopostal),
  pais: fv(fila, '_new_pais_value'),
  provincia: fv(fila, '_new_provincia_value'),
  localidad: fv(fila, '_new_localidad_value'),
});

/** Fila de new_licencia (consultas ingresadas y equipoIngresadas). `aliasTipo` es el alias del link a new_tipodelicencia. */
export const mapearLicencia = (fila: Fila, aliasTipo: string): Licencia => {
  const tipoLicencia = fv(fila, '_new_tipodelicencia_value');
  return {
    id: texto(fila?.new_licenciaid),
    nombre: texto(fila?.new_name),
    tipoLicencia,
    tipoLicenciaId: fila?._new_tipodelicencia_value ?? null,
    empleado: fv(fila, '_new_empleado_value'),
    empleadoId: fila?._new_empleado_value ?? null,
    legajo: texto(fila?.[`${ALIAS_LEGAJO}.new_numerolegajo`]),
    fechaSolicitud: fechaVisible(fila, 'new_fechadesolicitud'),
    fechaDesde: fechaVisible(fila, 'new_fechadesde'),
    fechaHasta: fechaVisible(fila, 'new_fechahasta'),
    desdeIso: diaCrm(fila?.new_fechadesde),
    hastaIso: diaCrm(fila?.new_fechahasta),
    diasSolicitados: numero(fila?.new_diashabilessolicitados ?? fila?.new_diassolicitados),
    estado: numero(fila?.statuscode),
    motivoRechazo: texto(fila?.new_motivoderechazo),
    comentarios: texto(fila?.new_comentarios),
    idAprobador1: fila?._new_aprobador1_value ?? null,
    certificadoObligatorio: fila?.[`${aliasTipo}.new_certificadoobligatorio`] ?? null,
    requiereValidacion: fila?.[`${aliasTipo}.new_requierevalidacion`] ?? null,
    domicilio: domicilioDeFila(fila),
    esMudanza: esLicenciaPorMudanza(tipoLicencia),
  };
};

// ---------------------------------------------------------------------------
// Vacaciones
// ---------------------------------------------------------------------------

/** Fila de new_vacaciones con el período vacacional (alias `ab`). Equivale al map de useVacaciones. */
export const mapearPeriodo = (fila: Fila): PeriodoVacaciones => {
  const correspondientes = numero(fila?.new_diasvacacionescorrespondientes);
  const adicionales = numero(fila?.new_diasvacacionesadicionales);
  return {
    id: texto(fila?.new_vacacionesid),
    periodo: fv(fila, '_new_periodovacacional_value'),
    diasAGozar: correspondientes + adicionales,
    diasCorrespondientes: correspondientes,
    diasAdicionales: adicionales,
    periodoId: fila?._new_periodovacacional_value ?? null,
    diasSolicitados: numero(fila?.new_totaldiassolicitados),
    diasGozados: numero(fila?.new_diasvacacionestomados),
    diasPendientes: numero(fila?.new_diasvacacionespendientes),
    penalidadesAplicadas: numero(fila?.new_penalidadesaplicadas),
    diasFraccionadosAcum: numero(fila?.new_diasfraccionadosacum),
    diasPendientesTotales: numero(fila?.new_diasvacacionespendientes),
    diasPendientesDelPeriodoAnterior: numero(fila?.new_diaspendietesdelperiodoanterior),
    fechaDesdePeriodo: fechaVisible(fila, 'ab.new_fechadesde'),
    fechaHastaPeriodo: fechaVisible(fila, 'ab.new_fechahasta'),
    fechaAperturaPeriodo: fechaVisible(fila, 'ab.new_fechaapertura'),
    fechaVencimientoPeriodo: fechaVisible(fila, 'ab.new_fechavencimiento'),
    aperturaIso: diaCrm(fila?.['ab.new_fechaapertura']),
    vencimientoIso: diaCrm(fila?.['ab.new_fechavencimiento']),
    desdeGoceIso: diaCrm(fila?.['ab.new_fechadesde']),
    hastaGoceIso: diaCrm(fila?.['ab.new_fechahasta']),
  };
};

/** Solicitud de vacaciones propia (useVacacionesGestion). */
export const mapearVacacionPropia = (fila: Fila): VacacionPropia => ({
  id: texto(fila?.new_licenciaid),
  name: texto(fila?.new_name),
  fechaSolicitud: fechaVisible(fila, 'new_fechadesolicitud'),
  fechaDesde: fechaVisible(fila, 'new_fechadesde'),
  fechaHasta: fechaVisible(fila, 'new_fechahasta'),
  desdeIso: diaCrm(fila?.new_fechadesde),
  hastaIso: diaCrm(fila?.new_fechahasta),
  diasSolicitados: numero(fila?.new_diashabilessolicitados ?? fila?.new_diassolicitados),
  penalidadesGeneradas: numero(fila?.new_penalidadesgeneradas),
  estado: numero(fila?.statuscode),
  motivoRechazo: texto(fila?.new_motivoderechazo),
  periodoVacacional: fv(fila, 'aq.new_periodovacacional'),
});

// ---------------------------------------------------------------------------
// Calendario y equipo
// ---------------------------------------------------------------------------

/**
 * Fila de new_licencia con los alias `numerolegajo` y `reportaA` (calendario y vacaciones del equipo).
 * - 'calendario': los días son los de las fechas (inclusive) y, si no se pueden calcular, los hábiles solicitados.
 * - 'vacaciones': los días son los hábiles solicitados (o los solicitados), como useSolicitudesEquipo.
 */
export const mapearSolicitudDeEquipo = (fila: Fila, modo: 'calendario' | 'vacaciones'): SolicitudDeEquipo => {
  const desdeIso = diaCrm(fila?.new_fechadesde);
  const hastaIso = diaCrm(fila?.new_fechahasta);
  const habiles = numero(fila?.new_diashabilessolicitados ?? fila?.new_diassolicitados);
  const estado = numero(fila?.statuscode);
  const nombre = fv(fila, '_new_empleado_value');
  return {
    id: texto(fila?.new_licenciaid),
    name: nombre,
    empleadoName: texto(fila?.['numerolegajo.new_name']) || nombre,
    empleadoId: fila?._new_empleado_value ?? null,
    tipoDeLicencia: { value: fila?._new_tipodelicencia_value ?? null, label: fv(fila, '_new_tipodelicencia_value') },
    fechaSolicitud: fechaVisible(fila, 'new_fechadesolicitud'),
    fechaDesde: fechaVisible(fila, 'new_fechadesde'),
    fechaHasta: fechaVisible(fila, 'new_fechahasta'),
    desdeIso,
    hastaIso,
    diasSolicitados: modo === 'calendario' ? (diasInclusivos(desdeIso, hastaIso) ?? habiles) : habiles,
    motivoRechazo: texto(fila?.new_motivoderechazo),
    estado,
    estadoName: etiquetaEstadoLicencia(estado) || fv(fila, 'statuscode'),
    reportaA: fila?.['reportaA.new_empleadoid'] ?? null,
    vacaciones: fila?._new_vacaciones_value ?? null,
    comentarios: texto(fila?.new_comentarios),
  };
};

export const mapearFeriado = (fila: Fila): Feriado => ({
  id: texto(fila?.new_diasferiadosid),
  nombre: texto(fila?.new_name) || 'Feriado',
  dia: diaCrm(fila?.new_fecha),
});

/** Pestaña "Días pendientes" de la gestión del líder. */
export const mapearDiasPendientesEquipo = (fila: Fila): DiasPendientesEquipo => ({
  id: texto(fila?.new_vacacionesid),
  empleado: fv(fila, '_new_empleado_value'),
  diasPendientes: fv(fila, 'new_diasvacacionespendientes') || '0',
  fechaDesde: fechaVisible(fila, 'new_fechadesde'),
  fechaHasta: fechaVisible(fila, 'new_fechahasta'),
  periodo: fv(fila, '_new_periodovacacional_value'),
});
