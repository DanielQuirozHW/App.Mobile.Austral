// Cónyuge e hijos/as, su documentación requerida y sus adjuntos.
// Port de Portal-Austral-Dev -> src/stores/useLegajoStore.ts:
// getFamiliarXEmpleado, cargarFamiliarXEmpleado, actualizarFamiliarEmpleado, eliminarFamiliarEmpleado,
// getAdjuntosFamiliaresXEmpleado, getDocumentosPorFamiliar, getAdjuntosXFamiliarXEmpleado y cargarAdjuntosPorFamiliares.
import { requestConReintento } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { armarPayloadFamiliar, type DatosFamiliar } from '../../domain/legajo/payload';
import { cabeceraConToken, tokenDeServicio } from './credencial';

/** Archivo elegido en el dispositivo, listo para subir. */
export interface ArchivoParaCarga {
  uri: string;
  name: string;
  type: string;
}

/** Filas de new_familiardeempleado. Devuelve el cuerpo crudo: si no es un array, quien llama conserva lo que tenía. */
export const leerFamiliares = async (empleadoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch = `<entity name="new_familiardeempleado">
    <attribute name="new_name"/>
    <attribute name="new_tipodocumento"/>
    <attribute name="new_nrodocumento"/>
    <attribute name="new_fechanacimiento"/>
    <attribute name="new_parentesco"/>
    <attribute name="new_empleado"/>
    <attribute name="new_familiardeempleadoid"/>
    <attribute name="new_tipodeparentesco"/>
    <attribute name="new_nombredepila"/>
    <attribute name="new_sexo"/>
    <attribute name="new_cargadefamilia"/>
    <attribute name="new_apellidos"/>
    <attribute name="new_adjunto"/>
    <order descending="false" attribute="new_name"/>
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>
    </filter>
  </entity>`;
  return consultarFetchXml('new_familiardeempleados', fetch, token);
};

/**
 * Notas (adjuntos) de todos los familiares del empleado, SIN el contenido.
 * DIFERENCIA CONSCIENTE con el portal: el portal pide también `documentbody` (todo el base64 de todos los
 * adjuntos) y después solo usa la cantidad. En el celular eso es costoso; el contenido se pide por documento
 * cuando el usuario abre un adjunto (leerAdjuntosDeDocumento).
 */
export const leerNotasDeFamiliares = async (empleadoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch = `<entity name="annotation">
    <attribute name="annotationid"/>
    <attribute name="subject"/>
    <attribute name="notetext"/>
    <attribute name="filename"/>
    <attribute name="mimetype"/>
    <attribute name="createdon"/>
    <order attribute="modifiedon" descending="false"/>
    <link-entity name="new_familiardeempleado" from="new_familiardeempleadoid" to="objectid" link-type="inner" alias="ag">
      <attribute name="new_tipodeparentesco"/>
      <attribute name="new_nombredepila"/>
      <attribute name="new_familiardeempleadoid"/>
      <filter type="and">
        <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>
      </filter>
    </link-entity>
  </entity>`;
  return consultarFetchXml('annotations', fetch, token);
};

/** Documentación requerida por familiar (DNI frente/dorso, CUD, etc.) con su marca de "cargado". */
export const leerDocumentosPorFamiliar = async (empleadoId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch = `<entity name="new_documentacionporfamiliardeempleado">
    <attribute name="new_name"/>
    <attribute name="createdon"/>
    <attribute name="new_tipodedocumentofamiliar"/>
    <attribute name="new_familiardeempleado"/>
    <attribute name="new_empleado"/>
    <attribute name="new_adjunto"/>
    <attribute name="new_documentacionporfamiliardeempleadoid"/>
    <order attribute="new_name" descending="false"/>
    <filter type="and">
      <condition attribute="statecode" operator="eq" value="0"/>
      <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>
    </filter>
    <link-entity name="new_familiardeempleado" from="new_familiardeempleadoid" to="new_familiardeempleado" link-type="inner" alias="ad">
      <filter type="and">
        <condition attribute="statecode" operator="eq" value="0"/>
      </filter>
      <attribute name="new_tipodeparentesco" />
    </link-entity>
  </entity>`;
  return consultarFetchXml('new_documentacionporfamiliardeempleados', fetch, token);
};

/** Archivos (con contenido en base64) de UN documento de familiar. */
export const leerAdjuntosDeDocumento = async (empleadoId: string, documentacionId: string): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch = `<entity name="annotation">
    <attribute name="annotationid"/>
    <attribute name="documentbody"/>
    <attribute name="filename"/>
    <attribute name="mimetype"/>
    <attribute name="createdon"/>
    <order attribute="subject" descending="false"/>
    <link-entity name="new_documentacionporfamiliardeempleado" from="new_documentacionporfamiliardeempleadoid" to="objectid" link-type="inner" alias="al">
      <filter type="and">
        <condition attribute="new_documentacionporfamiliardeempleadoid" operator="eq" uitype="new_documentacionporfamiliardeempleado" value="${escaparXml(documentacionId)}"/>
        <condition attribute="new_empleado" operator="eq" uitype="new_empleado" value="${escaparXml(empleadoId)}"/>
      </filter>
    </link-entity>
  </entity>`;
  return consultarFetchXml('annotations', fetch, token);
};

// ---------------------------------------------------------------------------
// Escrituras (sin reintentos)
// ---------------------------------------------------------------------------

const escribir = async (
  metodo: 'post' | 'put' | 'delete',
  data: unknown,
): Promise<unknown> => {
  const token = await tokenDeServicio();
  const resp = await requestConReintento({
    method: metodo,
    url: endpoints.familiarEmpleado(),
    data,
    headers: cabeceraConToken(token),
    reintentos: 0,
  });
  return resp.data;
};

export const crearFamiliar = (empleadoId: string, datos: DatosFamiliar): Promise<unknown> =>
  escribir('post', armarPayloadFamiliar(empleadoId, datos, false));

export const actualizarFamiliar = (empleadoId: string, datos: DatosFamiliar): Promise<unknown> =>
  escribir('put', armarPayloadFamiliar(empleadoId, datos, true));

export const eliminarFamiliar = (familiarId: string): Promise<unknown> => {
  if (!familiarId) throw new Error('Datos inválidos');
  return escribir('delete', { new_familiardeempleadoid: familiarId });
};

/**
 * Sube archivos a un documento de familiar (multipart, campo "file" por archivo, como el portal).
 * Devuelve el cuerpo de la respuesta; el portal trata un cuerpo vacío como fallo (`if (!result)`).
 */
export const cargarAdjuntosDeDocumento = async (
  documentacionId: string,
  archivos: ArchivoParaCarga[],
): Promise<unknown> => {
  if (!documentacionId) throw new Error('Datos inválidos');
  const token = await tokenDeServicio();
  const form = new FormData();
  archivos.forEach((archivo) => form.append('file', archivo as unknown as Blob));
  const resp = await requestConReintento({
    method: 'post',
    url: endpoints.adjuntoDocumentacionFamiliar(documentacionId),
    data: form,
    headers: { ...cabeceraConToken(token), 'Content-Type': 'multipart/form-data' },
    reintentos: 0,
    // La carga de archivos grandes puede tardar más que el timeout general.
    timeout: 120000,
  });
  return resp.data;
};
