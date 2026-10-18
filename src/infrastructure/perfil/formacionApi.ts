// Lecturas y escrituras de Perfil > Formación.
// Port de Portal-Austral-Dev -> src/hooks/formacion/*, src/stores/useFormacionStore.ts y useAutocompletadosStore.ts.
import { endpoints } from '../../config/api/endpoints';
import { escaparXml } from '../../config/api/fetchXml';
import type { CategoriaTitulo } from '../../domain/perfil/formacion';
import type { ArchivoParaCarga } from '../legajo/familiaresApi';
import {
  escribirRegistro,
  leerCatalogoFetchXml,
  leerRegistrosDeEmpleado,
  subirArchivos,
} from './perfilApi';

type Metodo = 'post' | 'put' | 'delete';

// ---------------------------------------------------------------------------
// Empleado (nivel de educación básica y links)
// ---------------------------------------------------------------------------

export const leerEmpleadoFormacion = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_empleados',
    entidad: 'new_empleado',
    atributos: [
      'new_name',
      'new_empleadoid',
      'new_nivel',
      'new_resumen',
      'new_tituloseducacionbasica',
      'new_linklinkedin',
      'new_linkresearchgate',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
    orden: 'new_name',
  });

// ---------------------------------------------------------------------------
// Títulos
// ---------------------------------------------------------------------------

const CARRERAS: Record<CategoriaTitulo, number[]> = {
  pregrado: [100000001, 100000006],
  posgrado: [100000002, 100000004, 100000003],
  posdoctoral: [100000000],
};

const condicionCarrera = (categoria: CategoriaTitulo): string => {
  const codigos = CARRERAS[categoria];
  return codigos.length === 1
    ? `<condition attribute="new_tipodecarrera" operator="eq" value="${codigos[0]}"/>`
    : `<condition attribute="new_tipodecarrera" operator="in">${codigos.map((c) => `<value>${c}</value>`).join('')}</condition>`;
};

const ATRIBUTOS_TITULO_BASE = [
  'new_universidad',
  'new_titulo',
  'new_fechaegreso',
  'new_name',
  'new_universidadporcontactoid',
  'new_titulodelatesis',
  'new_pais',
  'new_institucionotorganteotro',
  'new_institucionfinanciadoraseleccionada',
  'new_fechadeingreso',
  'new_tipodecarrera',
  'statuscode',
  'new_institucionotorgante',
];

export const leerTitulos = (empleadoId: string, categoria: CategoriaTitulo): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_universidadporcontactos',
    entidad: 'new_universidadporcontacto',
    atributos:
      categoria === 'pregrado'
        ? [...ATRIBUTOS_TITULO_BASE, 'new_validado']
        : [...ATRIBUTOS_TITULO_BASE, 'new_lorealizoconunabeca'],
    campoEmpleado: 'new_empleado',
    empleadoId,
    descendente: true,
    filtrosExtra: condicionCarrera(categoria),
  });

const ATRIBUTOS_NOTA = [
  'annotationid',
  'subject',
  'notetext',
  'modifiedby',
  'mimetype',
  'filesize',
  'filename',
  'createdon',
  'isdocument',
];

/**
 * Constancias (notas) de los títulos del empleado, SIN el contenido.
 * DIFERENCIA CONSCIENTE con el portal: el portal pide también `documentbody` (todo el base64 de todas las
 * constancias) y después solo usa la lista. En el celular eso es costoso; el contenido se pide por título al abrirlo
 * (leerAdjuntosDeTitulo).
 */
export const leerNotasDeTitulos = async (empleadoId: string, categoria: CategoriaTitulo): Promise<unknown> => {
  const atributos = ATRIBUTOS_NOTA.map((a) => `<attribute name="${a}"/>`).join('');
  const fetch =
    `<entity name="annotation">${atributos}<order attribute="modifiedon" descending="false"/>` +
    '<link-entity name="new_universidadporcontacto" from="new_universidadporcontactoid" to="objectid" link-type="inner" alias="aj">' +
    '<attribute name="new_universidadporcontactoid"/>' +
    `<filter type="and">${condicionCarrera(categoria)}` +
    '<condition attribute="statecode" operator="eq" value="0"/>' +
    `<condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>` +
    '</filter></link-entity></entity>';
  const { consultarFetchXml } = await import('../../config/api/fetchXml');
  const { tokenDeServicio } = await import('../legajo/credencial');
  return consultarFetchXml('annotations', fetch, await tokenDeServicio());
};

