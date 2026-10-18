// Foto de perfil. Port de Portal-Austral-Dev -> src/context/AuthContext.tsx (actualizarFotoPerfil).
// Mismo orden: subir a Storage, buscar el documento de `usuarios` por `uid`, guardar `photoURL` y actualizar la sesión.
// Textos de aviso: los del portal.
// FOTO DE PORTADA: el portal tiene `actualizarFotoPortada` en el contexto, pero ninguna pantalla leída la usa
// (la cabecera del legajo solo tiene foto de perfil). No se construye hasta que se confirme dónde se usa.
import { buscarUsuarioPorUid, actualizarUsuario } from '../../infrastructure/auth/usuariosFirestore';
import { subirFotoDePerfil } from '../../infrastructure/auth/fotosStorage';
import { useAuthStore } from '../../presentation/stores/authStore';
import { toast } from '../../presentation/utils/toast';

export const actualizarFotoPerfil = async (rutaLocal: string): Promise<void> => {
  const uid = useAuthStore.getState().user?.uid;
  const idToast = toast.loading('Cargando...');
  try {
    if (!uid) {
      toast.dismiss(idToast);
      toast.error('UID de usuario no definido.');
      return;
    }
    const url = await subirFotoDePerfil(uid, rutaLocal);

    const usuario = await buscarUsuarioPorUid(uid);
    if (!usuario) {
      toast.dismiss(idToast);
      toast.error('Usuario no encontrado.');
      return;
    }
    await actualizarUsuario(usuario.ref, { photoURL: url });
    useAuthStore.getState().setUser((previo) => (previo ? { ...previo, photoURL: url } : previo));
    toast.dismiss(idToast);
    toast.success('Tu foto se ha cargado correctamente.');
  } catch {
    toast.dismiss(idToast);
    toast.error('Error al actualizar la foto de perfil');
  }
};
