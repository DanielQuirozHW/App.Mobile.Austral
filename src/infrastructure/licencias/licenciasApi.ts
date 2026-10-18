// Licencias: tipos, listados propios y del equipo, solicitud, cancelación, aprobación y adjuntos.
// Port de Portal-Austral-Dev -> src/stores/useLicenciasStore.ts, useSolicitudesStore.cargarAdjuntoSolicitud,
// useGetNotasLicencia y useVacacionesStore.cancelarVacacion (la cancelación es la misma ruta para licencias).
import { requestConReintento } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { escaparXml } from '../../config/api/fetchXml';
import { mapearAdjunto } from '../../domain/legajo/mapeo';
import type { Adjunto } from '../../domain/legajo/tipos';
import { armarPayloadAprobarLicencia, armarPayloadLicencia, type DatosSolicitudLicencia } from '../../domain/licencias/payload';
import type { PerfilParaLicencias } from '../../domain/licencias/tiposDeLicencia';
import type { Fila } from '../../domain/licencias/tipos';
import { cabeceraConToken, tokenDeServicio } from '../legajo/credencial';
import { leerLegajo } from '../legajo/legajoApi';
import type { ArchivoParaCarga } from '../legajo/familiaresApi';
import { leerFilas } from './consultas';

// ---------------------------------------------------------------------------
// Tipos de licencia
// ---------------------------------------------------------------------------

const FETCH_TIPOS_DE_LICENCIA = `<entity name="new_tipodelicencia">
  <attribute name="new_name" />
  <attribute name="new_segmento" />
  <attribute name="new_codigo" />
  <attribute name="new_validador" />
  <attribute name="new_requierevalidacin" />
  <attribute name="new_requiereaprobacin" />
  <attribute name="new_tipodelicenciaid" />
  <attribute name="new_sexo" />
  <attribute name="statuscode" />
  <attribute name="createdon" />
  <attribute name="statecode" />
  <attribute name="new_conceptoaliquidar" />
  <attribute name="new_cantidaddiascorrespleyanuales" />
  <attribute name="new_cantdiashabilescorrespporley" />
  <attribute name="new_aprobador" />
  <attribute name="new_cargaportal" />
  <attribute name="new_certificadoobligatorio" />
  <attribute name="new_unidadacademica" />
  <attribute name="new_tiposdecontratacion"/>
  <attribute name="new_areadelpersonal"/>
  <attribute name="new_antiguedadminima"/>
  <attribute name="new_fechadesde" />
  <attribute name="new_fechahasta" />
  <attribute name="new_tienelimiteanual" />
  <order attribute="new_name" descending="false" />
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0"/>
    <condition attribute="new_cargaportal" operator="eq" value="100000000" />
  </filter>
</entity>`;

/** Tipos de licencia habilitados para el portal (new_cargaportal = 100000000). */
export const leerTiposDeLicencia = (): Promise<Fila[]> => leerFilas('new_tipodelicencias', FETCH_TIPOS_DE_LICENCIA);

/** Fila cruda de new_empleado: trae unidad organizativa, antigüedad y área, que el mapeo de Datos personales no guarda. */
export const leerFilaDeLegajo = async (empleadoId: string): Promise<Fila | null> => {
  const filas = await leerLegajo(empleadoId);
  return filas[0] ?? null;
};

const formatear = (valor?: string | number | null, etiqueta?: string | null): string =>
  etiqueta ? `${valor} (${etiqueta})` : `${valor ?? ''}`;

/**
 * Registro de la consulta de tipos (logConsultaTipoLicencias del portal): se manda sin esperar la
 * respuesta y cualquier error se ignora.
 */
export const registrarConsultaDeTipos = (
  empleadoId: string,
  filaLegajo: Fila | null,
  perfil: PerfilParaLicencias,
  todos: Fila[],
  filtradas: Fila[],
): void => {
  const FV = '@OData.Community.Display.V1.FormattedValue';
  const ahora = new Date().toISOString();
  const observaciones = [
    `unidadUsuario: ${formatear(perfil.unidad, filaLegajo?.[`_new_unidadorganizativa_value${FV}`])}`,
    `area: ${perfil.area}`,
    `contratacion: ${formatear(perfil.contratacion, filaLegajo?.[`new_tipodecontratacion${FV}`])}`,
    `antiguedad: ${perfil.antiguedadFecha ?? ''}`,
    `sexo: ${formatear(perfil.sexo, filaLegajo?.[`new_generosegundni${FV}`])}`,
    `| Licencias filtradas [${filtradas.length} de ${todos.length}]: ${filtradas.map((t) => t.new_name).join('; ')}`,
  ]
    .join(', ')
    .slice(0, 100000);

  tokenDeServicio()
    .then((token) =>
      requestConReintento({
        method: 'post',
        url: endpoints.logDeConsulta(),
        data: {
          new_name: `Log - new_tipodelicencias - ${ahora}`,
          new_nombreentidad: 'new_tipodelicencias',
          new_empleadoid: empleadoId,
          new_fecha: ahora,
          new_fetch: FETCH_TIPOS_DE_LICENCIA,
          new_respuesta: JSON.stringify(todos),
          new_observaciones: observaciones,
        },
        headers: cabeceraConToken(token),
        reintentos: 0,
      }),
    )
    .catch(() => undefined);
};

