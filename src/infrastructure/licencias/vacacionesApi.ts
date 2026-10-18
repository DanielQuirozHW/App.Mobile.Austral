// Vacaciones del empleado: cuenta y período, solicitudes propias y solicitud nueva.
// Port de Portal-Austral-Dev -> src/stores/useVacacionesStore.ts (VacacionesFetch, fetchVacacionesGestion, solicitudVacaciones).
import { requestConReintento } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { escaparXml } from '../../config/api/fetchXml';
import { armarPayloadVacaciones } from '../../domain/licencias/payload';
import type { Fila } from '../../domain/licencias/tipos';
import { cabeceraConToken, tokenDeServicio } from '../legajo/credencial';
import { leerFilas } from './consultas';

/**
 * Cuentas de vacaciones del empleado con su período vacacional publicado y ya abierto (`hoy` es yyyy-MM-dd).
 * El período solicitable se elige después en el dominio (elegirPeriodoSolicitable).
 */
export const leerPeriodosDeVacaciones = (empleadoId: string, hoy: string): Promise<Fila[]> => {
  const fetch = `<entity name="new_vacaciones">
  <attribute name="new_vacacionesid" />
  <attribute name="new_name" />
  <attribute name="new_empleado" />
  <attribute name="createdon" />
  <attribute name="new_diasvacacionescorrespondientes" />
  <attribute name="new_totaldiassolicitados" />
  <attribute name="new_diasvacacionestomados" />
  <attribute name="new_diasvacacionespendientes" />
  <attribute name="new_periodovacacional" />
  <attribute name="new_diasvacacionesadicionales" />
  <attribute name="new_diaspendietesdelperiodoanterior" />
  <attribute name="new_fechahasta" />
  <attribute name="new_fechadesde" />
  <attribute name="new_penalidadesaplicadas" />
  <attribute name="new_diasfraccionadosacum" />
  <order attribute="new_name" descending="false" />
  <filter type="and">
    <condition attribute="statuscode" operator="eq" value="1" />
    <condition attribute="statecode" operator="eq" value="0" />
    <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
  </filter>
  <link-entity name="new_periodovacacionaldefinido" from="new_periodovacacionaldefinidoid" to="new_periodovacacional" link-type="inner" alias="ab">
    <attribute name="new_name" />
    <attribute name="new_fechahasta" />
    <attribute name="new_fechadesde" />
    <attribute name="new_fechaapertura" />
    <attribute name="new_fechavencimiento" />
    <filter type="and">
      <condition attribute="new_publicado" operator="eq" value="1" />
      <condition attribute="new_fechaapertura" operator="on-or-before" value="${escaparXml(hoy)}" />
    </filter>
  </link-entity>
</entity>`;
  return leerFilas('new_vacacioneses', fetch);
};

/** Solicitudes de vacaciones del empleado (new_licencia de segmento Vacaciones), de la más antigua a la más nueva. */
export const leerSolicitudesDeVacaciones = (empleadoId: string): Promise<Fila[]> => {
  const fetch = `<entity name="new_licencia">
  <attribute name="statuscode" />
  <attribute name="new_fechahasta" />
  <attribute name="new_fechadesde" />
  <attribute name="new_empleado" />
  <attribute name="new_diassolicitados" />
  <attribute name="new_diashabilessolicitados" />
  <attribute name="new_licenciaid" />
  <attribute name="new_fechadesolicitud" />
  <attribute name="createdon" />
  <attribute name="new_motivoderechazo" />
  <attribute name="new_cantidadhoraslicencia" />
  <attribute name="new_penalidadesgeneradas" />
  <attribute name="new_aprobador3" />
  <attribute name="new_aprobador2" />
  <attribute name="new_aprobador1" />
  <attribute name="new_aprobacion3" />
  <attribute name="new_aprobacion2" />
  <attribute name="new_aprobacionsupervisor" />
  <attribute name="new_comentarios" />
  <order attribute="new_fechadesde" descending="false" />
  <filter type="and">
    <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}" />
  </filter>
  <link-entity name="new_tipodelicencia" from="new_tipodelicenciaid" to="new_tipodelicencia" link-type="inner" alias="as">
    <filter type="and">
      <condition attribute="new_segmento" operator="eq" value="100000004" />
    </filter>
  </link-entity>
  <link-entity name="new_vacaciones" from="new_vacacionesid" to="new_vacaciones" link-type="outer" alias="aq">
    <attribute name="new_periodovacacional" />
    <link-entity name="new_periodovacacionaldefinido" from="new_periodovacacionaldefinidoid" to="new_periodovacacional" link-type="outer" alias="at" />
  </link-entity>
</entity>`;
  return leerFilas('new_licencias', fetch);
};

/** POST hrfactors/vacaciones. Sin reintentos. */
export const solicitarVacaciones = async (
  empleadoId: string,
  tipoVacacionesId: string,
  periodoCuentaId: string,
  desde: Date,
  hasta: Date,
  comentarios: string,
  hoy: string,
): Promise<unknown> => {
  const token = await tokenDeServicio();
  const resp = await requestConReintento({
    method: 'post',
    url: endpoints.vacaciones(),
    data: armarPayloadVacaciones(empleadoId, tipoVacacionesId, periodoCuentaId, desde, hasta, comentarios, hoy),
    headers: cabeceraConToken(token),
    reintentos: 0,
  });
  return resp.data;
};
