// Estado de los avisos (toasts). Reemplaza a react-hot-toast del portal.
import { create } from 'zustand';

export type TipoToast = 'cargando' | 'exito' | 'error';

export interface ItemToast {
  id: string;
  tipo: TipoToast;
  mensaje: string;
}

interface ToastState {
  items: ItemToast[];
  /**
   * Cantidad de modales abiertos. Un Modal nativo se dibuja por encima de todo, así que mientras haya uno el host
   * de la raíz se oculta y cada modal dibuja su propio host (si no, los avisos quedarían detrás).
   */
  modalesAbiertos: number;
  agregar: (item: ItemToast) => void;
  quitar: (id: string) => void;
  modalAbierto: () => void;
  modalCerrado: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  items: [],
  modalesAbiertos: 0,
  agregar: (item) => set((estado) => ({ items: [...estado.items, item] })),
  quitar: (id) => set((estado) => ({ items: estado.items.filter((i) => i.id !== id) })),
  modalAbierto: () => set((estado) => ({ modalesAbiertos: estado.modalesAbiertos + 1 })),
  modalCerrado: () => set((estado) => ({ modalesAbiertos: Math.max(0, estado.modalesAbiertos - 1) })),
}));
