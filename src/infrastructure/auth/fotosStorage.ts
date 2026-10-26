// Fotos del usuario en Firebase Storage (React Native Firebase, API modular).
// Rutas del portal (AuthContext.tsx): `${uid}/foto perfil` y `${uid}/foto portada` (con espacio).
// A VERIFICAR: nombres exportados por @react-native-firebase/storage 26 (getStorage, ref, putFile, getDownloadURL).
import { getDownloadURL, getStorage, putFile, ref } from '@react-native-firebase/storage';

const subirFoto = async (rutaStorage: string, rutaLocal: string): Promise<string> => {
  const referencia = ref(getStorage(), rutaStorage);
  await putFile(referencia, rutaLocal);
  return getDownloadURL(referencia);
};

/** Sube el archivo local a `${uid}/foto perfil` (reemplaza el anterior) y devuelve la URL de descarga. */
export const subirFotoDePerfil = (uid: string, rutaLocal: string): Promise<string> =>
  subirFoto(`${uid}/foto perfil`, rutaLocal);

/** Sube el archivo local a `${uid}/foto portada` (reemplaza el anterior) y devuelve la URL de descarga. */
export const subirFotoDePortada = (uid: string, rutaLocal: string): Promise<string> =>
  subirFoto(`${uid}/foto portada`, rutaLocal);
