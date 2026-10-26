// Documentación requerida del empleado. Port de Portal-Austral-Dev -> src/hooks/useGetDocumentosEmpleado.ts y del
// estado de useLegajoStore (documentosEmpleado, checksTemporalesDocumentos).
import { create } from 'zustand';
import { hoyVisible, mapearDocumentosEmpleado, type DocumentoEmpleado } from '../../domain/documentacion/documentos';
import { leerDocumentosDeEmpleado } from '../../infrastructure/documentacion/documentacionApi';

interface DocumentacionState {
  /** Empleado de los datos cargados: si cambia, se descarta lo anterior (otra sesión). */
  empleadoId: string | null;
  documentos: DocumentoEmpleado[];
  cargando: boolean;
  /**
   * Documentos que el usuario acaba de subir. El CRM tarda en marcar `new_adjunto` y `new_fechadecarga`, así que el
   * portal muestra el check y la fecha al instante (checksTemporalesDocumentos / fechasTemporalesCarga, que guarda en
   * sessionStorage). Acá vive solo en memoria. Se marca únicamente tras una subida exitosa.
   */
  marcasTemporales: Record<string, { fecha: string }>;
  cargar: (empleadoId: string) => Promise<void>;
  marcarCargado: (documentoId: string) => void;
  reiniciar: () => void;
}

const inicial = {
  empleadoId: null as string | null,
  documentos: [] as DocumentoEmpleado[],
  cargando: false,
  marcasTemporales: {} as Record<string, { fecha: string }>,
};

export const useDocumentacionStore = create<DocumentacionState>()((set, get) => ({
  ...inicial,

  cargar: async (empleadoId) => {
    if (get().empleadoId !== empleadoId) set({ ...inicial, empleadoId });
    set({ cargando: true });
    try {
      const filas = await leerDocumentosDeEmpleado(empleadoId);
      // Un cuerpo que no es array (200 vacío tras reintentar) es un bache del backend: no se pisa lo que ya había.
      if (Array.isArray(filas)) set({ documentos: mapearDocumentosEmpleado(filas) });
    } catch {
      // Como el portal: se conserva lo anterior.
    } finally {
      set({ cargando: false });
    }
  },

  marcarCargado: (documentoId) =>
    set((estado) => ({
      marcasTemporales: { ...estado.marcasTemporales, [documentoId]: { fecha: hoyVisible() } },
    })),

  reiniciar: () => set({ ...inicial }),
}));
