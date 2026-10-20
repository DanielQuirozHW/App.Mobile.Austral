// Plan de Trabajo Anual (PTA): definición de las 18 secciones de carga.
// Cada sección dice qué campos tiene su formulario, qué muestra la tarjeta, qué mensajes usa, a qué endpoint escribe y
// qué cuerpo manda. Todo sale de Portal-Austral-Dev (modales de plan-de-trabajo, columns/columnsPlanTrabajo.tsx,
// hooks useCargar* / useEditar* y usePlanDeTrabajoStore).
import { aFechaApi } from '../legajo/fechas';
import {
  AYUDA_CARGO,
  AYUDA_DESARROLLO_MATERIAL,
  AYUDA_ENCARGO,
  AYUDA_EXTENSION,
  AYUDA_FORMACION_HUMANISTICA,
  AYUDA_FORMACION_PEDAGOGICA,
  AYUDA_SEMINARIOS,
  AYUDA_TIEMPO_DICTADO,
  AYUDA_TIPO_CLASE,
  AYUDA_TRANSFERENCIA,
  AYUDA_VARIABLES,
} from './constantes';
import { codigoEs, etiquetaEs } from './opciones';
import type { CampoPta, ClaveSeccion, FuenteSeccion, RegistroPta } from './tipos';

/** Endpoints de escritura (claves de config/api/endpoints.ts). */
export type EndpointPta =
  | 'clasePlanDeTrabajo'
  | 'areaInteresPlanDeTrabajo'
  | 'proyectosInvestigacionPlanDeTrabajo'
  | 'publicacionesRevistaPlanDeTrabajo'
  | 'congresosPlanDeTrabajo'
  | 'divulgacionesPlanDeTrabajo'
  | 'direccionDeTesisPlanDeTrabajo'
  | 'juradoTFPlanDeTrabajo'
  | 'cargosYEncargosPlanDeTrabajo'
  | 'extensionPlanDeTrabajo'
  | 'transferenciaPlanDeTrabajo'
  | 'formacionesPlanDeTrabajo'
  | 'bloquesPlanDeTrabajo';

export interface ContextoPayload {
  planId: string;
  /** Id del registro cuando se edita. */
  id?: string;
  /** Registro que se edita. */
  item?: RegistroPta;
}

export interface LineaTarjeta {
  label: string;
  valor: (item: RegistroPta) => string;
}

export interface MensajesSeccion {
  /** Mientras se guarda un alta. */
  procesando: string;
  /** Mientras se guarda una edición (por defecto, el mismo). */
  procesandoEdicion?: string;
  alta: string;
  edicion: string;
  eliminando: string;
  eliminado: string;
  /** Texto que antecede al detalle del error de baja ("Error al eliminar el Encargo:  "). */
  errorEliminar?: string;
}

export interface DefinicionSeccion {
  clave: ClaveSeccion;
  fuente: FuenteSeccion;
  /** Título del modal. */
  titulo: string;
  /** Texto de ayuda de la sección (tooltip del portal). */
  ayuda?: string;
  campos: CampoPta[];
  tituloDe: (item: RegistroPta) => string;
  lineas: LineaTarjeta[];
  textoAgregar?: string;
  textoVacio: string;
  /** Pregunta del diálogo de baja. */
  mensajeEliminar?: string;
  puedeAgregar: boolean;
  puedeEliminar: boolean;
  endpoint: EndpointPta;
  /** Nombre del campo id en el cuerpo de PUT / DELETE. */
  campoId: string;
  mensajes: MensajesSeccion;
  /** Cuerpo del POST (sin id) o del PUT (con id). */
  payload: (valores: any, contexto: ContextoPayload) => Record<string, any>;
  /** Para las formaciones: cuáles de la lectura común pertenecen a esta sección. */
  filtro?: (item: RegistroPta) => boolean;
  /** Código new_tema de las formaciones. */
  tema?: number;
}

// --- Utilidades ---

const n = (x: unknown): number => Number(x) || 0;
const s = (x: unknown): string => (x as string) || '';
const v = (o: any): any => o?.value;

const linea = (label: string, campo: string): LineaTarjeta => ({
  label,
  valor: (i) => {
    const x = i[campo];
    if (x === null || x === undefined) return '';
    if (typeof x === 'object') return String(x.label ?? '');
    return String(x);
  },
});

/** Cabecera del cuerpo: el plan en el alta; el id (y en la mayoría el plan) en la edición. */
const cabecera = (ctx: ContextoPayload, campoId: string, conPlanEnEdicion = true): Record<string, any> => {
  if (!ctx.id) return { new_plandetrabajo: ctx.planId };
  return conPlanEnEdicion
    ? { [campoId]: ctx.id, new_plandetrabajo: ctx.item?.idPlanTrabajo || ctx.planId }
    : { [campoId]: ctx.id };
};

const esOtra = (campo: string) => (valores: any) => etiquetaEs(valores?.[campo], 'Otra');

const campoUnidadMedida: CampoPta = {
  nombre: 'unidadMedida',
  label: 'Unidad de medida',
  tipo: 'select',
  requerido: true,
  mensajeRequerido: 'La unidad de medida es requerida',
  opciones: 'unidadMedida',
};

const campoEntero = (nombre: string, label: string, mensajeRequerido: string, baseNumero: string): CampoPta => ({
  nombre,
  label,
  tipo: 'entero',
  requerido: true,
  mensajeRequerido,
  baseNumero,
});

const campoOtraUnidad = (campo = 'unidadAcademica'): CampoPta => ({
  nombre: 'otraUnidadAcademica',
  label: 'Otra Unidad Académica',
  tipo: 'texto',
  requerido: true,
  mensajeRequerido: 'La otra unidad académica es requerida',
  visibleSi: esOtra(campo),
});

