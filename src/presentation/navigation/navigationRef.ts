// Referencia al contenedor de navegación, para poder navegar desde fuera de una pantalla (menú lateral, encabezado).
import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParams } from './tipos';

export const navigationRef = createNavigationContainerRef<RootStackParams>();

/**
 * Va a un módulo dejando Inicio debajo en la pila, de modo que "atrás" vuelve a Inicio y el menú no apila pantallas.
 * Con 'Inicio' deja solo esa pantalla. `params` son los parámetros de la ruta (p. ej. la pestaña de Docencia); como la
 * pila se rearma, la pantalla se crea de nuevo y arranca con esos parámetros.
 */
export const irAModulo = (ruta: keyof RootStackParams, params?: object): void => {
  if (!navigationRef.isReady()) return;
  const rutas = ruta === 'Inicio' ? [{ name: 'Inicio' }] : [{ name: 'Inicio' }, { name: ruta, params }];
  navigationRef.dispatch(CommonActions.reset({ index: rutas.length - 1, routes: rutas }));
};
