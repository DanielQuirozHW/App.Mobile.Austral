// Documentación del legajo (Legajo > Documentación). Reglas puras, sin red ni UI.
// Port de Portal-Austral-Dev:
//   - src/hooks/useGetDocumentosEmpleado.ts (mapeo de la fila, filtros y fecha de última carga)
//   - src/hooks/useGetaAdjuntosXEmpleado.ts (mapeo de los adjuntos)
//   - src/columns/columnsDocumentosLegajo.tsx ("Documento importado" = new_adjunto o carga reciente)
import { format, isValid, parse } from 'date-fns';
import { aFechaVisible, utcALocalVisible } from '../legajo/fechas';
import { esRelacionDependencia } from '../legajo/tipoContratacion';
import type { Adjunto, Opcion } from '../legajo/tipos';

type Fila = Record<string, any>;

// El CRM devuelve el texto de los OptionSet y lookups con esta anotación.
const FV = '@OData.Community.Display.V1.FormattedValue';

/** Documento requerido del empleado (fila de new_documentacionporempleado). */
export interface DocumentoEmpleado {
  /** new_documentacionporempleadoid: destino de la carga de archivos. */
  id: string;
  nombre: string;
  /** Texto del lookup new_documento: es la columna "Título" del portal. */
  titulo: string;
  /** new_documento (id en new_documentacion): con él se piden los adjuntos ya cargados. */
  documentoId: string;
  /** new_adjunto: el CRM ya registró al menos un archivo. */
  cargoDoc: boolean;
  /** "dd/MM/yyyy" de la última carga, o null. */
  fechaDeCarga: string | null;
}

/** Fecha de hoy como la muestra el portal tras una carga (dd/MM/yyyy). */
export const hoyVisible = (): string => format(new Date(), 'dd/MM/yyyy');

// Texto formateado del CRM ("3/11/25 16:34"): se descarta la hora y se prueban los mismos formatos que el portal.
const fechaDeTextoFormateado = (formateado: string): string => {
  const parteFecha = formateado.split(' ')[0];
  for (const patron of ['d/M/yy', 'd/M/yyyy']) {
    const fecha = parse(parteFecha, patron, new Date());
    if (isValid(fecha)) return format(fecha, 'dd/MM/yyyy');
  }
  return parteFecha;
};

const fechaDeCargaDeFila = (fila: Fila): string | null => {
  // Se prefiere el valor ISO si está disponible.
  if (fila?.new_fechadecarga) {
    const visible = aFechaVisible(fila.new_fechadecarga);
    if (visible) return visible;
  }
  const formateado = fila?.[`new_fechadecarga${FV}`];
  if (!formateado) return null;
  return fechaDeTextoFormateado(String(formateado));
};

// Filtros del portal (useGetDocumentosEmpleado): se omiten los de psicotécnico / examen preocupacional y el CUD
// para quien no es relación de dependencia. Se compara en minúsculas y con los textos tal cual los usa el portal.
const TEXTOS_EXCLUIDOS = ['psicotécnico', 'exámen preocupacional'];

const contieneAlguno = (texto: string, partes: string[]): boolean => partes.some((parte) => texto.includes(parte));

const esDocumentoExcluido = (nombre: string, titulo: string, relacionDependencia: boolean): boolean => {
  const nombreMin = nombre.toLowerCase();
  const tituloMin = titulo.toLowerCase();
  if (contieneAlguno(nombreMin, TEXTOS_EXCLUIDOS) || contieneAlguno(tituloMin, TEXTOS_EXCLUIDOS)) return true;
  const esCUD = tituloMin.includes('certificado único de discapacidad') || tituloMin.includes('cud');
  return esCUD && !relacionDependencia;
};

/** Filas de new_documentacionporempleado a los documentos que se listan (con los filtros del portal). */
export const mapearDocumentosEmpleado = (filas: unknown): DocumentoEmpleado[] => {
  if (!Array.isArray(filas)) return [];
  const documentos: DocumentoEmpleado[] = [];
  for (const fila of filas as Fila[]) {
    const relacionDependencia = esRelacionDependencia({
      value: fila?.['al.new_tipodecontratacion'],
      label: fila?.[`al.new_tipodecontratacion${FV}`],
    } as Partial<Opcion>);
    const nombre = String(fila?.new_name ?? '');
    const titulo = String(fila?.[`_new_documento_value${FV}`] ?? '');
    if (esDocumentoExcluido(nombre, titulo, relacionDependencia)) continue;
    documentos.push({
      id: fila?.new_documentacionporempleadoid,
      nombre,
      titulo,
      documentoId: fila?._new_documento_value,
      cargoDoc: fila?.new_adjunto === true,
      fechaDeCarga: fechaDeCargaDeFila(fila),
    });
  }
  return documentos;
};

/** Filas de annotation (alias av) del documento a Adjunto. */
export const mapearAdjuntosDeEmpleado = (filas: unknown): Adjunto[] => {
  if (!Array.isArray(filas)) return [];
  return (filas as Fila[]).map((fila) => ({
    id: fila?.['av.annotationid'],
    filename: fila?.['av.filename'] ?? 'Documento',
    mimetype: fila?.['av.mimetype'] ?? 'application/octet-stream',
    createdon: utcALocalVisible(fila?.['av.createdon']),
    documentbody: fila?.['av.documentbody'],
  }));
};
