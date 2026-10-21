// Ejecuta una escritura del PTA mostrando el toast de "procesando" y el resultado. Devuelve true si salió bien.
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { toast } from '../../utils/toast';

interface Textos {
  procesando: string;
  exito: string;
  error: string;
}

export const ejecutarConToast = async (accion: () => Promise<void>, textos: Textos): Promise<boolean> => {
  const idToast = toast.loading(textos.procesando);
  try {
    await accion();
    toast.dismiss(idToast);
    toast.success(textos.exito);
    return true;
  } catch (error) {
    toast.dismiss(idToast);
    toast.error(mensajeDeErrorApi(error, textos.error));
    return false;
  }
};
