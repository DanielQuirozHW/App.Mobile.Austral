// Legajo del empleado. Port de Portal-Austral-Dev -> src/stores/useLegajoStore.ts (miLegajo) + src/hooks/useMiLegajo.ts.
import { create } from 'zustand';
import { mapearLegajo } from '../../domain/legajo/mapeo';
import type { MiLegajo } from '../../domain/legajo/tipos';
import { leerLegajo } from '../../infrastructure/legajo/legajoApi';

interface LegajoState {
  /** Legajo mapeado. null si todavía no se cargó o si el empleado no tiene fila. */
  legajo: MiLegajo | null;
  /** true mientras corre una lectura. */
  cargando: boolean;
  /** true cuando terminó al menos una lectura (con o sin error). */
  cargado: boolean;
  /** true si la última lectura falló. Un error NO pisa el legajo que ya se tenía. */
  error: boolean;
  cargar: (empleadoId: string) => Promise<void>;
  reiniciar: () => void;
}

export const useLegajoStore = create<LegajoState>()((set) => ({
  legajo: null,
  cargando: false,
  cargado: false,
  error: false,

  cargar: async (empleadoId) => {
    set({ cargando: true });
    try {
      const filas = await leerLegajo(empleadoId);
      set({
        legajo: filas.length > 0 ? mapearLegajo(filas[0]) : null,
        cargando: false,
        cargado: true,
        error: false,
      });
    } catch {
      set({ cargando: false, cargado: true, error: true });
    }
  },

  reiniciar: () => set({ legajo: null, cargando: false, cargado: false, error: false }),
}));
