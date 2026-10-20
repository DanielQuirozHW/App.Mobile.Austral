// Resultados vinculados a un proyecto de investigación (7 tipos).
// Port de Portal-Austral-Dev -> src/hooks/investigacion-perfil/{useGetTablaProyInvestigacios,useCargarEditarResultadosProyecto,
// useGetResultadosProyecto,useGetMasInfoEntidad}.ts y columns/investigacion/columnsProyectos.tsx.
import { FV, texto, type Fila } from './comun';
import { mensajeDeErrorApi } from '../../config/api/apiError';

export type TipoResultado =
  | 'produccionCientifica'
  | 'financiamientoPropioUA'
  | 'financiamientoExternoUA'
  | 'tesistas'
  | 'direccionBecarios'
  | 'jornadasCongresos'
  | 'estancias';

/** Qué modal de solo lectura ya existe en la app para el "Más info" de cada tipo (null: todavía no migrado). */
export type VisorMasInfo = 'propio' | 'externo' | 'tesistas' | 'direccion' | null;

export interface ConfigResultado {
  tipo: TipoResultado;
  /** Nombre que usan los toasts y los títulos de los modales ("Resultado de X", "Vincular X"). */
  nombre: string;
  /** Título de la sección en el modal del proyecto. */
  tituloSeccion: string;
  /** Nombre de la columna de título y del select de la vinculación. */
  etiquetaTitulo: string;
  // Entidad de la vinculación
  coleccion: string;
  entidad: string;
  idAttr: string;
  lookupAttr: string;
  vinculadoPorAttr: string;
  /** Último tramo de api/hrfactors/investigacion/proyectos/<sufijo>. */
  sufijoEndpoint: string;
  /** Texto que trae el error del backend cuando la vinculación ya existe. */
  claveDuplicado: string;
  // Entidad que se vincula (opciones del select)
  coleccionOpciones: string;
  entidadOpciones: string;
  idOpcion: string;
  atributosOpciones: string[];
  ordenOpciones: string;
  etiquetaOpcion: (fila: Fila) => string;
  /** Entidad vinculada, para el "Más info" (lectura por GUID). */
  visor: VisorMasInfo;
}

const nombreDeFila = (fila: Fila): string => texto(fila?.new_name).trim();

