// Rutas de la API que usa la app. Port de Portal-Austral-Dev -> src/configs/endpoints.ts y de las rutas que
// escriben los stores y hooks del portal (useLegajoStore, useLicenciasStore, useVacacionesStore, useSolicitudesStore,
// hooks/formacion/*, hooks/trayectoria/*, hooks/useCargarActividadExtension, hooks/gestion-academica/*, hooks/docencia/*).
// Alcance actual: login, Datos personales, Licencias y vacaciones y Perfil.
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

  // --- Perfil > Formación ---

  /** POST / PUT / DELETE: títulos de pregrado/grado, posgrado y formación posdoctoral. */
  titulosGradoPosgrado: (): string => api('hrfactors/titulosgradoposgrado'),

  /** POST multipart: adjunta constancias a un título (parámetro educacionFormal_id). */
  adjuntoTitulo: (tituloId: string): string =>
    api(`hrfactors/adjuntosolicitud?educacionFormal_id=${encodeURIComponent(tituloId)}`),

  /** POST / PUT / DELETE: especialidad certificada por organismo/s de salud. */
  especialidadCertificadaSalud: (): string => api('hrfactors/especialidadcertificadosalud'),

  /** POST / PUT / DELETE: certificaciones y capacitaciones. */
  certificacion: (): string => api('hrfactors/certificacion'),

  /** POST / PUT / DELETE: idiomas. */
  idioma: (): string => api('hrfactors/idioma'),

  /** POST / PUT / DELETE: áreas de expertise - áreas de actuación. */
  areasDeExpertise: (): string => api('hrfactors/areasdeexpertise'),

  // --- Perfil > Trayectoria profesional ---

  /** POST / PUT / DELETE: experiencia laboral fuera del ámbito académico. */
  experienciaFuera: (): string => api('hrfactors/experienciafuera'),

  /** POST / PUT / DELETE: consultorías externas. */
  consultoriaExterna: (): string => api('hrfactors/consultoriaexterna'),

  /** POST / PUT / DELETE: comités profesionales o técnicos. */
  comiteProfesional: (): string => api('hrfactors/comiteprofesional'),

  /** POST / PUT / DELETE: licencias profesionales, membresías y asociaciones. */
  licProfMembresia: (): string => api('hrfactors/licprofmembresia'),

  /** POST / PUT / DELETE: reconocimientos profesionales (payload en camelCase). */
  reconocimientosProfesionales: (): string => api('hrfactors/reconocimientos-profesionales'),

  // --- Perfil > Extensión ---

  /** POST / PUT / DELETE: actividades de extensión. */
  actividadesExtension: (): string => api('hrfactors/actividadesextension'),

  // --- Perfil > Gestión académica ---

  /** POST: nuevo encargo en gestión académica. */
  nuevoEncargo: (): string => api('hrfactors/NuevoEncargo'),

  /** PUT: edita un encargo. */
  editarEncargo: (): string => api('hrfactors/EditarEncargo'),

  /** DELETE { new_encargosid }: elimina un encargo. */
  eliminarEncargo: (): string => api('hrfactors/EliminarEncargo'),

  /** POST / PUT / DELETE: cargos y encargos en gestión académica externos. */
  cargosYEncargosExternos: (): string => api('hrfactors/cargosYEncargosExternos'),

  // --- Perfil > Docencia ---

  /** POST / PUT / DELETE: docencia Universidad Austral. */
  docencia: (): string => api('hrfactors/docencia'),

  /** POST / PUT / DELETE: docencia externa. */
  docenciaExterna: (): string => api('hrfactors/docenciaexterna'),

  /** POST / PUT / DELETE: asesoramiento académico. */
  asesoramientoAcademico: (): string => api('hrfactors/asesoramientoAcademico'),
} as const;
