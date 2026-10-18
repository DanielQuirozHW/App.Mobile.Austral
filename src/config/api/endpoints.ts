// Rutas de la API que usa la app. Port de Portal-Austral-Dev -> src/configs/endpoints.ts,
// pero SOLO con lo que entra en el alcance actual (login y Datos personales).
// La base viene de env.apiUrl (termina en barra, igual que en el portal: `${UrlApi}api/...`).
import { env } from '../env';

const api = (ruta: string): string => `${env.apiUrl}api/${ruta}`;

export const endpoints = {
  /** POST { email, password } -> { token }. Usuario de servicio. */
  login: (): string => api('Usuarios/login'),

  /** POST { entidad, fetch } -> filas del CRM (FetchXML). Lecturas. */
  consultaFetchs: (): string => api('consultafetchs'),

  /** PUT: actualiza el legajo del empleado. */
  legajoEmpleado: (): string => api('hrfactors/empleado'),

  /** POST / PUT / DELETE: cónyuge e hijos/as. */
  familiarEmpleado: (): string => api('hrfactors/familiarEmpleado'),

  /** POST multipart: adjunta archivos a un documento de familiar. */
  adjuntoDocumentacionFamiliar: (documentacionId: string): string =>
    api(`hrfactors/adjuntosolicitud?documentacionporfamiliardeempleado=${encodeURIComponent(documentacionId)}`),

  /** GET catálogo v1 -> [{ id, nombre }]. Ej.: paises, provincias. */
  catalogo: (clave: string, parentId?: string): string =>
    api(`v1/catalogos/${clave}`) + (parentId ? `?parentId=${encodeURIComponent(parentId)}` : ''),
} as const;
