// Plan de Trabajo Anual (PTA): mapeo de las filas del CRM.
// Port de Portal-Austral-Dev -> hooks/plan-de-trabajo/useGetPta.ts y useGetNotaPTA.ts y
// hooks/plan-de-trabajo/useGetIndicadoresPlanificacion.ts.
import { FV, texto, type Fila } from '../perfil/comun';
import { utcALocalVisible } from '../legajo/fechas';
import type { Opcion } from '../legajo/tipos';
import { ORDEN_INDICADORES } from './constantes';
import type { IndicadorPta, NotaPta, PlanDeTrabajo } from './tipos';

/** Texto formateado del CRM de una columna ('' si no hay). */
export const fv = (fila: Fila, atributo: string): string => texto(fila?.[`${atributo}${FV}`]);

/** El portal muestra en mayúsculas los textos y opciones que mapea con toUpperCase(). */
export const mayus = (valor: unknown): string => (typeof valor === 'string' ? valor.toUpperCase() : '');

/** Opción { value: código crudo, label: texto formateado en MAYÚSCULAS }, como el Opt del portal. */
export const opt = (fila: Fila, atributo: string): Opcion => ({
  value: fila?.[atributo] ?? null,
  label: mayus(fila?.[`${atributo}${FV}`]),
});

const numeroONull = (valor: unknown): number | null => {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
};

const textoONull = (valor: unknown): string | null =>
  valor === null || valor === undefined || valor === '' ? null : String(valor);

export const mapearPlan = (fila: Fila): PlanDeTrabajo => ({
  id: texto(fila?.new_plandetrabajodocenteid),
  nombre: texto(fila?.new_name),
  statuscode: { value: numeroONull(fila?.statuscode), label: fv(fila, 'statuscode') },
  anio: fv(fila, 'new_anio'),
  fechaCierre: textoONull(fila?.new_fechacierre),
  fechaApertura: textoONull(fila?.new_fechaapertura),
  fechaPresentacion: textoONull(fila?.new_fechapresentacion),
  docente: fv(fila, '_new_docente_value'),
  unidadAcademica: fv(fila, '_new_unidadacademica_value'),
  areaDisciplinar: fv(fila, '_new_areadisciplinar_value'),
  categoriaDocenteUniversidad: fv(fila, 'new_categoriadocenteuniversidad'),
  categoriaDocente: texto(fila?.new_categoriadocente),
  categoriaConicet: fv(fila, 'new_categoraconicet'),
  perfilIAE: fv(fila, 'new_perfildeliae'),
  perfilDocente: fv(fila, 'new_perfildocente'),
  diasContratados: texto(fila?.new_dastotalescontratadosiae),
  departamento: texto(fila?.new_departamento_textarea),
  totalHorasInvestigacionAnual: texto(fila?.new_totalhorasinvestigacionanual),
  numeroAlumnos: numeroONull(fila?.new_nroalumnos),
  numeroEntrevistas: numeroONull(fila?.new_nroentrevistas),
  horasDocente: numeroONull(fila?.new_cantidadhorasasesoramientoacademico),
  observacionesResumen: texto(fila?.new_observacionescomentario),
  observaciones: texto(fila?.new_observacionesaldocente),
  formacionInv: {
    value: fila?.new_formacinvinculacinactividadesdeinvestigac ?? null,
    label: fv(fila, 'new_formacinvinculacinactividadesdeinvestigac'),
  },
  fechaObservacion: textoONull(fila?.new_registrodelecturadeobservacindeldocente),
  comentariosHorasClases: texto(fila?.new_comentarioshorasclases),
  totalHorasInvestigacion: numeroONull(fila?.new_totalhoras_llena),
  totalDiasInvestigacion: numeroONull(fila?.new_totaldias_llena),
  tipoCarga: { value: fila?.new_tipodecarga ?? null, label: fv(fila, 'new_tipodecarga') },
  horasInvestigacion: fv(fila, 'new_totalhoras'),
  totalHorasDocencia: fv(fila, 'new_horastotaldocencia'),
  totalDiasDocencia: fv(fila, 'new_dastotaldocencia'),
  totalHorasInvestigacionTotal: fv(fila, 'new_totalhorasinvestigacin'),
  totalDiasInvestigacionTotal: fv(fila, 'new_totaldasinvestigacin'),
  totalHorasFormacion: fv(fila, 'new_totalhorasformacionrrhh'),
  totalDiasFormacion: fv(fila, 'new_totaldiasformacionrrhh'),
  totalHorasGestion: fv(fila, 'new_totalhorasgestion'),
  totalDiasGestion: fv(fila, 'new_totaldiasgestion'),
  totalHorasExtension: fv(fila, 'new_totalhorasextension'),
  totalDiasExtension: fv(fila, 'new_totaldiasextension'),
  totalHorasTransferencia: fv(fila, 'new_totalhorastransferencia'),
  totalDiasTransferencia: fv(fila, 'new_totaldiastransferencia'),
  totalHorasFormaciones: fv(fila, 'new_totalhorasformaciones'),
  totalDiasFormaciones: fv(fila, 'new_totaldiasformaciones'),
  totalHorasVariables: fv(fila, 'new_totalhorasvariables'),
  totalDiasVariables: fv(fila, 'new_totaldiasvariables'),
  horasPtaAnterior: fv(fila, 'new_totalhorasptaaoanterior'),
  horasDedicacion: fv(fila, 'new_totalhorassegundedicacion'),
  diasDedicacion: fv(fila, 'new_totaldiassegundedicacion'),
  diferenciaPta: fv(fila, 'new_diferencia'),
});

// --- Indicadores ---

const numero = (valor: unknown): number => numeroONull(valor) ?? 0;

export const mapearIndicador = (fila: Fila): IndicadorPta => ({
  id: texto(fila?.new_indicadoresdeplanificacinid),
  label: fv(fila, 'new_segmento'),
  value: numero(fila?.new_cantidaddehorasdedocencia),
  cantidadDias: numero(fila?.new_cantidaddediasplanificados),
  porcentaje: numero(fila?.new_porcentajedistribucionhoras),
  porcentajeDias: numero(fila?.new_porcentajedistribuciondias),
});

/** Orden de la tabla: por la parte del segmento anterior a " - "; los que no están en la lista, al final. */
export const ordenarIndicadores = (indicadores: IndicadorPta[]): IndicadorPta[] => {
  const posicion = (i: IndicadorPta): number => {
    const clave = i.label.split(' - ')[0].trim();
    const p = ORDEN_INDICADORES.indexOf(clave);
    return p < 0 ? ORDEN_INDICADORES.length : p;
  };
  return [...indicadores].sort((a, b) => posicion(a) - posicion(b));
};

// --- Adjuntos (notas) ---

export const mapearNota = (fila: Fila): NotaPta => ({
  id: texto(fila?.annotationid),
  filename: texto(fila?.filename),
  subject: texto(fila?.subject),
  fechaCarga: utcALocalVisible(fila?.createdon),
  cargado: Boolean(fila?.annotationid),
});