const MENSAJE_ELIMINAR = (sustantivo: string): string => `¿Estás seguro de que deseas eliminar ${sustantivo}?`;

// --- Secciones ---

const CLASES: DefinicionSeccion = {
  clave: 'clases',
  fuente: 'clases',
  titulo: 'Clases',
  campos: [
    {
      nombre: 'unidadAcademica',
      label: 'Unidad académica',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La unidad académica es requerida',
      opciones: 'universidades',
    },
    {
      nombre: 'carrera',
      label: 'Carrera / tipo de programa',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'La carrera / tipo de programa es requerido',
      maximo: 200,
      mensajeMaximo: 'La carrera / tipo de programa no puede tener más de 200 caracteres',
    },
    { nombre: 'formaDictado', label: 'Cuatrimestre en el que dicta la materia', tipo: 'select', opciones: 'formaDictado' },
    {
      nombre: 'nivel',
      label: 'Nivel',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El nivel es requerido',
      opciones: 'nivelesClase',
    },
    {
      nombre: 'otroNivel',
      label: 'Otro Nivel',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El otro nivel es requerido',
      soloLetras: true,
      visibleSi: (valores) => etiquetaEs(valores?.nivel, 'Otro'),
    },
    {
      nombre: 'materia',
      label: 'Materia / área',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'La materia / área es requerida',
      maximo: 200,
      mensajeMaximo: 'La materia / área no puede tener más de 200 caracteres',
    },
    { nombre: 'teamTeaching', label: 'Teaching (Solo IAE)', tipo: 'select', opciones: 'teaching' },
    {
      nombre: 'modalidad',
      label: 'Modalidad',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La modalidad es requerida',
      opciones: 'modalidades',
    },
    {
      nombre: 'otraModalidad',
      label: 'Otra Modalidad',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'La otra modalidad es requerida',
      visibleSi: esOtra('modalidad'),
    },
    {
      nombre: 'tipo',
      label: 'Tipo',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El tipo es requerido',
      opciones: 'tipoClase',
      ayuda: AYUDA_TIPO_CLASE,
    },
    campoUnidadMedida,
    {
      ...campoEntero('tiempoDictado', 'Tiempo dictado', 'El tiempo de dictado es requerido', 'El tiempo de dictado'),
      ayuda: AYUDA_TIEMPO_DICTADO,
    },
    {
      nombre: 'tiempoPreparacion',
      label: 'Tiempo de preparación',
      tipo: 'entero',
      baseNumero: 'El tiempo de preparación',
    },
    { nombre: 'evaluacion', label: 'Tiempo de evaluación', tipo: 'entero', baseNumero: 'El tiempo de evaluación' },
    {
      nombre: 'desarrolloMaterial',
      label: 'Tiempo de desarrollo de material / Armado Campus',
      tipo: 'entero',
      baseNumero: 'El tiempo de desarrollo de material',
      ayuda: AYUDA_DESARROLLO_MATERIAL,
    },
    campoOtraUnidad(),
  ],
  tituloDe: (i) => i.materia || 'Clase',
  lineas: [
    linea('Unidad académica', 'unidadAcademica'),
    linea('Nivel', 'nivel'),
    linea('Carrera / tipo de programa', 'carrera'),
    linea('Materia / área', 'materia'),
    linea('Cuatrimestre', 'formaDictado'),
    linea('Teaching', 'teamTeaching'),
    linea('Tipo', 'tipo'),
    linea('Modalidad', 'modalidad'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo dictado', 'tiempoDictado'),
    linea('Tiempo preparación', 'tiempoPreparacion'),
    linea('Evaluación', 'evaluacion'),
    linea('Desarrollo de material / campus', 'desarrolloMaterial'),
    linea('Total unidades', 'totalUnidades'),
    linea('Horas total', 'horatotal'),
  ],
  textoAgregar: 'Agregar clase',
  textoVacio: 'Todavía no cargaste clases.',
  mensajeEliminar: MENSAJE_ELIMINAR('esta clase'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'clasePlanDeTrabajo',
  campoId: 'new_tpa_clasesid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Clase creada correctamente',
    edicion: 'Clase editada correctamente',
    eliminando: 'Eliminando clase...',
    eliminado: 'Proceso exitoso',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_tpa_clasesid'),
    new_unidadacadmica: v(x.unidadAcademica) || '',
    new_nivel: v(x.nivel) || '',
    new_carrera: s(x.carrera),
    new_materia: s(x.materia),
    new_teamteaching: n(v(x.teamTeaching)),
    new_tipo: n(v(x.tipo)),
    new_modalidad: v(x.modalidad) || '',
    new_unidaddemedida: n(v(x.unidadMedida)),
    new_tiempodedictado: n(x.tiempoDictado),
    new_tiempodepreparacion: n(x.tiempoPreparacion),
    new_evaluacion: n(x.evaluacion),
    new_desarrollomaterialcampus: n(x.desarrolloMaterial),
    new_otraunidadacademica: s(x.otraUnidadAcademica),
    new_otramodalidad: s(x.otraModalidad),
    new_otronivel: s(x.otroNivel),
    new_formadictado: v(x.formaDictado) || 0,
    ...(ctx.id ? { statecode: ctx.item?.statecode || 0 } : {}),
  }),
};

