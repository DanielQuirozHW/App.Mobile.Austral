// Selección de archivos para cargar (documentos, galería y cámara).
// Cada función devuelve los archivos válidos y los mensajes de los descartados; no muestra nada por sí misma.
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { mimetypePorExtension, validarArchivoParaCarga } from '../../domain/legajo/archivos';
import type { ArchivoParaCarga } from '../legajo/familiaresApi';

export interface ArchivoElegido extends ArchivoParaCarga {
  /** Peso en bytes si el sistema lo informa. */
  tamanio?: number;
}

export interface ResultadoSeleccion {
  archivos: ArchivoElegido[];
  /** Un mensaje por archivo descartado (tipo no permitido o demasiado pesado). */
  errores: string[];
}

const VACIO: ResultadoSeleccion = { archivos: [], errores: [] };

const clasificar = (candidatos: ArchivoElegido[]): ResultadoSeleccion => {
  const archivos: ArchivoElegido[] = [];
  const errores: string[] = [];
  candidatos.forEach((archivo) => {
    const error = validarArchivoParaCarga(archivo.name, archivo.tamanio);
    if (error) errores.push(`${archivo.name}: ${error}`);
    else archivos.push(archivo);
  });
  return { archivos, errores };
};

/** Archivos del dispositivo: PDF, imágenes, DOC y DOCX, con selección múltiple. */
export const elegirDocumentos = async (): Promise<ResultadoSeleccion> => {
  try {
    const resultado = await pick({
      type: [types.pdf, types.images, types.doc, types.docx],
      allowMultiSelection: true,
    });
    return clasificar(
      resultado.map((r) => {
        const name = r.name ?? 'archivo';
        return { uri: r.uri, name, type: r.type ?? mimetypePorExtension(name), tamanio: r.size ?? undefined };
      }),
    );
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return VACIO;
    throw error;
  }
};

const desdeImagePicker = (respuesta: ImagePickerResponse): ResultadoSeleccion => {
  if (respuesta.didCancel) return VACIO;
  if (respuesta.errorCode) throw new Error(respuesta.errorMessage || respuesta.errorCode);
  return clasificar(
    (respuesta.assets ?? [])
      .filter((a) => Boolean(a.uri))
      .map((a) => {
        const name = a.fileName ?? `foto-${Date.now()}.jpg`;
        return { uri: a.uri as string, name, type: a.type ?? mimetypePorExtension(name), tamanio: a.fileSize };
      }),
  );
};

/** Fotos de la galería, con selección múltiple. */
export const elegirDeGaleria = async (): Promise<ResultadoSeleccion> =>
  desdeImagePicker(await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 }));

/** Foto nueva con la cámara. */
export const elegirDeCamara = async (): Promise<ResultadoSeleccion> =>
  desdeImagePicker(await launchCamera({ mediaType: 'photo', saveToPhotos: false }));
