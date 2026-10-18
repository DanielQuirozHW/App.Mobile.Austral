// Mapeo de las filas del CRM a los objetos que usa la app.
// Port de Portal-Austral-Dev: src/hooks/useMiLegajo.ts, useGetFamiliarXEmpleado.ts,
// useGetDocumentosPorFamiliar.ts, useGetAdjuntosXFamiliarXEmpleado.ts, useGetLocalidades.ts.
import { utcALocalVisible, aFechaApi } from './fechas';
import { COD_A_CARGO_SI, COD_PARENTESCO_CONYUGE, COD_PARENTESCO_HIJO, PARENTESCO_CONYUGE } from './opciones';
import type { Adjunto, DocumentoFamiliar, Familiar, Localidad, MiLegajo, OpcionSelect } from './tipos';

type Fila = Record<string, any>;

// El CRM devuelve el texto de los OptionSet y lookups con esta anotación.
const FV = '@OData.Community.Display.V1.FormattedValue';

// ---------------------------------------------------------------------------
// Legajo
// ---------------------------------------------------------------------------

/** Mapea la primera fila de new_empleado (equivale al `useMemo` de useMiLegajo). */
export const mapearLegajo = (item: Fila): MiLegajo => ({
  new_apellidos: item?.new_apellidos,
  new_nombredepila: item?.new_nombredepila,
  new_numerolegajo: item?.new_numerolegajo,
  email: item?.new_correoelectronicopersonal,
  telefonoMovil: item?.new_telefonomovil,
  new_tipodocumento: { label: item?.[`new_tipodocumento${FV}`], value: item?.new_tipodocumento },
  numeroDocumento: item?.new_nrodocumento,
  new_cuitcuil: item?.new_cuitcuil,
  estadoCivil: { label: item?.[`new_estadocivil${FV}`], value: item?.new_estadocivil },
  paisNacimiento: { label: item?.[`_new_paisnacimiento_value${FV}`], value: item?._new_paisnacimiento_value },
  fechaNacimiento: item?.new_fechanacimiento,
  calle: item?.new_calle,
  piso: item?.new_piso,
  nroCalle: item?.new_nro,
  depto: item?.new_depto,
  localidad: { label: item?.[`_new_localidad_value${FV}`], value: item?._new_localidad_value },
  codigoPostal: item?.new_codigopostal,
  provincia: { label: item?.[`_new_provincia_value${FV}`], value: item?._new_provincia_value },
  segundaNacionalidad: {
    label: item?.[`_new_segundanacionalidad_value${FV}`],
    value: item?._new_segundanacionalidad_value,
  },
  pais: { label: item?.[`_new_pais_value${FV}`], value: item?._new_pais_value },
  posicion: item?.[`_new_posicin_value${FV}`],
  denominacionPersonal: item?.[`new_denominacionareadepersonal${FV}`],
  celularEmergencia: item?.new_celulardeemergencia,
  emailEmergencia: item?.new_emaildeemergencia,
  nombreEmergencia: item?.new_nombredecontactodeemergencia,
  generoSegunDni: {
    value: item?.new_generosegundni || null,
    label: item?.[`new_generosegundni${FV}`] || null,
  },
  vinculoEmergencia: {
    value: item?.new_vinculodecontacto || null,
    label: item?.[`new_vinculodecontacto${FV}`] || null,
  },
  tipoContratacion: {
    value: item?.new_tipodecontratacion || null,
    label: item?.[`new_tipodecontratacion${FV}`] || null,
  },
});

// ---------------------------------------------------------------------------
// Catálogos
// ---------------------------------------------------------------------------

/** Localidad de new_localidads: lleva el id de su provincia para filtrar en el cliente. */
export const mapearLocalidad = (item: Fila): Localidad => ({
  value: item?.new_localidadid,
  label: item?.new_name,
  provincia: item?._new_provincia_value ?? null,
});

/** Elemento del catálogo v1 ({ id, nombre }) a { value, label }. */
export const mapearCatalogo = (item: { id: string; nombre: string }): OpcionSelect => ({
  value: item.id,
  label: item.nombre,
});

// ---------------------------------------------------------------------------
// Familiares
// ---------------------------------------------------------------------------

/** Id del familiar al que pertenece una nota (alias `ag` de la consulta de adjuntos). */
const familiarIdDeNota = (nota: Fila): string | null => nota?.['ag.new_familiardeempleadoid'] ?? null;

/** Nota (annotation) del CRM a Adjunto. */
export const mapearAdjunto = (nota: Fila): Adjunto => ({
  id: nota?.annotationid,
  filename: nota?.filename ?? nota?.subject ?? 'Documento',
  mimetype: nota?.mimetype ?? 'application/octet-stream',
  createdon: utcALocalVisible(nota?.createdon),
  documentbody: nota?.documentbody,
});

/** Agrupa las notas por familiar. */
export const agruparAdjuntosPorFamiliar = (notas: unknown): Record<string, Adjunto[]> => {
  const grupos: Record<string, Adjunto[]> = {};
  if (!Array.isArray(notas)) return grupos;
  for (const nota of notas) {
    const familiarId = familiarIdDeNota(nota);
    if (!familiarId) continue;
    (grupos[familiarId] ||= []).push(mapearAdjunto(nota));
  }
  return grupos;
};

export const familiarVacio = (): Familiar => ({
  id: undefined,
  apellidoFamiliar: '',
  nombreFamiliar: '',
  tipoDocFamiliar: {},
  docFamiliar: '',
  tipoParentesco: { ...PARENTESCO_CONYUGE },
  adjuntos: [],
  adjuntoCheck: false,
  fechaNacimiento: null,
});

