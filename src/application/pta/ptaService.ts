// Flujos del Plan de Trabajo Anual. Los toasts los muestran las pantallas y los modales (los textos de cada sección
// están en domain/pta/secciones.ts).
import type { Fila } from '../../domain/perfil/comun';
import { MSG_SIN_ADJUNTO_PARA_ENVIAR, DEMORA_REFRESCO_PTA_PROYECTO_MS } from '../../domain/pta/constantes';
import {
  mapearAgrupador,
  mapearDisciplina,
  mapearEspecialidad,
  mapearGradoAcademico,
  mapearModalidad,
} from '../../domain/pta/catalogos';
import { limpiarOcultos } from '../../domain/pta/formulario';
import { MAPEADORES } from '../../domain/pta/mapeoSecciones';
import { mapearIndicador, mapearNota, mapearPlan, ordenarIndicadores } from '../../domain/pta/mapeo';
import {
  armarPayloadDiasHoras,
  armarPayloadEnvio,
  armarPayloadObservaciones,
  armarPayloadPlan,
  fechaLecturaDeObservaciones,
  type CambiosPlan,
  type CargaInvestigacion,
} from '../../domain/pta/payloads';
import { FUENTES, type DefinicionSeccion } from '../../domain/pta/secciones';
import type { FuenteSeccion, PlanDeTrabajo, RegistroPta } from '../../domain/pta/tipos';
import type { ArchivoParaCarga } from '../../infrastructure/legajo/familiaresApi';
import { leerGradosAcademicos, leerModalidadesDeDictado } from '../../infrastructure/perfil/docenciaApi';
import {
  eliminarNota,
  enviarPlan,
  escribirPlan,
  escribirSeccion,
  leerAgrupadores,
  leerDisciplinas,
  leerEspecialidades,
  leerIndicadoresDelPlan,
  leerNotasDelPlan,
  leerPlanesDelEmpleado,
  leerSeccionDelPlan,
  leerUniversidades,
  subirInformeAnterior,
} from '../../infrastructure/pta/ptaApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { usePtaStore } from '../../presentation/stores/ptaStore';

export const MSG_ERROR_CARGA_PTA = 'No pudimos cargar tus planes de trabajo. Por favor, volvé a intentar.';
export const MSG_ERROR_CARGA_DETALLE_PTA = 'No pudimos cargar todo el plan de trabajo. Por favor, volvé a intentar.';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Un 200 vacío tras los reintentos NO es "sin datos": se trata como fallo y se conserva lo que ya había. */
const filasOFallar = (filas: unknown, mensaje = MSG_ERROR_CARGA_DETALLE_PTA): Fila[] => {
  if (!Array.isArray(filas)) throw new Error(mensaje);
  return filas as Fila[];
};

const store = () => usePtaStore.getState();

// --- Lecturas ---

/** Planes del docente (GetPTA del portal). */
export const cargarPlanes = async (): Promise<void> => {
  const filas = filasOFallar(await leerPlanesDelEmpleado(empleadoIdActual()), MSG_ERROR_CARGA_PTA);
  store().fijar({ planes: filas.map(mapearPlan) });
};

/** Lo que lee la lista al abrirse. */
export const cargarListaDePlanes = async (): Promise<void> => {
  store().fijarEstado({ cargando: true, error: false });
  const resultados = await Promise.allSettled([cargarPlanes()]);
  store().fijarEstado({
    cargando: false,
    cargado: true,
    error: resultados.some((r) => r.status === 'rejected'),
  });
};

/** Una lista del plan abierto. Si mientras tanto se abrió otro plan, el resultado se descarta. */
export const cargarFuente = async (fuente: FuenteSeccion, planId: string): Promise<void> => {
  const filas = filasOFallar(await leerSeccionDelPlan(fuente, planId));
  if (store().planActualId !== planId) return;
  store().fijarFuente(fuente, filas.map(MAPEADORES[fuente]));
};

export const cargarIndicadores = async (planId: string): Promise<void> => {
  const filas = filasOFallar(await leerIndicadoresDelPlan(planId));
  if (store().planActualId !== planId) return;
  store().fijar({ indicadores: ordenarIndicadores(filas.map(mapearIndicador)) });
};

export const cargarNotas = async (planId: string): Promise<void> => {
  const filas = filasOFallar(await leerNotasDelPlan(planId));
  if (store().planActualId !== planId) return;
  store().fijar({ notas: filas.map(mapearNota) });
};

/** Catálogos de los formularios: se leen una sola vez por sesión. */
export const cargarCatalogos = async (): Promise<void> => {
  const { catalogos } = store();
  const tareas: Array<Promise<void>> = [];
  if (catalogos.universidades.length === 0) {
    tareas.push(leerUniversidades().then((universidades) => store().fijarCatalogos({ universidades })));
  }
  if (catalogos.modalidades.length === 0) {
    tareas.push(
      leerModalidadesDeDictado().then((filas) =>
        store().fijarCatalogos({ modalidades: filasOFallar(filas).map(mapearModalidad) }),
      ),
    );
  }
  if (catalogos.gradosAcademicos.length === 0) {
    tareas.push(
      leerGradosAcademicos().then((filas) =>
        store().fijarCatalogos({ gradosAcademicos: filasOFallar(filas).map(mapearGradoAcademico) }),
      ),
    );
  }
  if (catalogos.agrupadores.length === 0) {
    tareas.push(
      leerAgrupadores().then((filas) =>
        store().fijarCatalogos({ agrupadores: filasOFallar(filas).map(mapearAgrupador) }),
      ),
    );
  }
  if (catalogos.disciplinas.length === 0) {
    tareas.push(
      leerDisciplinas().then((filas) =>
        store().fijarCatalogos({ disciplinas: filasOFallar(filas).map(mapearDisciplina) }),
      ),
    );
  }
  if (catalogos.especialidades.length === 0) {
    tareas.push(
      leerEspecialidades().then((filas) =>
        store().fijarCatalogos({ especialidades: filasOFallar(filas).map(mapearEspecialidad) }),
      ),
    );
  }
  const resultados = await Promise.allSettled(tareas);
  if (resultados.some((r) => r.status === 'rejected')) throw new Error(MSG_ERROR_CARGA_DETALLE_PTA);
};