const AREAS: DefinicionSeccion = {
  clave: 'areas',
  fuente: 'areas',
  titulo: 'Áreas de interés',
  campos: [
    {
      nombre: 'agrupador',
      label: 'Gran Área',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'Gran Área es requerido',
      opciones: 'agrupadores',
      buscable: true,
      limpia: ['areas', 'actuacion'],
    },
    {
      nombre: 'areas',
      label: 'Disciplina primaria',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La disciplina primaria es requerida',
      opciones: 'disciplinas',
      buscable: true,
      limpia: ['actuacion'],
    },
    {
      nombre: 'actuacion',
      label: 'Especialidad',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La especialidad es requerida',
      opciones: 'especialidades',
      buscable: true,
    },
    {
      nombre: 'otro',
      label: 'Otra área de interés',
      tipo: 'texto',
      maximo: 100,
      mensajeMaximo: 'Máximo 100 caracteres',
    },
  ],
  tituloDe: (i) => i.areas?.label || 'Área de interés',
  lineas: [
    linea('Gran Área', 'agrupador'),
    linea('Disciplina primaria', 'areas'),
    linea('Especialidad', 'actuacion'),
    linea('Otra área de interés', 'otro'),
  ],
  textoAgregar: 'Agregar área de interés',
  textoVacio: 'Todavía no cargaste áreas de interés.',
  mensajeEliminar: MENSAJE_ELIMINAR('esta área'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'areaInteresPlanDeTrabajo',
  campoId: 'new_pta_areasinteresid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Área de interés creada correctamente',
    edicion: 'Area de interes editada correctamente',
    eliminando: 'Eliminando área de interés...',
    eliminado: 'Proceso exitoso',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_areasinteresid'),
    new_agrupador: v(x.agrupador) || '',
    new_area: v(x.areas) || '',
    new_actuacion: v(x.actuacion) || '',
    new_otro: s(x.otro),
  }),
};

const PROYECTOS: DefinicionSeccion = {
  clave: 'proyectos',
  fuente: 'proyectos',
  titulo: 'Proyectos de Investigación',
  campos: [
    {
      nombre: 'unidadAcademica',
      label: 'Unidad Académica / Instituto',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La Unidad Académica / Instituto es requerido',
      opciones: 'universidades',
    },
    {
      nombre: 'director',
      label: 'Director de la línea de investigacion',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'Director de la línea de investigacion es requerido',
    },
    {
      nombre: 'lineaInvestigacion',
      label: 'Grupo o línea de investigación',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'Grupo o línea de investigación es requerido',
      maximo: 200,
      mensajeMaximo: 'Grupo o línea de investigación no puede tener más de 200 caracteres',
    },
    {
      nombre: 'financiamiento',
      label: 'Financiamiento',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El financiamiento es requerido',
      opciones: 'financiamiento',
    },
    {
      nombre: 'proyecto',
      label: 'Proyecto',
      tipo: 'multilinea',
      requerido: true,
      mensajeRequerido: 'El proyecto es requerido',
      maximo: 4000,
      mensajeMaximo: 'El proyecto no puede tener más de 4000 caracteres',
      contador: true,
    },
    campoOtraUnidad(),
  ],
  tituloDe: (i) => i.lineaInvestigacion || 'Proyecto de investigación',
  lineas: [
    linea('Unidad Académica / instituto', 'unidadAcademica'),
    linea('Grupo o línea de investigación', 'lineaInvestigacion'),
    linea('Director de la línea de investigación', 'director'),
    linea('Financiamiento', 'financiamiento'),
    linea('Proyecto', 'proyecto'),
  ],
  textoAgregar: 'Agregar proyecto',
  textoVacio: 'Todavía no cargaste proyectos de investigación.',
  mensajeEliminar: MENSAJE_ELIMINAR('este proyecto'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'proyectosInvestigacionPlanDeTrabajo',
  campoId: 'new_pta_proyectosinvestigacionid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Proyecto de investigación creado correctamente',
    edicion: 'Proyecto de investigación editado correctamente',
    eliminando: 'Eliminando proyecto...',
    eliminado: 'Proceso exitoso',
  },
  // El PUT del portal no manda el plan.
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_proyectosinvestigacionid', false),
    new_unidadacademicainstituto: v(x.unidadAcademica) || '',
    new_lineadeinvestigacion: s(x.lineaInvestigacion),
    new_financiamiento: n(v(x.financiamiento)),
    new_directordelalineadeinvestigacion: s(x.director),
    new_cantidad: n(ctx.item?.cantidad),
    statecode: ctx.item?.statecode || 0,
    new_otraunidadacademica: s(x.otraUnidadAcademica),
    new_descripciondelproyecto: s(x.proyecto),
  }),
};

const PUBLICACIONES: DefinicionSeccion = {
  clave: 'publicaciones',
  fuente: 'publicaciones',
  titulo: 'N° de publicaciones previstas',
  campos: [
    {
      nombre: 'nombre',
      label: 'Nombre / Temática',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'Nombre / Temática es requerido',
    },
    {
      nombre: 'statuscode',
      label: 'Estado',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El Estado es requerido',
      opciones: 'estadoPublicacion',
    },
    {
      nombre: 'tipoPublicacion',
      label: 'Tipo de publicación',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El tipo de publicación es requerido',
      opciones: 'tipoPublicacion',
    },
    {
      nombre: 'revista',
      label: 'Revista y/o editorial',
      tipo: 'texto',
      maximo: 200,
      mensajeMaximo: 'Revista y/o editorial no puede tener más de 200 caracteres',
    },
  ],
  tituloDe: (i) => i.nombre || 'Publicación prevista',
  lineas: [
    linea('Nombre / Temática', 'nombre'),
    linea('Estado', 'statuscode'),
    linea('Tipo de publicación', 'tipoPublicacion'),
    linea('Revista y/o editorial', 'revista'),
  ],
  textoAgregar: 'Agregar publicación',
  textoVacio: 'Todavía no cargaste publicaciones previstas.',
  mensajeEliminar: MENSAJE_ELIMINAR('esta publicación'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'publicacionesRevistaPlanDeTrabajo',
  campoId: 'new_pta_publicacionesprevistasid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Publicación prevista creada correctamente',
    edicion: 'Publicación prevista editada correctamente',
    eliminando: 'Eliminando publicación...',
    eliminado: 'Proceso exitoso',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_publicacionesprevistasid'),
    new_name: s(x.nombre),
    new_revistayoeditorial: s(x.revista),
    new_tipodepublicacion: v(x.tipoPublicacion) || 0,
    statuscode: v(x.statuscode) || 0,
  }),
};

