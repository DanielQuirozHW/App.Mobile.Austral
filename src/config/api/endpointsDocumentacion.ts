// Rutas de la API de Documentación del legajo (Legajo > Documentación).
// Port de Portal-Austral-Dev -> src/stores/useLegajoStore.ts (cargarAdjuntoLegajoEmpleado).
// Archivo aparte para no reenviar endpoints.ts entero; se puede unificar cuando haya otro cambio en ese archivo.
import { env } from '../env';

export const endpointsDocumentacion = {
  /** POST multipart: adjunta archivos a un documento requerido del empleado (parámetro doc_empleado_id). */
  adjuntoDocumentacionEmpleado: (documentacionEmpleadoId: string): string =>
    `${env.apiUrl}api/hrfactors/adjuntosDocumentacion?doc_empleado_id=${encodeURIComponent(documentacionEmpleadoId)}`,
} as const;
