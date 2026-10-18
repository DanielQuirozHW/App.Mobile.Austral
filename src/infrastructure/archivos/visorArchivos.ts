// Abre un adjunto que llegó en base64: lo escribe en la caché de la app y lo muestra con el visor del sistema.
import ReactNativeBlobUtil from 'react-native-blob-util';
import { viewDocument } from '@react-native-documents/viewer';
import { limpiarBase64, mimetypePorExtension } from '../../domain/legajo/archivos';
import type { Adjunto } from '../../domain/legajo/tipos';

export const MSG_ADJUNTO_SIN_CONTENIDO = 'El documento no tiene contenido para descargar.';
export const MSG_NO_SE_PUDO_ABRIR = 'No se pudo abrir el documento. Descárguelo para verlo en su equipo.';

// Evita caracteres que el sistema de archivos no acepta.
const nombreSeguro = (nombre: string): string => nombre.replace(/[^\w.\- ()]/g, '_');

/** Lanza Error con el mensaje para el usuario si el adjunto no tiene contenido o no se puede abrir. */
export const abrirAdjunto = async (adjunto: Adjunto): Promise<void> => {
  const base64 = limpiarBase64(adjunto.documentbody);
  if (!base64) throw new Error(MSG_ADJUNTO_SIN_CONTENIDO);

  const nombre = nombreSeguro(adjunto.filename || 'documento');
  const ruta = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${Date.now()}-${nombre}`;
  try {
    await ReactNativeBlobUtil.fs.writeFile(ruta, base64, 'base64');
    await viewDocument({
      uri: `file://${ruta}`,
      mimeType: adjunto.mimetype || mimetypePorExtension(adjunto.filename),
      grantPermissions: 'read',
    });
  } catch {
    throw new Error(MSG_NO_SE_PUDO_ABRIR);
  }
};