/** Constancias (con contenido en base64) de UN título. */
export const leerAdjuntosDeTitulo = async (empleadoId: string, tituloId: string): Promise<unknown> => {
  const atributos = [...ATRIBUTOS_NOTA, 'documentbody'].map((a) => `<attribute name="${a}"/>`).join('');
  const fetch =
    `<entity name="annotation">${atributos}<order attribute="modifiedon" descending="false"/>` +
    '<link-entity name="new_universidadporcontacto" from="new_universidadporcontactoid" to="objectid" link-type="inner" alias="aj">' +
    '<attribute name="new_universidadporcontactoid"/>' +
    '<filter type="and">' +
    `<condition attribute="new_universidadporcontactoid" operator="eq" uitype="new_universidadporcontacto" value="${escaparXml(tituloId)}"/>` +
    '<condition attribute="statecode" operator="eq" value="0"/>' +
    `<condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>` +
    '</filter></link-entity></entity>';
  const { consultarFetchXml } = await import('../../config/api/fetchXml');
  const { tokenDeServicio } = await import('../legajo/credencial');
  return consultarFetchXml('annotations', fetch, await tokenDeServicio());
};

export const escribirTitulo = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.titulosGradoPosgrado(), metodo, data);

export const subirConstanciasDeTitulo = (tituloId: string, archivos: ArchivoParaCarga[]): Promise<unknown> => {
  if (!tituloId) throw new Error('Datos inválidos');
  return subirArchivos(endpoints.adjuntoTitulo(tituloId), archivos);
};

// ---------------------------------------------------------------------------
// Especialidad, certificaciones, idiomas y áreas de expertise
// ---------------------------------------------------------------------------

export const leerEspecialidades = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_especialidadcertificadosaluds',
    entidad: 'new_especialidadcertificadosalud',
    atributos: [
      'new_name',
      'createdon',
      'new_tipodeformacionincluidaotro',
      'new_tipodeformacionincluida',
      'new_especialidadotro',
      'new_especialidad',
      'new_fechadeinicio',
      'new_fechadefin',
      'statuscode',
      'new_anodeobtenciondelaultimacertificacin',
      'new_empleadoid',
      'new_especialidadcertificadosaludid',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
  });

export const escribirEspecialidad = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.especialidadCertificadaSalud(), metodo, data);

export const leerCertificaciones = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_certificaciones_capacitacioneses',
    entidad: 'new_certificaciones_capacitaciones',
    atributos: [
      'createdon',
      'new_tipodeformacion',
      'new_tipo',
      'new_segmento',
      'statuscode',
      'new_denominaciondelacertificacion',
      'new_certificaciones_capacitacionesid',
      'new_tipodeformacionotro',
      'new_tipodecapacitacion',
      'new_segmentootro',
      'new_fechadeinicio',
      'new_fechadefinalizacion',
      'new_institucionorganismootorgante',
      'new_fechadeobtenciondelacertificacion',
      'new_duracionenmeses',
      'new_cargahoraria',
      'new_areacapacitadora',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
    descendente: true,
  });

export const escribirCertificacion = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.certificacion(), metodo, data);

export const leerIdiomas = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_idiomaporcontactos',
    entidad: 'new_idiomaporcontacto',
    atributos: [
      'new_nivel',
      'new_lee',
      'new_idioma',
      'new_idiomalist',
      'new_habla',
      'new_escribe',
      'new_empleado',
      'new_idiomatxt',
      'new_idiomaporcontactoid',
    ],
    campoEmpleado: 'new_empleado',
    empleadoId,
  });

export const escribirIdioma = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.idioma(), metodo, data);

export const leerAreasExpertise = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_pta_areasintereses',
    entidad: 'new_pta_areasinteres',
    atributos: ['new_pta_areasinteresid', 'new_area', 'new_actuacion', 'new_otro', 'new_agrupador', 'new_area_otro'],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
  });

export const escribirAreaExpertise = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.areasDeExpertise(), metodo, data);

// ---------------------------------------------------------------------------
// Catálogos propios de Formación (useAutocompletadosStore del portal)
// ---------------------------------------------------------------------------

export const leerInstitucionesOtorgantes = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_institucionotorgantes',
    'new_institucionotorgante',
    ['new_name', 'new_codigo', 'new_institucionotorganteid'],
    'new_name',
  );

/** Agrupadores: áreas de interés sin agrupador. */
export const leerAgrupadores = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_areasdeintereses',
    'new_areasdeinteres',
    ['new_name', 'new_areasdeinteresid'],
    null,
    '<condition attribute="new_agrupador" operator="null"/>',
  );

export const leerAreasDeInteres = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_areasdeintereses',
    'new_areasdeinteres',
    ['new_areasdeinteresid', 'new_name', 'createdon', 'new_agrupador'],
    'new_name',
  );

export const leerActuaciones = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_actuacions',
    'new_actuacion',
    ['new_actuacionid', 'new_nombre', 'createdon', 'new_area'],
    'new_nombre',
  );
