// Lectura de filas del CRM para el módulo. Todas las lecturas pasan por acá para tratar igual un 200 vacío:
// tras los reintentos es un fallo transitorio del backend, NO "no hay datos" (criterio del portal en useLegajoStore).
import { consultarFetchXml } from '../../config/api/fetchXml';
import type { Fila } from '../../domain/licencias/tipos';
import { tokenDeServicio } from '../legajo/credencial';

export const MSG_ERROR_CARGA_LICENCIAS = 'No pudimos cargar los datos. Por favor, volvé a intentar.';

/** Ejecuta un FetchXML y devuelve las filas. Lanza error si la respuesta no es un array. */
export const leerFilas = async (entidad: string, fetch: string): Promise<Fila[]> => {
  const token = await tokenDeServicio();
  const datos = await consultarFetchXml(entidad, fetch, token);
  if (!Array.isArray(datos)) throw new Error(MSG_ERROR_CARGA_LICENCIAS);
  return datos as Fila[];
};
