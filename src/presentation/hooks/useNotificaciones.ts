// Notificaciones del empleado. Equivale a useNotificaciones de Portal-Austral-Dev -> src/hooks/useGetNotificaciones.ts.
// Tiempo real: el portal abre una conexión SignalR (hub `hubs/notifications`, evento "NuevaNotificacion"). La app no
// agrega esa dependencia: vuelve a pedir la lista cada 5 minutos (el intervalo que el portal dejó comentado como
// "polling fallback") y cada vez que el usuario la abre o toca "Actualizar" (decisión 90).
import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { env } from '../../config/env';
import { marcarComoLeida, marcarTodasComoLeidas } from '../../application/notificaciones/notificacionesService';
import {
  aFilaNotificacion,
  separarNotificaciones,
  type FilaNotificacion,
} from '../../domain/notificaciones/notificaciones';
import { leerNotificacionesDeEmpleado } from '../../infrastructure/notificaciones/notificacionesApi';
import { useAuthStore } from '../stores/authStore';

const INTERVALO_DE_ACTUALIZACION_MS = 5 * 60 * 1000;

interface UseNotificaciones {
  pendientes: FilaNotificacion[];
  completadas: FilaNotificacion[];
  cargando: boolean;
  error: boolean;
  refrescar: () => Promise<unknown>;
  marcarLeida: (id: string) => Promise<boolean>;
  marcarTodas: () => Promise<number>;
}

export const useNotificaciones = (): UseNotificaciones => {
  const user = useAuthStore((s) => s.user);
  const correo = user?.email ?? '';

  const consulta = useQuery({
    queryKey: ['notificaciones', correo],
    queryFn: () => leerNotificacionesDeEmpleado(correo),
    enabled: Boolean(correo),
    refetchInterval: INTERVALO_DE_ACTUALIZACION_MS,
    select: separarNotificaciones,
  });

  const { data, refetch } = consulta;

  const { pendientes, completadas } = useMemo(() => {
    const contexto = { user, portalCaeUrl: env.portalCaeUrl };
    return {
      pendientes: (data?.activas ?? []).map((n) => aFilaNotificacion(n, true, contexto)),
      completadas: (data?.inactivas ?? []).map((n) => aFilaNotificacion(n, false, contexto)),
    };
  }, [data, user]);

  const refrescar = useCallback(() => refetch(), [refetch]);

  const marcarLeida = useCallback((id: string) => marcarComoLeida(id, refrescar), [refrescar]);

  const marcarTodas = useCallback(
    () =>
      marcarTodasComoLeidas(
        pendientes.map((n) => n.id),
        refrescar,
      ),
    [pendientes, refrescar],
  );

  return {
    pendientes,
    completadas,
    cargando: consulta.isLoading,
    error: consulta.isError,
    refrescar,
    marcarLeida,
    marcarTodas,
  };
};