const CONGRESOS: DefinicionSeccion = {
  clave: 'congresos',
  fuente: 'congresos',
  titulo: 'Congresos',
  campos: [
    {
      nombre: 'tipoCongreso',
      label: 'Tipo de congreso',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El tipo de congreso es requerido',
      opciones: 'tipoCongreso',
    },
    {
      nombre: 'tipoParticipacion',
      label: 'Tipo de participación',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El tipo participación es requerido',
      opciones: 'tipoParticipacion',
    },
    {
      nombre: 'nombre',
      label: 'Nombre/Temática del Congreso',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El nombre es requerido',
    },
    { nombre: 'fechaModal', label: 'Fecha', tipo: 'fecha' },
    { nombre: 'lugar', label: 'Lugar', tipo: 'texto', requerido: true, mensajeRequerido: 'El lugar es requerido' },
    {
      nombre: 'nombreArticulo',
      label: 'Nombre del articulo a presentar',
      tipo: 'texto',
      maximo: 200,
      mensajeMaximo: 'El nombre del articulo no puede tener más de 200 caracteres',
    },
    {
      nombre: 'otroTipoParticipacion',
      label: 'Otro Tipo de participación',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El otro tipo de participación es requerido',
      visibleSi: (valores) => codigoEs(valores?.tipoParticipacion, 100000002),
    },
  ],
  tituloDe: (i) => i.nombre || 'Congreso',
  lineas: [
    linea('Tipo de congreso', 'tipoCongreso'),
    linea('Tipo de participación', 'tipoParticipacion'),
    linea('Nombre/Temática del Congreso', 'nombre'),
    linea('Fecha', 'fechaModal'),
    linea('Lugar', 'lugar'),
    linea('Nombre del artículo a presentar', 'nombreArticulo'),
  ],
  textoAgregar: 'Agregar congreso',
  textoVacio: 'Todavía no cargaste congresos.',
  mensajeEliminar: MENSAJE_ELIMINAR('este congreso'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'congresosPlanDeTrabajo',
  campoId: 'new_pta_congresosid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Congreso creado correctamente',
    edicion: 'Congreso editado correctamente',
    eliminando: 'Eliminando congreso...',
    eliminado: 'Proceso exitoso',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_congresosid'),
    new_name: s(x.nombre),
    new_tipodecongreso: n(v(x.tipoCongreso)),
    new_tipodeparticipacionesperada: n(v(x.tipoParticipacion)),
    new_fecha: x.fechaModal instanceof Date ? aFechaApi(x.fechaModal) : null,
    new_lugar: s(x.lugar),
    new_nombredelarticuloapresentar: s(x.nombreArticulo),
    new_otrotipodeparticipacion: s(x.otroTipoParticipacion),
  }),
};

const DIVULGACIONES: DefinicionSeccion = {
  clave: 'divulgaciones',
  fuente: 'divulgaciones',
  titulo: 'Divulgación',
  campos: [
    {
      nombre: 'tipo',
      label: 'Tipo',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El tipo es requerido',
      opciones: 'tipoDivulgacion',
    },
    campoUnidadMedida,
    campoEntero('cantidadPreparacion', 'Tiempo preparación', 'La cantidad es requerida', 'La cantidad'),
    campoEntero('cantidadDivulgacion', 'Tiempo divulgación', 'La cantidad es requerida', 'La cantidad'),
    {
      nombre: 'otroTipo',
      label: 'Otro Tipo',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El otro tipo es requerido',
      visibleSi: (valores) => codigoEs(valores?.tipo, 100000002),
    },
  ],
  tituloDe: (i) => i.tipo?.label || 'Divulgación',
  lineas: [
    linea('Tipo', 'tipo'),
    linea('Tiempo preparación', 'cantidadPreparacion'),
    linea('Tiempo divulgación', 'cantidadDivulgacion'),
    linea('Horas preparación', 'horasPreparacion'),
    linea('Horas divulgación', 'horasDivulgacion'),
    linea('Horas Totales', 'horasTotales'),
  ],
  textoAgregar: 'Agregar divulgación',
  textoVacio: 'Todavía no cargaste divulgaciones.',
  mensajeEliminar: MENSAJE_ELIMINAR('esta divulgación'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'divulgacionesPlanDeTrabajo',
  campoId: 'new_pta_divulgacionesid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Divulgación creada correctamente',
    edicion: 'Divulgación editada correctamente',
    eliminando: 'Eliminando divulgación...',
    eliminado: 'Proceso exitoso',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_divulgacionesid'),
    new_tipo: n(v(x.tipo)),
    new_unidaddemedida: n(v(x.unidadMedida)),
    new_cantidadpreparacion: n(x.cantidadPreparacion),
    new_cantidaddivulgacion: n(x.cantidadDivulgacion),
    new_otrotipo: s(x.otroTipo),
  }),
};

