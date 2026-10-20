// Lecturas y escrituras de Perfil > Investigación > Resultados / Impacto I+D (estancias, participación en jornadas y
// producción científica con sus autores).
// Port de Portal-Austral-Dev -> store/useInvestigacionDocenciaStore.ts (fetchers) y hooks/investigacion-perfil/*.
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { ATRIBUTOS_DE_PRODUCCION } from '../../domain/perfil/produccionCientifica';
import { tokenDeServicio } from '../legajo/credencial';
import { escribirRegistro, leerRegistrosDeEmpleado } from './perfilApi';

type Metodo = 'post' | 'put' | 'delete';

const atributosXml = (atributos: string[]): string => atributos.map((x) => `<attribute name="${x}"/>`).join('');

// --- Estancias ---

/** Atributos de una estancia (también los usa el "Más info" de Proyectos de investigación). */
export const ATRIBUTOS_ESTANCIA: string[] = [
  'new_estanciasid',
  'new_tipodeactividadrealizada',
  'new_otraactividad',
  'new_institucion',
  'new_pais',
  'new_fechadeinicio',
  'new_fechadefin',
  'createdon',
];

export const leerEstancias = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_estanciases',
    entidad: 'new_estancias',
    atributos: ATRIBUTOS_ESTANCIA,
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'createdon',
    descendente: true,
  });

export const escribirEstancia = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.estancias(), metodo, data);

// --- Participación en jornadas, congresos y eventos ---

/** Atributos de una participación en jornadas (también los usa el "Más info" de Proyectos de investigación). */
export const ATRIBUTOS_JORNADA: string[] = [
  'new_participacioneneventosycongresosid',
  'new_tipodeactividad',
  'new_otraactividad',
  'new_tipodeparticipacion',
  'new_otraparticipacion',
  'new_lugar',
  'new_fecha',
  'new_name',
  'createdon',
  'statecode',
];

export const leerJornadas = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_participacioneneventosycongresoses',
    entidad: 'new_participacioneneventosycongresos',
    atributos: ATRIBUTOS_JORNADA,
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'createdon',
    descendente: true,
  });

export const escribirJornada = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.participacionJornadas(), metodo, data);

// --- Producción científica ---

/** Atributos de una producción propia (también los usa el "Más info" de Proyectos de investigación). */
export const ATRIBUTOS_PRODUCCION_PROPIA: string[] = Array.from(
  new Set(['new_produccioncientificaid', 'createdon', 'new_colaborador', ...ATRIBUTOS_DE_PRODUCCION]),
);

/** Producciones que cargó el empleado. */
export const leerProduccionesPropias = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_produccioncientificas',
    entidad: 'new_produccioncientifica',
    atributos: ATRIBUTOS_PRODUCCION_PROPIA,
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'createdon',
    descendente: true,
  });

/** Producciones de otras personas en las que el empleado figura como autor (con los datos de su participación). */
export const leerProduccionesComoAutor = async (empleadoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const atributos = Array.from(new Set([...ATRIBUTOS_PRODUCCION_PROPIA, 'statecode']));
  const fetch =
    `<entity name="new_produccioncientifica">${atributosXml(atributos)}` +
    '<order attribute="createdon" descending="true"/>' +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/></filter>' +
    '<link-entity name="new_participantesdeproduccioncientifica" from="new_produccioncientifica" ' +
    'to="new_produccioncientificaid" link-type="inner" alias="participantesdeproduccioncientifica">' +
    atributosXml([
      'new_participantesdeproduccioncientificaid',
      'new_lugardetrabajo',
      'new_nombreyapellido',
      'new_ordendeautor',
      'new_responsabledebaja',
      'new_produccioncientifica',
      'new_otro',
      'new_name',
      'new_motivodebaja',
      'new_fechadebaja',
      'statuscode',
      'statecode',
      'new_colaborador',
      'new_fechadesde',
      'createdon',
    ]) +
    '<order attribute="createdon" descending="true"/>' +
    '<filter type="and">' +
    `<condition attribute="new_colaborador" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>` +
    '</filter></link-entity></entity>';
  return consultarFetchXml('new_produccioncientificas', fetch, token);
};

export const escribirProduccion = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(metodo === 'delete' ? endpoints.produccionCientificaEliminar() : endpoints.produccionCientifica(), metodo, data);

// --- Autores de una producción ---

export const leerAutoresDeProduccion = async (produccionId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `<entity name="new_participantesdeproduccioncientifica">${atributosXml([
      'new_participantesdeproduccioncientificaid',
      'new_lugardetrabajo',
      'new_nombreyapellido',
      'new_ordendeautor',
      'new_responsabledebaja',
      'new_produccioncientifica',
      'new_otro',
      'new_name',
      'new_motivodebaja',
      'new_fechadebaja',
      'statuscode',
      'statecode',
      'new_colaborador',
      'new_fechadesde',
      'new_otrainstitucion',
    ])}` +
    '<order attribute="new_ordendeautor" descending="false"/>' +
    '<filter type="and"><condition attribute="statecode" operator="eq" value="0"/>' +
    `<condition attribute="new_produccioncientifica" operator="eq" uitype="new_produccioncientifica" value="${escaparXml(produccionId)}"/>` +
    '</filter>' +
    '<link-entity name="new_produccioncientifica" from="new_produccioncientificaid" to="new_produccioncientifica" ' +
    'link-type="inner" alias="produccioncientifica"><attribute name="new_tipodematerial"/></link-entity></entity>';
  return consultarFetchXml('new_participantesdeproduccioncientificas', fetch, token);
};

export const escribirAutor = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(metodo === 'delete' ? endpoints.autoresProduccionEliminar() : endpoints.autoresProduccion(), metodo, data);
