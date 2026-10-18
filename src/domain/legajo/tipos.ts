// Tipos del legajo. Forma tomada de Portal-Austral-Dev -> src/hooks/useMiLegajo.ts y useGetFamiliarXEmpleado.ts.

/** Opción de un OptionSet o de un lookup tal como la arma el portal: código + etiqueta. */
export interface Opcion {
  value: number | string | null | undefined;
  label: string | null | undefined;
}

/** Datos del legajo ya mapeados (equivale a lo que devuelve useMiLegajo en el portal). */
export interface MiLegajo {
  new_apellidos?: string;
  new_nombredepila?: string;
  new_numerolegajo?: string;
  email?: string;
  telefonoMovil?: string;
  new_tipodocumento: Opcion;
  numeroDocumento?: string;
  new_cuitcuil?: string;
  estadoCivil: Opcion;
  paisNacimiento: Opcion;
  /** Fecha cruda del CRM (yyyy-MM-dd o ISO). */
  fechaNacimiento?: string | null;
  calle?: string;
  piso?: string;
  nroCalle?: string;
  depto?: string;
  localidad: Opcion;
  codigoPostal?: string;
  provincia: Opcion;
  segundaNacionalidad: Opcion;
  pais: Opcion;
  posicion?: string;
  denominacionPersonal?: string;
  celularEmergencia?: string;
  emailEmergencia?: string;
  nombreEmergencia?: string;
  generoSegunDni: Opcion;
  vinculoEmergencia: Opcion;
  tipoContratacion: Opcion;
}

/** Archivo adjunto de un familiar o de un documento (nota del CRM). */
export interface Adjunto {
  id: string;
  filename: string;
  mimetype: string;
  /** dd/MM/yyyy HH:mm, hora local. */
  createdon: string | null;
  documentbody?: string;
}

/** Cónyuge o hijo/a. */
export interface Familiar {
  id?: string;
  tipoDocFamiliar: Opcion | Record<string, never>;
  docFamiliar: string;
  nombreFamiliar: string;
  apellidoFamiliar: string;
  tipoParentesco: Opcion;
  aCargo?: Opcion;
  generoHijos?: Opcion;
  /** yyyy-MM-dd o null. */
  fechaNacimiento: string | null;
  campoRequerido?: { esObligatorio: boolean; etiqueta: string };
  adjuntos: Adjunto[];
  adjuntoCheck?: boolean;
}

/** Fila de documentación requerida de un familiar. */
export interface DocumentoFamiliar {
  id: string;
  nombre: string;
  nombreFamiliar?: string;
  familiarId?: string;
  /** 'SÍ' o 'NO', como en el portal. */
  cargoDoc: 'SÍ' | 'NO';
}

/** Elemento de un select: { value, label }. */
export interface OpcionSelect {
  value: string;
  label: string;
}

/** Localidad: lleva el id de su provincia para filtrar del lado del cliente. */
export interface Localidad extends OpcionSelect {
  provincia: string | null;
}
