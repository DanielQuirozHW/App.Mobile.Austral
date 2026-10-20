// Consultas FetchXML al CRM a través de la API (POST api/consultafetchs).
// Port del patrón que repite Portal-Austral-Dev -> src/stores/useLegajoStore.ts en cada lectura:
//   apiPost(`${UrlApi}api/consultafetchs`, { entidad, fetch }, { headers: Bearer, reintentarVacio: true, reintentos: 3 })
import { apiPost } from './apiClient';
import { endpoints } from './endpoints';

/** Los ids y correos van dentro de XML: se escapan para que no puedan romper la consulta. */
export const escaparXml = (valor: string): string =>
  String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/**
 * Ejecuta un FetchXML. Devuelve el cuerpo tal cual: si el backend dio un 200 vacío tras los reintentos,
 * NO es un array y quien llama decide qué hacer (en el portal, eso no equivale a "sin datos").
 */
export const consultarFetchXml = async (entidad: string, fetch: string, token: string): Promise<unknown> => {
  const resp = await apiPost<unknown>(
    endpoints.consultaFetchs(),
    { entidad, fetch },
    { headers: { Authorization: `Bearer ${token}` }, reintentarVacio: true, reintentos: 3 },
  );
  return resp.data;
};

/**
 * Igual que consultarFetchXml, pero contra el endpoint singular (api/consultafetch). El portal lo usa en las dos
 * lecturas de proyectos de investigación (propios y como participante), que mandan el FetchXML completo con <fetch>.
 */
export const consultarFetchXmlSingular = async (entidad: string, fetch: string, token: string): Promise<unknown> => {
  const resp = await apiPost<unknown>(
    endpoints.consultaFetch(),
    { entidad, fetch },
    { headers: { Authorization: `Bearer ${token}` }, reintentarVacio: true, reintentos: 3 },
  );
  return resp.data;
};