const TESIS: DefinicionSeccion = {
  clave: 'tesis',
  fuente: 'tesis',
  titulo: 'Dirección de tesis / trabajos finales',
  campos: [
    {
      nombre: 'nombreAlumno',
      label: 'Nombre del alumno',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El nombre del alumno es requerido',
    },
    {
      nombre: 'unidadAcademica',
      label: 'Unidad académica',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La Unidad académica es requerida',
      opciones: 'universidades',
    },
    {
      nombre: 'tituloObtener',
      label: 'Título a obtener',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El título a obtener académica es requerido',
      opciones: 'titulosTesis',
    },
    {
      nombre: 'avance',
      label: 'Avance',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El Avance es requerido',
      opciones: 'avanceTesis',
    },
    campoUnidadMedida,
    campoEntero('tiempoAsignado', 'Tiempo asignado', 'El tiempo asignado es requerido', 'El tiempo asignado'),
    campoOtraUnidad(),
  ],
  tituloDe: (i) => i.nombreAlumno || 'Dirección de tesis',
  lineas: [
    linea('Nombre del alumno', 'nombreAlumno'),
    linea('Unidad Académica', 'unidadAcademica'),
    linea('Título a obtener', 'tituloObtener'),
    linea('Avance', 'avance'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo Asignado', 'tiempoAsignado'),
    linea('Horas totales', 'horasTotales'),
  ],
  textoAgregar: 'Agregar dirección de tesis',
  textoVacio: 'Todavía no cargaste direcciones de tesis.',
  mensajeEliminar: MENSAJE_ELIMINAR('esta dirección de tesis'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'direccionDeTesisPlanDeTrabajo',
  campoId: 'new_pta_direcciontesisid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Dirección de tesis creada correctamente',
    edicion: 'Dirección de tesis editada correctamente',
    eliminando: 'Eliminando dirección de tesis...',
    eliminado: 'Proceso exitoso',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_direcciontesisid'),
    new_nombredelalumno: s(x.nombreAlumno),
    new_unidadacadmica: v(x.unidadAcademica) || '',
    new_tituloaobtener: v(x.tituloObtener) || '',
    new_avance: n(v(x.avance)),
    new_unidaddemedida: n(v(x.unidadMedida)),
    new_tiempoasignado: n(x.tiempoAsignado),
    new_otraunidadacademica: s(x.otraUnidadAcademica),
  }),
};

const JURADOS: DefinicionSeccion = {
  clave: 'jurados',
  fuente: 'jurados',
  titulo: 'Jurado de trabajos finales / Tesis',
  campos: [
    {
      nombre: 'tipo',
      label: 'Nivel académico',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'El nivel académico es requerido',
      opciones: 'nivelJurado',
    },
    {
      nombre: 'unidadAcademica',
      label: 'Unidad Académica',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La unidad Académica es requerida',
      opciones: 'universidadesJurado',
    },
    campoUnidadMedida,
    campoEntero('cantidad', 'Tiempo asignado', 'La cantidad es requerida', 'La cantidad'),
  ],
  tituloDe: (i) => i.tipo?.label || 'Jurado',
  lineas: [
    linea('Nivel Académico', 'tipo'),
    linea('Unidad Académica', 'unidadAcademica'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo asignado', 'cantidad'),
    linea('Horas totales', 'horasTotales'),
  ],
  textoAgregar: 'Agregar jurado',
  textoVacio: 'Todavía no cargaste jurados.',
  mensajeEliminar: MENSAJE_ELIMINAR('este jurado'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'juradoTFPlanDeTrabajo',
  campoId: 'new_pta_juradotrabajosfinalesid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Jurado de trabajo final creado correctamente',
    edicion: 'Jurado de trabajo final editado correctamente',
    eliminando: 'Eliminando jurado de trabajo final...',
    eliminado: 'Proceso exitoso',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_juradotrabajosfinalesid'),
    new_tipojurado: v(x.tipo) || '',
    new_unidadacadmica: v(x.unidadAcademica) || '',
    new_unidaddemedida: n(v(x.unidadMedida)),
    new_cantidad: n(x.cantidad),
  }),
};

/** Cargo: el portal solo permite ver y editar (los cargos los asigna la Universidad). */
const CARGOS: DefinicionSeccion = {
  clave: 'cargos',
  fuente: 'cargos',
  titulo: 'Gestión cargo',
  ayuda: AYUDA_CARGO,
  campos: [
    { nombre: 'cargo', label: 'Cargo', tipo: 'texto', soloLectura: true },
    { nombre: 'unidadAcademica', label: 'Unidad académica', tipo: 'texto', soloLectura: true },
    {
      nombre: 'propuestaFormativa',
      label: 'Propuesta formativa',
      tipo: 'texto',
      maximo: 200,
      mensajeMaximo: 'La propuesta formativa no puede tener más de 200 caracteres',
    },
    campoUnidadMedida,
    campoEntero('tiempoAsignado', 'Tiempo Asignado', 'El tiempo asignado es requerido', 'El tiempo asignado'),
  ],
  tituloDe: (i) => i.cargo?.label || 'Cargo',
  lineas: [
    linea('Cargo', 'cargo'),
    linea('Unidad Académica', 'unidadAcademica'),
    linea('Propuesta formativa', 'propuestaFormativa'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo Asignado', 'tiempoAsignado'),
    linea('Horas totales', 'horasTotales'),
  ],
  textoVacio: 'No tenés cargos registrados.',
  mensajeEliminar: MENSAJE_ELIMINAR('este cargo'),
  puedeAgregar: false,
  puedeEliminar: false,
  endpoint: 'cargosYEncargosPlanDeTrabajo',
  campoId: 'new_pta_cargos_encargosid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Cargo cargado correctamente',
    edicion: 'Cargo editado correctamente',
    eliminando: 'Eliminando...',
    eliminado: 'Cargo eliminado correctamente',
    errorEliminar: 'Error al eliminar el Cargo:  ',
  },
  // editarCargoSolo: la unidad académica va como new_UnidadAcademicaDelCargo (la del registro, que no se edita).
  payload: (x, ctx) => ({
    new_pta_cargos_encargosid: ctx.id,
    new_propuestaformativa: s(x.propuestaFormativa),
    new_unidaddemedida: n(v(x.unidadMedida)),
    new_tiempoasignado: n(x.tiempoAsignado),
    new_UnidadAcademicaDelCargo: v(ctx.item?.unidadAcademica) || '',
  }),
};

