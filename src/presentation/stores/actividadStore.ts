// Datos de Perfil > Investigación > Actividad I+D (financiamientos y formación de RRHH).
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type { DireccionBecario, Tesista } from '../../domain/perfil/formacionRrhh';
import type { FinanciamientoExterno, FinanciamientoPropio } from '../../domain/perfil/financiamientos';

interface DatosActividad {
  propios: FinanciamientoPropio[];
  externos: FinanciamientoExterno[];
  tesistas: Tesista[];
  direcciones: DireccionBecario[];
  /** Colaboradores activos: opciones de los selects de director, codirector e investigador / becario. */
  colaboradores: OpcionSelect[];
}

interface ActividadState extends DatosActividad {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosActividad>) => void;
  fijarEstado: (parcial: Partial<Pick<ActividadState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

const vacio: DatosActividad = {
  propios: [],
  externos: [],
  tesistas: [],
  direcciones: [],
  colaboradores: [],
};

export const useActividadStore = create<ActividadState>()((set) => ({
  ...vacio,
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () => set({ ...vacio, cargando: false, cargado: false, error: false }),
}));
