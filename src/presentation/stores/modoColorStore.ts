// Preferencia de modo de color de la app: seguir al sistema, claro u oscuro. Se guarda en el almacenamiento local.
// El portal tiene un selector de tema (settingsContext); la app lo resuelve con este store y la pantalla Ajustes.
// Por defecto sigue al sistema (decisión 27).
import { create } from 'zustand';
import { CLAVE_MODO_COLOR, guardarTexto, leerTexto } from '../../infrastructure/storage/almacenamiento';

export type PreferenciaModoColor = 'sistema' | 'claro' | 'oscuro';

const VALORES: string[] = ['sistema', 'claro', 'oscuro'];

interface ModoColorState {
  preferencia: PreferenciaModoColor;
  /** true cuando ya se pidió la lectura del almacenamiento (evita leerlo dos veces). */
  cargada: boolean;
  cargar: () => Promise<void>;
  elegir: (preferencia: PreferenciaModoColor) => Promise<void>;
}

export const useModoColorStore = create<ModoColorState>()((set, get) => ({
  preferencia: 'sistema',
  cargada: false,

  cargar: async () => {
    if (get().cargada) return;
    set({ cargada: true });
    const guardada = await leerTexto(CLAVE_MODO_COLOR);
    if (guardada && VALORES.includes(guardada)) {
      set({ preferencia: guardada as PreferenciaModoColor });
    }
  },

  elegir: async (preferencia) => {
    set({ preferencia });
    await guardarTexto(CLAVE_MODO_COLOR, preferencia);
  },
}));
