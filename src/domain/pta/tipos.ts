// Plan de Trabajo Anual (PTA): tipos.
import type { Opcion } from '../legajo/tipos';

/** Estado del PTA: código (statuscode) y texto formateado del CRM. */
export interface EstadoPta {
  value: number | null;
  label: string;
}

/** Un PTA tal como lo arma useGetPta del portal. Los totales llegan ya formateados por el CRM (texto). */
export interface PlanDeTrabajo {
  id: string;
  nombre: string;
  statuscode: EstadoPta;
  anio: string;
  fechaCierre: string | null;
  fechaApertura: string | null;
  fechaPresentacion: string | null;
  docente: string;
  unidadAcademica: string;
  areaDisciplinar: string;
  /** Texto formateado de new_categoriadocenteuniversidad. */
  categoriaDocenteUniversidad: string;
  /** Valor crudo de new_categoriadocente (es el que muestra "Categoría docente"). */
  categoriaDocente: string;
  categoriaConicet: string;
  perfilIAE: string;
  perfilDocente: string;
  diasContratados: string;
  departamento: string;
  totalHorasInvestigacionAnual: string;
  numeroAlumnos: number | null;
  numeroEntrevistas: number | null;
  horasDocente: number | null;
  observacionesResumen: string;
  /** Observaciones del Secretario Académico al docente. */
  observaciones: string;
  formacionInv: Opcion;
  fechaObservacion: string | null;
  comentariosHorasClases: string;
  totalHorasInvestigacion: number | null;
  totalDiasInvestigacion: number | null;
  tipoCarga: Opcion;
  horasInvestigacion: string;
  // Totales por sección (texto del CRM)
  totalHorasDocencia: string;
  totalDiasDocencia: string;
  totalHorasInvestigacionTotal: string;
  totalDiasInvestigacionTotal: string;
  totalHorasFormacion: string;
  totalDiasFormacion: string;
  totalHorasGestion: string;
  totalDiasGestion: string;
  totalHorasExtension: string;
  totalDiasExtension: string;
  totalHorasTransferencia: string;
  totalDiasTransferencia: string;
  totalHorasFormaciones: string;
  totalDiasFormaciones: string;
  totalHorasVariables: string;
  totalDiasVariables: string;
  // Totales registrados (Resumen)
  horasPtaAnterior: string;
  horasDedicacion: string;
  diasDedicacion: string;
  diferenciaPta: string;
}

/** Fila de la tabla de indicadores del Resumen. */
export interface IndicadorPta {
  id: string;
  label: string;
  /** Horas. */
  value: number;
  /** Días. */
  cantidadDias: number;
  /** Porcentaje de distribución (horas). */
  porcentaje: number;
  porcentajeDias: number;
}

/** Adjunto (nota) del PTA: el informe del año anterior. */
export interface NotaPta {
  id: string;
  /** Nombre del archivo (columna "Título"). */
  filename: string;
  subject: string;
  /** createdon en hora local, dd/MM/yyyy HH:mm. */
  fechaCarga: string | null;
  /** true si la nota tiene id (columna "Documento cargado"). */
  cargado: boolean;
}

/** Registro de una sección del PTA (clase, área, proyecto...). Los campos dependen de la sección. */
export type RegistroPta = { id: string } & Record<string, any>;

export type ClaveSeccion =
  | 'clases'
  | 'areas'
  | 'proyectos'
  | 'publicaciones'
  | 'congresos'
  | 'divulgaciones'
  | 'tesis'
  | 'jurados'
  | 'cargos'
  | 'encargos'
  | 'extension'
  | 'transferencia'
  | 'formacionDoctoral'
  | 'formacionEspecifica'
  | 'formacionHumanistica'
  | 'formacionPedagogica'
  | 'seminarios'
  | 'bloques';

/** Lista que se lee del CRM. Las 5 formaciones comparten la misma lectura. */
export type FuenteSeccion = Exclude<
  ClaveSeccion,
  'formacionDoctoral' | 'formacionEspecifica' | 'formacionHumanistica' | 'formacionPedagogica' | 'seminarios'
> | 'formaciones';

/** Datos de las secciones cargadas, por fuente. */
export type RegistrosPorFuente = Record<FuenteSeccion, RegistroPta[]>;

// --- Campos de formulario ---

export type TipoCampo = 'select' | 'texto' | 'entero' | 'multilinea' | 'fecha';

/** Listas de opciones de un select (fijas o de catálogo). */
export type ClaveOpciones =
  | 'unidadMedida'
  | 'formaDictado'
  | 'teaching'
  | 'tipoClase'
  | 'financiamiento'
  | 'estadoPublicacion'
  | 'tipoPublicacion'
  | 'tipoCongreso'
  | 'tipoParticipacion'
  | 'tipoDivulgacion'
  | 'avanceTesis'
  | 'nivelJurado'
  | 'gradoAvance'
  | 'etapaFormacion'
  | 'universidades'
  | 'universidadesJurado'
  | 'modalidades'
  | 'nivelesClase'
  | 'titulosTesis'
  | 'agrupadores'
  | 'disciplinas'
  | 'especialidades';

export interface CampoPta {
  /** Nombre en el formulario (coincide con el campo del registro mapeado). */
  nombre: string;
  label: string;
  tipo: TipoCampo;
  requerido?: boolean;
  mensajeRequerido?: string;
  maximo?: number;
  mensajeMaximo?: string;
  /** Muestra "N caracteres restantes". */
  contador?: boolean;
  opciones?: ClaveOpciones;
  /** Si devuelve false el campo no se muestra, no se valida y se envía vacío. */
  visibleSi?: (valores: any) => boolean;
  /** Campo deshabilitado (el Cargo muestra cargo y unidad sin poder cambiarlos). */
  soloLectura?: boolean;
  /** Solo letras y espacios (Otro nivel, Otra unidad académica de Clases). */
  soloLetras?: boolean;
  /** Sujeto de los mensajes numéricos: "La cantidad" -> "La cantidad debe ser un número". */
  baseNumero?: string;
  /** Texto de ayuda (tooltip del portal). */
  ayuda?: string;
  buscable?: boolean;
  /** Selects que dependen de otro: al cambiar este campo se limpian los indicados. */
  limpia?: string[];
}
