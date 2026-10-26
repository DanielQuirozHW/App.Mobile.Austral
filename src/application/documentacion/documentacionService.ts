// Flujos de Documentación del legajo. Port de Portal-Austral-Dev:
//  - lista: useGetDocumentosEmpleado.ts
//  - ver adjuntos: ModalVerDocumentos.tsx + useGetaAdjuntosXEmpleado.ts
//  - cargar: ModalCargarDocumentos.tsx + useEnviarArchivos.ts
// Las notificaciones (toasts) las muestra la pantalla; acá se devuelve el resultado o se lanza el error.
import { mapearAdjuntosDeEmpleado } from '../../domain/documentacion/documentos';
import type { Adjunto } from '../../domain/legajo/tipos';
import {
  cargarAdjuntosDeEmpleado,
  leerAdjuntosDeDocumentoEmpleado,
} from '../../infrastructure/documentacion/documentacionApi';
import type { ArchivoParaCarga } from '../../infrastructure/legajo/familiaresApi';
import { useAuthStore } from '../../presentation/stores/authStore';
import { useDocumentacionStore } from '../../presentation/stores/documentacionStore';

const empleadoIdActual = (): string => {
  const id = useAuthStore.getState().user?.empleadoid;
  if (!id) throw new Error('No hay un empleado en sesión.');
  return id;
};

/** Lee (o relee) la lista de documentos requeridos del empleado en sesión. */
export const cargarDocumentacion = (): Promise<void> =>
  useDocumentacionStore.getState().cargar(empleadoIdActual());

/**
 * Archivos ya cargados de un documento (con contenido en base64, para abrirlos). `documentoId` es el id de
 * new_documentacion del documento (row.documentoId del portal), no el de la fila del empleado.
 */
export const obtenerAdjuntosDeDocumentoEmpleado = async (documentoId: string): Promise<Adjunto[]> => {
  const filas = await leerAdjuntosDeDocumentoEmpleado(empleadoIdActual(), documentoId);
  return mapearAdjuntosDeEmpleado(filas);
};

/**
 * Sube archivos a un documento requerido. Como en el portal: se sube, se muestra el check y la fecha de hoy al
 * instante y se relee la lista. DIFERENCIA CONSCIENTE: el portal marca el check ANTES de subir y lo deja aunque la
 * subida falle; acá se marca solo si la subida salió bien. El portal no trata una respuesta vacía como error, acá
 * tampoco.
 */
export const subirAdjuntosDeEmpleado = async (
  documentacionEmpleadoId: string,
  archivos: ArchivoParaCarga[],
): Promise<void> => {
  await cargarAdjuntosDeEmpleado(documentacionEmpleadoId, archivos);
  useDocumentacionStore.getState().marcarCargado(documentacionEmpleadoId);
  await cargarDocumentacion();
};
