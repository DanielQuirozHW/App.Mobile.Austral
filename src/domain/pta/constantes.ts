// Plan de Trabajo Anual (PTA): estados, listas fijas y textos.
// Port de Portal-Austral-Dev -> src/app/(dashboard)/planes-de-trabajo/**, columns/columnsPlanTrabajo.tsx y los
// modales de plan-de-trabajo (los códigos de las listas son los del CRM; las etiquetas son las que muestra el portal).
import type { OpcionDeLista } from '../perfil/comun';

// --- Estados del PTA (statuscode) ---

/** El docente puede cargar y modificar el PTA solo en estos estados. */
export const ESTADOS_EDITABLES = [1, 100000000];

/** PTA vigente (aprobado por el Secretario Académico). */
export const ESTADO_VIGENTE = 100000002;

/** Con observaciones del Secretario Académico: habilita la pestaña "Observaciones del Sec. Académico". */
export const ESTADO_CON_OBSERVACIONES = 100000000;

/** Estados de la pestaña "EN DESARROLLO". */
export const ESTADOS_EN_DESARROLLO = [100000000, 100000003, 100000001, 1];

// --- Pestañas de la lista (page.tsx) ---

export type PestaniaLista = 'vigente' | 'desarrollo' | 'historico';

export const PESTANIAS_LISTA: Array<{ clave: PestaniaLista; etiqueta: string; info: string }> = [
  {
    clave: 'vigente',
    etiqueta: 'VIGENTE',
    info:
      'PTA vigente para el ciclo lectivo en curso, una vez el mismo haya sido presentado por el docente y aprobado por el Secretario Académico. En ciertos casos, en el que el PTA del año en curso sea aprobado antes del vencimiento del PTA del año anterior, pueden convivir cierto período de tiempo dos planes vigentes, cada uno identificado con el año al cual corresponde.',
  },
  {
    clave: 'desarrollo',
    etiqueta: 'EN DESARROLLO',
    info:
      'PTA en desarrollo por parte del docente. Se habilita anualmente en la fecha de apertura y permanecerá en dicha pestaña hasta tanto sea aprobado por el Secretario Académico.',
  },
  {
    clave: 'historico',
    etiqueta: 'HISTÓRICO',
    info: 'Se visualizan todos los PTA de ciclos anteriores.',
  },
];

export const TEXTO_AYUDA_LISTA = 'Click en el icono del ojo para acceder a la carga/visualización de contenido.';

// --- Pestañas del detalle ---

export type PestaniaPrincipal = 'datos' | 'observaciones' | 'actividad';

export type SubPestania =
  | 'docencia'
  | 'investigacion'
  | 'formacionRrhh'
  | 'gestion'
  | 'extension'
  | 'transferencia'
  | 'formacion'
  | 'variables'
  | 'resumen';

export const SUBPESTANIAS: Array<{ clave: SubPestania; etiqueta: string }> = [
  { clave: 'docencia', etiqueta: 'Docencia' },
  { clave: 'investigacion', etiqueta: 'Investigación' },
  { clave: 'formacionRrhh', etiqueta: 'Formación RRHH' },
  { clave: 'gestion', etiqueta: 'Gestión' },
  { clave: 'extension', etiqueta: 'Extensión' },
  { clave: 'transferencia', etiqueta: 'Transferencia' },
  { clave: 'formacion', etiqueta: 'Formación' },
  { clave: 'variables', etiqueta: 'HS/Bloq. Var.' },
  { clave: 'resumen', etiqueta: 'Resumen' },
];

// --- Listas fijas (OptionSets del CRM) ---

export const OPC_UNIDAD_MEDIDA: OpcionDeLista[] = [
  { value: 100000001, label: 'Horas anuales' },
  { value: 100000000, label: 'Bloques anuales' },
  { value: 100000002, label: 'Días anuales' },
];

export const OPC_FORMA_DICTADO: OpcionDeLista[] = [
  { value: 100000000, label: '1er Cuatrimestre' },
  { value: 100000001, label: '2do Cuatrimestre' },
  { value: 100000002, label: 'Anual' },
  { value: 100000003, label: 'Quarter 1' },
  { value: 100000004, label: 'Quarter 2' },
  { value: 100000005, label: 'Quarter 3' },
];

export const OPC_TEACHING: OpcionDeLista[] = [
  { value: 1, label: 'Sí' },
  { value: 0, label: 'No' },
];

