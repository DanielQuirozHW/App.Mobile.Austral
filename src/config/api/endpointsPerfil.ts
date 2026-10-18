// Rutas de la API de las secciones de Perfil que se suman a las de Formación y Trayectoria (estas últimas están en
// endpoints.ts). Mismo formato: `${env.apiUrl}api/...`.
import { env } from '../env';

const api = (ruta: string): string => `${env.apiUrl}api/${ruta}`;

export const endpointsPerfil = {
  /** POST / PUT / DELETE: actividades de extensión. */
  actividadesExtension: (): string => api('hrfactors/actividadesextension'),
} as const;