// ---------------------------------------------------------------------------
// Listados
// ---------------------------------------------------------------------------

const ATRIBUTOS_LICENCIA = `<attribute name="new_tipodelicencia" />
  <attribute name="new_fechadesde" />
  <attribute name="new_empleado" />
  <attribute name="statuscode" />
  <attribute name="new_fechahasta" />
  <attribute name="new_diassolicitados" />
  <attribute name="new_licenciaid" />
  <attribute name="new_requieremasinformacion" />
  <attribute name="new_name" />
  <attribute name="new_fechadesolicitud" />
  <attribute name="createdon" />
  <attribute name="new_fechaaltamedica" />
  <attribute name="statecode" />
  <attribute name="new_diashabilessolicitados" />
  <attribute name="new_comentarios" />
  <attribute name="new_cantidadhoraslicencia" />
  <attribute name="new_aprobador1" />
  <attribute name="new_aprobacionsupervisor" />
  <attribute name="new_aprobacionrecursoshumanos" />
  <attribute name="new_motivoderechazo" />
  <attribute name="new_calle" />
  <attribute name="new_nro" />
  <attribute name="new_piso" />
  <attribute name="new_depto" />
  <attribute name="new_codigopostal" />
  <attribute name="new_pais" />
  <attribute name="new_provincia" />
  <attribute name="new_localidad" />`;

/** Licencias del empleado (sin vacaciones), de la más reciente a la más antigua. */
export const leerLicenciasPropias = (empleadoId: string): Promise<Fila[]> => {
  const fetch = `<entity name="new_licencia">
  ${ATRIBUTOS_LICENCIA}
  <order attribute="new_fechadesde" descending="true" />
  <order attribute="new_empleado" descending="false" />
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0" />
    <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
    <condition entityname="a_a88c8d1fb4c5e911a811000d3ac022de" attribute="new_segmentoname" operator="not-like" value="%Vacaciones%" />
  </filter>
  <link-entity name="new_tipodelicencia" from="new_tipodelicenciaid" to="new_tipodelicencia" visible="false" link-type="inner" alias="a_a88c8d1fb4c5e911a811000d3ac022de">
    <attribute name="new_segmento" />
    <attribute name="new_certificadoobligatorio" />
    <attribute name="new_tiposdecontratacion"/>
    <attribute name="new_areadelpersonal"/>
    <attribute name="new_antiguedadminima"/>
    <attribute name="new_fechadesde" />
    <attribute name="new_fechahasta" />
  </link-entity>
  <link-entity name="new_empleado" from="new_empleadoid" to="new_empleado" visible="false" link-type="outer" alias="a_64419f07b4c5e911a811000d3ac022de">
    <attribute name="new_numerolegajo" />
  </link-entity>
</entity>`;
  return leerFilas('new_licencias', fetch);
};

/** Licencias (sin vacaciones) que el empleado debe aprobar (new_aprobador1 = él). */
export const leerLicenciasDeEquipo = (empleadoId: string): Promise<Fila[]> => {
  const fetch = `<entity name="new_licencia">
  ${ATRIBUTOS_LICENCIA}
  <order attribute="new_fechadesde" descending="true" />
  <order attribute="new_empleado" descending="false" />
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0" />
    <condition attribute="new_aprobador1" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
    <condition entityname="tipodelicencia" attribute="new_segmentoname" operator="not-like" value="%Vacaciones%" />
  </filter>
  <link-entity name="new_tipodelicencia" from="new_tipodelicenciaid" to="new_tipodelicencia" visible="false" link-type="inner" alias="tipodelicencia">
    <attribute name="new_segmento" />
    <attribute name="new_certificadoobligatorio" />
    <attribute name="new_tiposdecontratacion"/>
    <attribute name="new_areadelpersonal"/>
    <attribute name="new_antiguedadminima"/>
    <attribute name="new_fechadesde" />
    <attribute name="new_fechahasta" />
    <attribute name="new_requierevalidacion" />
  </link-entity>
  <link-entity name="new_empleado" from="new_empleadoid" to="new_empleado" visible="false" link-type="outer" alias="a_64419f07b4c5e911a811000d3ac022de">
    <attribute name="new_numerolegajo" />
  </link-entity>
</entity>`;
  return leerFilas('new_licencias', fetch);
};

// ---------------------------------------------------------------------------
// Escrituras (sin reintentos)
// ---------------------------------------------------------------------------

