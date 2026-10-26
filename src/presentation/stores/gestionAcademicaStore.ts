// Datos de Perfil > Gestión académica.
import { create } from 'zustand';
import type { OpcionSelect } from '../../domain/legajo/tipos';
import type { CargoEncargoExterno, CargoGestion, Encargo } from '../../domain/perfil/gestionAcademica';

interface DatosGestion {
  cargos: CargoGestion[];
  encargos: Encargo[];
  externos: CargoEncargoExterno[];
  unidades: OpcionSelect[];
  /** Opciones de "Otra entidad académica". */
  otrasEntidades: OpcionSelect[];
  paises: OpcionSelect[];
}

interface GestionState extends DatosGestion {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosGestion>) => void;
  fijarEstado: (parcial: Partial<Pick<GestionState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

export const useGestionAcademicaStore = create<GestionState>()((set) => ({
  cargos: [],
  encargos: [],
  externos: [],
  unidades: [],
  otrasEntidades: [],
  paises: [],
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () =>
    set({
      cargos: [],
      encargos: [],
      externos: [],
      unidades: [],
      otrasEntidades: [],
      paises: [],
      cargando: false,
      cargado: false,
      error: false,
    }),
}));
