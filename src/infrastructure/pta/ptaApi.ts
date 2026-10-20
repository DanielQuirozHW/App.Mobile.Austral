// Lecturas y escrituras del Plan de Trabajo Anual. Port de usePlanDeTrabajoStore, useAutocompletadosStore y los hooks de
// hooks/plan-de-trabajo/* de Portal-Austral-Dev.
// DIFERENCIA CONSCIENTE: el portal tiene escrito en un FetchXML (cargos del store) un nombre de ejemplo (atributo uiname);
// no se copia. Las lecturas por empleado arman el filtro solo con uitype y value.
import { apiGet } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { mapearCatalogo } from '../../domain/legajo/mapeo';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import { LECTURAS } from '../../domain/pta/lecturas';
import type { FuenteSeccion } from '../../domain/pta/tipos';
import { cabeceraConToken, tokenDeServicio } from '../legajo/credencial';
import type { ArchivoParaCarga } from '../legajo/familiaresApi';
import { escribirRegistro, leerCatalogoFetchXml, leerRegistrosDeEmpleado, subirArchivos } from '../perfil/perfilApi';

type Metodo = 'post' | 'put' | 'delete';

const atributosXml = (atributos: string[]): string => atributos.map((a) => `<attribute name="${a}"/>`).join('');

// --- PTA del empleado ---

const ATRIBUTOS_PTA = [
  'statuscode',
  'new_docente',
  'new_anio',
  'new_plandetrabajodocenteid',
  'new_categoriadocenteuniversidad',
  'new_cantidadhorasasesoramientoacademico',
  'new_cantidaddeentrevistasplanificadas',
  'new_categoraconicet',
  'new_unidadacademica',
  'new_nroentrevistas',
  'new_nroalumnos',
  'new_totalhorasvariables',
  'new_totalhorastransferencia',
  'new_totalhorasinvestigacin',
  'new_totalhorasgestion',
  'new_totalhorasformaciones',
  'new_totalhorasformacionrrhh',
  'new_totalhorasextension',
  'new_totaldiasvariables',
  'new_totaldiastransferencia',
  'new_totaldasinvestigacin',
  'new_totaldiasgestion',
  'new_totaldiasformaciones',
  'new_totaldiasformacionrrhh',
  'new_totaldiasextension',
  'new_horastotaldocencia',
  'new_dastotaldocencia',
  'new_observacionesaldocente',
  'new_fechaapertura',
  'new_fechacierre',
  'new_fechapresentacion',
  'new_totalhorassegundedicacion',
  'new_totaldiassegundedicacion',
  'new_totalhorasptaaoanterior',
  'new_diferencia',
  'new_perfildocente',
  'new_observacionescomentario',
  'new_formacinvinculacinactividadesdeinvestigac',
  'new_totalhoras',
  'new_registrodelecturadeobservacindeldocente',
  'new_totalhorasinvestigacionanual',
  'new_comentarioshorasclases',
  'new_departamento_textarea',
  'new_perfildeliae',
  'new_dastotalescontratadosiae',
  'new_totalhoras_llena',
  'new_totaldias_llena',
  'new_tipodecarga',
  'new_categoriadocente',
];

/** Planes de trabajo del docente (statecode = 0). Devuelve el cuerpo crudo. */
export const leerPlanesDelEmpleado = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_plandetrabajodocentes',
    entidad: 'new_plandetrabajodocente',
    atributos: ATRIBUTOS_PTA,
    campoEmpleado: 'new_docente',
    empleadoId,
    orden: 'new_docente',
  });

// --- Secciones (cuelgan del PTA) ---

/** Filas de una lista del PTA (statecode = 0 y new_plandetrabajo = planId). */
export const leerSeccionDelPlan = async (fuente: FuenteSeccion, planId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const lectura = LECTURAS[fuente];
  const cargo =
    lectura.cargo === 'con'
      ? '<condition attribute="new_cargo" operator="not-null"/>'
      : lectura.cargo === 'sin'
        ? '<condition attribute="new_cargo" operator="null"/>'
        : '';
  const fetch =
    `<entity name="${lectura.entidad}">${atributosXml(lectura.atributos)}` +
    (lectura.orden ? `<order attribute="${lectura.orden}" descending="false"/>` : '') +
    '<filter type="and">' +
    '<condition attribute="statecode" operator="eq" value="0"/>' +
    `<condition attribute="new_plandetrabajo" operator="eq" uitype="new_plandetrabajodocente" value="${escaparXml(planId)}"/>` +
    `${cargo}</filter></entity>`;
  return consultarFetchXml(lectura.coleccion, fetch, token);
};

