// Perfil > Investigación > Resultados / Impacto I+D > Producción científica (con sus autores).
// Port de Portal-Austral-Dev -> perfil/investigacion/resultados-impacto-i+d/produccion-cientifica/page.tsx,
// perfil/_components/investigacion/resultados-impacto-i+d/produccion-cientifica/modales/{ModalProduccionCientifica,
// ModalParticipantes,BotonesAprobacionProduccionCientifica}.tsx, columns/investigacion/columnsAutoresProduccionCientifica.tsx,
// hooks/investigacion-perfil/{useCargaEditarProduccionCientifica,useCargarEditarAutoresProduccionCientifica,
// useGetProduccionCientifica,useGetAutoresProduccionCientifica}.ts y store/useInvestigacionDocenciaStore.ts.
//
// El portal arma 13 secciones de campos según el "Tipo de material". Acá cada sección es una lista de campos
// (CAMPOS_POR_TIPO); de esa lista salen los controles del modal y las validaciones. Los atributos de la API
// (ATRIBUTOS) alimentan el mapeo de lectura, los valores iniciales y el cuerpo de POST / PUT.
import { isValid } from 'date-fns';
import * as yup from 'yup';
import { esValor } from './afiliaciones';
import {
  esFechaFutura,
  fechaDeFila,
  FV,
  opcionDeLista,
  opcionOpcional,
  opcionRequerida,
  parsearFechaCrm,
  texto,
  type Fila,
  type OpcionDeLista,
  type OpcionONull,
} from './comun';
import { diaADocenciaApi } from './docencia';

// ---------------------------------------------------------------------------
// Listas fijas (las mismas que los selects del portal)
// ---------------------------------------------------------------------------

export const TIPO_MATERIAL: OpcionDeLista[] = [
  { value: 100000000, label: 'Libros o compilaciones de artículos' },
  { value: 100000001, label: 'Capítulos de libros' },
  { value: 100000002, label: 'Artículos en revistas científicas con referato' },
  { value: 100000003, label: 'Artículos en congresos científicos con referato' },
  { value: 100000004, label: 'Artículos de difusión' },
  { value: 100000005, label: 'Casos y notas técnicas' },
  { value: 100000006, label: 'Conferencias y seminarios dictados' },
  { value: 100000007, label: 'Comunicaciones en congresos, jornadas y workshops' },
  { value: 100000008, label: 'Artículos en revistas científicas sin referato' },
  { value: 100000009, label: 'Patentes científicas' },
  { value: 100000010, label: 'Transferencia' },
  {
    value: 100000011,
    label: 'Producciones artísticas y/o de diseño (muestras, exposiciones, exhibiciones, demás producciones)',
  },
  { value: 100000012, label: 'Intellectuall Nouvel Courses (IAE)' },
];

export const TIPO_CONGRESO: OpcionDeLista[] = [
  { value: 100000000, label: 'Académica' },
  { value: 100000001, label: 'Profesional' },
];

export const TIPO_CONFERENCIA: OpcionDeLista[] = [
  { value: 100000000, label: 'Académica' },
  { value: 100000001, label: 'Profesional' },
];

export const CLASIFICACION_JOURNAL: OpcionDeLista[] = [
  { value: 100000000, label: 'A+' },
  { value: 100000001, label: 'A' },
  { value: 100000002, label: 'A-' },
  { value: 100000003, label: 'B+' },
  { value: 100000004, label: 'B' },
  { value: 100000005, label: 'B-' },
  { value: 100000006, label: 'N/A' },
];

/** "Estado" de libros, capítulos y artículos. */
export const ESTADO_PUBLICACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Publicado' },
  { value: 100000001, label: 'En Prensa' },
];

export const PRODUCCION_PUBLICADA = 100000002;
export const PRODUCCION_BORRADOR = 100000001;

/** "Estado de la producción" (statuscode). */
export const ESTADO_PRODUCCION: OpcionDeLista[] = [
  { value: PRODUCCION_PUBLICADA, label: 'Publicado' },
  { value: PRODUCCION_BORRADOR, label: 'Borrador' },
];

const INNOVACION_OTRO = 100000004;

export const TIPO_INNOVACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Materia Electiva' },
  { value: 100000001, label: 'Programa Focalizado' },
  { value: 100000002, label: 'Programa corto IAE' },
  { value: 100000003, label: 'Coursera' },
  { value: INNOVACION_OTRO, label: 'Otro' },
];

export const TIPO_CASO: OpcionDeLista[] = [
  { value: 100000000, label: 'Caso' },
  { value: 100000001, label: 'Nota Técnica' },
];

// ---------------------------------------------------------------------------
// Atributos de la API
// ---------------------------------------------------------------------------

type DatoApi = 'texto' | 'numero' | 'opcion' | 'fecha';

interface Atributo {
  clave: string;
  api: string;
  dato: DatoApi;
  lista?: OpcionDeLista[];
}

const atr = (clave: string, api: string, dato: DatoApi, lista?: OpcionDeLista[]): Atributo => ({
  clave,
  api,
  dato,
  lista,
});

/**
 * Todos los campos de la producción, con el atributo del CRM. El portal manda TODOS en cada POST / PUT
 * (los que no aplican al tipo viajan vacíos o en 0), igual que acá.
 */
