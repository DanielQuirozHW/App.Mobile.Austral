// API imperativa de avisos, con la forma de react-hot-toast que usa el portal:
//   const id = toast.loading('Guardando...');  toast.dismiss(id);  toast.success('Listo');  toast.error('Falló', 4000);
import { useToastStore } from '../stores/toastStore';
import type { TipoToast } from '../stores/toastStore';

let contador = 0;
const temporizadores = new Map<string, ReturnType<typeof setTimeout>>();

const quitar = (id: string): void => {
  const temporizador = temporizadores.get(id);
  if (temporizador) clearTimeout(temporizador);
  temporizadores.delete(id);
  useToastStore.getState().quitar(id);
};

const agregar = (tipo: TipoToast, mensaje: string, duracionMs?: number): string => {
  contador += 1;
  const id = `toast-${contador}`;
  useToastStore.getState().agregar({ id, tipo, mensaje });
  if (duracionMs) temporizadores.set(id, setTimeout(() => quitar(id), duracionMs));
  return id;
};

export const toast = {
  /** Queda hasta que se lo descarte con dismiss. */
  loading: (mensaje: string): string => agregar('cargando', mensaje),
  success: (mensaje: string, duracionMs = 3000): string => agregar('exito', mensaje, duracionMs),
  error: (mensaje: string, duracionMs = 4000): string => agregar('error', mensaje, duracionMs),
  /** Sin id descarta todos. */
  dismiss: (id?: string): void => {
    if (id) {
      quitar(id);
      return;
    }
    useToastStore
      .getState()
      .items.map((i) => i.id)
      .forEach(quitar);
  },
};