export const CONFIG_RESULTADOS: ConfigResultado[] = [
  {
    tipo: 'produccionCientifica',
    nombre: 'Producción Científica',
    tituloSeccion: 'Producción Científica / Innovación Académica',
    etiquetaTitulo: 'Título',
    coleccion: 'new_resproy_produccioncientificas',
    entidad: 'new_resproy_produccioncientifica',
    idAttr: 'new_resproy_produccioncientificaid',
    lookupAttr: 'new_produccioncientifica',
    vinculadoPorAttr: 'new_vinculadopor_5',
    sufijoEndpoint: 'resultadoProyectoProduccionCientificas',
    claveDuplicado: 'vinculapor-ProCienti',
    coleccionOpciones: 'new_produccioncientificas',
    entidadOpciones: 'new_produccioncientifica',
    idOpcion: 'new_produccioncientificaid',
    atributosOpciones: ['new_produccioncientificaid', 'new_titulo', 'new_tema', 'new_nombredelaobra'],
    ordenOpciones: 'new_titulo',
    etiquetaOpcion: (f) =>
      texto(f?.new_titulo).trim() || texto(f?.new_tema).trim() || texto(f?.new_nombredelaobra).trim(),
    visor: null,
  },
  {
    tipo: 'financiamientoPropioUA',
    nombre: 'Financiamiento Propio de la UA',
    tituloSeccion: 'Financiamientos / Subsidios - Financiamiento propio de la UA',
    etiquetaTitulo: 'Nombre del subsidio',
    coleccion: 'new_resproyfinancpropiouas',
    entidad: 'new_resproyfinancpropioua',
    idAttr: 'new_resproyfinancpropiouaid',
    lookupAttr: 'new_financiamientopropioua',
    vinculadoPorAttr: 'new_vinculadopor_6',
    // Los dos sufijos de financiamiento llevan el typo del backend ("Financiaminet"): se mantienen tal cual.
    sufijoEndpoint: 'resultadoProyectoFinanciaminetoPropioUA',
    claveDuplicado: 'vinculapor-FinPropioUA',
    coleccionOpciones: 'new_financiamientopropiodelauas',
    entidadOpciones: 'new_financiamientopropiodelaua',
    idOpcion: 'new_financiamientopropiodelauaid',
    atributosOpciones: ['new_financiamientopropiodelauaid', 'new_name'],
    ordenOpciones: 'createdon',
    etiquetaOpcion: nombreDeFila,
    visor: 'propio',
  },
  {
    tipo: 'financiamientoExternoUA',
    nombre: 'Financiamiento Externo a la UA',
    tituloSeccion: 'Financiamientos / Subsidios - Financiamiento externo a la UA',
    etiquetaTitulo: 'Nombre del subsidio',
    coleccion: 'new_resproyfinancexternouas',
    entidad: 'new_resproyfinancexternoua',
    idAttr: 'new_resproyfinancexternouaid',
    lookupAttr: 'new_financiamientoexternoua',
    vinculadoPorAttr: 'new_vinculadopor_6_1',
    sufijoEndpoint: 'resultadoProyectoFinanciaminetoExternoUA',
    claveDuplicado: 'FinExternoUA',
    coleccionOpciones: 'new_financiamientoexternoalauas',
    entidadOpciones: 'new_financiamientoexternoalaua',
    idOpcion: 'new_financiamientoexternoalauaid',
    atributosOpciones: ['new_financiamientoexternoalauaid', 'new_name'],
    ordenOpciones: 'createdon',
    etiquetaOpcion: nombreDeFila,
    visor: 'externo',
  },
  {
    tipo: 'tesistas',
    nombre: 'Formación de Tesistas',
    tituloSeccion: 'Formación de RRHH - Formación tesistas',
    etiquetaTitulo: 'Título del trabajo',
    coleccion: 'new_resproy_formaciontesistases',
    entidad: 'new_resproy_formaciontesistas',
    idAttr: 'new_resproy_formaciontesistasid',
    lookupAttr: 'new_formaciontesistas',
    vinculadoPorAttr: 'new_vinculadopor_7',
    sufijoEndpoint: 'resultadoProyectoTesistas',
    claveDuplicado: 'vinculapor-tesista',
    coleccionOpciones: 'new_formaciontesistases',
    entidadOpciones: 'new_formaciontesistas',
    idOpcion: 'new_formaciontesistasid',
    atributosOpciones: ['new_formaciontesistasid', 'new_name'],
    ordenOpciones: 'createdon',
    etiquetaOpcion: nombreDeFila,
    visor: 'tesistas',
  },
  {
    tipo: 'direccionBecarios',
    nombre: 'Formación de Investigadores y/o Becarios',
    tituloSeccion: 'Formación de RRHH - Dirección de Investigadores y/o Becarios',
    etiquetaTitulo: 'Pertenencia director',
    coleccion: 'new_resproy_direccioninvyobecarioses',
    entidad: 'new_resproy_direccioninvyobecarios',
    idAttr: 'new_resproy_direccioninvyobecariosid',
    lookupAttr: 'new_direcciondeinvestigadoresbecarios',
    vinculadoPorAttr: 'new_vinculadopor_7_1',
    sufijoEndpoint: 'resultadoProyectoInvestigadoresBecarios',
    claveDuplicado: 'vinculapor-DireInvBeca',
    coleccionOpciones: 'new_direcciondeinvestigadoresbecarioses',
    entidadOpciones: 'new_direcciondeinvestigadoresbecarios',
    idOpcion: 'new_direcciondeinvestigadoresbecariosid',
    atributosOpciones: ['new_direcciondeinvestigadoresbecariosid', 'new_pertenenciadirector'],
    ordenOpciones: 'createdon',
    etiquetaOpcion: (f) => texto(f?.[`new_pertenenciadirector${FV}`]).trim(),
    visor: 'direccion',
  },
  {
    tipo: 'jornadasCongresos',
    nombre: 'Participación en Jornadas',
    tituloSeccion: 'Participación en Jornadas / Congresos / Eventos',
    etiquetaTitulo: 'Nombre',
    coleccion: 'new_resproy_participacionenjornadases',
    entidad: 'new_resproy_participacionenjornadas',
    idAttr: 'new_resproy_participacionenjornadasid',
    lookupAttr: 'new_participacioneneventosycongresos',
    vinculadoPorAttr: 'new_vinculadopor_8',
    sufijoEndpoint: 'resultadoProyectoInvestigadoresParticipacionJornadas',
    claveDuplicado: 'vinculapor-jornada',
    coleccionOpciones: 'new_participacioneneventosycongresoses',
    entidadOpciones: 'new_participacioneneventosycongresos',
    idOpcion: 'new_participacioneneventosycongresosid',
    atributosOpciones: ['new_participacioneneventosycongresosid', 'new_name'],
    ordenOpciones: 'createdon',
    etiquetaOpcion: nombreDeFila,
    visor: null,
  },
  {
    tipo: 'estancias',
    nombre: 'Estancias',
    tituloSeccion: 'Estancias',
    etiquetaTitulo: 'Tipo de actividad realizada',
    coleccion: 'new_resproy_estanciases',
    entidad: 'new_resproy_estancias',
    idAttr: 'new_resproy_estanciasid',
    lookupAttr: 'new_estancias',
    vinculadoPorAttr: 'new_vinculadopor_10',
    sufijoEndpoint: 'resultadoProyectoInvestigadoresEstancias',
    claveDuplicado: 'vinculapor-Estancia',
    coleccionOpciones: 'new_estanciases',
    entidadOpciones: 'new_estancias',
    idOpcion: 'new_estanciasid',
    atributosOpciones: ['new_estanciasid', 'new_tipodeactividadrealizada'],
    ordenOpciones: 'createdon',
    etiquetaOpcion: (f) => texto(f?.[`new_tipodeactividadrealizada${FV}`]).trim(),
    visor: null,
  },
];

