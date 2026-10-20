// Lecturas y escrituras de Perfil > Investigación > Actividad I+D > Proyectos de investigación.
// Port de Portal-Austral-Dev -> hooks/investigacion-perfil/{useGetProyectosDeInvestigacion,useGetParticipantesProyecto,
// useCargarEditarProyectos,useCargarEditarParticipanteProyecto,useGetTablaProyInvestigacios,useCargarEditarResultadosProyecto,
// useGetResultadosProyecto,useGetMasInfoEntidad}.ts y de los hooks de catálogo (unidad organizativa, agrupador, áreas, actuación).
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml, consultarFetchXmlSingular, escaparXml } from '../../config/api/fetchXml';
import type { ConfigResultado } from '../../domain/perfil/resultadosProyecto';
import { TIPO_UNIDAD_ACADEMICA } from '../../domain/perfil/proyectos';
import { tokenDeServicio } from '../legajo/credencial';
import { escribirRegistro, leerCatalogoFetchXml } from './perfilApi';

type Metodo = 'post' | 'put' | 'delete';

const atributosXml = (lista: string[]): string => lista.map((a) => `<attribute name="${a}"/>`).join('');

const ABRE_FETCH = '<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">';

const condicionDeEmpleado = (atributo: string, empleadoId: string): string =>
  `<condition attribute="${atributo}" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>`;

// --- Proyectos ---

const ATRIBUTOS_PROYECTO: string[] = [
  'new_name',
  'new_fechadeinicio',
  'new_fechadefinalizacin',
  'new_carcterdelaparticipcin',
  'new_institucionfinanciadora',
  'new_institucionevaluadora',
  'new_institucion',
  'new_proyectosdeinvestigacinid',
  'new_tesista',
  'new_tesis',
  'new_sededeejecucionprincipal',
  'new_resumen',
  'statuscode',
  'new_palabrasclave',
  'new_otrassedesdeejecucion',
  'new_lineadeinvestigacion',
  'statecode',
  'new_duracion',
  'new_empleado',
  'new_codigo',
  'new_principalesresultados',
  'new_abstract',
  'new_relacionlineasprioritariasua',
  'new_otraareadeactuacion',
  'new_otraarea',
  'new_area',
  'new_agrupador',
  'new_actuacion',
  'new_motivoderechazosi',
  'new_secretariodeinvestigacion',
  'new_colaborador',
  'createdon',
];

/** Proyectos que el usuario creó (con su participación, si la tiene, en el alias `ac`). Endpoint singular. */
export const leerProyectosPropios = async (empleadoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `${ABRE_FETCH}<entity name="new_proyectosdeinvestigacin">${atributosXml(ATRIBUTOS_PROYECTO)}` +
    '<order attribute="createdon" descending="true"/>' +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/>' +
    `${condicionDeEmpleado('new_colaborador', empleadoId)}</filter>` +
    '<link-entity name="new_participantesproyecto" from="new_proyectoinvestigacion" to="new_proyectosdeinvestigacinid" link-type="outer" alias="ac">' +
    `${atributosXml(['new_rol', 'statuscode', 'new_participantesproyectoid', 'new_lugardetrabajo'])}` +
    `<filter type="and">${condicionDeEmpleado('new_participante', empleadoId)}</filter>` +
    '</link-entity></entity></fetch>';
  return consultarFetchXmlSingular('new_proyectosdeinvestigacins', fetch, token);
};

/** Proyectos en los que el usuario es participante (join interno, alias `af`). Endpoint singular. */
export const leerProyectosComoParticipante = async (empleadoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `${ABRE_FETCH}<entity name="new_proyectosdeinvestigacin">${atributosXml(ATRIBUTOS_PROYECTO)}` +
    '<order attribute="createdon" descending="true"/>' +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/></filter>' +
    '<link-entity name="new_participantesproyecto" from="new_proyectoinvestigacion" to="new_proyectosdeinvestigacinid" link-type="inner" alias="af">' +
    `${atributosXml(['new_rol', 'statuscode', 'new_participantesproyectoid', 'new_lugardetrabajo', 'createdon'])}` +
    '<order attribute="createdon" descending="true"/>' +
    `<filter type="and">${condicionDeEmpleado('new_participante', empleadoId)}</filter>` +
    '</link-entity></entity></fetch>';
  return consultarFetchXmlSingular('new_proyectosdeinvestigacins', fetch, token);
};

/**
 * Alta (POST), edición (PUT) y baja (DELETE ?permanente=true) de un proyecto. API v1.
 * El portal usa el empleado en sesión en la ruta, también cuando edita un participante aprobado.
 */
export const escribirProyecto = (
  metodo: Metodo,
  empleadoId: string,
  proyectoId: string | undefined,
  data?: unknown,
): Promise<unknown> => {
  if (metodo === 'post') return escribirRegistro(endpoints.proyectosInvestigacion(empleadoId), 'post', data);
  if (!proyectoId) return Promise.reject(new Error('Falta el id del proyecto.'));
  return escribirRegistro(
    endpoints.proyectoInvestigacion(empleadoId, proyectoId, metodo === 'delete'),
    metodo,
    metodo === 'delete' ? undefined : data,
  );
};

