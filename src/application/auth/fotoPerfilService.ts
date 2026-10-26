// Foto de perfil y foto de portada. Port de Portal-Austral-Dev -> src/context/AuthContext.tsx
// (actualizarFotoPerfil y actualizarFotoPortada).
// Mismo orden: subir a Storage, buscar el documento de `usuarios` por `uid`, guardar el campo y actualizar la sesión.
// Campos: `photoURL` (perfil) y `photoPORTADA` (portada). Textos de aviso: los del portal.
// NOTA: el portal define `actualizarFotoPortada` pero su cabecera (PerfilHeader) hoy no la usa. La app la ofrece
// porque Daniel lo pidió (decisión 88).
import { buscarUsuarioPorUid, actualizarUsuario } from '../../infrastructure/auth/usuariosFirestore';
import { subirFotoDePerfil, subirFotoDePortada } from '../../infrastructure/auth/fotosStorage';
import { useAuthStore } from '../../presentation/stores/authStore';
import { toast } from '../../presentation/utils/toast';

interface ConfigFoto {
  campo: 'photoURL' | 'photoPORTADA';
  subir: (uid: string, rutaLocal: string) => Promise<string>;
  textoError: string;
}

const actualizarFoto = async (rutaLocal: string, config: ConfigFoto): Promise<void> => {
  const uid = useAuthStore.getState().user?.uid;
  const idToast = toast.loading('Cargando...');
  try {
    if (!uid) {
      toast.dismiss(idToast);
      toast.error('UID de usuario no definido.');
      return;
    }
    const url = await config.subir(uid, rutaLocal);

    const usuario = await buscarUsuarioPorUid(uid);
    if (!usuario) {
      toast.dismiss(idToast);
      toast.error('Usuario no encontrado.');
      return;
    }
    await actualizarUsuario(usuario.ref, { [config.campo]: url });
    useAuthStore.getState().setUser((previo) => (previo ? { ...previo, [config.campo]: url } : previo));
    toast.dismiss(idToast);
    toast.success('Tu foto se ha cargado correctamente.');
  } catch {
    toast.dismiss(idToast);
    toast.error(config.textoError);
  }
};

export const actualizarFotoPerfil = (rutaLocal: string): Promise<void> =>
  actualizarFoto(rutaLocal, {
    campo: 'photoURL',
    subir: subirFotoDePerfil,
    textoError: 'Error al actualizar la foto de perfil',
  });

export const actualizarFotoPortada = (rutaLocal: string): Promise<void> =>
  actualizarFoto(rutaLocal, {
    campo: 'photoPORTADA',
    subir: subirFotoDePortada,
    textoError: 'Error al actualizar la foto de portada',
  });
