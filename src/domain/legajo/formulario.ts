// Valores del formulario de Datos personales y su hidratación desde el legajo.
// Port de Portal-Austral-Dev -> src/app/(dashboard)/legajo/datos-personales/page.tsx
// (defaultValues, mapearLegajoAForm y la hidratación del teléfono).
import { parsearFecha } from './fechas';
import { partirTelefono } from './telefono';
import type { Localidad, MiLegajo, Opcion } from './tipos';

/** Opción elegida en un select; null si no hay selección. */
export type OpcionONull = Opcion | null;

export interface FormularioDatosPersonales {
  // Identidad
  new_apellidos: string;
  new_nombredepila: string;
  generoSegunDni: OpcionONull;
  new_tipodocumento: OpcionONull;
  numeroDocumento: string;
  new_cuitcuil: string;
  estadoCivil: OpcionONull;
  paisNacimiento: OpcionONull;
  fechaNacimiento: Date | null;
  segundaNacionalidad: OpcionONull;
  // Contacto
  telefonoMovilPais: string;
  telefonoMovilDdn: string;
  telefonoMovilNumero: string;
  email: string;
  // Domicilio real
  calle: string;
  nroCalle: string;
  piso: string;
  depto: string;
  codigoPostal: string;
  pais: OpcionONull;
  provincia: OpcionONull;
  localidad: OpcionONull;
  // Contacto de emergencia
  nombreEmergencia: string;
  celularEmergencia: string;
  emailEmergencia: string;
  vinculoEmergencia: OpcionONull;
}

export const formularioVacio = (): FormularioDatosPersonales => ({
  new_apellidos: '',
  new_nombredepila: '',
  generoSegunDni: null,
  new_tipodocumento: null,
  numeroDocumento: '',
  new_cuitcuil: '',
  estadoCivil: null,
  paisNacimiento: null,
  fechaNacimiento: null,
  segundaNacionalidad: null,
  telefonoMovilPais: '',
  telefonoMovilDdn: '',
  telefonoMovilNumero: '',
  email: '',
  calle: '',
  nroCalle: '',
  piso: '',
  depto: '',
  codigoPostal: '',
  pais: null,
  provincia: null,
  localidad: null,
  nombreEmergencia: '',
  celularEmergencia: '',
  emailEmergencia: '',
  vinculoEmergencia: null,
});

/** Una opción sin código es "sin selección": los selects y la validación esperan null. */
export const opcionONull = (opcion?: Partial<Opcion> | null): OpcionONull => {
  if (!opcion) return null;
  const { value } = opcion;
  if (value === null || value === undefined || value === '') return null;
  return { value, label: opcion.label ?? '' };
};

const texto = (valor: unknown): string => (valor === null || valor === undefined ? '' : String(valor));

/** Si el CRM solo devolvió el id de la localidad, la etiqueta se completa con el catálogo. */
const completarEtiquetaLocalidad = (opcion: OpcionONull, localidades: Localidad[]): OpcionONull => {
  if (!opcion || opcion.label) return opcion;
  const encontrada = localidades.find((l) => l.value === opcion.value);
  return encontrada ? { value: opcion.value, label: encontrada.label } : opcion;
};

/** Arma los valores del formulario a partir del legajo. */
export const legajoAFormulario = (leg: MiLegajo, localidades: Localidad[] = []): FormularioDatosPersonales => {
  const telefono = partirTelefono(leg.telefonoMovil);
  return {
    new_apellidos: texto(leg.new_apellidos),
    new_nombredepila: texto(leg.new_nombredepila),
    generoSegunDni: opcionONull(leg.generoSegunDni),
    new_tipodocumento: opcionONull(leg.new_tipodocumento),
    numeroDocumento: texto(leg.numeroDocumento).trim(),
    new_cuitcuil: texto(leg.new_cuitcuil),
    estadoCivil: opcionONull(leg.estadoCivil),
    paisNacimiento: opcionONull(leg.paisNacimiento),
    fechaNacimiento: parsearFecha(leg.fechaNacimiento),
    segundaNacionalidad: opcionONull(leg.segundaNacionalidad),
    telefonoMovilPais: telefono.pais,
    telefonoMovilDdn: telefono.ddn,
    telefonoMovilNumero: telefono.numero,
    email: texto(leg.email),
    calle: texto(leg.calle),
    nroCalle: texto(leg.nroCalle),
    piso: texto(leg.piso),
    depto: texto(leg.depto),
    codigoPostal: texto(leg.codigoPostal),
    pais: opcionONull(leg.pais),
    provincia: opcionONull(leg.provincia),
    localidad: completarEtiquetaLocalidad(opcionONull(leg.localidad), localidades),
    nombreEmergencia: texto(leg.nombreEmergencia),
    celularEmergencia: texto(leg.celularEmergencia),
    emailEmergencia: texto(leg.emailEmergencia),
    vinculoEmergencia: opcionONull(leg.vinculoEmergencia),
  };
};
