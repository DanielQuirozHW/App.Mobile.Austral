// Acceso a la colección `usuarios` de Firestore (React Native Firebase, API modular).
// El portal usa DOS formas de documento (verificado en AuthContext.tsx):
//  - Login por email: id automático (lo crea el registro del portal) y campo `uid`; se busca con where('uid','==',uid).
//    La app no registra usuarios (decisión 36): esas cuentas y sus documentos ya existen.
//  - Login Microsoft/SAML: el id del documento ES el uid (setDoc/getDoc/updateDoc).
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';

const COLECCION = 'usuarios';

export interface UsuarioDoc {
  ref: ReturnType<typeof doc>;
  data: Record<string, any>;
}

/** Primer documento cuyo campo `uid` coincide (null si no hay). */
export const buscarUsuarioPorUid = async (uid: string): Promise<UsuarioDoc | null> => {
  const consulta = query(collection(getFirestore(), COLECCION), where('uid', '==', uid));
  const snapshot = await getDocs(consulta);
  if (snapshot.empty) return null;
  const primero = snapshot.docs[0];
  return { ref: primero.ref, data: primero.data() as Record<string, any> };
};

/** Documento cuyo id es el uid (forma usada por el login Microsoft/SAML). */
export const leerUsuarioPorId = async (uid: string): Promise<UsuarioDoc | null> => {
  const ref = doc(getFirestore(), COLECCION, uid);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? { ref, data: snapshot.data() as Record<string, any> } : null;
};

export const referenciaUsuarioPorId = (uid: string) => doc(getFirestore(), COLECCION, uid);

export const actualizarUsuario = async (ref: UsuarioDoc['ref'], datos: Record<string, any>): Promise<void> => {
  await updateDoc(ref, datos);
};

export const crearUsuarioConId = async (uid: string, datos: Record<string, any>): Promise<void> => {
  await setDoc(doc(getFirestore(), COLECCION, uid), datos);
};
