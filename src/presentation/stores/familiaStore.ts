// Cónyuge, hijos/as y su documentación. Port de Portal-Austral-Dev -> src/stores/useLegajoStore.ts y de los hooks
// useGetFamiliarXEmpleado / useGetDocumentosPorFamiliar.
import { create } from 'zustand';
import {
  agruparAdjuntosPorFamiliar,
  familiarVacio,
  separarDocumentosFamiliares,
  separarFamilia,
} from '../../domain/legajo/mapeo';
import type { DocumentoFamiliar, Familiar } from '../../domain/legajo/tipos';
import {
  leerDocumentosPorFamiliar,
  leerFamiliares,
  leerNotasDeFamiliares,
} from '../../infrastructure/legajo/familiaresApi';

interface FamiliaState {
  conyuge: Familiar;
  hijos: Familiar[];
  documentosHijos: DocumentoFamiliar[];
  documentosConyuge: DocumentoFamiliar[];
  cargandoFamiliares: boolean;
  cargandoDocumentos: boolean;
  /**
   * Documentos que el usuario acaba de subir. El CRM tarda en marcar `new_adjunto`, así que el portal muestra el
   * check al instante (checksTemporalesDocumentos). Acá vive solo en memoria.
   */
  checksTemporales: Record<string, true>;
  cargarFamiliares: (empleadoId: string) => Promise<void>;
  cargarDocumentos: (empleadoId: string) => Promise<void>;
  marcarCheckTemporal: (documentoId: string) => void;
  reiniciar: () => void;
}

const inicial = {
  conyuge: familiarVacio(),
  hijos: [] as Familiar[],
  documentosHijos: [] as DocumentoFamiliar[],
  documentosConyuge: [] as DocumentoFamiliar[],
  cargandoFamiliares: false,
  cargandoDocumentos: false,
  checksTemporales: {} as Record<string, true>,
};

export const useFamiliaStore = create<FamiliaState>()((set) => ({
  ...inicial,

  cargarFamiliares: async (empleadoId) => {
    set({ cargandoFamiliares: true });
    try {
      const [filas, notas] = await Promise.all([leerFamiliares(empleadoId), leerNotasDeFamiliares(empleadoId)]);
      // Un cuerpo que no es array (200 vacío tras reintentar) es un bache del backend: no se pisa lo que ya había.
      if (Array.isArray(filas)) {
        set({ ...separarFamilia(filas, agruparAdjuntosPorFamiliar(notas)) });
      }
    } catch {
      // Como el portal: se registra y se conserva lo anterior.
    } finally {
      set({ cargandoFamiliares: false });
    }
  },

  cargarDocumentos: async (empleadoId) => {
    set({ cargandoDocumentos: true });
    try {
      const filas = await leerDocumentosPorFamiliar(empleadoId);
      if (Array.isArray(filas)) {
        const { hijos, conyuge } = separarDocumentosFamiliares(filas);
        set({ documentosHijos: hijos, documentosConyuge: conyuge });
      }
    } catch {
      // Se conserva lo anterior.
    } finally {
      set({ cargandoDocumentos: false });
    }
  },

  marcarCheckTemporal: (documentoId) =>
    set((estado) => ({ checksTemporales: { ...estado.checksTemporales, [documentoId]: true } })),

  reiniciar: () => set({ ...inicial, conyuge: familiarVacio() }),
}));
