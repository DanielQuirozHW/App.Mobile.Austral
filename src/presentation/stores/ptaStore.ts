// Datos del Plan de Trabajo Anual: la lista de planes y, del plan que está abierto, sus secciones, indicadores,
// adjuntos y los catálogos de los formularios.
import { create } from 'zustand';
import { CATALOGOS_VACIOS, type CatalogosPta } from '../../domain/pta/opciones';
import type {
  FuenteSeccion,
  IndicadorPta,
  NotaPta,
  PlanDeTrabajo,
  RegistroPta,
  RegistrosPorFuente,
} from '../../domain/pta/tipos';

export const seccionesVacias = (): RegistrosPorFuente => ({
  clases: [],
  areas: [],
  proyectos: [],
  publicaciones: [],
  congresos: [],
  divulgaciones: [],
  tesis: [],
  jurados: [],
  cargos: [],
  encargos: [],
  extension: [],
  transferencia: [],
  formaciones: [],
  bloques: [],
});

interface DatosPta {
  planes: PlanDeTrabajo[];
  /** Plan cuyo detalle está cargado en las listas de abajo. */
  planActualId: string | null;
  secciones: RegistrosPorFuente;
  indicadores: IndicadorPta[];
  notas: NotaPta[];
  catalogos: CatalogosPta;
}

interface EstadoDeCarga {
  /** Lista de planes. */
  cargando: boolean;
  cargado: boolean;
  /** Alguna lectura de la lista falló. Un error NO pisa lo que ya se tenía. */
  error: boolean;
  /** Detalle del plan abierto. */
  cargandoDetalle: boolean;
  errorDetalle: boolean;
}

interface PtaState extends DatosPta, EstadoDeCarga {
  fijar: (parcial: Partial<DatosPta>) => void;
  fijarFuente: (fuente: FuenteSeccion, registros: RegistroPta[]) => void;
  fijarCatalogos: (parcial: Partial<CatalogosPta>) => void;
  fijarEstado: (parcial: Partial<EstadoDeCarga>) => void;
  /** Abre otro plan: se descartan las listas del anterior. */
  abrirPlan: (planId: string) => void;
  reiniciar: () => void;
}

const vacio = (): DatosPta => ({
  planes: [],
  planActualId: null,
  secciones: seccionesVacias(),
  indicadores: [],
  notas: [],
  catalogos: CATALOGOS_VACIOS,
});

const estadoVacio: EstadoDeCarga = {
  cargando: false,
  cargado: false,
  error: false,
  cargandoDetalle: false,
  errorDetalle: false,
};

export const usePtaStore = create<PtaState>()((set) => ({
  ...vacio(),
  ...estadoVacio,
  fijar: (parcial) => set(parcial),
  fijarFuente: (fuente, registros) => set((s) => ({ secciones: { ...s.secciones, [fuente]: registros } })),
  fijarCatalogos: (parcial) => set((s) => ({ catalogos: { ...s.catalogos, ...parcial } })),
  fijarEstado: (parcial) => set(parcial),
  abrirPlan: (planId) =>
    set((s) =>
      s.planActualId === planId
        ? {}
        : { planActualId: planId, secciones: seccionesVacias(), indicadores: [], notas: [], errorDetalle: false },
    ),
  reiniciar: () => set({ ...vacio(), ...estadoVacio }),
}));
