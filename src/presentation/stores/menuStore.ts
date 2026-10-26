// Estado del menú lateral (abierto / cerrado) y la ruta activa al abrirlo.
import { create } from 'zustand';
import { navigationRef } from '../navigation/navigationRef';

interface MenuState {
  abierto: boolean;
  /** Nombre de la ruta visible al abrir el menú, para resaltar su entrada. */
  rutaActual: string | null;
  abrir: () => void;
  cerrar: () => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  abierto: false,
  rutaActual: null,
  abrir: () => set({ abierto: true, rutaActual: navigationRef.getCurrentRoute()?.name ?? null }),
  cerrar: () => set({ abierto: false }),
}));
