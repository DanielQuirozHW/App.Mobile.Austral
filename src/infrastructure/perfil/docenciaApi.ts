// Lecturas y escrituras de Perfil > Docencia. Port de hooks/docencia/*, useAutocompletadosStore (grado académico y
// modalidad de dictado) y las páginas de perfil/docencia/* de Portal-Austral-Dev.
// DIFERENCIA CONSCIENTE: el portal tiene escrito en el FetchXML un nombre de persona de ejemplo (atributo uiname);
// no se copia, el filtro por empleado se arma solo con uitype y value.
// DIFERENCIA CONSCIENTE: no se piden los link-entity que el portal agrega y después no usa en el mapeo.
import { endpoints } from '../../config/api/endpoints';
import { escribirRegistro, leerCatalogoFetchXml, leerRegistrosDeEmpleado } from './perfilApi';
import { ESTADOS_NOMBRAMIENTO_VISIBLES } from '../../domain/perfil/docencia';

type Metodo = 'post' | 'put' | 'delete';

export const leerCategorizacionVigente = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_empleados',
    entidad: 'new_empleado',
    atributos: [
      'new_posicin',
      'new_empleadoid',
      'new_unidadorganizativa',
      'new_unidadacademica',
      'new_nivelua',
      'new_categorainvestigadorprinuar',
      'new_categoriadocenteua',
      'new_categoradocenteua',
      'new_categoriadocente',
      'new_categoriaasimilablea',
      'new_agrupadordecategorias',
      'new_fechainiciocategoria',
      'new_tipodecarreradocente',
    ],
    campoEmpleado: 'new_empleadoid',
    empleadoId,
    orden: 'new_numerolegajo',
  });

export const leerCategorizacionHistorica = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_historicocategoriasdocentes',
    entidad: 'new_historicocategoriasdocente',
    atributos: [
      'new_unidadacademicaperteneciente',
      'new_categoriaasimilablea',
      'new_fechainiciocategoria',
      'new_fechafincategoria',
      'new_dedicacion',
      'new_historicocategoriasdocenteid',
      'new_categoriadocente',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
  });

const ATRIBUTOS_NOMBRAMIENTO = [
  'new_nombramientosdocentesid',
  'new_condicion',
  'new_colaborador',
  'new_categoria',
  'new_unidadacademica',
  'new_fecha',
  'new_duracionvigencia',
  'new_resolucioncpcscd',
  'statuscode',
  'new_ciclolectivo',
];

/** Vigentes / aprobados: activos y en un estado visible (los estados en trámite no se muestran). */
export const leerNombramientosVigentes = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_nombramientosdocenteses',
    entidad: 'new_nombramientosdocentes',
    atributos: ATRIBUTOS_NOMBRAMIENTO,
    campoEmpleado: 'new_colaborador',
    empleadoId,
    filtrosExtra: `<condition attribute="statuscode" operator="in">${ESTADOS_NOMBRAMIENTO_VISIBLES.map(
      (e) => `<value>${e}</value>`,
    ).join('')}</condition>`,
  });

/** Históricos: registros con statecode 1. */
export const leerNombramientosHistoricos = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_nombramientosdocenteses',
    entidad: 'new_nombramientosdocentes',
    atributos: ATRIBUTOS_NOMBRAMIENTO,
    campoEmpleado: 'new_colaborador',
    empleadoId,
    statecode: 1,
  });

/**
 * Promociones del propio perfil: solo las que no vienen de una postulación o las que ya se comunicaron al docente
 * (soloComunicadas = true en el portal).
 */
export const leerPromociones = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_promociondocentes',
    entidad: 'new_promociondocente',
    atributos: [
      'new_promociondocenteid',
      'new_colaborador',
      'new_anoconvocatoria',
      'new_categoriapromovida',
      'new_fechapresentacion',
      'new_fecharesolucion',
      'new_resolucion',
      'statuscode',
      'new_categoriaorigen',
      'new_nivelorigen',
      'new_nivelpromovido',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    filtrosExtra:
      '<filter type="or">' +
      '<condition attribute="new_postulaciondocente" operator="null"/>' +
      '<condition entityname="post" attribute="new_comunicadodocente" operator="eq" value="1"/>' +
      '</filter>',
    extra:
      '<link-entity name="new_postulaciondocente" from="new_postulaciondocenteid" to="new_postulaciondocente" link-type="outer" alias="post"/>',
  });

export const leerDocenciasUA = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_docencias',
    entidad: 'new_docencia',
    atributos: [
      'new_docenciaid',
      'new_colaborador',
      'new_unidadacademica',
      'new_carrerapropuestaformativa',
      'new_materiaarea',
      'new_nivel',
      'new_regimendedictado',
      'new_unidaddemedida',
      'new_dedicacionhorariatotal',
      'new_modalidaddedictado',
      'new_fechainicio',
      'new_fechafin',
      'new_otronivel',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
  });

export const leerDocenciasExternas = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_docenciaexternas',
    entidad: 'new_docenciaexterna',
    atributos: [
      'new_docenciaexternaid',
      'new_name',
      'createdon',
      'new_unidadacademicafacultad',
      'new_regimendedictado',
      'new_otrocargo',
      'new_otrainstitucion',
      'new_nivel',
      'new_institucion',
      'new_fechainicio',
      'new_fechafin',
      'new_dedicacionhoraria',
      'new_dedicacion',
      'new_carrerapropuestaformativa',
      'new_cargo',
      'new_asignaturaactividadcurricular',
      'cr20a_otronivel',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
    orden: 'new_name',
  });

export const leerAsesoramientos = (empleadoId: string): Promise<unknown> =>
  leerRegistrosDeEmpleado({
    coleccion: 'new_asesoramientoacademicos',
    entidad: 'new_asesoramientoacademico',
    atributos: [
      'new_asesoramientoacademicoid',
      'new_colaborador',
      'new_cantidadalumnosasignados',
      'new_ano',
      'new_unidadacademica',
    ],
    campoEmpleado: 'new_colaborador',
    empleadoId,
  });

// --- Catálogos ---

/** Grado académico (nivel): label = new_name, value = id. */
export const leerGradosAcademicos = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_gradoacadmicos',
    'new_gradoacadmico',
    ['new_gradoacadmicoid', 'new_name', 'createdon'],
    'new_name',
  );

/** Modalidad de dictado: label = new_name, value = id. */
export const leerModalidadesDeDictado = (): Promise<unknown> =>
  leerCatalogoFetchXml(
    'new_modalidaddedictados',
    'new_modalidaddedictado',
    ['new_name', 'new_descripcion', 'new_codigodemodalidad', 'new_modalidaddedictadoid'],
    'new_name',
  );

// --- Escrituras ---

export const escribirDocenciaUA = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.docencia(), metodo, data);

export const escribirDocenciaExterna = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.docenciaExterna(), metodo, data);

export const escribirAsesoramiento = (metodo: Metodo, data: unknown): Promise<unknown> =>
  escribirRegistro(endpoints.asesoramientoAcademico(), metodo, data);
