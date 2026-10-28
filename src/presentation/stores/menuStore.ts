// Estado del menú lateral (abierto / cerrado) y la pantalla activa al abrirlo.
import { create } from 'zustand';
import { navigationRef } from '../navigation/navigationRef';

interface MenuState {
  abierto: boolean;
  /** Nombre de la ruta visible al abrir el menú, para resaltar su entrada. */
  rutaActual: string | null;
  /** Parámetros de esa ruta (pestaña de Docencia, id de "En construcción"...), para resaltar la entrada exacta. */
  paramsActual: Record<string, unknown> | null;
  abrir: () => void;
  cerrar: () => void;
}

export const useMenuStore = create<MenuState>()((set) => ({
  abierto: false,
  rutaActual: null,
  paramsActual: null,
  abrir: () => {
    const ruta = navigationRef.getCurrentRoute();
    set({
      abierto: true,
      rutaActual: ruta?.name ?? null,
      paramsActual: (ruta?.params as Record<string, unknown> | undefined) ?? null,
    });
  },
  cerrar: () => set({ abierto: false }),
}));