export const OPC_TIPO_CLASE: OpcionDeLista[] = [
  { value: 100000000, label: 'Recurrente' },
  { value: 100000001, label: 'Nueva' },
];

export const OPC_FINANCIAMIENTO: OpcionDeLista[] = [
  { value: 100000000, label: 'Interno' },
  { value: 100000001, label: 'Externo' },
  { value: 100000002, label: 'No posee' },
];

export const OPC_ESTADO_PUBLICACION: OpcionDeLista[] = [
  { value: 100000001, label: 'Sin iniciar' },
  { value: 100000002, label: 'En curso' },
  { value: 100000003, label: 'En etapa final' },
  { value: 100000004, label: 'Under Review (UR)' },
  { value: 100000005, label: 'Revise y Resubmit (R&R)' },
];

export const OPC_TIPO_PUBLICACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Libro o compilación de artículos' },
  { value: 100000001, label: 'Capítulo de libro' },
  { value: 100000002, label: 'Artículo en revista científica con referato' },
  { value: 100000003, label: 'Artículo en revista científica sin referato' },
  { value: 100000004, label: 'Caso o nota técnica' },
  { value: 100000005, label: 'Producción artística y/o de diseño' },
];

export const OPC_TIPO_CONGRESO: OpcionDeLista[] = [
  { value: 100000000, label: 'Nacional' },
  { value: 100000001, label: 'Internacional' },
];

export const OPC_TIPO_PARTICIPACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Asistencia' },
  { value: 100000001, label: 'Presentación' },
  { value: 100000002, label: 'Otro' },
];

export const OPC_TIPO_DIVULGACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Informe para medio' },
  { value: 100000001, label: 'Nota de Opinión' },
  { value: 100000002, label: 'Otro' },
];

export const OPC_AVANCE_TESIS: OpcionDeLista[] = [
  { value: 100000003, label: 'Iniciando' },
  { value: 100000002, label: 'Lento' },
  { value: 100000001, label: 'Intermedio' },
  { value: 100000000, label: 'Avanzado' },
];

export const OPC_NIVEL_JURADO: OpcionDeLista[] = [
  { value: 100000000, label: 'Grado' },
  { value: 100000001, label: 'Especialización' },
  { value: 100000002, label: 'Maestría' },
  { value: 100000003, label: 'Doctorado' },
];

export const OPC_GRADO_AVANCE: OpcionDeLista[] = [
  { value: 100000000, label: 'No iniciado' },
  { value: 100000001, label: 'Iniciado' },
  { value: 100000002, label: 'En curso' },
  { value: 100000003, label: 'Finalizado' },
];

export const OPC_ETAPA_FORMACION: OpcionDeLista[] = [
  { value: 100000000, label: 'No iniciado' },
  { value: 100000002, label: 'Iniciado' },
  { value: 100000001, label: 'En proceso' },
  { value: 100000003, label: 'Finalización' },
];

/** Formación / vinculación con actividades de investigación (Investigación, punto 1). */
export const OPC_FORMACION_INV: OpcionDeLista[] = [
  { value: 100000000, label: 'Doctor ' },
  { value: 100000001, label: 'Doctorando' },
  { value: 100000002, label: 'Profesor (Sin formación Doctoral) vinculado a proyecto de investigación' },
];

export const TIPO_CARGA_HORAS = 100000000;
export const TIPO_CARGA_DIAS = 100000001;

export const OPC_TIPO_CARGA: OpcionDeLista[] = [
  { value: TIPO_CARGA_HORAS, label: 'Horas' },
  { value: TIPO_CARGA_DIAS, label: 'Días' },
];

// --- Orden y exclusiones de los catálogos ---

/** Se excluye de todas las listas de unidades académicas. */
export const UNIVERSIDAD_EXCLUIDA = 'Instituto de Investigación en Medicina Traslacional';

export const ORDEN_UNIVERSIDADES = [
  'Facultad de Ciencias Empresariales (Rosario)',
  'Facultad de Ciencias Empresariales (Pilar)',
  'Facultad de Comunicación',
  'Facultad de Ingeniería',
  'Facultad de Derecho',
  'Facultad de Ciencias Biomédicas',
  'Escuela de Educación',
  'Instituto de Ciencias para la Familia',
  'Instituto de filosofía',
  'IAE Business School',
  'Otra',
];

