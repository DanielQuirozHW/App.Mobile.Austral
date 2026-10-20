// Plan de Trabajo Anual (PTA): reglas de la lista y del detalle.
// Port de Portal-Austral-Dev -> planes-de-trabajo/page.tsx y ModalPlanDeTrabajoDocente.tsx.
import {
  ESTADOS_EDITABLES,
  ESTADOS_EN_DESARROLLO,
  ESTADO_CON_OBSERVACIONES,
  ESTADO_VIGENTE,
  type PestaniaLista,
  type SubPestania,
} from './constantes';
import type { ClaveSeccion, PlanDeTrabajo } from './tipos';

// --- Lista ---

/** Fecha de cierre (UTC) como número comparable de día (año, mes, día); null si no hay. */
const diaUtc = (valor: string | null): number | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor ?? '');
  return m ? Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};

const hoyComoDia = (hoy: Date): number => Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

/** Filtros de las pestañas. No son excluyentes: un PTA puede estar en HISTÓRICO y en otra pestaña. */
export const planEnPestania = (plan: PlanDeTrabajo, pestania: PestaniaLista, hoy: Date = new Date()): boolean => {
  const estado = plan.statuscode.value;
  if (pestania === 'vigente') return estado === ESTADO_VIGENTE;
  if (pestania === 'desarrollo') return estado !== null && ESTADOS_EN_DESARROLLO.includes(estado);
  const cierre = diaUtc(plan.fechaCierre);
  return cierre !== null && cierre <= hoyComoDia(hoy);
};

export const filtrarPlanes = (planes: PlanDeTrabajo[], pestania: PestaniaLista, hoy: Date = new Date()): PlanDeTrabajo[] =>
  planes.filter((p) => planEnPestania(p, pestania, hoy));

/** Hay un PTA vigente (estadoVigente del portal). */
export const hayPlanVigente = (planes: PlanDeTrabajo[]): boolean =>
  planes.some((p) => p.statuscode.value === ESTADO_VIGENTE);

// --- Detalle ---

export const estadoDe = (plan: PlanDeTrabajo): number | null => plan.statuscode.value;

/** Estado en el que el docente puede cargar (1 o 100000000). */
export const estadoEditable = (plan: PlanDeTrabajo): boolean => {
  const estado = estadoDe(plan);
  return estado !== null && ESTADOS_EDITABLES.includes(estado);
};

/** isDisabled del portal: estado no editable, PTA vigente o abierto desde HISTÓRICO / VIGENTE. */
export const planDeshabilitado = (plan: PlanDeTrabajo, estadoHistorico: boolean): boolean =>
  !estadoEditable(plan) || estadoDe(plan) === ESTADO_VIGENTE || estadoHistorico;

/** La pestaña "Observaciones del Sec. Académico" solo existe con ese estado. */
export const mostrarObservaciones = (plan: PlanDeTrabajo): boolean => estadoDe(plan) === ESTADO_CON_OBSERVACIONES;

// --- Secciones por pestaña de actividad ---

export interface SeccionDeSubpestania {
  clave: ClaveSeccion;
  /** Encabezado tal como lo escribe el portal (con su numeración). */
  encabezado: string;
}

export const SECCIONES_POR_SUBPESTANIA: Partial<Record<SubPestania, SeccionDeSubpestania[]>> = {
  docencia: [{ clave: 'clases', encabezado: '1. Clases' }],
  investigacion: [
    { clave: 'areas', encabezado: '2. Áreas de interés' },
    { clave: 'proyectos', encabezado: '3. Proyectos de Investigación' },
    { clave: 'publicaciones', encabezado: '4.1. N° publicaciones previstas' },
    { clave: 'congresos', encabezado: '4.2. Congresos' },
    { clave: 'divulgaciones', encabezado: '6. Divulgación' },
  ],
  formacionRrhh: [
    { clave: 'tesis', encabezado: '1. Dirección de tesis / trabajos finales' },
    { clave: 'jurados', encabezado: '2. Jurado de trabajos finales / Tesis' },
  ],
  gestion: [
    { clave: 'cargos', encabezado: '1. Cargo' },
    { clave: 'encargos', encabezado: '2. Encargo' },
  ],
  extension: [{ clave: 'extension', encabezado: '1. Extensión' }],
  transferencia: [{ clave: 'transferencia', encabezado: '1. Transferencia' }],
  formacion: [
    { clave: 'formacionDoctoral', encabezado: '1. Formación doctoral' },
    { clave: 'formacionEspecifica', encabezado: '2. Otra formación específica' },
    { clave: 'formacionHumanistica', encabezado: '3. Formación Humanística' },
    { clave: 'formacionPedagogica', encabezado: '4. Formación en docencia (pedagógica)' },
    { clave: 'seminarios', encabezado: '5. Formación en investigación (metodología de la investigación)' },
  ],
  variables: [{ clave: 'bloques', encabezado: '1. Horas / bloques variables' }],
};

/** "Totales registrados" que muestra cada pestaña (texto del CRM). */
export interface TotalDeSubpestania {
  etiquetaHoras: string;
  etiquetaDias: string;
  horas: (plan: PlanDeTrabajo) => string;
  dias: (plan: PlanDeTrabajo) => string;
}

export const TOTALES_POR_SUBPESTANIA: Partial<Record<SubPestania, TotalDeSubpestania>> = {
  docencia: {
    etiquetaHoras: 'Total horas docencia',
    etiquetaDias: 'Total días docencia',
    horas: (p) => p.totalHorasDocencia,
    dias: (p) => p.totalDiasDocencia,
  },
  investigacion: {
    etiquetaHoras: 'Total horas investigación',
    etiquetaDias: 'Total días investigación',
    horas: (p) => p.totalHorasInvestigacionTotal,
    dias: (p) => p.totalDiasInvestigacionTotal,
  },
  formacionRrhh: {
    etiquetaHoras: 'Total horas formación RRHH',
    etiquetaDias: 'Total días formación RRHH',
    horas: (p) => p.totalHorasFormacion,
    dias: (p) => p.totalDiasFormacion,
  },
  gestion: {
    etiquetaHoras: 'Total horas gestión',
    etiquetaDias: 'Total días gestión',
    horas: (p) => p.totalHorasGestion,
    dias: (p) => p.totalDiasGestion,
  },
  extension: {
    etiquetaHoras: 'Total horas extensión',
    etiquetaDias: 'Total días extensión',
    horas: (p) => p.totalHorasExtension,
    dias: (p) => p.totalDiasExtension,
  },
  transferencia: {
    etiquetaHoras: 'Total horas transferencia',
    etiquetaDias: 'Total días transferencia',
    horas: (p) => p.totalHorasTransferencia,
    dias: (p) => p.totalDiasTransferencia,
  },
  formacion: {
    etiquetaHoras: 'Total horas formaciones',
    etiquetaDias: 'Total días formaciones',
    horas: (p) => p.totalHorasFormaciones,
    dias: (p) => p.totalDiasFormaciones,
  },
  variables: {
    etiquetaHoras: 'Total Horas Variables',
    etiquetaDias: 'Total Días Variables',
    horas: (p) => p.totalHorasVariables,
    dias: (p) => p.totalDiasVariables,
  },
};
