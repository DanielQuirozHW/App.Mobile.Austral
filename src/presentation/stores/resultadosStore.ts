// Datos de Perfil > Investigación > Resultados / Impacto I+D (producción científica, jornadas y estancias).
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type { Estancia, Jornada } from '../../domain/perfil/resultados';
import type { Produccion } from '../../domain/perfil/produccionCientifica';

interface DatosResultados {
  producciones: Produccion[];
  jornadas: Jornada[];
  estancias: Estancia[];
  /** Colaboradores activos: opciones del select de autores de la Universidad. */
  colaboradores: OpcionSelect[];
  paises: OpcionSelect[];
}

interface ResultadosState extends DatosResultados {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosResultados>) => void;
  fijarEstado: (parcial: Partial<Pick<ResultadosState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

const vacio: DatosResultados = {
  producciones: [],
  jornadas: [],
  estancias: [],
  colaboradores: [],
  paises: [],
};

export const useResultadosStore = create<ResultadosState>()((set) => ({
  ...vacio,
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () => set({ ...vacio, cargando: false, cargado: false, error: false }),
}));