export const configDeResultado = (tipo: TipoResultado): ConfigResultado => {
  const config = CONFIG_RESULTADOS.find((c) => c.tipo === tipo);
  if (!config) throw new Error(`Tipo de resultado desconocido: ${tipo}`);
  return config;
};

/** Vinculación de un resultado a un proyecto, tal como se lista en el modal del proyecto. */
export interface ResultadoVinculado {
  /** Id de la vinculación. */
  id: string;
  /** value = id del registro vinculado (para el "Más info"); label = su texto. */
  titulo: { value: string | null; label: string };
  vinculadoPor: string;
  fechaVinculacion: string;
}

export const mapearResultadosVinculados = (config: ConfigResultado, filas: Fila[]): ResultadoVinculado[] =>
  filas.map((f) => ({
    id: texto(f?.[config.idAttr]),
    titulo: {
      value: f?.[`_${config.lookupAttr}_value`] ? String(f[`_${config.lookupAttr}_value`]) : null,
      label: texto(f?.[`_${config.lookupAttr}_value${FV}`]),
    },
    vinculadoPor: texto(f?.[config.vinculadoPorAttr]),
    fechaVinculacion: texto(f?.[`createdon${FV}`]),
  }));

/** Opción del select de "Vincular": registros del usuario y de los participantes del proyecto. */
export interface OpcionDeResultado {
  value: string;
  label: string;
}

export const mapearOpcionesDeResultado = (config: ConfigResultado, filas: Fila[]): OpcionDeResultado[] => {
  const vistos = new Set<string>();
  const opciones: OpcionDeResultado[] = [];
  filas.forEach((f) => {
    const id = texto(f?.[config.idOpcion]);
    const label = config.etiquetaOpcion(f);
    if (!id || !label || vistos.has(id)) return;
    vistos.add(id);
    opciones.push({ value: id, label });
  });
  return opciones;
};

export interface FormularioResultado {
  titulo: { value: string | number | null | undefined; label: string | null | undefined } | null;
}

/** "Apellidos, Nombre": cómo el portal guarda quién hizo la vinculación. */
export const nombreDelVinculador = (apellidos: unknown, nombre: unknown): string =>
  `${texto(apellidos)}, ${texto(nombre)}`;

export const armarPayloadResultado = (
  config: ConfigResultado,
  tituloId: string,
  vinculadoPor: string,
  proyectoId: string,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { [config.idAttr]: id } : {}),
  [config.lookupAttr]: tituloId,
  [config.vinculadoPorAttr]: vinculadoPor,
  new_proyectodeinvestigacion: proyectoId,
});

/** Mismo criterio del portal para comparar nombres: sin tildes, sin espacios tras la coma y en minúsculas. */
export const normalizarNombre = (valor: unknown): string =>
  texto(valor)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/,\s+/g, ',')
    .trim()
    .toLowerCase();

/** Solo quien hizo la vinculación puede editarla o eliminarla, y solo si puede vincular en el proyecto. */
export const puedeModificarVinculacion = (
  puedeVincular: boolean,
  resultado: ResultadoVinculado,
  nombreDelUsuario: string,
): boolean =>
  puedeVincular &&
  normalizarNombre(resultado.vinculadoPor) !== '' &&
  normalizarNombre(resultado.vinculadoPor) === normalizarNombre(nombreDelUsuario);

export const MSG_VINCULACION_DUPLICADA =
  'La vinculación que intenta hacer, ya fue vinculada anteriormente a este proyecto';

/** Mensaje de error de una escritura: la vinculación duplicada tiene texto propio; si no, el del servidor. */
export const mensajeDeErrorDeResultado = (error: unknown, config: ConfigResultado, porDefecto: string): string => {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  const plano = typeof data === 'string' ? data : data ? JSON.stringify(data) : '';
  if (plano.includes(config.claveDuplicado)) return MSG_VINCULACION_DUPLICADA;
  return mensajeDeErrorApi(error, porDefecto);
};
