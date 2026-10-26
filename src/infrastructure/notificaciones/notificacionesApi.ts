// Lecturas y escrituras de Notificaciones. Port de Portal-Austral-Dev:
//   src/stores/useLegajoStore.ts -> getNotificacionesEmpleado (FetchXML sobre `task`)
//   src/hooks/useGetNotificaciones.ts -> putInactivarTarea (PUT api/hrfactors/inactivartarea)
import { endpointsNotificaciones } from '../../config/api/endpointsNotificaciones';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { tokenDeServicio } from '../legajo/credencial';
import { escribirRegistro } from '../perfil/perfilApi';

// Tipos de notificación que muestra el portal (new_tipodenotificacion).
const TIPOS_DE_NOTIFICACION = [100000000, 100000027, 100000028, 100000029, 100000030, 100000031];

/**
 * Tareas del CRM que el portal muestra al empleado: new_mostrarenportal = 1, de los tipos de arriba, cuyo "regarding"
 * es el empleado con ese correo de portal. Sin filtro de statecode: trae pendientes y leídas. Devuelve el cuerpo crudo.
 */
export const leerNotificacionesDeEmpleado = async (correoPortal: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const valores = TIPOS_DE_NOTIFICACION.map((tipo) => `<value>${tipo}</value>`).join('');
  const fetch =
    '<entity name="task">' +
    '<attribute name="subject"/>' +
    '<attribute name="statecode"/>' +
    '<attribute name="scheduledend"/>' +
    '<attribute name="createdon"/>' +
    '<attribute name="activityid"/>' +
    '<attribute name="statuscode"/>' +
    '<attribute name="new_tipodenotificacion"/>' +
    '<attribute name="new_mostrarenportal"/>' +
    '<attribute name="description"/>' +
    '<attribute name="new_plandetrabajoanual"/>' +
    '<order attribute="createdon" descending="true"/>' +
    '<filter type="and">' +
    '<filter type="and"><condition attribute="new_mostrarenportal" operator="eq" value="1"/></filter>' +
    `<condition attribute="new_tipodenotificacion" operator="in">${valores}</condition>` +
    '</filter>' +
    '<link-entity name="new_empleado" from="new_empleadoid" to="regardingobjectid" link-type="inner" alias="ab">' +
    '<filter type="and">' +
    `<condition attribute="new_correoelectronicoportal" operator="eq" value="${escaparXml(correoPortal)}"/>` +
    '</filter>' +
    '</link-entity>' +
    '</entity>';
  return consultarFetchXml('tasks', fetch, token);
};

/** Marca una notificación como leída (la inactiva). Sin reintentos: es una escritura. */
export const inactivarTarea = async (activityid: string): Promise<void> => {
  await escribirRegistro(endpointsNotificaciones.inactivarTarea(), 'put', { activityid });
};