const escribir = async (metodo: 'post' | 'put' | 'delete', url: string, data: unknown): Promise<unknown> => {
  const token = await tokenDeServicio();
  const resp = await requestConReintento({
    method: metodo,
    url,
    data,
    headers: cabeceraConToken(token),
    reintentos: 0,
  });
  return resp.data;
};

/** POST solicitudlicencia. Devuelve el id de la licencia creada ('' si el backend no lo informó). */
export const solicitarLicencia = async (
  empleadoId: string,
  datos: DatosSolicitudLicencia,
  certificadoObligatorioModo: number | null,
  cantidadArchivos: number,
): Promise<string> => {
  if (!empleadoId || !datos.tipoId) throw new Error('Datos o token faltantes');
  const payload = armarPayloadLicencia(empleadoId, datos, certificadoObligatorioModo, cantidadArchivos);
  const respuesta = await escribir('post', endpoints.solicitudLicencia(), payload);
  return typeof respuesta === 'string' ? respuesta : '';
};

/** DELETE hrfactors/vacaciones { new_licenciaid }: cancela una solicitud (sirve para licencias y para vacaciones). */
export const cancelarSolicitud = async (licenciaId: string): Promise<void> => {
  if (!licenciaId) throw new Error('Datos o token faltantes');
  await escribir('delete', endpoints.vacaciones(), { new_licenciaid: licenciaId });
};

/** PUT aprobarrechazarlicencia. */
export const aprobarRechazarLicencia = async (
  licenciaId: string,
  idAprobador1: string | null,
  aprobar: boolean,
  motivoRechazo: string,
): Promise<unknown> =>
  escribir(
    'put',
    endpoints.aprobarRechazarLicencia(),
    armarPayloadAprobarLicencia(licenciaId, idAprobador1, aprobar, motivoRechazo),
  );

/** PUT licencia/marcaradjuntocargado { licenciaId }. */
export const marcarAdjuntoCargadoLicencia = async (licenciaId: string): Promise<void> => {
  if (!licenciaId) return;
  await escribir('put', endpoints.marcarAdjuntoCargadoLicencia(), { licenciaId });
};

// ---------------------------------------------------------------------------
// Adjuntos
// ---------------------------------------------------------------------------

/**
 * Sube archivos a una solicitud: multipart con una parte `body{i}` por archivo (así lo arma el portal).
 * `clave` es el parámetro de la URL, p. ej. 'licencia_id'. Devuelve el cuerpo de la respuesta.
 */
export const cargarAdjuntosDeSolicitud = async (
  clave: string,
  solicitudId: string,
  archivos: ArchivoParaCarga[],
): Promise<unknown> => {
  if (!solicitudId || archivos.length === 0) throw new Error('Datos o token faltantes');
  const token = await tokenDeServicio();
  const form = new FormData();
  archivos.forEach((archivo, indice) => form.append(`body${indice}`, archivo as unknown as Blob));
  const resp = await requestConReintento({
    method: 'post',
    url: endpoints.adjuntoSolicitud(clave, solicitudId),
    data: form,
    headers: { ...cabeceraConToken(token), 'Content-Type': 'multipart/form-data' },
    transformRequest: (data: unknown) => data,
    reintentos: 0,
    timeout: 120000,
  });
  return resp.data;
};

const notasDeLicencia = (licenciaId: string, notaId: string | null, conContenido: boolean): string => `<entity name="annotation">
  <attribute name="annotationid" />
  <attribute name="subject" />
  <attribute name="notetext" />
  <attribute name="modifiedby" />
  <attribute name="mimetype" />
  <attribute name="filesize" />
  <attribute name="filename" />
  <attribute name="createdon" />
  <attribute name="isdocument" />
  ${conContenido ? '<attribute name="documentbody" />' : ''}
  ${notaId ? `<filter type="and"><condition attribute="annotationid" operator="eq" value="${escaparXml(notaId)}" /></filter>` : ''}
  <link-entity name="new_licencia" from="new_licenciaid" to="objectid" link-type="inner" alias="licencia">
    <filter type="and">
      <condition attribute="new_licenciaid" operator="eq" value="${escaparXml(licenciaId)}" />
    </filter>
  </link-entity>
</entity>`;

/**
 * Notas (adjuntos) de una licencia, SIN el contenido.
 * DIFERENCIA CONSCIENTE con el portal: el portal pide también `documentbody`; en el celular el contenido
 * se pide por documento cuando el usuario lo abre (leerAdjuntoConContenido).
 */
export const leerAdjuntosDeLicencia = async (licenciaId: string): Promise<Adjunto[]> => {
  const filas = await leerFilas('annotations', notasDeLicencia(licenciaId, null, false));
  return filas.map(mapearAdjunto);
};

/** Una nota con su contenido en base64, para abrirla. */
export const leerAdjuntoConContenido = async (licenciaId: string, notaId: string): Promise<Adjunto | null> => {
  const filas = await leerFilas('annotations', notasDeLicencia(licenciaId, notaId, true));
  return filas[0] ? mapearAdjunto(filas[0]) : null;
};
