// Lectura y escritura del legajo del empleado.
// Port de Portal-Austral-Dev -> src/stores/useLegajoStore.ts (miLegajo y actualizacionLegajo).
import { requestConReintento } from '../../config/api/apiClient';
import { endpoints } from '../../config/api/endpoints';
import { consultarFetchXml, escaparXml } from '../../config/api/fetchXml';
import { armarPayloadLegajo } from '../../domain/legajo/payload';
import type { FormularioDatosPersonales } from '../../domain/legajo/formulario';
import { cabeceraConToken, tokenDeServicio } from './credencial';

// Adaptado del portal ("...recargá la página"): en la app no hay páginas que recargar.
export const MSG_ERROR_CARGA_LEGAJO = 'No pudimos cargar tus datos. Por favor, volvé a intentar.';

// Atributos de new_empleado que lee el portal en miLegajo (mismo orden y mismos nombres).
const ATRIBUTOS_LEGAJO = [
  'new_name', 'new_usuariocanvas', 'new_numerolegajo', 'new_posicin', 'new_correoelectronicoportal',
  'new_empresa', 'new_empleadoid', 'new_tipodocumento', 'new_nrodocumento', 'new_tipodeincorporacion',
  'new_telefonoparticular', 'new_telefonomovil', 'new_provincia', 'new_piso', 'new_categoria',
  'new_paisnacimiento', 'new_provincianacimiento', 'new_pais', 'new_nro', 'new_nombredepila',
  'new_localidad', 'new_genero', 'new_generootro', 'new_fechanacimiento', 'new_estadocivil', 'new_edad',
  'new_depto', 'new_cuitcuil', 'new_correoelectronicopersonal', 'new_usuarioportalrh', 'new_codigopostal',
  'new_calle', 'new_barrio', 'new_apellidos', 'new_extenciontelefonica', 'new_subdisciplina',
  'new_informacionadicional', 'new_nivel', 'new_tituloseducacionbasica', 'new_cantidadtotaldetesis',
  'new_canttesisdoctoralesdirigactualmente', 'new_canttesismaestriasdirigyconcult',
  'new_cantmaestriasquedirigeactualmente', 'new_canttesinasytrabfinales',
  'new_canttesinasytrabajosquedirigeactualmente', 'new_experienciaeneducacinadistancia', 'new_conicet',
  'new_programade', 'new_fechaingreso', 'new_habilitadocargadenovedadesdepago', 'new_segundanacionalidad',
  'new_sexo', 'new_generosegundni', 'new_denominacionareadepersonal',
  'new_dedicacionhorariasemanalainvestigacion', 'new_emaildeemergencia', 'new_nombredecontactodeemergencia',
  'new_celulardeemergencia', 'new_resumen', 'new_vinculodecontacto', 'new_tipodecontratacion',
  'new_antiguedadreconocida', 'new_fechadeantigedadreconocida', 'new_unidadorganizativa',
];

/**
 * Filas de new_empleado del empleado (statecode = 0). Lanza error si la respuesta no es un array:
 * un 200 vacío tras reintentar es un fallo transitorio del backend, NO "el empleado no tiene legajo",
 * y quien llama no debe pisar el legajo que ya tenía (comentario del portal).
 */
export const leerLegajo = async (empleadoId: string): Promise<Record<string, any>[]> => {
  const token = await tokenDeServicio();
  const atributos = ATRIBUTOS_LEGAJO.map((a) => `<attribute name='${a}'/>`).join('');
  const fetch =
    `<entity name='new_empleado'>${atributos}` +
    "<order attribute='new_numerolegajo' descending='false'/>" +
    "<filter type='and'>" +
    "<condition attribute='statecode' operator='eq' value='0'/>" +
    `<condition attribute='new_empleadoid' operator='eq' uitype='new_empleado' value='${escaparXml(empleadoId)}'/>` +
    '</filter></entity>';
  const datos = await consultarFetchXml('new_empleados', fetch, token);
  if (!Array.isArray(datos)) throw new Error(MSG_ERROR_CARGA_LEGAJO);
  return datos;
};

/**
 * PUT api/hrfactors/empleado. Sin reintentos (es una escritura).
 * Devuelve el cuerpo de la respuesta: el portal considera éxito solo si es "truthy" (`if (resultado)`).
 */
export const actualizarLegajo = async (empleadoId: string, datos: FormularioDatosPersonales): Promise<unknown> => {
  const token = await tokenDeServicio();
  const resp = await requestConReintento({
    method: 'put',
    url: endpoints.legajoEmpleado(),
    data: armarPayloadLegajo(empleadoId, datos),
    headers: cabeceraConToken(token),
    reintentos: 0,
  });
  return resp.data;
};
