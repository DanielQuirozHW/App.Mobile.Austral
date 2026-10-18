// Payloads de escritura. Port de Portal-Austral-Dev -> src/stores/useLegajoStore.ts
// (actualizacionLegajo, cargarFamiliarXEmpleado, actualizarFamiliarEmpleado).
// Los tipos y redondeos (toString, Number, ?? 0) son los del portal: el backend los espera así.
import { aFechaApi } from './fechas';
import type { FormularioDatosPersonales } from './formulario';
import { unirTelefono } from './telefono';
import type { Opcion } from './tipos';

const valorDe = (opcion?: Partial<Opcion> | null): unknown => opcion?.value;
const comoTexto = (valor: unknown): string => (valor ? String(valor) : '');

/** Body del PUT api/hrfactors/empleado. */
export const armarPayloadLegajo = (empleadoId: string, datos: FormularioDatosPersonales) => ({
  new_empleadoid: empleadoId,
  new_apellidos: datos.new_apellidos || '',
  new_nombredepila: datos.new_nombredepila || '',
  new_estadocivil: valorDe(datos.estadoCivil) ? Number(valorDe(datos.estadoCivil)) : 0,
  new_telefonomovil: unirTelefono({
    pais: datos.telefonoMovilPais,
    ddn: datos.telefonoMovilDdn,
    numero: datos.telefonoMovilNumero,
  }),
  new_paisnacimiento: datos.paisNacimiento ? valorDe(datos.paisNacimiento) : '',
  new_calle: datos.calle || '',
  new_nro: comoTexto(datos.nroCalle),
  new_piso: comoTexto(datos.piso),
  new_depto: comoTexto(datos.depto),
  new_localidad: datos.localidad ? valorDe(datos.localidad) : '',
  new_codigopostal: comoTexto(datos.codigoPostal),
  new_provincia: datos.provincia ? valorDe(datos.provincia) : '',
  new_segundanacionalidad: datos.segundaNacionalidad ? valorDe(datos.segundaNacionalidad) : '',
  new_pais: datos.pais ? valorDe(datos.pais) : '',
  new_fechanacimiento: aFechaApi(datos.fechaNacimiento),
  new_emaildeemergencia: datos.emailEmergencia || '',
  new_nombredecontactodeemergencia: datos.nombreEmergencia || '',
  new_celulardeemergencia: comoTexto(datos.celularEmergencia),
  new_correoelectronicopersonal: datos.email || '',
  new_generosegundni: valorDe(datos.generoSegunDni) ?? 0,
  new_tipodocumento: valorDe(datos.new_tipodocumento) ?? 0,
  new_nrodocumento: comoTexto(datos.numeroDocumento),
  new_cuitcuil: comoTexto(datos.new_cuitcuil),
  new_vinculodecontacto: valorDe(datos.vinculoEmergencia) ?? 0,
});

/** Datos de un familiar tal como los manejan los modales (cónyuge e hijos/as). */
export interface DatosFamiliar {
  id?: string;
  nombreFamiliar: string;
  apellidoFamiliar: string;
  tipoDocFamiliar?: Partial<Opcion> | null;
  docFamiliar: string;
  tipoParentesco: Partial<Opcion>;
  generoHijos?: Partial<Opcion> | null;
  aCargo?: Partial<Opcion> | null;
  fechaNacimiento: Date | string | null;
}

/** Body del POST / PUT api/hrfactors/familiarEmpleado. El PUT agrega `new_familiardeempleadoid`. */
export const armarPayloadFamiliar = (empleadoId: string, datos: DatosFamiliar, incluirId: boolean) => ({
  ...(incluirId ? { new_familiardeempleadoid: datos.id } : {}),
  new_empleado: empleadoId,
  new_nombredepila: datos.nombreFamiliar || '',
  new_apellidos: datos.apellidoFamiliar || '',
  new_tipodocumento: valorDe(datos.tipoDocFamiliar) || 0,
  new_nrodocumento: datos.docFamiliar ? String(datos.docFamiliar) : '',
  new_tipodeparentesco: valorDe(datos.tipoParentesco) || 0,
  new_sexo: valorDe(datos.generoHijos) || 0,
  new_cargadefamilia: valorDe(datos.aCargo) || 0,
  new_fechanacimiento: aFechaApi(datos.fechaNacimiento),
});
