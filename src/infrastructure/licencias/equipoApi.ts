// Calendario, feriados y gestión del líder. Port de Portal-Austral-Dev -> src/stores/useVacacionesStore.ts
// (fetchLicenciasEquipoCalendario, vacacionesEquipoFetch, VacacionesEquipoPendientes), useGetFeriados y useEsLiderEquipo.
import { requestConReintento } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { ESTADOS_EN_BANDEJA } from '../../domain/licencias/estados';
import { armarPayloadAprobarVacacion } from '../../domain/licencias/payload';
import type { Fila } from '../../domain/licencias/tipos';
import { cabeceraConToken, tokenDeServicio } from '../legajo/credencial';
import { leerFilas } from './consultas';

const ATRIBUTOS_SOLICITUD_DE_EQUIPO = `<attribute name="new_name" />
  <attribute name="new_aprobacionrecursoshumanos" />
  <attribute name="new_tipodelicencia" />
  <attribute name="new_fechahasta" />
  <attribute name="new_fechadesde" />
  <attribute name="new_fechadesolicitud" />
  <attribute name="new_empleado" />
  <attribute name="statuscode" />
  <attribute name="new_diassolicitados" />
  <attribute name="new_diashabilessolicitados" />
  <attribute name="new_licenciaid" />
  <attribute name="new_vacaciones" />
  <attribute name="new_motivoderechazo" />
  <attribute name="new_comentarios" />
  <order attribute="new_fechadesde" descending="false" />
  <order attribute="new_empleado" descending="false" />`;

const LINK_LEGAJO_EXTERNO = `<link-entity name="new_empleado" from="new_empleadoid" to="new_empleado" link-type="outer" alias="numerolegajo">
    <attribute name="new_numerolegajo" />
    <attribute name="new_name" />
  </link-entity>`;

/** Personas que reportan a `empleadoId` y su líder (alias ak -> reportaA). */
const linkReportaA = (empleadoId: string): string => `<link-entity name="new_empleado" from="new_empleadoid" to="new_empleado" link-type="inner" alias="ak">
    <link-entity name="new_empleado" from="new_empleadoid" to="new_reportaaid" link-type="inner" alias="reportaA">
      <attribute name="new_name" />
      <attribute name="new_empleadoid" />
      <filter type="and">
        <condition attribute="new_empleadoid" operator="eq" value="${escaparXml(empleadoId)}" />
      </filter>
    </link-entity>
  </link-entity>`;

/**
 * Licencias y vacaciones propias y del equipo para el calendario: dos consultas en paralelo,
 * unidas y sin repetir por new_licenciaid.
 */
export const leerCalendario = async (empleadoId: string): Promise<Fila[]> => {
  const propias = `<entity name="new_licencia">
  ${ATRIBUTOS_SOLICITUD_DE_EQUIPO}
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0" />
    <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
  </filter>
  ${LINK_LEGAJO_EXTERNO}
</entity>`;
  const delEquipo = `<entity name="new_licencia">
  ${ATRIBUTOS_SOLICITUD_DE_EQUIPO}
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0" />
  </filter>
  ${linkReportaA(empleadoId)}
  ${LINK_LEGAJO_EXTERNO}
</entity>`;

  const [filasPropias, filasEquipo] = await Promise.all([
    leerFilas('new_licencias', propias),
    leerFilas('new_licencias', delEquipo),
  ]);

  const vistas = new Set<string>();
  const unidas: Fila[] = [];
  [...filasPropias, ...filasEquipo].forEach((fila) => {
    const id = String(fila?.new_licenciaid ?? '');
    if (id && vistas.has(id)) return;
    if (id) vistas.add(id);
    unidas.push(fila);
  });
  return unidas;
};

/** Días feriados (new_diasferiados), del más nuevo al más viejo. */
export const leerFeriados = (): Promise<Fila[]> => {
  const fetch = `<entity name="new_diasferiados">
  <attribute name="new_name" />
  <attribute name="new_fecha" />
  <attribute name="new_diasferiadosid" />
  <order attribute="new_fecha" descending="true" />
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0" />
  </filter>
</entity>`;
  return leerFilas('new_diasferiadoses', fetch);
};