/** Fila de new_familiardeempleado a Familiar (equivale a `mapRow` de useGetFamiliarXEmpleado). */
export const mapearFamiliar = (item: Fila, adjuntosPorFamiliar: Record<string, Adjunto[]>): Familiar => {
  const id = item?.new_familiardeempleadoid;
  const aCargoEsSi = item?.new_cargadefamilia === COD_A_CARGO_SI;
  return {
    id,
    tipoDocFamiliar: item?.new_tipodocumento
      ? { value: item.new_tipodocumento, label: item?.[`new_tipodocumento${FV}`] ?? '' }
      : {},
    docFamiliar: item?.new_nrodocumento ?? '',
    nombreFamiliar: item?.new_nombredepila?.toUpperCase() ?? '',
    apellidoFamiliar: item?.new_apellidos?.toUpperCase() ?? '',
    tipoParentesco: {
      value: item?.new_tipodeparentesco,
      label: item?.[`new_tipodeparentesco${FV}`]?.toUpperCase() ?? '',
    },
    aCargo: {
      value: item?.new_cargadefamilia,
      label: item?.[`new_cargadefamilia${FV}`]?.toUpperCase() ?? '',
    },
    generoHijos: { value: item?.new_sexo, label: item?.[`new_sexo${FV}`] ?? '' },
    fechaNacimiento: item?.new_fechanacimiento ? aFechaApi(item.new_fechanacimiento) || null : null,
    campoRequerido: {
      esObligatorio: aCargoEsSi,
      etiqueta: aCargoEsSi ? 'Requerido obligatorio' : 'Requerido sugerido',
    },
    adjuntos: (id && adjuntosPorFamiliar[id]) || [],
    adjuntoCheck: Boolean(item?.new_adjunto),
  };
};

/** Separa cónyuge e hijos/as. El cónyuge es el primero que aparezca; si no hay, queda el vacío. */
export const separarFamilia = (
  filas: unknown,
  adjuntosPorFamiliar: Record<string, Adjunto[]>,
): { conyuge: Familiar; hijos: Familiar[] } => {
  if (!Array.isArray(filas) || filas.length === 0) return { conyuge: familiarVacio(), hijos: [] };
  const mapeados = filas.map((fila) => mapearFamiliar(fila, adjuntosPorFamiliar));
  const conyuge = mapeados.find((f) => f.tipoParentesco?.value === COD_PARENTESCO_CONYUGE);
  const hijos = mapeados.filter((f) => f.tipoParentesco?.value === COD_PARENTESCO_HIJO);
  return { conyuge: conyuge ? { ...familiarVacio(), ...conyuge } : familiarVacio(), hijos };
};

// ---------------------------------------------------------------------------
// Documentación requerida por familiar
// ---------------------------------------------------------------------------

// El nombre del documento lo escribe el CRM: se compara normalizado (sin tildes, mayúsculas y espacios).
export const normalizarNombreDoc = (nombre: unknown): string =>
  String(nombre ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

// Documentos que se listan para hijos y el orden en que se muestran.
const ORDEN_DOCUMENTOS_HIJOS: Record<string, number> = {
  'CERTIFICADO UNICO DE DISCAPACIDAD': 1,
  'DNI DORSO': 2,
  'DNI FRENTE': 3,
};

const mapearDocumentoFamiliar = (item: Fila): DocumentoFamiliar => ({
  id: item?.new_documentacionporfamiliardeempleadoid,
  nombre: item?.new_name,
  nombreFamiliar: item?.[`_new_familiardeempleado_value${FV}`],
  familiarId: item?._new_familiardeempleado_value,
  cargoDoc: item?.new_adjunto === true ? 'SÍ' : 'NO',
});

const comparar = (a?: string, b?: string): number => (a ?? '').localeCompare(b ?? '');

/** Separa los documentos requeridos de hijos (solo los 3 permitidos) y de cónyuge (todos). */
export const separarDocumentosFamiliares = (
  filas: unknown,
): { hijos: DocumentoFamiliar[]; conyuge: DocumentoFamiliar[] } => {
  const hijos: DocumentoFamiliar[] = [];
  const conyuge: DocumentoFamiliar[] = [];
  if (Array.isArray(filas)) {
    for (const item of filas) {
      const parentesco = item?.['ad.new_tipodeparentesco'];
      if (parentesco === COD_PARENTESCO_HIJO) {
        if (ORDEN_DOCUMENTOS_HIJOS[normalizarNombreDoc(item?.new_name)] !== undefined) {
          hijos.push(mapearDocumentoFamiliar(item));
        }
      } else if (parentesco === COD_PARENTESCO_CONYUGE) {
        conyuge.push(mapearDocumentoFamiliar(item));
      }
    }
  }

  hijos.sort((a, b) => {
    if (a.nombreFamiliar !== b.nombreFamiliar) return comparar(a.nombreFamiliar, b.nombreFamiliar);
    const ordenA = ORDEN_DOCUMENTOS_HIJOS[normalizarNombreDoc(a.nombre)] || 999;
    const ordenB = ORDEN_DOCUMENTOS_HIJOS[normalizarNombreDoc(b.nombre)] || 999;
    return ordenA - ordenB;
  });
  conyuge.sort((a, b) => comparar(a.nombre, b.nombre));

  return { hijos, conyuge };
};
