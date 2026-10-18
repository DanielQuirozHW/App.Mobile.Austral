import { AppState, Platform } from 'react-native';
import { focusManager, QueryClient } from '@tanstack/react-query';

/**
 * Cliente de TanStack Query.
 *
 * Los reintentos NO se hacen acá: viven en la capa de axios (src/config/api), que replica
 * las reglas del portal (reintentos ante error de red/5xx/429/408 y ante 200 con cuerpo vacío,
 * y nunca en escrituras). Reintentar también en Query duplicaría los intentos.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

/**
 * Le avisa a Query cuando la app vuelve a primer plano, para que vuelva a leer los datos.
 * Devuelve la función que quita el listener.
 */
export const registrarRefetchAlVolverALaApp = (): (() => void) => {
  const suscripcion = AppState.addEventListener('change', estado => {
    if (Platform.OS !== 'web') {
      focusManager.setFocused(estado === 'active');
    }
  });
  return () => suscripcion.remove();
};