const ENCARGOS: DefinicionSeccion = {
  clave: 'encargos',
  fuente: 'encargos',
  titulo: 'Gestión encargo',
  ayuda: AYUDA_ENCARGO,
  campos: [
    {
      nombre: 'unidadAcademica',
      label: 'Unidad académica',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La unidad académica es requerida',
      opciones: 'universidades',
    },
    {
      nombre: 'encargo',
      label: 'Encargo',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El encargo es requerido',
      maximo: 200,
      mensajeMaximo: 'El Encargo no puede tener más de 200 caracteres',
    },
    {
      nombre: 'propuestaFormativa',
      label: 'Propuesta formativa',
      tipo: 'texto',
      maximo: 200,
      mensajeMaximo: 'La propuesta formativa no puede tener más de 200 caracteres',
    },
    campoUnidadMedida,
    campoEntero('tiempoAsignado', 'Tiempo Asignado', 'El tiempo asignado es requerido', 'El tiempo asignado'),
    campoOtraUnidad(),
  ],
  tituloDe: (i) => i.encargo || 'Encargo',
  lineas: [
    linea('Unidad Académica', 'unidadAcademica'),
    linea('Encargo', 'encargo'),
    linea('Propuesta formativa', 'propuestaFormativa'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo Asignado', 'tiempoAsignado'),
    linea('Horas totales', 'horasTotales'),
  ],
  textoAgregar: 'Agregar encargo',
  textoVacio: 'Todavía no cargaste encargos.',
  mensajeEliminar: MENSAJE_ELIMINAR('este encargo'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'cargosYEncargosPlanDeTrabajo',
  campoId: 'new_pta_cargos_encargosid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Encargo cargado correctamente',
    edicion: 'Encargo editado correctamente',
    eliminando: 'Eliminando...',
    eliminado: 'Encargo eliminado correctamente',
    errorEliminar: 'Error al eliminar el Encargo:  ',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_cargos_encargosid', false),
    new_propuestaformativa: s(x.propuestaFormativa),
    new_unidaddemedida: n(v(x.unidadMedida)),
    new_tiempoasignado: n(x.tiempoAsignado),
    new_unidadacadmica: v(x.unidadAcademica) || '',
    new_otraunidadacademica: s(x.otraUnidadAcademica),
    new_encargo: s(x.encargo),
  }),
};

const EXTENSION: DefinicionSeccion = {
  clave: 'extension',
  fuente: 'extension',
  titulo: 'Extensión',
  ayuda: AYUDA_EXTENSION,
  campos: [
    {
      nombre: 'actividad',
      label: 'Actividad',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'La actividad es requerida',
    },
    // En el portal la unidad académica de Extensión no es obligatoria para guardar.
    { nombre: 'unidadAcademica', label: 'Unidad académica', tipo: 'select', opciones: 'universidades' },
    campoUnidadMedida,
    campoEntero('cantidad', 'Tiempo asignado', 'La cantidad es requerido', 'La cantidad'),
    { ...campoOtraUnidad(), requerido: true },
  ],
  tituloDe: (i) => i.actividad || 'Extensión',
  lineas: [
    linea('Actividad', 'actividad'),
    linea('Unidad Académica', 'unidadAcademica'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo asignado', 'cantidad'),
    linea('Horas reloj', 'horasReloj'),
  ],
  textoAgregar: 'Agregar extensión',
  textoVacio: 'Todavía no cargaste actividades de extensión.',
  mensajeEliminar: MENSAJE_ELIMINAR('esta extensión'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'extensionPlanDeTrabajo',
  campoId: 'new_pta_extensionid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Extensión creada correctamente',
    edicion: 'Extensión editada correctamente',
    eliminando: 'Eliminando extensión...',
    eliminado: 'Proceso exitoso',
  },
  // El PUT del portal no manda el plan.
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_extensionid', false),
    new_actividad: s(x.actividad),
    new_unidadacadmica: v(x.unidadAcademica) || '',
    new_unidaddemedida: n(v(x.unidadMedida)),
    new_cantidad: n(x.cantidad),
    new_otraunidadacademica: s(x.otraUnidadAcademica),
  }),
};

const TRANSFERENCIA: DefinicionSeccion = {
  clave: 'transferencia',
  fuente: 'transferencia',
  titulo: 'Transferencia',
  ayuda: AYUDA_TRANSFERENCIA,
  campos: [
    {
      nombre: 'actividad',
      label: 'Tipo de actividad',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El tipo de actividad es requerido',
    },
    {
      nombre: 'unidadAcademica',
      label: 'Unidad Académica',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La Unidad Académica es requerida',
      opciones: 'universidades',
    },
    {
      nombre: 'nombre',
      label: 'Nombre de actividad',
      tipo: 'texto',
      requerido: true,
      mensajeRequerido: 'El Nombre de actividad es requerido',
    },
    campoEntero('horasDedicadas', 'Horas dedicadas', 'Las horas dedicadas es requerida', 'Las horas dedicadas'),
    campoOtraUnidad(),
  ],
  tituloDe: (i) => i.nombre || 'Transferencia',
  lineas: [
    linea('Tipo de actividad', 'actividad'),
    linea('Unidad Académica', 'unidadAcademica'),
    linea('Nombre de actividad', 'nombre'),
    linea('Horas dedicadas', 'horasDedicadas'),
  ],
  textoAgregar: 'Agregar transferencia',
  textoVacio: 'Todavía no cargaste transferencias.',
  mensajeEliminar: MENSAJE_ELIMINAR('esta transferencia'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'transferenciaPlanDeTrabajo',
  campoId: 'new_pta_transferenciaid',
  mensajes: {
    procesando: 'Cargando...',
    procesandoEdicion: 'Editando...',
    alta: 'Transferencia cargada correctamente',
    edicion: 'Transferencia editada correctamente',
    eliminando: 'Eliminando...',
    eliminado: 'Transferencia eliminada correctamente',
    errorEliminar: 'Error al eliminar la Transferencia:  ',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_transferenciaid', false),
    new_tipodeactividad: s(x.actividad),
    new_unidadacadmica: v(x.unidadAcademica) || '',
    new_name: s(x.nombre),
    new_horasdedicadas: n(x.horasDedicadas),
    new_otraunidadacademica: s(x.otraUnidadAcademica),
  }),
};

