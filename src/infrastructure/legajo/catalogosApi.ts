// Catálogos para los selects de Datos personales.
// Países y provincias: GET api/v1/catalogos/{clave} -> [{ id, nombre }] (como Portal-Austral-Dev -> catalogos.v1.ts).
// Localidades: el portal las deja en consultafetchs (carga todas con su provincia y filtra en el cliente);
// la app hace lo mismo para conservar la cascada País > Provincia > Localidad.
import { apiGet } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml } from '../../config/api/fetchXml';
import { mapearCatalogo, mapearLocalidad } from '../../domain/legajo/mapeo';
import type { Localidad, OpcionSelect } from '../../domain/legajo/tipos';
import { cabeceraConToken, tokenDeServicio } from './credencial';

const leerCatalogo = async (clave: string): Promise<OpcionSelect[]> => {
  const token = await tokenDeServicio();
  const resp = await apiGet<Array<{ id: string; nombre: string }>>(endpoints.catalogo(clave), {
    headers: cabeceraConToken(token),
    reintentarVacio: true,
  });
  // 204 (sin contenido) es válido: catálogo vacío.
  return Array.isArray(resp.data) ? resp.data.map(mapearCatalogo) : [];
};

export const obtenerPaises = (): Promise<OpcionSelect[]> => leerCatalogo('paises');

export const obtenerProvincias = (): Promise<OpcionSelect[]> => leerCatalogo('provincias');

export const obtenerLocalidades = async (): Promise<Localidad[]> => {
  const token = await tokenDeServicio();
  const fetch = `<entity name='new_localidad'>
    <attribute name='new_localidadid' />
    <attribute name='new_name' />
    <attribute name='createdon' />
    <attribute name='new_provincia' />
    <order attribute='new_name' descending='false' />
    <filter type='and'>
      <condition attribute='statecode' operator='eq' value='0'/>
    </filter>
  </entity>`;
  const datos = await consultarFetchXml('new_localidads', fetch, token);
  return Array.isArray(datos) ? datos.map(mapearLocalidad) : [];
};
