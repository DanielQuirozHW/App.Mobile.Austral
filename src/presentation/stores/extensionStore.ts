// Datos de Perfil > Extensión (actividades de extensión y catálogos de entidades académicas).
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type { ActividadExtension } from '../../domain/perfil/extension';

interface DatosExtension {
  actividades: ActividadExtension[];
  unidades: OpcionSelect[];
  /** Opciones de "Otra entidad académica". */
  otrasEntidades: OpcionSelect[];
}

interface ExtensionState extends DatosExtension {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosExtension>) => void;
  fijarEstado: (parcial: Partial<Pick<ExtensionState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

export const useExtensionStore = create<ExtensionState>()((set) => ({
  actividades: [],
  unidades: [],
  otrasEntidades: [],
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () =>
    set({ actividades: [], unidades: [], otrasEntidades: [], cargando: false, cargado: false, error: false }),
}));