// --- Formaciones: 5 secciones sobre la misma lectura y el mismo endpoint ---

const TEMA_ESPECIFICA = 100000000;
const TEMA_HUMANISTICA = 100000001;
const TEMA_PEDAGOGICA = 100000002;
const TEMA_SEMINARIOS = 100000003;
const TEMA_DOCTORAL = 100000004;

const campoInstitucion = (label: string, mensajeRequerido: string, mensajeMaximo: string): CampoPta => ({
  nombre: 'institucion',
  label,
  tipo: 'texto',
  requerido: true,
  mensajeRequerido,
  maximo: 200,
  mensajeMaximo,
});

const MAX_INSTITUCION = 'Institución / organismo capacitador no puede tener más de 200 caracteres';

const campoGradoAvance: CampoPta = {
  nombre: 'gradoAvance',
  label: 'Grado de avance',
  tipo: 'select',
  requerido: true,
  mensajeRequerido: 'El grado de avance es requerido',
  opciones: 'gradoAvance',
};

const campoCantidadFormacion = campoEntero('cantidad', 'Tiempo asignado', 'La cantidad es requerida', 'La cantidad');

const campoNombre = (label: string, mensajeRequerido: string): CampoPta => ({
  nombre: 'nombre',
  label,
  tipo: 'texto',
  requerido: true,
  mensajeRequerido,
});

