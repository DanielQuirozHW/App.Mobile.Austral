// Ruta de la API que usa Notificaciones y que no está en endpoints.ts.
// Fuente: Portal-Austral-Dev -> src/hooks/useGetNotificaciones.ts (putInactivarTarea).
// Mismo formato que endpoints.ts: base env.apiUrl (termina en barra) + api/...
import { env } from '../env';

export const endpointsNotificaciones = {
  /** PUT { activityid }: marca una notificación (tarea del CRM) como leída, es decir, la inactiva. */
  inactivarTarea: (): string => `${env.apiUrl}api/hrfactors/inactivartarea`,
} as const;
