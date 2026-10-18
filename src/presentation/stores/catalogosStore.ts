// Catálogos de los selects (países, provincias y localidades). Port de
// Portal-Austral-Dev -> src/stores/useAutocompletadosStore.ts y los hooks useGetPaises/Provincias/Localidades.
// El portal los vuelve a pedir en cada pantalla; acá se piden una vez y se reutilizan hasta cerrar sesión.
import { create } from 'zustand';
import type { Localidad, OpcionSelect } from '../../domain/legajo/tipos';
import { obtenerLocalidades, obtenerPaises, obtenerProvincias } from '../../infrastructure/legajo/catalogosApi';

interface CatalogosState {
  paises: OpcionSelect[];
  provincias: OpcionSelect[];
  localidades: Localidad[];
  cargando: boolean;
  /** true si alguno de los tres falló en la última carga. */
  error: boolean;
  /** Pide los catálogos que todavía estén vacíos. */
  cargar: () => Promise<void>;
  reiniciar: () => void;
}

let cargaEnCurso: Promise<void> | null = null;

export const useCatalogosStore = create<CatalogosState>()((set, get) => ({
  paises: [],
  provincias: [],
  localidades: [],
  cargando: false,
  error: false,

  cargar: () => {
    if (cargaEnCurso) return cargaEnCurso;
    const { paises, provincias, localidades } = get();
    if (paises.length > 0 && provincias.length > 0 && localidades.length > 0) return Promise.resolve();

    set({ cargando: true, error: false });
    cargaEnCurso = (async () => {
      const resultados = await Promise.allSettled([
        paises.length > 0 ? Promise.resolve(paises) : obtenerPaises(),
        provincias.length > 0 ? Promise.resolve(provincias) : obtenerProvincias(),
        localidades.length > 0 ? Promise.resolve(localidades) : obtenerLocalidades(),
      ]);
      const [p, pr, l] = resultados;
      set({
        paises: p.status === 'fulfilled' ? (p.value as OpcionSelect[]) : paises,
        provincias: pr.status === 'fulfilled' ? (pr.value as OpcionSelect[]) : provincias,
        localidades: l.status === 'fulfilled' ? (l.value as Localidad[]) : localidades,
        cargando: false,
        error: resultados.some((r) => r.status === 'rejected'),
      });
      cargaEnCurso = null;
    })();
    return cargaEnCurso;
  },

  reiniciar: () => {
    cargaEnCurso = null;
    set({ paises: [], provincias: [], localidades: [], cargando: false, error: false });
  },
}));