const ATRIBUTOS: Atributo[] = [
  atr('tipoMaterial', 'new_tipodematerial', 'opcion', TIPO_MATERIAL),
  atr('name', 'new_name', 'texto'),
  atr('link', 'new_link', 'texto'),
  atr('titulo', 'new_titulo', 'texto'),
  atr('estadoProduccion', 'statuscode', 'opcion', ESTADO_PRODUCCION),
  atr('estadoPublicacion', 'new_estadodepublicacion', 'opcion', ESTADO_PUBLICACION),
  atr('editorial', 'new_editorial', 'texto'),
  atr('pais', 'new_pais', 'texto'),
  atr('ano', 'new_ano', 'numero'),
  atr('isbn', 'new_isbn', 'numero'),
  atr('isbnTxt', 'new_isbn_txt', 'texto'),
  atr('puntaje', 'new_puntajeobtenidoiae', 'numero'),
  atr('tituloCapitulo', 'new_titulodelcapitulo', 'texto'),
  atr('paginaInicial', 'new_paginainicial', 'numero'),
  atr('paginaFinal', 'new_paginafinal', 'numero'),
  atr('numeroCapitulo', 'new_numerocapitulo', 'numero'),
  atr('doi', 'new_doi', 'texto'),
  atr('revista', 'new_revista', 'texto'),
  atr('volumen', 'new_volumennro', 'numero'),
  atr('impactFactor', 'new_impactfactorsoloiae', 'numero'),
  atr('clasificacionJournal', 'new_clasificaciondejournalsoloiae', 'opcion', CLASIFICACION_JOURNAL),
  atr('detalleClasificacion', 'new_detalledeclasificacion', 'texto'),
  atr('medioDifusion', 'new_mediodedifusion', 'texto'),
  atr('tipoCaso', 'new_tipocaso', 'opcion', TIPO_CASO),
  atr('codigoIae', 'new_codigoiae', 'texto'),
  atr('nombreConferencia', 'new_nombredelaconferenciaseminario', 'texto'),
  atr('tipoConferencia', 'new_tipodeconferenciaseminario', 'opcion', TIPO_CONFERENCIA),
  atr('ciudad', 'new_ciudad_', 'texto'),
  atr('fecha', 'new_fecha', 'fecha'),
  atr('nombreCongreso', 'new_nombredelcongresojornadaworkshop', 'texto'),
  atr('tipoCongreso', 'new_tipodecongresojornadaworkshop', 'opcion', TIPO_CONGRESO),
  atr('tema', 'new_tema', 'texto'),
  atr('periodo', 'new_periodo', 'numero'),
  atr('lugarPresentacion', 'new_lugardepresentacion', 'texto'),
  atr('observacion', 'new_observacion', 'texto'),
  atr('empresaTransferencia', 'new_empresalugardondeserealizolatrasferencia', 'texto'),
  atr('nombreObra', 'new_nombredelaobra', 'texto'),
  atr('tipoEvento', 'new_tipodeevento', 'texto'),
  atr('tipoInnovacion', 'new_tipodeinnovacion', 'opcion', TIPO_INNOVACION),
  atr('otroTipoInnovacion', 'new_otrotipoinnovacion', 'texto'),
  atr('duracionDias', 'new_duraciondelprogramamateriaendias', 'numero'),
  atr('innovacionPedag', 'new_innovacionpedagexptec', 'texto'),
  atr('porcMaterialPropio', 'new_porcmaterialpropio', 'texto'),
  atr('materialDesarrollado', 'new_indicarmaterialdesarrolladoparaelcursomateri', 'texto'),
  atr('fechaInicial', 'new_fechainicial', 'fecha'),
  atr('fechaFinal', 'new_fechafinal', 'fecha'),
  atr('fechaPublicacion', 'new_fechadepublicacion', 'fecha'),
];

/** Atributos del CRM que se leen de cada producción (los de ATRIBUTOS). */
export const ATRIBUTOS_DE_PRODUCCION: string[] = ATRIBUTOS.map((at) => at.api);

export type FormularioProduccion = Record<string, any>;

const valorInicial = (at: Atributo): unknown => {
  switch (at.dato) {
    case 'texto':
    case 'numero':
      return '';
    default:
      return null;
  }
};

/** Formulario vacío (todos los campos de la producción). */
export const produccionVacia = (): FormularioProduccion => {
  const f: FormularioProduccion = {};
  ATRIBUTOS.forEach((at) => {
    f[at.clave] = valorInicial(at);
  });
  return f;
};

// ---------------------------------------------------------------------------
// Campos de cada sección (según el tipo de material)
// ---------------------------------------------------------------------------

export type ControlProduccion = 'texto' | 'textoLargo' | 'numero' | 'fecha' | 'opcion';

export interface CampoProduccion {
  clave: string;
  etiqueta: string;
  control: ControlProduccion;
  /** Nombre para los mensajes de validación ("El/La {nombre} es obligatorio/a"). */
  nombre: string;
  femenino?: boolean;
  requerido?: boolean;
  /** Mensaje de campo obligatorio, si no es el generado. */
  msgRequerido?: string;
  maximo?: number;
  /** Mensaje de máximo de caracteres, si no es el generado. */
  msgMaximo?: string;
  opciones?: OpcionDeLista[];
  /** Solo se ve al editar o ver (no al crear). */
  soloEdicion?: boolean;
  /** Lo calcula el back office: se ve pero no se edita. */
  soloLectura?: boolean;
  /** Muestra "N caracteres restantes". */
  contador?: boolean;
  /** Solo dígitos y guiones. */
  esIsbn?: boolean;
}

const LINK: CampoProduccion = {
  clave: 'link',
  etiqueta: 'Link',
  nombre: 'link',
  control: 'texto',
  maximo: 4000,
};

const t = (
  clave: string,
  etiqueta: string,
  nombre: string,
  extra: Partial<CampoProduccion> = {},
): CampoProduccion => ({ clave, etiqueta, nombre, control: 'texto', ...extra });

const n = (
  clave: string,
  etiqueta: string,
  nombre: string,
  extra: Partial<CampoProduccion> = {},
): CampoProduccion => ({ clave, etiqueta, nombre, control: 'numero', requerido: true, ...extra });

const o = (
  clave: string,
  etiqueta: string,
  nombre: string,
  opciones: OpcionDeLista[],
  extra: Partial<CampoProduccion> = {},
): CampoProduccion => ({ clave, etiqueta, nombre, control: 'opcion', opciones, requerido: true, ...extra });

const fch = (
  clave: string,
  etiqueta: string,
  nombre: string,
  extra: Partial<CampoProduccion> = {},
): CampoProduccion => ({ clave, etiqueta, nombre, control: 'fecha', requerido: true, femenino: true, ...extra });

const ESTADO: CampoProduccion = o('estadoPublicacion', 'Estado', 'estado de publicación', ESTADO_PUBLICACION);

const ESTADO_DE_LA_PRODUCCION: CampoProduccion = o(
  'estadoProduccion',
  'Estado de la producción',
  'estado de la producción',
  ESTADO_PRODUCCION,
  { requerido: false, soloEdicion: true },
);

const PUNTAJE: CampoProduccion = n('puntaje', 'Puntos obtenidos (solo IAE)', 'puntaje', {
  requerido: false,
  soloEdicion: true,
  soloLectura: true,
});

const EDITORIAL = t('editorial', 'Editorial', 'editorial', { requerido: true, maximo: 100, femenino: true });
const PAIS = t('pais', 'País', 'país', { requerido: true, maximo: 100 });
const ISBN = t('isbnTxt', 'ISBN', 'ISBN', { requerido: true, maximo: 100, esIsbn: true });
const PAGINA_INICIAL = n('paginaInicial', 'Página inicial', 'página inicial', { femenino: true });
const PAGINA_FINAL = n('paginaFinal', 'Página final', 'página final', { femenino: true });
const ANIO: CampoProduccion = n('ano', 'Año', 'año');
const REVISTA = t('revista', 'Revista', 'revista', { requerido: true, maximo: 100, femenino: true });
const VOLUMEN = n('volumen', 'Volumen Nro.', 'volumen');
const CIUDAD = t('ciudad', 'Ciudad', 'ciudad', { requerido: true, maximo: 100, femenino: true });
const LUGAR = t('lugarPresentacion', 'Lugar de presentación', 'lugar de presentación', {
  requerido: true,
  maximo: 100,
});

