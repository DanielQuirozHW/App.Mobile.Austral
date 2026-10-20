// Datos de Perfil > Investigación > Actividad I+D > Proyectos de investigación.
// Los participantes y los resultados vinculados de cada proyecto se leen al abrir su modal y no se guardan acá.
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type {
  ActuacionDeArea,
  AreaDeInteres,
  Colaborador,
  Proyecto,
  UnidadOrganizativa,
} from '../../domain/perfil/proyectos';

interface DatosProyectos {
  proyectos: Proyecto[];
  /** Empleados activos con su nivel (el rol Director / Codirector / Investigador pide Doctorado). */
  colaboradores: Colaborador[];
  unidades: UnidadOrganizativa[];
  agrupadores: OpcionSelect[];
  areas: AreaDeInteres[];
  actuaciones: ActuacionDeArea[];
}

interface ProyectosState extends DatosProyectos {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosProyectos>) => void;
  fijarEstado: (parcial: Partial<Pick<ProyectosState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

const vacio: DatosProyectos = {
  proyectos: [],
  colaboradores: [],
  unidades: [],
  agrupadores: [],
  areas: [],
  actuaciones: [],
};

export const useProyectosStore = create<ProyectosState>()((set) => ({
  ...vacio,
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () => set({ ...vacio, cargando: false, cargado: false, error: false }),
}));
