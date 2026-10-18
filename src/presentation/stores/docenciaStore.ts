// Datos de Perfil > Docencia.
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type {
  Asesoramiento,
  CategorizacionHistorica,
  CategorizacionVigente,
  DocenciaExterna,
  DocenciaUA,
  Nombramiento,
  Promocion,
} from '../../domain/perfil/docencia';

interface DatosDocencia {
  categorizacionVigente: CategorizacionVigente[];
  categorizacionHistorica: CategorizacionHistorica[];
  nombramientosVigentes: Nombramiento[];
  nombramientosHistoricos: Nombramiento[];
  promociones: Promocion[];
  docenciasUA: DocenciaUA[];
  docenciasExternas: DocenciaExterna[];
  asesoramientos: Asesoramiento[];
  unidades: OpcionSelect[];
  /** Catálogo completo de grado académico (lo usa Docencia externa). */
  gradosAcademicos: OpcionSelect[];
  modalidades: OpcionSelect[];
  instituciones: OpcionSelect[];
}

interface DocenciaState extends DatosDocencia {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosDocencia>) => void;
  fijarEstado: (parcial: Partial<Pick<DocenciaState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

const vacio: DatosDocencia = {
  categorizacionVigente: [],
  categorizacionHistorica: [],
  nombramientosVigentes: [],
  nombramientosHistoricos: [],
  promociones: [],
  docenciasUA: [],
  docenciasExternas: [],
  asesoramientos: [],
  unidades: [],
  gradosAcademicos: [],
  modalidades: [],
  instituciones: [],
};

export const useDocenciaStore = create<DocenciaState>()((set) => ({
  ...vacio,
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () => set({ ...vacio, cargando: false, cargado: false, error: false }),
}));