export const ORDEN_MODALIDADES = [
  'Presencial',
  'Mix Presencial/Asincrónico',
  'Mix. Presencial/Sincrónico',
  'Mix Asincrónico/Sincrónico',
  'Sincrónica Virtual',
  'Asincrónica',
  'Otra',
];

/** Modalidad "Distancia": el portal la excluye del selector de Clases. */
export const MODALIDAD_EXCLUIDA_ID = '8daa9587-6fdb-f011-8543-000d3a892dfb';

export const NIVELES_CLASE = ['Pregrado', 'Grado', 'Posgrado', 'Curso', 'Programa', 'Diplomatura', 'Otro'];

export const TITULOS_TESIS = ['Pregrado', 'Grado', 'Especialista', 'Magíster', 'Doctor'];

// --- Indicadores (Resumen) ---

export const ORDEN_INDICADORES = [
  'Docencia',
  'Investigación',
  'Formación de RRHH',
  'Gestión',
  'Extensión',
  'Transferencia',
  'Formación',
  'Horas / Bloques variables',
];

// --- Textos de ayuda (tooltips del portal) ---

export const AYUDA_ASESORAMIENTO = 'Se sugiere un mínimo de 4 horas por alumno (una entrevista por bimestre)';
export const AYUDA_TIPO_CLASE =
  'RECURRENTE: materia que se dicta de manera periódica en cada ciclo lectivo, ya sea de forma anual o cuatrimestral. NUEVA: materia que se dicta por primera vez.';
export const AYUDA_TIEMPO_DICTADO = 'Se sugiere calcular 3 horas de preparación y evaluación por cada 1 hora de dictado';
export const AYUDA_DESARROLLO_MATERIAL =
  'Completar excluyentemente cuando se realiza un rearmado total del campus (generación de videos, etc.) o cuando desarrolla como materia nueva';
export const AYUDA_CARGO =
  'Un cargo de gobierno o gestión académica es un puesto de responsabilidad académica / administrativa enfocado en planificar, coordinar y supervisar procesos educativos y académicos de la institución en distintos niveles (Rectorado, Unidad Académica, Carrera u otro).  Requieren de un proceso de aprobacion de un organo de gobierno.';
export const AYUDA_ENCARGO =
  'Un encargo académico o institucional es una responsabilidad extraordinaria, transitoria y específica asignada a una persona para coordinar, liderar o ejecutar una tarea o proyecto estratégico dentro de la Universidad.No implica la ocupación de una posición estructural dentro del organigrama, sino la asunción de una función adicional o complementaria, delimitada en alcance, objetivos y duración. Los encargos suelen tener temporalidad variable, responden a necesidades institucionales concretas (por ejemplo, conducir un proyecto de innovación curricular, coordinar una acreditación o diseñar un plan de mejora) y pueden concluir o renovarse según el avance del proyecto o decisión de la autoridad que lo dispuso.';
export const AYUDA_EXTENSION =
  'Iniciativas que aplican el conocimiento académico para contribuir al desarrollo social, cultural o educativo de la comunidad';
export const AYUDA_TRANSFERENCIA =
  'Proceso mediante el cual se aplican conocimientos, tecnologías o innovaciones generados en la universidad para beneficio de la sociedad o el sector productivo.';
export const AYUDA_FORMACION_HUMANISTICA =
  'Según el RGP, los profesores con dedicación exclusiva (DE) deben cumplir un mínimo de 20 horas anuales.';
export const AYUDA_FORMACION_PEDAGOGICA = 'Formación vinculada a la enseñanza: pedagógica, didáctica u otros';
export const AYUDA_SEMINARIOS =
  'Seminarios desarrollados en el marco de la formación doctoral y que promueve actividades investigativas y metodológicas en estudios de posgrado.';
export const AYUDA_VARIABLES = 'Ingresar aquellas actividades u otros que no estén contemplados en ningún punto anterior.';

// --- Adjunto del informe del año anterior ---

export const MSG_SIN_ADJUNTO_PARA_ENVIAR = 'No se puede enviar el PTA. Por favor, cargue el Informe PTA del año Anterior.';

export const MSG_CONFIRMAR_ENVIO =
  '¿Está seguro de enviar el Plan de Trabajo Anual? Luego de esta acción no se podrá modificar.';

/** Demora del portal para refrescar el PTA después de eliminar un proyecto de investigación. */
export const DEMORA_REFRESCO_PTA_PROYECTO_MS = 9000;
