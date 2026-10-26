// Documentación requerida del empleado y sus adjuntos.
// Port de Portal-Austral-Dev -> src/stores/useLegajoStore.ts: getDocumentosEmpleado, getAdjuntosXEmpleado y
// cargarAdjuntoLegajoEmpleado.
import { requestConReintento } from '../../config/api/apiClient';
import { endpointsDocumentacion } from '../../config/api/endpointsDocumentacion';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { cabeceraConToken, tokenDeServicio } from '../legajo/credencial';
import type { ArchivoParaCarga } from '../legajo/familiaresApi';

/** Filas de new_documentacionporempleado del empleado. Devuelve el cuerpo crudo (si no es array, quien llama conserva lo que tenía). */
export const leerDocumentosDeEmpleado = async (empleadoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch = `<entity name="new_documentacionporempleado">
    <attribute name="new_name"/>
    <attribute name="createdon"/>
    <attribute name="new_tipodeempleado"/>
    <attribute name="new_requerido"/>
    <attribute name="new_ingresante"/>
    <attribute name="new_empleado"/>
    <attribute name="new_documento"/>
    <attribute name="new_descripcion"/>
    <attribute name="new_documentacionporempleadoid"/>
    <attribute name="new_adjunto"/>
    <attribute name="new_fechadecarga"/>
    <order attribute="new_name" descending="false"/>
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>
    </filter>
    <link-entity name="new_documentacion" from="new_documentacionid" to="new_documento" link-type="inner" alias="ba">
      <attribute name="modifiedon"/>
      <attribute name="createdon"/>
    </link-entity>
    <link-entity name="new_empleado" from="new_empleadoid" to="new_empleado" link-type="inner" alias="al">
      <attribute name="new_tipodecontratacion"/>
    </link-entity>
  </entity>`;
  return consultarFetchXml('new_documentacionporempleados', fetch, token);
};

/**
 * Archivos (con contenido en base64) de UN documento requerido, buscado por el id de new_documentacion.
 * DIFERENCIA CONSCIENTE con el portal: su consulta lleva fijo el nombre de una persona en el atributo `uiname`
 * de la condición; acá no se manda (el filtro real es el valor del id).
 */
export const leerAdjuntosDeDocumentoEmpleado = async (empleadoId: string, documentoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch = `<entity name="new_documentacionporempleado">
    <attribute name="new_name"/>
    <attribute name="createdon"/>
    <attribute name="new_tipodeempleado"/>
    <attribute name="new_requerido"/>
    <attribute name="new_ingresante"/>
    <attribute name="new_empleado"/>
    <attribute name="new_documento"/>
    <attribute name="new_descripcion"/>
    <attribute name="new_documentacionporempleadoid"/>
    <order attribute="new_name" descending="false"/>
    <filter type="and">
      <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>
    </filter>
    <link-entity name="new_documentacion" from="new_documentacionid" to="new_documento" link-type="inner" alias="au">
      <filter type="and">
        <condition attribute="new_documentacionid" operator="eq" uitype="new_documentacion" value="${escaparXml(documentoId)}"/>
        <condition attribute="statecode" operator="eq" value="0"/>
      </filter>
    </link-entity>
    <link-entity name="annotation" from="objectid" to="new_documentacionporempleadoid" link-type="inner" alias="av">
      <attribute name="annotationid"/>
      <attribute name="documentbody"/>
      <attribute name="filename"/>
      <attribute name="mimetype"/>
      <attribute name="createdon"/>
    </link-entity>
  </entity>`;
  return consultarFetchXml('new_documentacionporempleados', fetch, token);
};

/**
 * Sube archivos a un documento requerido del empleado (multipart, campo "file" por archivo, como el portal).
 * Sin reintentos: es una escritura.
 */
export const cargarAdjuntosDeEmpleado = async (
  documentacionEmpleadoId: string,
  archivos: ArchivoParaCarga[],
): Promise<unknown> => {
  if (!documentacionEmpleadoId) throw new Error('Datos inválidos');
  const token = await tokenDeServicio();
  const form = new FormData();
  archivos.forEach((archivo) => form.append('file', archivo as unknown as Blob));
  const resp = await requestConReintento({
    method: 'post',
    url: endpointsDocumentacion.adjuntoDocumentacionEmpleado(documentacionEmpleadoId),
    data: form,
    headers: { ...cabeceraConToken(token), 'Content-Type': 'multipart/form-data' },
    reintentos: 0,
    // La carga de archivos grandes puede tardar más que el timeout general.
    timeout: 120000,
  });
  return resp.data;
};