/** Solicitudes de vacaciones de las personas que reportan al empleado. */
export const leerVacacionesDeEquipo = (empleadoId: string): Promise<Fila[]> => {
  const fetch = `<entity name="new_licencia">
  ${ATRIBUTOS_SOLICITUD_DE_EQUIPO}
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0" />
  </filter>
  <link-entity name="new_tipodelicencia" from="new_tipodelicenciaid" to="new_tipodelicencia" link-type="inner" alias="as">
    <filter type="and">
      <condition attribute="new_segmento" operator="eq" value="100000004" />
    </filter>
  </link-entity>
  ${linkReportaA(empleadoId)}
  ${LINK_LEGAJO_EXTERNO}
</entity>`;
  return leerFilas('new_licencias', fetch);
};

/** Cuentas de vacaciones de quienes reportan al empleado (pestaña "Días pendientes"). */
export const leerDiasPendientesDeEquipo = (empleadoId: string): Promise<Fila[]> => {
  const fetch = `<entity name="new_vacaciones">
  <attribute name="new_empleado" />
  <attribute name="new_diasvacacionespendientes" />
  <attribute name="new_fechahasta" />
  <attribute name="new_fechadesde" />
  <attribute name="new_periodovacacional" />
  <attribute name="new_vacacionesid" />
  <order attribute="new_empleado" descending="false" />
  <order attribute="new_fechadesde" descending="true" />
  <link-entity name="new_empleado" from="new_empleadoid" to="new_empleado" link-type="inner" alias="ad">
    <filter type="and">
      <condition attribute="new_reportaaid" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
    </filter>
  </link-entity>
  <link-entity name="new_periodovacacionaldefinido" from="new_periodovacacionaldefinidoid" to="new_periodovacacional" link-type="inner" alias="ab">
    <filter type="and">
      <condition attribute="statuscode" operator="eq" value="1" />
    </filter>
  </link-entity>
</entity>`;
  return leerFilas('new_vacacioneses', fetch);
};

/**
 * useEsLiderEquipo del portal: es líder quien tiene empleados que le reportan o quien es aprobador de alguna
 * solicitud en bandeja. Lanza error si una consulta falla (quien llama conserva lo que tenía).
 */
export const consultarEsLider = async (empleadoId: string): Promise<boolean> => {
  const reportan = await leerFilas(
    'new_empleados',
    `<entity name="new_empleado">
  <attribute name="new_empleadoid" />
  <filter type="and">
    <condition attribute="new_reportaaid" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
  </filter>
</entity>`,
  );
  if (reportan.length > 0) return true;

  const estados = ESTADOS_EN_BANDEJA.map((e) => `<value>${e}</value>`).join('');
  const aprobadas = await leerFilas(
    'new_licencias',
    `<entity name="new_licencia">
  <attribute name="new_licenciaid" />
  <filter type="and">
    <condition attribute="statecode" operator="eq" value="0" />
    <condition attribute="new_aprobador1" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
    <condition attribute="statuscode" operator="in">${estados}</condition>
  </filter>
</entity>`,
  );
  return aprobadas.length > 0;
};

/** PUT aprobarrechazarvacaciones. Sin reintentos. */
export const aprobarRechazarVacacion = async (
  licenciaId: string,
  tipoDeLicenciaId: string | null,
  aprobar: boolean,
  motivoRechazo: string,
): Promise<unknown> => {
  const token = await tokenDeServicio();
  const resp = await requestConReintento({
    method: 'put',
    url: endpoints.aprobarRechazarVacaciones(),
    data: armarPayloadAprobarVacacion(licenciaId, tipoDeLicenciaId, aprobar, motivoRechazo),
    headers: cabeceraConToken(token),
    reintentos: 0,
  });
  return resp.data;
};

// consultarFetchXml se re-exporta solo para que los consumidores de esta capa no dependan de config/ directamente.
export { consultarFetchXml };
