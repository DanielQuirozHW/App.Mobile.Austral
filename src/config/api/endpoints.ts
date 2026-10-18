// Rutas de la API que usa la app. Port de Portal-Austral-Dev -> src/configs/endpoints.ts y de las rutas que
// escriben los stores del portal (useLegajoStore, useLicenciasStore, useVacacionesStore, useSolicitudesStore).
// Alcance actual: login, Datos personales y Licencias y vacaciones.
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

  // --- Licencias y vacaciones ---

  /** POST: solicita vacaciones. DELETE { new_licenciaid }: cancela una solicitud (licencia o vacaciones). */
  vacaciones: (): string => api('hrfactors/vacaciones'),

  /** POST: solicita una licencia. */
  solicitudLicencia: (): string => api('hrfactors/solicitudlicencia'),

  /** PUT: el líder aprueba o rechaza una licencia. */
  aprobarRechazarLicencia: (): string => api('hrfactors/aprobarrechazarlicencia'),

  /** PUT: el líder aprueba o rechaza una solicitud de vacaciones. */
  aprobarRechazarVacaciones: (): string => api('hrfactors/aprobarrechazarvacaciones'),

  /** PUT { licenciaId }: marca que el certificado de la licencia ya se cargó. */
  marcarAdjuntoCargadoLicencia: (): string => api('hrfactors/licencia/marcaradjuntocargado'),

  /** POST multipart: adjunta archivos a una solicitud. `clave` es el parámetro del portal, p. ej. licencia_id. */
  adjuntoSolicitud: (clave: string, solicitudId: string): string =>
    api(`hrfactors/adjuntosolicitud?${clave}=${encodeURIComponent(solicitudId)}`),

  /** POST: registro de la consulta de tipos de licencia (el portal lo manda sin esperar la respuesta). */
  logDeConsulta: (): string => api('hrfactors/logDeConsulta'),
} as const;
