// Datos de Perfil > Trayectoria profesional. Port de Portal-Austral-Dev -> src/stores/useTrayectoriaStore.ts.
import { create } from 'zustand';
import type { DatosFormacionEmpleado } from '../../domain/perfil/formacion';
import type {
  ComiteProfesional,
  ConsultoriaExterna,
  ExperienciaFuera,
  LicenciaProfesional,
  Reconocimiento,
} from '../../domain/perfil/trayectoria';

interface DatosTrayectoria {
  empleado: DatosFormacionEmpleado | null;
  experiencias: ExperienciaFuera[];
  consultorias: ConsultoriaExterna[];
  comites: ComiteProfesional[];
  licencias: LicenciaProfesional[];
  reconocimientos: Reconocimiento[];
}

interface TrayectoriaState extends DatosTrayectoria {
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura de la última carga falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  fijar: (parcial: Partial<DatosTrayectoria>) => void;
  fijarEstado: (parcial: Partial<Pick<TrayectoriaState, 'cargando' | 'cargado' | 'error'>>) => void;
  reiniciar: () => void;
}

const vacio = (): DatosTrayectoria => ({
  empleado: null,
  experiencias: [],
  consultorias: [],
  comites: [],
  licencias: [],
  reconocimientos: [],
});

export const useTrayectoriaStore = create<TrayectoriaState>()((set) => ({
  ...vacio(),
  cargando: false,
  cargado: false,
  error: false,
  fijar: (parcial) => set(parcial),
  fijarEstado: (parcial) => set(parcial),
  reiniciar: () => set({ ...vacio(), cargando: false, cargado: false, error: false }),
}));