/** Indicadores de planificación del Resumen. */
export const leerIndicadoresDelPlan = async (planId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    '<entity name="new_indicadoresdeplanificacin">' +
    atributosXml([
      'new_segmento',
      'new_cantidaddehorasdedocencia',
      'new_indicadoresdeplanificacinid',
      'new_cantidaddediasplanificados',
      'new_porcentajedistribucionhoras',
      'new_porcentajedistribuciondias',
    ]) +
    '<order attribute="new_segmento" descending="false"/>' +
    '<filter type="and">' +
    '<condition attribute="statecode" operator="eq" value="0"/>' +
    `<condition attribute="new_plandetrabajo" operator="eq" uitype="new_plandetrabajodocente" value="${escaparXml(planId)}"/>` +
    '</filter></entity>';
  return consultarFetchXml('new_indicadoresdeplanificacins', fetch, token);
};

/** Adjuntos (notas) del PTA: el informe del año anterior. */
export const leerNotasDelPlan = async (planId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `<entity name="annotation">${atributosXml(['subject', 'notetext', 'filename', 'annotationid', 'createdon'])}` +
    '<order attribute="subject" descending="false"/>' +
    '<link-entity name="new_plandetrabajodocente" from="new_plandetrabajodocenteid" to="objectid" alias="pta" link-type="inner">' +
    '<filter type="and">' +
    `<condition attribute="new_plandetrabajodocenteid" operator="eq" value="${escaparXml(planId)}"/>` +
    '</filter></link-entity></entity>';
  return consultarFetchXml('annotations', fetch, token);
};

// --- Catálogos ---

/** Unidades académicas: GET api/v1/catalogos/universidades -> [{ id, nombre }]. */
export const leerUniversidades = async (): Promise<OpcionSelect[]> => {
  const token = await tokenDeServicio();
  const resp = await apiGet<Array<{ id: string; nombre: string }>>(endpoints.catalogo('universidades'), {
    headers: cabeceraConToken(token),
    reintentarVacio: true,
  });
  return Array.isArray(resp.data) ? resp.data.map(mapearCatalogo) : [];
};

/** Gran área: las filas de áreas de interés sin agrupador. */
export const leerAgrupadores = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_areasdeintereses',
    'new_areasdeinteres',
    ['new_name', 'new_areasdeinteresid'],
    null,
    '<condition attribute="new_agrupador" operator="null"/>',
  );

/** Disciplina primaria: todas las áreas de interés (cada una con su agrupador). */
export const leerDisciplinas = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_areasdeintereses',
    'new_areasdeinteres',
    ['new_areasdeinteresid', 'new_name', 'createdon', 'new_agrupador'],
    'new_name',
  );

/** Especialidad: cada una con su disciplina (new_area). */
export const leerEspecialidades = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_actuacions',
    'new_actuacion',
    ['new_actuacionid', 'new_nombre', 'createdon', 'new_area'],
    'new_nombre',
  );

// --- Escrituras ---

export const escribirSeccion = (
  endpoint: keyof typeof endpoints,
  metodo: Metodo,
  data: unknown,
): Promise<unknown> => {
  const url = (endpoints[endpoint] as () => string)();
  return escribirRegistro(url, metodo, data);
};

export const escribirPlan = (data: Record<string, unknown>): Promise<unknown> =>
  escribirRegistro(endpoints.planDeTrabajoDocente(), 'put', data);

export const enviarPlan = (data: Record<string, unknown>): Promise<unknown> =>
  escribirRegistro(endpoints.cambiarRazonParaElEstadoPTA(), 'put', data);

export const eliminarNota = (annotationId: string): Promise<unknown> =>
  escribirRegistro(endpoints.nota(), 'delete', { annotationid: annotationId });

export const subirInformeAnterior = (planId: string, archivos: ArchivoParaCarga[]): Promise<unknown> =>
  subirArchivos(endpoints.adjuntoPta(planId), archivos);
