// Datos de Perfil > Investigación > Afiliaciones.
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type {
  CategorizacionExternaHistorica,
  CategorizacionPrinuarHistorica,
  ExternaVigente,
  JuradoTribunal,
  Pertenencia,
  PerfilInvestigacion,
  PrinuarVigente,
} from '../../domain/perfil/afiliaciones';

interface DatosAfiliaciones {
  perfil: PerfilInvestigacion | null;
  externa: ExternaVigente | null;
  prinuar: PrinuarVigente | null;
  externasHistoricas: CategorizacionExternaHistorica[];
  prinuarHistoricas: CategorizacionPrinuarHistorica[];
  pertenencias: Pertenencia[];
  jurados: JuradoTribunal[];
  /** Catálogo de pertenencias de la UA (new_unidadacademicadepertenencia). */
  catalogoPertenencias: OpcionSelect[];
  /** Unidades organizativas de tipo UA (lugares de trabajo cuando es la Universidad Austral). */
  unidades: OpcionSelect[];
  /** Instituciones otorgantes (lugares de trabajo cuando NO es la Universidad Austral). */
  instituciones: OpcionSelect[];
  paises: OpcionSelect[];
}

interface AfiliacionesState extends DatosAfiliaciones {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosAfiliaciones>) => void;
  fijarEstado: (parcial: Partial<Pick<AfiliacionesState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

const vacio: DatosAfiliaciones = {
  perfil: null,
  externa: null,
  prinuar: null,
  externasHistoricas: [],
  prinuarHistoricas: [],
  pertenencias: [],
  jurados: [],
  catalogoPertenencias: [],
  unidades: [],
  instituciones: [],
  paises: [],
};

export const useAfiliacionesStore = create<AfiliacionesState>()((set) => ({
  ...vacio,
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () => set({ ...vacio, cargando: false, cargado: false, error: false }),
}));
