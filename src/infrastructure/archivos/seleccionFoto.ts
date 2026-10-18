// Selección de la foto de perfil (galería o cámara), una sola imagen.
// El portal acepta solo png / jpg / jpeg (UserProfileBanner.tsx) y avisa con el mismo texto.
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';

export const MSG_FORMATO_FOTO = 'El formato de la foto debe ser png/jpg/jpeg';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpg', 'image/jpeg'];

export interface FotoElegida {
  uri: string;
}

/** null si el usuario canceló. Lanza Error con el texto a mostrar si el formato no es válido o el selector falla. */
const resolver = (respuesta: ImagePickerResponse): FotoElegida | null => {
  if (respuesta.didCancel) return null;
  if (respuesta.errorCode) throw new Error(respuesta.errorMessage || respuesta.errorCode);
  const archivo = respuesta.assets?.[0];
  if (!archivo?.uri) return null;
  if (!archivo.type || !TIPOS_PERMITIDOS.includes(archivo.type.toLowerCase())) throw new Error(MSG_FORMATO_FOTO);
  return { uri: archivo.uri };
};

export const elegirFotoDeGaleria = async (): Promise<FotoElegida | null> =>
  resolver(await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 }));

export const elegirFotoConCamara = async (): Promise<FotoElegida | null> =>
  resolver(await launchCamera({ mediaType: 'photo', saveToPhotos: false }));