const COLUMNAS_FORMACION: Record<string, LineaTarjeta[]> = {
  comun: [
    linea('Nombre', 'nombre'),
    linea('Institución / organismo capacitador', 'institucion'),
    linea('Grado de avance', 'gradoAvance'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo asignado', 'cantidad'),
    linea('Horas totales', 'horasTotales'),
  ],
  doctoral: [
    linea('Nombre', 'nombre'),
    linea('Institución / organismo capacitador', 'institucion'),
    linea('Etapa de formación', 'estapaFormacion'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo asignado', 'cantidad'),
    linea('Horas totales', 'horasTotales'),
  ],
  humanistica: [
    linea('Nombre del curso / actividad', 'nombre'),
    linea('Unidad de formación', 'institucion'),
    linea('Grado de avance', 'gradoAvance'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo asignado', 'cantidad'),
    linea('Horas totales', 'horasTotales'),
  ],
  seminarios: [
    linea('Nombre del seminario', 'nombre'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo asignado', 'cantidad'),
    linea('Horas totales', 'horasTotales'),
  ],
};

const MENSAJES_FORMACION: MensajesSeccion = {
  procesando: 'Cargando...',
  alta: 'Formación cargada correctamente',
  edicion: 'Formación editada correctamente',
  eliminando: 'Eliminando...',
  eliminado: 'Formación eliminada correctamente',
  errorEliminar: 'Error al eliminar la Formación',
};

const formacion = (
  clave: ClaveSeccion,
  tema: number,
  titulo: string,
  campos: CampoPta[],
  lineas: LineaTarjeta[],
  textoAgregar: string,
  textoVacio: string,
  ayuda?: string,
): DefinicionSeccion => ({
  clave,
  fuente: 'formaciones',
  titulo,
  ayuda,
  campos,
  tema,
  filtro: (i) => Number(i.tema?.value) === tema,
  tituloDe: (i) => i.nombre || titulo,
  lineas,
  textoAgregar,
  textoVacio,
  mensajeEliminar: MENSAJE_ELIMINAR('esta formación'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'formacionesPlanDeTrabajo',
  campoId: 'new_pta_formacionesid',
  mensajes: MENSAJES_FORMACION,
  // La edición no manda ni el tema ni el plan. new_capacitador se envía vacío, como el portal.
  payload: (x, ctx) => ({
    ...(ctx.id ? { new_pta_formacionesid: ctx.id } : { new_plandetrabajo: ctx.planId }),
    new_name: s(x.nombre),
    new_capacitador: '',
    new_institucionorganismocapacitador: s(x.institucion),
    new_gradodeavance: v(x.gradoAvance) || 0,
    new_unidaddemedida: v(x.unidadMedida) || 0,
    new_cantidad: n(x.cantidad),
    ...(ctx.id ? {} : { new_tema: tema }),
    new_etapadeformacion: v(x.estapaFormacion) || 0,
  }),
});

const FORMACION_DOCTORAL = formacion(
  'formacionDoctoral',
  TEMA_DOCTORAL,
  'Formación doctoral',
  [
    campoNombre('Nombre', 'El nombre es requerido'),
    campoInstitucion(
      'Institución / organismo capacitador',
      'Institución / organismo capacitador es requerido',
      MAX_INSTITUCION,
    ),
    {
      nombre: 'estapaFormacion',
      label: 'Etapa de formación',
      tipo: 'select',
      requerido: true,
      mensajeRequerido: 'La etapa de formación es requerida',
      opciones: 'etapaFormacion',
    },
    campoUnidadMedida,
    campoCantidadFormacion,
  ],
  COLUMNAS_FORMACION.doctoral,
  'Agregar formación doctoral',
  'Todavía no cargaste formación doctoral.',
);

const FORMACION_ESPECIFICA = formacion(
  'formacionEspecifica',
  TEMA_ESPECIFICA,
  'Formación específica',
  [
    campoNombre('Nombre', 'El nombre es requerido'),
    campoInstitucion(
      'Institución / organismo capacitador',
      'Institución / organismo capacitador es requerido',
      MAX_INSTITUCION,
    ),
    campoGradoAvance,
    campoUnidadMedida,
    campoCantidadFormacion,
  ],
  COLUMNAS_FORMACION.comun,
  'Agregar formación específica',
  'Todavía no cargaste otra formación específica.',
);

const FORMACION_HUMANISTICA = formacion(
  'formacionHumanistica',
  TEMA_HUMANISTICA,
  'Formación Humanística',
  [
    campoNombre('Nombre del curso / actividad', 'El Nombre del curso / actividad es requerido'),
    campoInstitucion('Unidad de formación', 'Unidad de formación es requerida', MAX_INSTITUCION),
    campoGradoAvance,
    campoUnidadMedida,
    campoCantidadFormacion,
  ],
  COLUMNAS_FORMACION.humanistica,
  'Agregar formación humanística',
  'Todavía no cargaste formación humanística.',
  AYUDA_FORMACION_HUMANISTICA,
);

const FORMACION_PEDAGOGICA = formacion(
  'formacionPedagogica',
  TEMA_PEDAGOGICA,
  'Formación en docencia (pedagógica)',
  [
    campoNombre('Nombre', 'El nombre es requerido'),
    campoInstitucion(
      'Institución / organismo capacitador',
      'Institución / organismo capacitador es requerido',
      MAX_INSTITUCION,
    ),
    campoGradoAvance,
    campoUnidadMedida,
    campoCantidadFormacion,
  ],
  COLUMNAS_FORMACION.comun,
  'Agregar formación',
  'Todavía no cargaste formación en docencia.',
  AYUDA_FORMACION_PEDAGOGICA,
);

const SEMINARIOS = formacion(
  'seminarios',
  TEMA_SEMINARIOS,
  'Formación en investigación (metodología de la investigación)',
  [
    campoNombre('Nombre del seminario', 'El Nombre del seminario es requerido'),
    campoInstitucion(
      'Institución / Organismo capacitador',
      'Institución / organismo capacitador es requerido',
      MAX_INSTITUCION,
    ),
    campoUnidadMedida,
    campoCantidadFormacion,
  ],
  COLUMNAS_FORMACION.seminarios,
  'Agregar seminario',
  'Todavía no cargaste formación en investigación.',
  AYUDA_SEMINARIOS,
);

const BLOQUES: DefinicionSeccion = {
  clave: 'bloques',
  fuente: 'bloques',
  titulo: 'Horas / Bloques variables',
  ayuda: AYUDA_VARIABLES,
  campos: [
    { nombre: 'actividad', label: 'Actividad', tipo: 'texto', requerido: true, mensajeRequerido: 'La actividad es requerido' },
    campoUnidadMedida,
    campoEntero('cantidad', 'Tiempo asignado', 'La cantidad es requerida', 'La cantidad'),
  ],
  tituloDe: (i) => i.actividad || 'Bloque / hora',
  lineas: [
    linea('Actividad', 'actividad'),
    linea('Unidad de medida', 'unidadMedida'),
    linea('Tiempo asignado', 'cantidad'),
    linea('Horas totales', 'horasTotales'),
  ],
  textoAgregar: 'Agregar bloque / hora',
  textoVacio: 'Todavía no cargaste horas o bloques variables.',
  mensajeEliminar: MENSAJE_ELIMINAR('este bloque / hora'),
  puedeAgregar: true,
  puedeEliminar: true,
  endpoint: 'bloquesPlanDeTrabajo',
  campoId: 'new_pta_bloquesid',
  mensajes: {
    procesando: 'Cargando...',
    alta: 'Bloque / hora cargado correctamente',
    edicion: 'Bloque / hora editado correctamente',
    eliminando: 'Eliminando...',
    eliminado: 'Bloque / hora eliminado correctamente',
    errorEliminar: 'Error al eliminar el bloque / hora:  ',
  },
  payload: (x, ctx) => ({
    ...cabecera(ctx, 'new_pta_bloquesid', false),
    new_name: s(x.actividad),
    new_unidaddemedida: v(x.unidadMedida) || 0,
    new_cantidad: n(x.cantidad),
  }),
};

export const SECCIONES: Record<ClaveSeccion, DefinicionSeccion> = {
  clases: CLASES,
  areas: AREAS,
  proyectos: PROYECTOS,
  publicaciones: PUBLICACIONES,
  congresos: CONGRESOS,
  divulgaciones: DIVULGACIONES,
  tesis: TESIS,
  jurados: JURADOS,
  cargos: CARGOS,
  encargos: ENCARGOS,
  extension: EXTENSION,
  transferencia: TRANSFERENCIA,
  formacionDoctoral: FORMACION_DOCTORAL,
  formacionEspecifica: FORMACION_ESPECIFICA,
  formacionHumanistica: FORMACION_HUMANISTICA,
  formacionPedagogica: FORMACION_PEDAGOGICA,
  seminarios: SEMINARIOS,
  bloques: BLOQUES,
};

/** Todas las fuentes de lectura (las 5 formaciones comparten una). */
export const FUENTES: FuenteSeccion[] = [
  'clases',
  'areas',
  'proyectos',
  'publicaciones',
  'congresos',
  'divulgaciones',
  'tesis',
  'jurados',
  'cargos',
  'encargos',
  'extension',
  'transferencia',
  'formaciones',
  'bloques',
];

export const registrosDeSeccion = (def: DefinicionSeccion, porFuente: Record<FuenteSeccion, RegistroPta[]>): RegistroPta[] => {
  const lista = porFuente[def.fuente] ?? [];
  return def.filtro ? lista.filter(def.filtro) : lista;
};
