// Acciones sobre las notificaciones. Port de Portal-Austral-Dev -> src/hooks/useGetNotificaciones.ts
// (inactivarTarea e inactivarTareas). Los textos de aviso son los del portal.
import { inactivarTarea } from '../../infrastructure/notificaciones/notificacionesApi';
import { toast } from '../../presentation/utils/toast';

/**
 * Marca una como leída. Éxito: aviso "Notificación marcada como leída" y recarga. Si falla, el portal solo escribe en la
 * consola; la app además avisa (diferencia deliberada, ver decisión 90). Devuelve si se pudo.
 */
export const marcarComoLeida = async (id: string, refrescar: () => Promise<unknown>): Promise<boolean> => {
  try {
    await inactivarTarea(id);
  } catch {
    toast.error('No se pudo marcar la notificación como leída');
    return false;
  }
  toast.success('Notificación marcada como leída', 2500);
  await refrescar();
  return true;
};

/**
 * Marca varias de una. La API no tiene un endpoint masivo: se mandan de a tandas (5 en paralelo, como el portal) para no
 * disparar decenas de pedidos juntos. Devuelve cuántas fallaron.
 */
export const marcarTodasComoLeidas = async (
  ids: string[],
  refrescar: () => Promise<unknown>,
  tamanioTanda = 5,
): Promise<number> => {
  let fallidas = 0;
  for (let i = 0; i < ids.length; i += tamanioTanda) {
    const tanda = ids.slice(i, i + tamanioTanda);
    const resultados = await Promise.allSettled(tanda.map((id) => inactivarTarea(id)));
    fallidas += resultados.filter((r) => r.status === 'rejected').length;
  }
  await refrescar();
  if (fallidas > 0) {
    toast.error(`${fallidas} notificación(es) no se pudieron marcar como leídas`, 2500);
  } else {
    toast.success(`${ids.length} notificación(es) marcadas como leídas`, 2500);
  }
  return fallidas;
};