// --- Participantes ---

const ATRIBUTOS_PARTICIPANTE: string[] = [
  'new_participantesproyectoid',
  'new_lugardetrabajo',
  'new_rol',
  'new_nombreyapellido',
  'new_razonparaelestado',
  'statuscode',
  'new_participante',
  'new_otrainstitucion',
  'new_instituciondepertenencia',
  'new_proyectoinvestigacion',
  'new_motivodebaja',
  'new_creadopor',
];

/**
 * Participantes de un proyecto. El portal los pide filtrando por el proyecto (en su versión los parámetros llegan
 * cruzados con el empleado); acá el filtro es siempre por el id del proyecto.
 */
export const leerParticipantesDeProyecto = async (proyectoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `<entity name="new_participantesproyecto">${atributosXml(ATRIBUTOS_PARTICIPANTE)}` +
    '<order attribute="createdon" descending="true"/>' +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/>' +
    `<condition attribute="new_proyectoinvestigacion" operator="eq" uitype="new_proyectosdeinvestigacin" value="${escaparXml(proyectoId)}"/></filter>` +
    '<link-entity name="new_proyectosdeinvestigacin" from="new_proyectosdeinvestigacinid" to="new_proyectoinvestigacion" link-type="inner" alias="ab">' +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/></filter></link-entity></entity>';
  return consultarFetchXml('new_participantesproyectos', fetch, token);
};

export const escribirParticipante = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(
    metodo === 'delete' ? endpoints.participanteProyectoEliminar() : endpoints.participanteProyecto(),
    metodo,
    data,
  );

// --- Resultados vinculados ---

/** Vinculaciones de un tipo de resultado con un proyecto. */
export const leerResultadosVinculados = async (config: ConfigResultado, proyectoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `<entity name="${config.entidad}">` +
    `${atributosXml([config.idAttr, 'createdon', config.lookupAttr, config.vinculadoPorAttr, 'statuscode', 'new_proyectodeinvestigacion'])}` +
    '<order attribute="createdon" descending="true"/>' +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/>' +
    `<condition attribute="new_proyectodeinvestigacion" operator="eq" uitype="new_proyectosdeinvestigacin" value="${escaparXml(proyectoId)}"/></filter></entity>`;
  return consultarFetchXml(config.coleccion, fetch, token);
};

/** Registros que se pueden vincular: los del usuario y los de cada participante del proyecto (filtro OR por colaborador). */
export const leerOpcionesDeResultado = async (config: ConfigResultado, empleadoIds: string[]): Promise<unknown> => {
  const token = await tokenDeServicio();
  const unicos = Array.from(new Set(empleadoIds.filter((id) => id !== '')));
  const condiciones = unicos.map((id) => condicionDeEmpleado('new_colaborador', id)).join('');
  const fetch =
    `<entity name="${config.entidadOpciones}">${atributosXml(config.atributosOpciones)}` +
    `<order attribute="${config.ordenOpciones}" descending="true"/>` +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/>' +
    `<filter type="or">${condiciones}</filter></filter></entity>`;
  return consultarFetchXml(config.coleccionOpciones, fetch, token);
};

export const escribirResultado = (config: ConfigResultado, metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.resultadoProyecto(config.sufijoEndpoint), metodo, data);

/** Un registro por su id ("Más info" de un resultado vinculado). */
export const leerRegistroPorId = async (
  coleccion: string,
  entidad: string,
  idAttr: string,
  atributos: string[],
  id: string,
): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `<entity name="${entidad}">${atributosXml(atributos)}` +
    `<filter type="and"><condition attribute="${idAttr}" operator="eq" value="${escaparXml(id)}"/></filter></entity>`;
  return consultarFetchXml(coleccion, fetch, token);
};

// --- Catálogos ---

/** Unidades del organigrama de tipo 100000010 (sedes y "Unidad Académica") y 100000011. */
export const leerUnidadesOrganizativas = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_unidadorganigramas',
    'new_unidadorganigrama',
    ['new_name', 'new_unidadorganigramaid', 'new_tipo'],
    'new_name',
    `<condition attribute="new_tipo" operator="in"><value>${TIPO_UNIDAD_ACADEMICA}</value><value>100000011</value></condition>`,
  );

/** Áreas disciplinares (agrupadores): las áreas de interés sin agrupador. */
export const leerAgrupadores = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_areasdeintereses',
    'new_areasdeinteres',
    ['new_name', 'new_areasdeinteresid'],
    null,
    '<condition attribute="new_agrupador" operator="null"/>',
  );

/** Áreas de interés (cada una cuelga de un agrupador). */
export const leerAreasDeInteres = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_areasdeintereses',
    'new_areasdeinteres',
    ['new_areasdeinteresid', 'new_name', 'createdon', 'new_agrupador'],
    'new_name',
  );

/** Actuaciones (cada una cuelga de un área de interés). */
export const leerActuaciones = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_actuacions',
    'new_actuacion',
    ['new_actuacionid', 'new_nombre', 'createdon', 'new_area'],
    'new_nombre',
  );