const IAE_TEXTO = (clave: string, etiqueta: string, msgRequerido: string): CampoProduccion =>
  t(clave, etiqueta, etiqueta, {
    requerido: true,
    maximo: 100,
    msgRequerido,
    msgMaximo: 'No puede superar los 100 caracteres',
  });

export interface SeccionProduccion {
  titulo: string;
  campos: CampoProduccion[];
}

const tituloDe = (valor: number): string => TIPO_MATERIAL.find((x) => x.value === valor)?.label ?? '';

export const CAMPOS_POR_TIPO: Record<number, SeccionProduccion> = {
  // Libros o compilaciones de artículos
  100000000: {
    titulo: tituloDe(100000000),
    campos: [
      { ...LINK, etiqueta: 'Link Repositorio/Publicación' },
      t('titulo', 'Título del libro', 'título del libro', { requerido: true, maximo: 500, contador: true }),
      ESTADO,
      EDITORIAL,
      PAIS,
      ANIO,
      ISBN,
      PUNTAJE,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Capítulos de libros
  100000001: {
    titulo: tituloDe(100000001),
    campos: [
      LINK,
      t('tituloCapitulo', 'Título del capítulo', 'título del capítulo', { requerido: true, maximo: 500 }),
      t('titulo', 'Título del libro', 'título del libro', { requerido: true, maximo: 500 }),
      ESTADO,
      EDITORIAL,
      PAIS,
      ANIO,
      PAGINA_INICIAL,
      PAGINA_FINAL,
      n('numeroCapitulo', 'Número de capítulo', 'número de capítulo'),
      ISBN,
      PUNTAJE,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Artículos en revistas científicas con referato
  100000002: {
    titulo: tituloDe(100000002),
    campos: [
      t('doi', 'DOI', 'DOI', { maximo: 100 }),
      LINK,
      t('titulo', 'Título del artículo', 'título del artículo', { requerido: true, maximo: 500 }),
      REVISTA,
      ESTADO,
      VOLUMEN,
      EDITORIAL,
      ANIO,
      PAGINA_INICIAL,
      PAGINA_FINAL,
      PUNTAJE,
      o('clasificacionJournal', 'Clasificación de Journal (Solo IAE)', 'clasificación de journal', CLASIFICACION_JOURNAL, {
        requerido: false,
        soloEdicion: true,
        soloLectura: true,
      }),
      n('impactFactor', 'Impact Factor (solo IAE)', 'impact factor', {
        requerido: false,
        soloEdicion: true,
        soloLectura: true,
      }),
      t('detalleClasificacion', 'Detalle de Clasificación', 'detalle de clasificación', {
        soloEdicion: true,
        soloLectura: true,
      }),
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Artículos en congresos científicos con referato
  100000003: {
    titulo: tituloDe(100000003),
    campos: [
      LINK,
      t('titulo', 'Título del artículo', 'título del artículo', { requerido: true, maximo: 500 }),
      REVISTA,
      ESTADO,
      VOLUMEN,
      ANIO,
      PAGINA_INICIAL,
      PAGINA_FINAL,
      PUNTAJE,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Artículos de difusión
  100000004: {
    titulo: tituloDe(100000004),
    campos: [
      LINK,
      t('titulo', 'Título del artículo', 'título del artículo', { requerido: true, maximo: 500 }),
      t('medioDifusion', 'Medio de difusión', 'medio de difusión', { requerido: true, maximo: 100 }),
      ANIO,
      PAGINA_INICIAL,
      PAGINA_FINAL,
      PUNTAJE,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Casos y notas técnicas
  100000005: {
    titulo: tituloDe(100000005),
    campos: [
      LINK,
      t('titulo', 'Título', 'título', { requerido: true, maximo: 500 }),
      o('tipoCaso', 'Tipo de caso o nota técnica', 'tipo de caso o nota técnica', TIPO_CASO),
      EDITORIAL,
      ISBN,
      ANIO,
      PAGINA_INICIAL,
      PAGINA_FINAL,
      t('codigoIae', 'Código IAE', 'código IAE', { maximo: 100 }),
      PUNTAJE,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Conferencias y seminarios dictados
  100000006: {
    titulo: tituloDe(100000006),
    campos: [
      LINK,
      t('nombreConferencia', 'Nombre de la conferencia/seminario', 'nombre de la conferencia o seminario', {
        requerido: true,
        maximo: 500,
      }),
      t('titulo', 'Título de la presentación', 'título de la conferencia o seminario', {
        requerido: true,
        maximo: 500,
      }),
      o('tipoConferencia', 'Tipo de conferencia o seminario', 'tipo de conferencia o seminario', TIPO_CONFERENCIA),
      CIUDAD,
      PAIS,
      fch('fecha', 'Fecha', 'fecha', { msgRequerido: 'La fecha es obligatoria' }),
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Comunicaciones en congresos, jornadas y workshops
  100000007: {
    titulo: tituloDe(100000007),
    campos: [
      LINK,
      t('nombreCongreso', 'Nombre del congreso/jornada/workshop', 'nombre del congreso, jornada o workshop', {
        requerido: true,
        maximo: 500,
      }),
      t('titulo', 'Título de la comunicación/paper', 'título de la comunicación', { requerido: true, maximo: 500 }),
      o(
        'tipoCongreso',
        'Tipo de congreso, jornada o workshop',
        'tipo de congreso, jornada o workshop',
        TIPO_CONGRESO,
      ),
      CIUDAD,
      PAIS,
      fch('fecha', 'Fecha', 'fecha', { msgRequerido: 'La fecha es obligatoria' }),
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Artículos en revistas científicas sin referato
  100000008: {
    titulo: tituloDe(100000008),
    campos: [
      LINK,
      t('titulo', 'Título del artículo', 'título del artículo', { requerido: true, maximo: 500 }),
      REVISTA,
      ESTADO,
      n('volumen', 'Volumen/Número', 'volumen'),
      ANIO,
      n('paginaInicial', 'Pág. inicial', 'página inicial', { femenino: true }),
      n('paginaFinal', 'Pág. final', 'página final', { femenino: true }),
      PUNTAJE,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Patentes científicas
  100000009: {
    titulo: tituloDe(100000009),
    campos: [
      LINK,
      t('tema', 'Tema', 'tema de la patente', { requerido: true, maximo: 500 }),
      n('periodo', 'Período', 'período'),
      LUGAR,
      {
        ...t('observacion', 'Observación', 'observación', {
          requerido: true,
          maximo: 1900,
          femenino: true,
          msgMaximo: 'La observación no puede superar los 1900 caracteres',
          contador: true,
        }),
        control: 'textoLargo',
      },
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Transferencia
  100000010: {
    titulo: tituloDe(100000010),
    campos: [
      t('tema', 'Tema', 'tema de la transferencia', { requerido: true, maximo: 500 }),
      t(
        'empresaTransferencia',
        'Empresa / lugar donde se realizó la transferencia',
        'empresa o lugar de transferencia',
        {
          requerido: true,
          maximo: 100,
          femenino: true,
          msgRequerido: 'La empresa o lugar donde se realizó la transferencia es obligatorio',
        },
      ),
      fch('fechaInicial', 'Período (fecha inicial)', 'fecha inicial', {
        msgRequerido: 'La fecha inicial es obligatoria',
      }),
      fch('fechaFinal', 'Período (fecha final)', 'fecha final', { msgRequerido: 'La fecha final es obligatoria' }),
      LUGAR,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Producciones artísticas y/o de diseño
  100000011: {
    titulo: tituloDe(100000011),
    campos: [
      LINK,
      t('nombreObra', 'Nombre de la obra', 'nombre de la obra', { requerido: true, maximo: 500 }),
      fch('fecha', 'Fecha de presentación', 'fecha de presentación', {
        msgRequerido: 'La fecha de presentación es obligatoria',
      }),
      LUGAR,
      t('tipoEvento', 'Tipo de evento', 'tipo de evento', { requerido: true, maximo: 100 }),
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
  // Intellectuall Nouvel Courses (IAE)
  100000012: {
    titulo: tituloDe(100000012),
    campos: [
      o('tipoInnovacion', 'Tipo de innovación', 'tipo de innovación', TIPO_INNOVACION),
      t('otroTipoInnovacion', 'Otro tipo de innovación', 'otro tipo de innovación', { maximo: 100 }),
      t('titulo', 'Título', 'título del curso', { requerido: true, maximo: 500 }),
      n('duracionDias', 'Duración del programa/materia en días', 'duración del programa/materia en días', {
        femenino: true,
        msgRequerido: 'La duración del programa/materia en días es obligatoria',
      }),
      IAE_TEXTO(
        'innovacionPedag',
        '¿En qué medida el programa o materia incluye innovación pedagógica, de experiencia y/o tecnológica?',
        'Debe indicar en qué medida el programa o materia incluye innovación pedagógica, de experiencia y/o tecnológica',
      ),
      IAE_TEXTO(
        'porcMaterialPropio',
        '¿Qué porcentaje del material utilizado ha sido desarrollado especialmente para el programa / materia?',
        'El porcentaje de material desarrollado especialmente para el programa/materia es obligatorio',
      ),
      IAE_TEXTO(
        'materialDesarrollado',
        'Indicar material desarrollado para el curso/materia',
        'Debe indicar el material desarrollado para el curso/materia',
      ),
      { ...ANIO, etiqueta: 'Año de lanzamiento', nombre: 'año de lanzamiento' },
      PUNTAJE,
      ESTADO_DE_LA_PRODUCCION,
    ],
  },
};

/** Tipo de material (número) de un valor de formulario; null si no hay. */
export const tipoDeMaterial = (opcion: OpcionONull | undefined): number | null => {
  const v = Number(opcion?.value);
  return opcion?.value !== undefined && opcion?.value !== null && Number.isFinite(v) ? v : null;
};

export const seccionDeTipo = (opcion: OpcionONull | undefined): SeccionProduccion | null => {
  const tipo = tipoDeMaterial(opcion);
  return tipo === null ? null : CAMPOS_POR_TIPO[tipo] ?? null;
};

/**
 * Al crear, cambiar el tipo de material descarta lo cargado en los campos que el nuevo tipo no tiene
 * (el portal crea el formulario con shouldUnregister y esos campos desaparecen). Devuelve los valores vacíos
 * de esos campos.
 */
export const camposAjenosVacios = (opcion: OpcionONull | undefined): FormularioProduccion => {
  const propios = new Set((seccionDeTipo(opcion)?.campos ?? []).map((c) => c.clave));
  const vacio = produccionVacia();
  const parche: FormularioProduccion = {};
  ATRIBUTOS.forEach((at) => {
    if (at.clave !== 'tipoMaterial' && !propios.has(at.clave)) parche[at.clave] = vacio[at.clave];
  });
  return parche;
};

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

const INT32_MAX = 2147483647;
const ESTADO_PUBLICADO_LIBRO = 100000000;

const articulo = (c: CampoProduccion): string => (c.femenino ? 'La' : 'El');
const mayuscula = (c: CampoProduccion): string => `${articulo(c)} ${c.nombre}`;
const sufijo = (c: CampoProduccion): string => (c.femenino ? 'a' : 'o');

const msgObligatorio = (c: CampoProduccion): string => c.msgRequerido ?? `${mayuscula(c)} es obligatori${sufijo(c)}`;

const esPublicado = (estado: unknown): boolean => {
  const v = (estado as { value?: unknown } | null)?.value;
  return v === ESTADO_PUBLICADO_LIBRO || String(v ?? '').toLowerCase() === 'publicado';
};

const anioActual = (): number => new Date().getFullYear();

const esquemaDeTexto = (c: CampoProduccion) => {
  let s = yup.string().nullable();
  if (c.maximo) {
    s = s.max(c.maximo, c.msgMaximo ?? `${mayuscula(c)} no puede exceder los ${c.maximo} caracteres`);
  }
  if (c.esIsbn) {
    s = s
      .trim()
      .matches(/^[0-9-]+$/, { message: 'El ISBN solo puede contener números y guiones', excludeEmptyString: true });
  }
  if (c.requerido) s = s.trim().required(msgObligatorio(c));
  return s;
};

const esquemaDeNumero = (c: CampoProduccion) =>
  yup
    .string()
    .nullable()
    .test('obligatorio', msgObligatorio(c), (v) => !c.requerido || Boolean(v && String(v).trim()))
    .test('entero', `${mayuscula(c)} debe ser un número entero`, (v) => !v || Number.isInteger(Number(v)))
    .test('positivo', `${mayuscula(c)} debe ser positiv${sufijo(c)}`, (v) => !v || Number(v) > 0)
    .test(
      'maximo',
      `${mayuscula(c)} no puede exceder el valor máximo permitido (2.147.483.647)`,
      (v) => !v || Number(v) <= INT32_MAX,
    );

/** Año: 4 dígitos y, si el estado es "Publicado", no puede ser futuro. Casos y notas: nunca futuro. */
const esquemaDeAnio = (c: CampoProduccion, tipo: number, conEstado: boolean) =>
  yup
    .string()
    .nullable()
    .test('obligatorio', msgObligatorio(c), (v) => Boolean(v && String(v).trim()))
    .test('entero', 'El año debe ser un número entero', (v) => !v || Number.isInteger(Number(v)))
    .test('positivo', 'El año debe ser positivo', (v) => !v || Number(v) > 0)
    .test('minimo', 'El año debe tener 4 dígitos', (v) => !v || Number(v) >= 1000)
    .test('maximo', 'El año debe tener máximo 4 dígitos', (v) => !v || Number(v) <= 9999)
    .test('futuro-publicado', function (v) {
      if (!conEstado || !v || !esPublicado(this.parent.estadoPublicacion)) return true;
      if (Number(v) > anioActual()) {
        return this.createError({
          path: 'ano',
          message: `La fecha seleccionada no puede ser mayor a la fecha actual (${anioActual()}).`,
        });
      }
      return true;
    })
    .test('futuro-caso', function (v) {
      if (tipo !== 100000005 || !v) return true;
      if (Number(v) > anioActual()) {
        return this.createError({ path: 'ano', message: `El año no puede ser mayor a ${anioActual()}` });
      }
      return true;
    });

const esquemaDeFecha = (c: CampoProduccion, tipo: number) => {
  let s: yup.AnySchema = yup.date().nullable().typeError('Debe ser una fecha válida');
  if (c.requerido) s = s.required(msgObligatorio(c));
  if (c.clave === 'fecha' && (tipo === 100000006 || tipo === 100000007)) {
    s = s.test('no-futura', 'La fecha no puede ser mayor a la fecha de hoy', (v) => !v || !esFechaFutura(v as Date));
  }
  if (c.clave === 'fechaInicial') {
    s = s.test('inicial-orden', 'La fecha inicial no puede ser posterior a la fecha final.', function (v) {
      const fin = this.parent.fechaFinal as Date | null;
      return !v || !fin || (v as Date) <= fin;
    });
  }
  if (c.clave === 'fechaFinal') {
    s = s.test('final-orden', 'La fecha final no puede ser anterior a la fecha inicial.', function (v) {
      const inicio = this.parent.fechaInicial as Date | null;
      return !v || !inicio || (v as Date) >= inicio;
    });
  }
  return s;
};

const esquemaDeTipo = (tipo: number | null): yup.AnyObjectSchema => {
  const base: Record<string, yup.AnySchema> = {
    tipoMaterial: opcionRequerida('El tipo de material es obligatorio') as unknown as yup.AnySchema,
  };
  const seccion = tipo === null ? null : CAMPOS_POR_TIPO[tipo];
  if (seccion) {
    const conEstado = seccion.campos.some((c) => c.clave === 'estadoPublicacion');
    seccion.campos.forEach((c) => {
      if (c.soloLectura) return;
      if (c.clave === 'otroTipoInnovacion') {
        base[c.clave] = yup
          .string()
          .nullable()
          .max(100, 'El otro tipo de innovación no puede exceder los 100 caracteres')
          .test('otro', 'Debe especificar el otro tipo de innovación', function (v) {
            return !esValor(this.parent.tipoInnovacion, INNOVACION_OTRO) || Boolean(v && v.trim());
          });
        return;
      }
      if (c.clave === 'ano') {
        base[c.clave] = esquemaDeAnio(c, tipo as number, conEstado) as unknown as yup.AnySchema;
        return;
      }
      if (c.clave === 'estadoPublicacion') {
        base[c.clave] = opcionRequerida(msgObligatorio(c)).test('futuro', function (valor) {
          const ano = this.parent.ano;
          if (!esPublicado(valor) || !ano) return true;
          if (Number(ano) > anioActual()) {
            return this.createError({
              path: 'estadoPublicacion',
              message: `El estado no puede ser "Publicado" si el año seleccionado (${ano}) es mayor al año actual (${anioActual()}).`,
            });
          }
          return true;
        }) as unknown as yup.AnySchema;
        return;
      }
      switch (c.control) {
        case 'texto':
        case 'textoLargo':
          base[c.clave] = esquemaDeTexto(c) as unknown as yup.AnySchema;
          break;
        case 'numero':
          base[c.clave] = esquemaDeNumero(c) as unknown as yup.AnySchema;
          break;
        case 'fecha':
          base[c.clave] = esquemaDeFecha(c, tipo as number);
          break;
        case 'opcion':
          base[c.clave] = (c.requerido ? opcionRequerida(msgObligatorio(c)) : opcionOpcional()) as unknown as yup.AnySchema;
          break;
      }
    });
  }
  return yup.object(base) as unknown as yup.AnyObjectSchema;
};

/** El esquema depende del tipo de material elegido (yup.lazy, como schemaDinamico del portal). */
export const esquemaProduccion = yup.lazy((valores: FormularioProduccion) =>
  esquemaDeTipo(tipoDeMaterial(valores?.tipoMaterial)),
);

// ---------------------------------------------------------------------------
// Lectura
// ---------------------------------------------------------------------------

const PARTICIPANTE_ALIAS = 'participantesdeproduccioncientifica';

export const PARTICIPANTE_PENDIENTE = 100000001;
export const PARTICIPANTE_APROBADO = 100000002;
export const PARTICIPANTE_RECHAZADO = 100000003;
export const PARTICIPANTE_BAJA = 100000004;
/** statuscode del participante inactivo. */
export const PARTICIPANTE_INACTIVO = 2;

export const ESTADO_AUTOR: OpcionDeLista[] = [
  { value: PARTICIPANTE_PENDIENTE, label: 'Pendiente' },
  { value: PARTICIPANTE_APROBADO, label: 'Aprobado' },
  { value: PARTICIPANTE_RECHAZADO, label: 'Rechazado' },
  { value: PARTICIPANTE_BAJA, label: 'Baja' },
];

/** Participación del empleado en una producción de otra persona (columna "participante" del portal). */
export interface ParticipacionPropia {
  id: string;
  lugarTrabajo: number | null;
  nombreYApellido: string;
  orden: string;
  motivoDeBaja: string;
  fechaDeBaja: Date | null;
  statuscode: number | null;
  colaboradorId: string;
  colaboradorNombre: string;
  otro: string;
}

export interface Produccion {
  id: string;
  creadoEn: string;
  creadorId: string;
  creadorNombre: string;
  /** Todos los campos de la producción, con la forma del formulario. */
  valores: FormularioProduccion;
  /** Solo si el empleado figura como autor de una producción que cargó otra persona. */
  participante: ParticipacionPropia | null;
}

const numeroONull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
};

const opcionDeAtributo = (fila: Fila, at: Atributo): OpcionONull => {
  const valor = fila?.[at.api];
  if (valor === null || valor === undefined || valor === '') return null;
  const lista = at.lista ?? [];
  const encontrada = lista.find((x) => String(x.value) === String(valor));
  if (encontrada) return { value: encontrada.value, label: encontrada.label };
  const delCrm = fila?.[`${at.api}${FV}`];
  return { value: valor, label: texto(delCrm ?? valor) };
};

const valoresDeFila = (fila: Fila): FormularioProduccion => {
  const v: FormularioProduccion = {};
  ATRIBUTOS.forEach((at) => {
    switch (at.dato) {
      case 'texto':
      case 'numero':
        v[at.clave] = texto(fila?.[at.api]);
        break;
      case 'fecha':
        v[at.clave] = fechaDeFila(fila, at.api);
        break;
      default:
        v[at.clave] = opcionDeAtributo(fila, at);
    }
  });
  return v;
};

const delAlias = (fila: Fila, atributo: string): unknown => fila?.[`${PARTICIPANTE_ALIAS}.${atributo}`];

const fechaDeAlias = (fila: Fila, atributo: string): Date | null => {
  const crudo = delAlias(fila, atributo);
  if (typeof crudo === 'string' && crudo.trim() !== '') {
    const d = new Date(crudo);
    if (isValid(d)) return d;
  }
  return parsearFechaCrm(delAlias(fila, `${atributo}${FV}`));
};

const participacionDeFila = (fila: Fila): ParticipacionPropia => {
  const nombre = texto(delAlias(fila, 'new_nombreyapellido'));
  const colaboradorId = texto(delAlias(fila, 'new_colaborador') ?? delAlias(fila, '_new_colaborador_value'));
  const colaboradorFv = texto(
    delAlias(fila, `new_colaborador${FV}`) ?? delAlias(fila, `_new_colaborador_value${FV}`),
  );
  return {
    id: texto(delAlias(fila, 'new_participantesdeproduccioncientificaid')),
    lugarTrabajo: numeroONull(delAlias(fila, 'new_lugardetrabajo')),
    nombreYApellido: nombre,
    orden: texto(delAlias(fila, 'new_ordendeautor')),
    motivoDeBaja: texto(delAlias(fila, 'new_motivodebaja')),
    fechaDeBaja: fechaDeAlias(fila, 'new_fechadebaja'),
    statuscode: numeroONull(delAlias(fila, 'statuscode')),
    colaboradorId,
    colaboradorNombre: colaboradorFv || nombre,
    otro: texto(delAlias(fila, 'new_otro')),
  };
};

const produccionDeFila = (fila: Fila, conParticipante: boolean): Produccion => ({
  id: texto(fila?.new_produccioncientificaid),
  creadoEn: texto(fila?.createdon),
  creadorId: texto(fila?._new_colaborador_value),
  creadorNombre: texto(fila?.[`_new_colaborador_value${FV}`]),
  valores: valoresDeFila(fila),
  participante: conParticipante ? participacionDeFila(fila) : null,
});

const porFechaDeAlta = (x: Produccion, y: Produccion): number => {
  const tx = Date.parse(x.creadoEn);
  const ty = Date.parse(y.creadoEn);
  return (Number.isFinite(ty) ? ty : 0) - (Number.isFinite(tx) ? tx : 0);
};

/**
 * Lista de producciones del empleado: las que cargó él, más las de otras personas donde figura como autor
 * (sin las que están en Borrador, como el portal). Si una producción aparece en las dos lecturas manda la propia.
 */
export const combinarProducciones = (propias: Fila[], comoAutor: Fila[]): Produccion[] => {
  const lista: Produccion[] = [];
  const vistas = new Set<string>();
  propias.forEach((fila) => {
    const p = produccionDeFila(fila, false);
    if (p.id && !vistas.has(p.id)) {
      vistas.add(p.id);
      lista.push(p);
    }
  });
  comoAutor.forEach((fila) => {
    if (Number(fila?.statuscode) === PRODUCCION_BORRADOR) return;
    const p = produccionDeFila(fila, true);
    if (p.id && !vistas.has(p.id)) {
      vistas.add(p.id);
      lista.push(p);
    }
  });
  return lista.sort(porFechaDeAlta);
};

// ---------------------------------------------------------------------------
// Reglas de la lista y del modal
// ---------------------------------------------------------------------------

export type ModoProduccion = 'nuevo' | 'editar' | 'ver' | 'responder';

export interface AccionesDeProduccion {
  ver: boolean;
  editar: boolean;
  eliminar: boolean;
  responder: boolean;
}

/** Acciones de cada fila (columnsProduccionCientifica del portal). */
export const accionesDeProduccion = (p: Produccion): AccionesDeProduccion => {
  if (!p.participante) return { ver: true, editar: true, eliminar: true, responder: false };
  const st = p.participante.statuscode;
  if (st === PARTICIPANTE_APROBADO) return { ver: true, editar: true, eliminar: false, responder: false };
  if (st === PARTICIPANTE_RECHAZADO || st === PARTICIPANTE_BAJA || st === PARTICIPANTE_INACTIVO) {
    return { ver: true, editar: false, eliminar: false, responder: false };
  }
  return { ver: false, editar: false, eliminar: false, responder: true };
};

export const estaPublicada = (p: Produccion | undefined): boolean =>
  Number(p?.valores?.estadoProduccion?.value) === PRODUCCION_PUBLICADA;

/** Si ya está publicada, "Borrador" deja de ser una opción. */
export const opcionesDeEstadoProduccion = (publicada: boolean): OpcionDeLista[] =>
  publicada ? ESTADO_PRODUCCION.filter((x) => x.value !== PRODUCCION_BORRADOR) : ESTADO_PRODUCCION;

/** Título que muestra la tarjeta de la lista. */
export const tituloDeProduccion = (p: Produccion): string =>
  texto(p.valores.titulo) ||
  texto(p.valores.tituloCapitulo) ||
  texto(p.valores.nombreObra) ||
  texto(p.valores.tema) ||
  texto(p.valores.nombreConferencia) ||
  texto(p.valores.nombreCongreso) ||
  '';

// ---------------------------------------------------------------------------
// Alta, edición y baja de la producción
// ---------------------------------------------------------------------------

export const produccionAFormulario = (p: Produccion | undefined): FormularioProduccion =>
  p ? { ...produccionVacia(), ...p.valores } : produccionVacia();

const numeroDeCampo = (v: unknown): number => (v ? Number(v) : 0);
const opcionNumero = (v: OpcionONull | undefined): number => (v?.value ? Number(v.value) : 0);

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/produccionCientifica
 * (hooks/investigacion-perfil/useCargaEditarProduccionCientifica). El alta manda new_colaborador; la edición, el id.
 * Números: Number(x) o 0; textos: vacío si no hay; opciones: su código o 0.
 * DIFERENCIAS CONSCIENTES: el portal manda además un new_tipodecaso que siempre vale 0 (lee mal el campo); acá no se
 * manda. Y al editar el portal omite new_fechainicial / new_fechafinal (la transferencia nunca guarda cambios de
 * período); acá se mandan también al editar.
 */
export const armarPayloadProduccion = (
  empleadoId: string,
  valores: FormularioProduccion,
  id?: string,
): Record<string, unknown> => {
  const cuerpo: Record<string, unknown> = id
    ? { new_produccioncientificaid: id }
    : { new_colaborador: empleadoId };
  ATRIBUTOS.forEach((at) => {
    const v = valores[at.clave];
    switch (at.dato) {
      case 'texto':
        cuerpo[at.api] = v ?? '';
        break;
      case 'numero':
        cuerpo[at.api] = numeroDeCampo(v);
        break;
      case 'fecha':
        cuerpo[at.api] = diaADocenciaApi(v as Date | null) ?? '';
        break;
      default:
        cuerpo[at.api] = opcionNumero(v as OpcionONull);
    }
  });
  return cuerpo;
};

/** Al publicar, el creador tiene que figurar entre los autores. */
export const MSG_CREADOR_DEBE_SER_AUTOR =
  'El creador de la producción debe estar incluido entre los autores para poder Publicar.';

export const publicaConEstado = (valores: FormularioProduccion): boolean =>
  Number(valores?.estadoProduccion?.value) === PRODUCCION_PUBLICADA;

// ---------------------------------------------------------------------------
// Autores
// ---------------------------------------------------------------------------

export const LUGAR_UA = 100000000;
export const LUGAR_OTRO = 100000001;

export const LUGAR_TRABAJO_AUTOR: OpcionDeLista[] = [
  { value: LUGAR_UA, label: 'Universidad Austral' },
  { value: LUGAR_OTRO, label: 'Otro' },
];

export interface Autor {
  id: string;
  produccionId: string;
  lugarTrabajo: OpcionONull;
  colaboradorId: string;
  colaboradorNombre: string;
  otro: string;
  nombreYApellido: string;
  orden: string;
  motivoDeBaja: string;
  fechaDeBaja: Date | null;
  statuscode: number | null;
  /** Texto del estado ("Aprobado", "Inactivo", ...). */
  estadoTexto: string;
  otraInstitucion: string;
}

const estadoDeAutor = (fila: Fila): { codigo: number | null; texto: string } => {
  const codigo = numeroONull(fila?.statuscode);
  const delLista = ESTADO_AUTOR.find((x) => x.value === codigo)?.label;
  return { codigo, texto: delLista ?? texto(fila?.[`statuscode${FV}`]) };
};

/** Autores de una producción, ordenados por "Orden de autor" (los que no tienen, al final). */
export const mapearAutores = (filas: Fila[]): Autor[] =>
  filas
    .map((fila) => {
      const lugar = opcionDeLista(fila?.new_lugardetrabajo, LUGAR_TRABAJO_AUTOR);
      const estado = estadoDeAutor(fila);
      const esUa = Number(lugar?.value) === LUGAR_UA;
      return {
        id: texto(fila?.new_participantesdeproduccioncientificaid),
        produccionId: texto(fila?._new_produccioncientifica_value),
        lugarTrabajo: lugar,
        colaboradorId: esUa ? texto(fila?._new_colaborador_value) : '',
        colaboradorNombre: esUa
          ? texto(fila?.[`_new_colaborador_value${FV}`]) || texto(fila?.new_nombreyapellido)
          : '',
        otro: texto(fila?.new_otro),
        nombreYApellido: texto(fila?.new_nombreyapellido),
        orden: texto(fila?.new_ordendeautor),
        motivoDeBaja: texto(fila?.new_motivodebaja),
        fechaDeBaja: (() => {
          const crudo = fila?.new_fechadebaja;
          if (typeof crudo === 'string' && crudo.trim() !== '') {
            const d = new Date(crudo);
            if (isValid(d)) return d;
          }
          return fechaDeFila(fila, 'new_fechadebaja');
        })(),
        statuscode: estado.codigo,
        estadoTexto: estado.texto,
        otraInstitucion: texto(fila?.new_otrainstitucion),
      };
    })
    .sort((x, y) => {
      const ox = numeroONull(x.orden);
      const oy = numeroONull(y.orden);
      if (ox === null && oy === null) return 0;
      if (ox === null) return 1;
      if (oy === null) return -1;
      return ox - oy;
    });

export interface FormularioAutor {
  lugarTrabajo: OpcionONull;
  colaborador: OpcionONull;
  otro: string;
  orden: string;
  otraInstitucion: string;
  estado: OpcionONull;
  motivoDeBaja: string;
}

export const autorAFormulario = (autor: Autor | undefined): FormularioAutor => ({
  lugarTrabajo: autor?.lugarTrabajo ?? null,
  colaborador: autor?.colaboradorId ? { value: autor.colaboradorId, label: autor.colaboradorNombre } : null,
  otro: autor?.otro ?? '',
  orden: autor?.orden ?? '',
  otraInstitucion: autor?.otraInstitucion ?? '',
  estado: autor ? opcionDeLista(autor.statuscode, ESTADO_AUTOR) : null,
  motivoDeBaja: autor?.motivoDeBaja ?? '',
});

/** Estados que se pueden elegir al editar un autor, según el que tiene ahora (ModalParticipantes). */
export const opcionesDeEstadoAutor = (estadoActual: number | null, esElPropioCreador: boolean): OpcionDeLista[] => {
  const por = (...codigos: number[]) => ESTADO_AUTOR.filter((x) => codigos.includes(Number(x.value)));
  if (esElPropioCreador) return por(PARTICIPANTE_APROBADO);
  switch (estadoActual) {
    case PARTICIPANTE_PENDIENTE:
      return por(PARTICIPANTE_APROBADO, PARTICIPANTE_RECHAZADO, PARTICIPANTE_BAJA);
    case PARTICIPANTE_APROBADO:
      return por(PARTICIPANTE_BAJA);
    case PARTICIPANTE_RECHAZADO:
      return por(PARTICIPANTE_PENDIENTE, PARTICIPANTE_BAJA);
    case PARTICIPANTE_BAJA:
      return por(PARTICIPANTE_PENDIENTE);
    default:
      return ESTADO_AUTOR;
  }
};

/** Estado con el que nace un autor: el propio empleado y los de otras instituciones, aprobados; el resto, pendientes. */
export const estadoInicialDeAutor = (f: FormularioAutor, empleadoId: string): number => {
  if (Number(f.lugarTrabajo?.value) === LUGAR_UA) {
    return f.colaborador?.value === empleadoId ? PARTICIPANTE_APROBADO : PARTICIPANTE_PENDIENTE;
  }
  return PARTICIPANTE_APROBADO;
};

const fechaDeBajaAhora = (): string => new Date().toISOString();

/**
 * Cuerpo de POST api/hrfactors/investigacion/AutoresProduccionCientifica (useCargarEditarAutoresProduccionCientifica.cargarAutor).
 * DIFERENCIA CONSCIENTE: si el lugar de trabajo es la Universidad, el texto "otro" no se manda (y al revés con el
 * colaborador): el portal manda lo que haya quedado en el formulario aunque el campo ya no se vea.
 */
export const armarPayloadAutorNuevo = (
  empleadoId: string,
  produccionId: string,
  f: FormularioAutor,
): Record<string, unknown> => {
  const esUa = Number(f.lugarTrabajo?.value) === LUGAR_UA;
  const estado = estadoInicialDeAutor(f, empleadoId);
  const otro = esUa ? '' : f.otro;
  const baja = estado === PARTICIPANTE_BAJA;
  return {
    new_produccioncientifica: produccionId,
    new_lugardetrabajo: f.lugarTrabajo?.value ?? 0,
    new_colaborador: esUa ? f.colaborador?.value ?? '' : '',
    new_otro: otro ?? '',
    new_ordendeautor: f.orden ? Number(f.orden) : 0,
    statuscode: estado,
    new_motivodebaja: f.motivoDeBaja ?? '',
    new_nombreyapellido: otro ? otro : f.colaborador?.label,
    new_responsabledebaja: baja ? empleadoId : null,
    new_fechadebaja: baja ? fechaDeBajaAhora() : null,
    new_otrainstitucion: f.otraInstitucion || null,
  };
};

/** Cuerpo de PUT api/hrfactors/investigacion/AutoresProduccionCientifica (useCargarEditarAutoresProduccionCientifica.editarAutor). */
export const armarPayloadAutorEditado = (
  empleadoId: string,
  autorId: string,
  f: FormularioAutor,
): Record<string, unknown> => {
  const esUa = Number(f.lugarTrabajo?.value) === LUGAR_UA;
  const otro = esUa ? '' : f.otro;
  const estado = f.estado?.value;
  const baja = Number(estado) === PARTICIPANTE_BAJA;
  return {
    new_participantesdeproduccioncientificaid: autorId,
    new_lugardetrabajo: f.lugarTrabajo?.value ?? 0,
    new_colaborador: (esUa ? f.colaborador?.value : '') || null,
    new_otro: otro || null,
    new_ordendeautor: f.orden ? Number(f.orden) : 0,
    statuscode: estado ?? null,
    new_motivodebaja: f.motivoDeBaja || null,
    new_nombreyapellido: otro ? otro : f.colaborador?.label,
    new_responsabledebaja: baja ? empleadoId : null,
    new_fechadebaja: baja ? fechaDeBajaAhora() : null,
    new_otrainstitucion: f.otraInstitucion || null,
  };
};

/**
 * Cuerpo del PUT con el que un autor aprueba o rechaza su participación (onConfirmAccept del modal del portal).
 * El nombre sale del colaborador; si el CRM no devolvió su texto se usa "Nombre y apellido" del autor.
 */
export const armarPayloadRespuestaDeAutor = (
  p: ParticipacionPropia,
  aprobar: boolean,
): Record<string, unknown> => ({
  new_participantesdeproduccioncientificaid: p.id,
  new_lugardetrabajo: p.lugarTrabajo ?? 0,
  new_colaborador: p.colaboradorId || null,
  new_otro: null,
  new_ordendeautor: p.orden ? Number(p.orden) : 0,
  statuscode: aprobar ? PARTICIPANTE_APROBADO : PARTICIPANTE_RECHAZADO,
  new_motivodebaja: null,
  new_nombreyapellido: p.colaboradorNombre || p.nombreYApellido,
  new_responsabledebaja: null,
  new_fechadebaja: null,
  new_otrainstitucion: null,
});

export const esquemaAutor = yup.object({
  lugarTrabajo: opcionRequerida('El lugar de trabajo es requerido'),
  orden: yup
    .string()
    .nullable()
    .test('entero', 'El orden de autor debe ser un número entero', (v) => !v || Number.isInteger(Number(v)))
    .test('maximo', 'El orden de autor no puede ser mayor a 9999', (v) => !v || Number(v) <= 9999)
    .test('minimo', 'El orden de autor no puede ser menor a 1', (v) => !v || Number(v) >= 1),
  colaborador: yup
    .mixed()
    .nullable()
    .test('colaborador', 'El autor es requerido', function (v) {
      return Number(this.parent.lugarTrabajo?.value) !== LUGAR_UA || Boolean((v as { value?: unknown } | null)?.value);
    }),
  otro: yup
    .string()
    .nullable()
    .test('otro', 'El Autor/es es requerido', function (v) {
      return Number(this.parent.lugarTrabajo?.value) !== LUGAR_OTRO || Boolean(v && v.trim());
    }),
  motivoDeBaja: yup
    .string()
    .nullable()
    .test('motivo', 'El motivo de baja es requerido', function (v) {
      return Number(this.parent.estado?.value) !== PARTICIPANTE_BAJA || Boolean(v && v.trim());
    })
    .max(2000, 'El motivo de baja no puede exceder los 2000 caracteres'),
});

// ---------------------------------------------------------------------------
// Errores de la API de autores
// ---------------------------------------------------------------------------

const textoCrudoDeError = (error: unknown): string | null => {
  const data = (error as { response?: { data?: any } } | null)?.response?.data;
  if (!data) return null;
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (typeof data?.message === 'string') return data.message.trim();
  if (typeof data?.error?.message === 'string') return data.error.message.trim();
  if (typeof data?.Message === 'string') return data.Message.trim();
  return null;
};

/** Mensajes de los errores conocidos del CRM; el resto se muestra tal cual, y sin texto va el mensaje por defecto. */
export const mensajeDeErrorDeAutor = (error: unknown, porDefecto: string): string => {
  const crudo = textoCrudoDeError(error);
  if (!crudo) return porDefecto;
  if (crudo.includes('CLAVECOMPUESTA')) return 'El Orden de autor elegido ya está asignado en esta producción.';
  if (crudo.includes('validarduplicado-deColaborador')) {
    return 'El colaborador elegido ya fue relacionado con esta Producción científica. Por favor, validar.';
  }
  return crudo;
};
