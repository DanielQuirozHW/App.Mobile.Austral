// Utilidades para los adjuntos que llegan del CRM en base64. Port de
// Portal-Austral-Dev -> src/@core/utils/archivos.ts, sin las partes que dependen del navegador
// (Blob, <a download>): en la app los archivos se escriben a disco al abrirlos.

const EXTENSIONES_IMAGEN = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

/** Tipos que acepta el portal al cargar: JPG, JPEG, PNG, PDF, DOC y DOCX. */
export const MIMETYPES_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const EXTENSIONES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];

/** Máximo por archivo que informa el portal: 15 MB. */
export const TAMANIO_MAXIMO_BYTES = 15 * 1024 * 1024;

export const obtenerExtension = (filename?: string): string =>
  (filename?.split('.').pop() ?? '').toLowerCase();

export const esPdf = (mimetype?: string, filename?: string): boolean =>
  (mimetype ?? '').toLowerCase().includes('pdf') || obtenerExtension(filename) === 'pdf';

export const esImagen = (mimetype?: string, filename?: string): boolean =>
  (mimetype ?? '').toLowerCase().startsWith('image/') || EXTENSIONES_IMAGEN.includes(obtenerExtension(filename));

/** Solo PDF e imágenes se pueden mostrar dentro de la app; el resto se abre con otra app. */
export const esPrevisualizable = (mimetype?: string, filename?: string): boolean =>
  esPdf(mimetype, filename) || esImagen(mimetype, filename);

/** Etiqueta corta del formato (PDF, DOCX, JPG…). */
export const etiquetaTipo = (mimetype?: string, filename?: string): string => {
  const extension = obtenerExtension(filename);
  if (extension) return extension.toUpperCase();
  if (esPdf(mimetype)) return 'PDF';
  if (esImagen(mimetype)) return 'Imagen';
  return 'Archivo';
};

/** Peso legible. Si no viene `bytes` se estima a partir del base64. */
export const formatearPeso = (bytes?: number, base64?: string): string | null => {
  const tamanio = bytes && bytes > 0 ? bytes : base64 ? Math.round((base64.length * 3) / 4) : 0;
  if (!tamanio) return null;
  if (tamanio < 1024) return `${tamanio} B`;
  if (tamanio < 1024 * 1024) return `${(tamanio / 1024).toFixed(1)} KB`;
  return `${(tamanio / (1024 * 1024)).toFixed(1)} MB`;
};

/** Base64 limpio: sin prefijo data:, sin espacios y con el alfabeto estándar (el CRM a veces manda url-safe). */
export const limpiarBase64 = (base64?: string): string =>
  (base64 ?? '')
    .replace(/^data:.*;base64,/, '')
    .replace(/[\r\n\s]/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');

/** Valida un archivo elegido antes de cargarlo. Devuelve el mensaje de error o null si está bien. */
export const validarArchivoParaCarga = (nombre: string, bytes?: number | null): string | null => {
  if (!EXTENSIONES_PERMITIDAS.includes(obtenerExtension(nombre))) {
    return 'Tipo de archivo no permitido. Se aceptan JPG, JPEG, PNG, PDF, DOC y DOCX.';
  }
  if (bytes != null && bytes > TAMANIO_MAXIMO_BYTES) {
    return 'El tamaño máximo permitido por archivo es de 15 MB.';
  }
  return null;
};
