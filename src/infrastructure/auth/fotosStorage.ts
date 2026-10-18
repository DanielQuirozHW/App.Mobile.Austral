// Fotos del usuario en Firebase Storage (React Native Firebase, API modular).
// Rutas del portal (AuthContext.tsx -> actualizarFotoPerfil): `${uid}/foto perfil`  (con espacio).
// A VERIFICAR: nombres exportados por @react-native-firebase/storage 26 (getStorage, ref, putFile, getDownloadURL).
import { getDownloadURL, getStorage, putFile, ref } from '@react-native-firebase/storage';

/** Sube el archivo local a `${uid}/foto perfil` (reemplaza el anterior) y devuelve la URL de descarga. */
export const subirFotoDePerfil = async (uid: string, rutaLocal: string): Promise<string> => {
  const referencia = ref(getStorage(), `${uid}/foto perfil`);
  await putFile(referencia, rutaLocal);
  return getDownloadURL(referencia);
};
