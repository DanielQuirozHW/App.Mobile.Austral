// Plan de Trabajo Anual (PTA): cuerpos de los PUT al PTA.
// Port de usePlanDeTrabajoStore (setPLandeTrabajo, setPLandeTrabajoObservaciones, cambioEstadoPta) y de
// hooks/plan-de-trabajo/useEditarPta (editarDiasHorasInvestigacion) de Portal-Austral-Dev.
import { TIPO_CARGA_DIAS, TIPO_CARGA_HORAS } from './constantes';
import type { PlanDeTrabajo } from './tipos';

const n = (x: unknown): number => Number(x) || 0;

/** Horas por día que usa el portal para pasar días a horas (y al revés). */
export const HORAS_POR_DIA = 8;

/** Cambios que una pantalla le hace al PTA antes de guardarlo. */
export interface CambiosPlan {
  numeroAlumnos?: number | string | null;
  numeroEntrevistas?: number | string | null;
  horasDocente?: number | string | null;
  observacionesResumen?: string;
  comentariosHorasClases?: string;
  formacionInv?: number | null;
  fechaObservacion?: string | null;
}

/**
 * Cuerpo completo del PUT del PTA (setPLandeTrabajo). Lo que no se cambia se reenvía tal como está en el PTA.
 * `new_totalhoras` sale del texto formateado de las horas de investigación, igual que en el portal.
 */
export const armarPayloadPlan = (plan: PlanDeTrabajo, cambios: CambiosPlan = {}): Record<string, unknown> => {
  const valor = <K extends keyof CambiosPlan>(clave: K, actual: unknown): unknown =>
    clave in cambios ? cambios[clave] : actual;
  return {
    new_plandetrabajodocenteid: plan.id,
    new_nroalumnos: n(valor('numeroAlumnos', plan.numeroAlumnos)),
    new_nroentrevistas: n(valor('numeroEntrevistas', plan.numeroEntrevistas)),
    new_cantidadhorasasesoramientoacademico: n(valor('horasDocente', plan.horasDocente)),
    new_observacionescomentario: (valor('observacionesResumen', plan.observacionesResumen) as string) || '',
    new_formacinvinculacinactividadesdeinvestigac:
      ('formacionInv' in cambios ? cambios.formacionInv : plan.formacionInv.value) || 0,
    new_totalhoras: n(plan.horasInvestigacion),
    new_registrodelecturadeobservacindeldocente:
      ('fechaObservacion' in cambios ? cambios.fechaObservacion : plan.fechaObservacion) || '',
    new_comentarioshorasclases: (valor('comentariosHorasClases', plan.comentariosHorasClases) as string) || '',
  };
};

/** PUT de las observaciones / comentarios del Resumen (setPLandeTrabajoObservaciones). */
export const armarPayloadObservaciones = (planId: string, observaciones: string): Record<string, unknown> => ({
  new_plandetrabajodocenteid: planId,
  new_observacionescomentario: observaciones || '',
});

export interface CargaInvestigacion {
  tipoCarga: number;
  /** Texto o número cargado en el campo "Horas". */
  horas: string | number;
  /** Texto o número cargado en el campo "Días". */
  dias: string | number;
}

/** Horas y días que se mandan según el tipo de carga (editarDiasHorasInvestigacion). */
export const calcularCargaInvestigacion = (carga: CargaInvestigacion) => {
  let totalHoras = 0;
  let horasCalculadas = 0;
  let diasCalculados = 0;
  let horasLlena = 0;
  let diasLlena = 0;
  if (carga.tipoCarga === TIPO_CARGA_DIAS) {
    diasLlena = n(carga.dias);
    if (diasLlena > 0) {
      horasCalculadas = diasLlena * HORAS_POR_DIA;
      totalHoras = horasCalculadas;
      diasCalculados = diasLlena;
    }
  } else if (carga.tipoCarga === TIPO_CARGA_HORAS) {
    horasLlena = n(carga.horas);
    if (horasLlena > 0) {
      totalHoras = horasLlena;
      diasCalculados = horasLlena / HORAS_POR_DIA;
    }
  }
  return { totalHoras, horasCalculadas, diasCalculados, horasLlena, diasLlena };
};

/** PUT del punto "5. Total horas proyectos de investigación y resultados esperados". */
export const armarPayloadDiasHoras = (plan: PlanDeTrabajo, carga: CargaInvestigacion): Record<string, unknown> => {
  const calculo = calcularCargaInvestigacion(carga);
  return {
    new_plandetrabajodocenteid: plan.id,
    new_nroalumnos: n(plan.numeroAlumnos),
    new_nroentrevistas: n(plan.numeroEntrevistas),
    new_cantidadhorasasesoramientoacademico: n(plan.horasDocente),
    new_observacionescomentario: plan.observacionesResumen || '',
    new_formacinvinculacinactividadesdeinvestigac: plan.formacionInv.value || 0,
    new_totalhoras: calculo.totalHoras,
    new_registrodelecturadeobservacindeldocente: plan.fechaObservacion || '',
    new_comentarioshorasclases: plan.comentariosHorasClases || '',
    new_totalhoras_llena: calculo.horasLlena,
    new_totaldias_llena: calculo.diasLlena,
    new_tipodecarga: carga.tipoCarga,
    new_totalhoras_calculado: calculo.horasCalculadas,
    new_totaldiascalculado: calculo.diasCalculados,
  };
};

/**
 * PUT de "Enviar a Sec. Académico": el portal manda el estado ACTUAL del PTA; el cambio de estado lo resuelve el backend.
 */
export const armarPayloadEnvio = (plan: PlanDeTrabajo): Record<string, unknown> => ({
  new_plandetrabajodocenteid: plan.id,
  statuscode: n(plan.statuscode.value),
});

/**
 * Fecha en que el docente leyó las observaciones: la hora actual a UTC-3 con ese desplazamiento
 * (el portal usa dayjs().utcOffset(-3).format('YYYY-MM-DDTHH:mm:ssZ')).
 */
export const fechaLecturaDeObservaciones = (ahora: Date = new Date()): string => {
  const enArgentina = new Date(ahora.getTime() - 3 * 60 * 60 * 1000);
  return `${enArgentina.toISOString().slice(0, 19)}-03:00`;
};