/** Detalle de un plan: todas sus listas, los indicadores, los adjuntos y los catálogos. */
export const abrirDetalleDePlan = async (planId: string): Promise<void> => {
  store().abrirPlan(planId);
  store().fijarEstado({ cargandoDetalle: true, errorDetalle: false });
  const resultados = await Promise.allSettled([
    ...FUENTES.map((fuente) => cargarFuente(fuente, planId)),
    cargarIndicadores(planId),
    cargarNotas(planId),
    cargarCatalogos(),
  ]);
  if (store().planActualId !== planId) return;
  store().fijarEstado({
    cargandoDetalle: false,
    errorDetalle: resultados.some((r) => r.status === 'rejected'),
  });
};

// --- Escrituras de las secciones ---

/**
 * Después de cualquier alta, edición o baja el portal vuelve a leer la lista, el PTA (los totales) y los indicadores.
 * DIFERENCIA CONSCIENTE: la app refresca siempre las tres cosas (el portal omite alguna según la sección).
 * Si el refresco falla, el cambio ya está guardado: no se informa como error de guardado.
 */
const refrescarTrasCambio = async (fuente: FuenteSeccion, planId: string): Promise<void> => {
  await Promise.allSettled([cargarFuente(fuente, planId), cargarPlanes(), cargarIndicadores(planId)]);
};

export const guardarRegistro = async (
  def: DefinicionSeccion,
  valores: Record<string, any>,
  planId: string,
  item?: RegistroPta,
): Promise<void> => {
  const limpios = limpiarOcultos(def.campos, valores);
  const cuerpo = def.payload(limpios, { planId, id: item?.id, item });
  await escribirSeccion(def.endpoint, item ? 'put' : 'post', cuerpo);
  await refrescarTrasCambio(def.fuente, planId);
};

export const eliminarRegistro = async (def: DefinicionSeccion, planId: string, item: RegistroPta): Promise<void> => {
  await escribirSeccion(def.endpoint, 'delete', { [def.campoId]: item.id });
  await refrescarTrasCambio(def.fuente, planId);
  // Al borrar un proyecto de investigación el portal vuelve a leer el PTA unos segundos después,
  // cuando el backend ya recalculó los totales.
  if (def.clave === 'proyectos') {
    setTimeout(() => {
      void cargarPlanes().catch(() => undefined);
    }, DEMORA_REFRESCO_PTA_PROYECTO_MS);
  }
};

// --- Escrituras del PTA ---

/** Después de editar el PTA el portal vuelve a leer los indicadores y el PTA. */
const refrescarTrasEditarPlan = async (planId: string): Promise<void> => {
  await Promise.allSettled([cargarIndicadores(planId), cargarPlanes()]);
};

/** Guarda alumnos, entrevistas, horas, comentario de horas de clases o formación vinculada a investigación. */
export const guardarDatosDelPlan = async (plan: PlanDeTrabajo, cambios: CambiosPlan): Promise<void> => {
  await escribirPlan(armarPayloadPlan(plan, cambios));
  await refrescarTrasEditarPlan(plan.id);
};

/** Guarda el campo "Observaciones / Comentarios" del Resumen. */
export const guardarObservacionesDelResumen = async (plan: PlanDeTrabajo, observaciones: string): Promise<void> => {
  await escribirPlan(armarPayloadObservaciones(plan.id, observaciones));
  await refrescarTrasEditarPlan(plan.id);
};

/** Guarda el punto "5. Total horas proyectos de investigación y resultados esperados". */
export const guardarCargaDeInvestigacion = async (plan: PlanDeTrabajo, carga: CargaInvestigacion): Promise<void> => {
  await escribirPlan(armarPayloadDiasHoras(plan, carga));
  await refrescarTrasEditarPlan(plan.id);
};

/** Al abrir "Observaciones del Sec. Académico" el portal registra la fecha de lectura. */
export const registrarLecturaDeObservaciones = async (plan: PlanDeTrabajo): Promise<void> => {
  await escribirPlan(armarPayloadPlan(plan, { fechaObservacion: fechaLecturaDeObservaciones() }));
  await refrescarTrasEditarPlan(plan.id);
};

/** "Enviar a Sec. Académico". Sin informe del año anterior adjunto no se envía (el portal muestra ese mensaje). */
export const enviarASecretariaAcademica = async (plan: PlanDeTrabajo): Promise<void> => {
  if (store().notas.length === 0) throw new Error(MSG_SIN_ADJUNTO_PARA_ENVIAR);
  await enviarPlan(armarPayloadEnvio(plan));
  await cargarPlanes();
};

// --- Adjunto del informe del año anterior ---

export const subirInformeDelAnioAnterior = async (planId: string, archivos: ArchivoParaCarga[]): Promise<void> => {
  await subirInformeAnterior(planId, archivos);
  await cargarNotas(planId);
};

export const eliminarInformeAdjunto = async (planId: string, notaId: string): Promise<void> => {
  await eliminarNota(notaId);
  await cargarNotas(planId);
};
