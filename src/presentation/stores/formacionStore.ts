// Datos de Perfil > Formación. Port de Portal-Austral-Dev -> src/stores/useFormacionStore.ts y
// useAutocompletadosStore.ts (instituciones otorgantes, agrupadores, áreas de interés y actuación).
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type {
  Actuacion,
  AreaExpertise,
  AreaInteres,
  Certificacion,
  DatosFormacionEmpleado,
  Especialidad,
  Idioma,
  Titulo,
} from '../../domain/perfil/formacion';

interface DatosFormacion {
  empleado: DatosFormacionEmpleado | null;
  pregrado: Titulo[];
  posgrado: Titulo[];
  posdoctoral: Titulo[];
  especialidades: Especialidad[];
  certificaciones: Certificacion[];
  idiomas: Idioma[];
  areas: AreaExpertise[];
  instituciones: OpcionSelect[];
  agrupadores: OpcionSelect[];
  areasInteres: AreaInteres[];
  actuaciones: Actuacion[];
}

interface FormacionState extends DatosFormacion {
  /** true mientras corre la carga inicial de la pantalla. */
  cargando: boolean;
  /** true cuando terminó al menos una carga inicial (con o sin error). */
  cargado: boolean;
  /** true si alguna lectura de la última carga falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosFormacion>) => void;
  fijarEstado: (parcial: Partial<Pick<FormacionState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

const vacio = (): DatosFormacion => ({
  empleado: null,
  pregrado: [],
  posgrado: [],
  posdoctoral: [],
  especialidades: [],
  certificaciones: [],
  idiomas: [],
  areas: [],
  instituciones: [],
  agrupadores: [],
  areasInteres: [],
  actuaciones: [],
});

export const useFormacionStore = create<FormacionState>()((set) => ({
  ...vacio(),
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () => set({ ...vacio(), cargando: false, cargado: false, error: false }),
}));
