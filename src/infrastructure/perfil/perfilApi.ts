// Lecturas y escrituras genéricas de Perfil. Los hooks del portal (hooks/formacion/*, hooks/trayectoria/*) repiten el mismo
// patrón: FetchXML por empleado para leer y POST / PUT / DELETE a api/hrfactors/* para escribir.
import { requestConReintento } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { cabeceraConToken, tokenDeServicio } from '../legajo/credencial';
import type { ArchivoParaCarga } from '../legajo/familiaresApi';

export interface ConsultaDeEmpleado {
  /** Nombre de la colección (plural), primer parámetro de consultafetchs. */
  coleccion: string;
  /** Nombre de la entidad (singular), el de <entity name=...>. */
  entidad: string;
  atributos: string[];
  /** Columna que apunta al empleado (new_empleado o new_empleadoid). */
  campoEmpleado: string;
  empleadoId: string;
  /** Columna de orden. Por defecto createdon. */
  orden?: string;
  descendente?: boolean;
  /** Estado del registro: 0 activo (por defecto) o 1 inactivo (los "históricos" de nombramientos del portal). */
  statecode?: 0 | 1;
  /** Condiciones extra dentro del <filter>. */
  filtrosExtra?: string;
  /** Fragmentos extra dentro de <entity> (link-entity, por ejemplo). */
  extra?: string;
}

/** Filas de una entidad que cuelga del empleado (activas, statecode = 0, salvo que se pida otro). Devuelve el cuerpo crudo. */
export const leerRegistrosDeEmpleado = async (consulta: ConsultaDeEmpleado): Promise<unknown> => {
  const token = await tokenDeServicio();
  const atributos = consulta.atributos.map((a) => `<attribute name="${a}"/>`).join('');
  const fetch =
    `<entity name="${consulta.entidad}">${atributos}` +
    `<order attribute="${consulta.orden ?? 'createdon'}" descending="${consulta.descendente ? 'true' : 'false'}"/>` +
    '<filter type="and">' +
    `<condition attribute="statecode" operator="eq" value="${consulta.statecode ?? 0}"/>` +
    `<condition attribute="${consulta.campoEmpleado}" operator="eq" uitype="new_empleado" value="${escaparXml(consulta.empleadoId)}"/>` +
    `${consulta.filtrosExtra ?? ''}</filter>${consulta.extra ?? ''}</entity>`;
  return consultarFetchXml(consulta.coleccion, fetch, token);
};

/** Catálogo (lista de filas activas) sin filtro de empleado. */
export const leerCatalogoFetchXml = async (
  coleccion: string,
  entidad: string,
  atributos: string[],
  orden: string | null,
  filtrosExtra = '',
): Promise<unknown> => {
  const token = await tokenDeServicio();
  const fetch =
    `<entity name="${entidad}">${atributos.map((a) => `<attribute name="${a}"/>`).join('')}` +
    (orden ? `<order attribute="${orden}" descending="false"/>` : '') +
    `<filter type="and"><condition attribute="statecode" operator="eq" value="0"/>${filtrosExtra}</filter></entity>`;
  return consultarFetchXml(coleccion, fetch, token);
};

/** POST / PUT / DELETE sin reintentos (son escrituras). Devuelve el cuerpo de la respuesta. */
export const escribirRegistro = async (
  url: string,
  metodo: 'post' | 'put' | 'delete',
  data: unknown,
): Promise<unknown> => {
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

/** Sube archivos (multipart, campo "file" por archivo, como el portal). Devuelve el cuerpo de la respuesta. */
export const subirArchivos = async (url: string, archivos: ArchivoParaCarga[]): Promise<unknown> => {
  const token = await tokenDeServicio();
  const form = new FormData();
  archivos.forEach((archivo) => form.append('file', archivo as unknown as Blob));
  const resp = await requestConReintento({
    method: 'post',
    url,
    data: form,
    headers: { ...cabeceraConToken(token), 'Content-Type': 'multipart/form-data' },
    reintentos: 0,
    // La carga de archivos grandes puede tardar más que el timeout general.
    timeout: 120000,
  });
  return resp.data;
};

/** PUT api/hrfactors/empleado con los campos sueltos que cambia Perfil (nivel básico, links). */
export const actualizarEmpleado = (data: Record<string, unknown>): Promise<unknown> =>
  escribirRegistro(endpoints.legajoEmpleado(), 'put', data);
