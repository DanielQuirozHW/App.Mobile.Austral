// Esquemas de validación. Los mensajes y reglas son los del portal:
//  - Datos personales: Portal-Austral-Dev -> src/app/(dashboard)/legajo/datos-personales/page.tsx (validacionSchema)
//  - Hijos/as: ModalHijos.tsx (validacionSchema)
//  - Cónyuge: ModalConyuge.tsx
import * as yup from 'yup';
import { esDocumentoAlfanumerico } from './opciones';

const MSG_TIPO_DOC = 'El tipo de documento es obligatorio';

/** Opción { value, label } obligatoria. `.nullable().required()` hace que un null avise en español (comentario del portal). */
const opcionObligatoria = (mensaje: string) =>
  yup
    .object()
    .shape({ value: yup.mixed().required(mensaje) })
    .nullable()
    .required(mensaje);

// Documento: alfanumérico (máx. 20) para D.E./Pasaporte/Documento Extranjero; 8 dígitos para el resto.
const numeroDocumentoSegunTipo = (tipoArray: any[], schema: yup.StringSchema, mensajes: {
  soloNumeros: string;
  largo: string;
  obligatorio: string;
  exacto: boolean;
}) => {
  const tipo = Array.isArray(tipoArray) ? tipoArray[0] : tipoArray;
  if (esDocumentoAlfanumerico(tipo?.label)) {
    return schema
      .matches(/^[a-zA-Z0-9]*$/, 'Solo letras y números')
      .max(20, 'Máximo 20 caracteres')
      .required(mensajes.obligatorio);
  }
  return mensajes.exacto
    ? schema.matches(/^\d{8}$/, mensajes.largo).required(mensajes.obligatorio)
    : schema
        .matches(/^\d+$/, mensajes.soloNumeros)
        .length(8, mensajes.largo)
        .required(mensajes.obligatorio);
};

const fechaNoFutura = (mensajeObligatoria: string, mensajeFutura?: string) => {
  let schema = yup
    .date()
    .nullable()
    .typeError(mensajeObligatoria)
    .required(mensajeObligatoria);
  if (mensajeFutura) {
    schema = schema.test('no-futura', mensajeFutura, (valor) => !valor || valor.getTime() <= Date.now());
  }
  return schema;
};

/** Formulario principal de Datos personales. */
export const esquemaDatosPersonales = yup.object({
  new_nombredepila: yup.string().trim().required('El nombre es obligatorio'),
  new_apellidos: yup.string().trim().required('El apellido es obligatorio'),
  new_tipodocumento: opcionObligatoria(MSG_TIPO_DOC),
  numeroDocumento: yup.string().when('new_tipodocumento', (tipoArray: any[], schema: yup.StringSchema) =>
    numeroDocumentoSegunTipo(tipoArray, schema, {
      soloNumeros: '',
      largo: 'Debe contener exactamente 8 dígitos (solo números)',
      obligatorio: 'El número de documento es obligatorio',
      exacto: true,
    }),
  ),
  new_cuitcuil: yup
    .string()
    .matches(/^\d{11}$/, 'El CUIL debe contener exactamente 11 dígitos sin guiones')
    .required('El CUIT/CUIL es obligatorio'),
  calle: yup.string().trim().required('La calle es obligatoria'),
  // El campo de texto entrega un string: vacío se trata como faltante (mensaje de obligatorio) y no como NaN.
  nroCalle: yup
    .number()
    .transform((valor, original) => (original === '' || original === null ? undefined : valor))
    .typeError('Debe ingresar un número')
    .required('El número de calle es obligatorio'),
  // Opcional, pero SIEMPRE nullable: el formulario le asigna null (legajo sin localidad y cambio de provincia).
  localidad: yup
    .object({ value: yup.mixed(), label: yup.string().nullable() })
    .nullable(),
  codigoPostal: yup
    .string()
    .required('El código postal es obligatorio')
    .matches(/^[a-zA-Z0-9]*$/, 'Solo se permiten letras y números')
    .max(10, 'El código postal no puede exceder los 10 caracteres'),
  provincia: opcionObligatoria('La provincia es obligatoria'),
  pais: opcionObligatoria('El país es obligatorio'),
  telefonoMovilPais: yup
    .string()
    .required('El código de país es obligatorio')
    .matches(/^[0-9]{2,3}$/, 'Debe tener entre 2 y 3 dígitos'),
  telefonoMovilDdn: yup
    .string()
    .required('El DDN es obligatorio')
    .matches(/^[0-9]{2,4}$/, 'Debe tener entre 2 y 4 dígitos'),
  telefonoMovilNumero: yup
    .string()
    .required('El número es obligatorio')
    .matches(/^[0-9]{6,8}$/, 'Debe tener entre 6 y 8 dígitos'),
  celularEmergencia: yup
    .string()
    .required('El celular de emergencia es obligatorio')
    .max(100, 'El celular de emergencia no puede exceder los 100 caracteres'),
  emailEmergencia: yup
    .string()
    .email('Debe ingresar un email válido')
    .required('El email de contacto de emergencia es obligatorio'),
  vinculoEmergencia: opcionObligatoria('El vínculo de contacto es obligatorio'),
  generoSegunDni: opcionObligatoria('El sexo según DNI es obligatorio'),
  email: yup.string().email('Debe ingresar un email válido').required('El email personal es obligatorio'),
  fechaNacimiento: fechaNoFutura('La fecha de nacimiento es obligatoria'),
  estadoCivil: opcionObligatoria('El estado civil es obligatorio'),
});

/** Cónyuge (ModalConyuge). */
export const esquemaConyuge = yup.object({
  apellido: yup.string().trim().required('El apellido del cónyuge es obligatorio'),
  nombre: yup.string().trim().required('El nombre del cónyuge es obligatorio'),
  tipoDoc: opcionObligatoria(MSG_TIPO_DOC),
  docFamiliar: yup.string().when('tipoDoc', (tipoArray: any[], schema: yup.StringSchema) =>
    numeroDocumentoSegunTipo(tipoArray, schema, {
      soloNumeros: 'Solo debe contener números',
      largo: 'Debe contener exactamente 8 dígitos',
      obligatorio: 'El número de documento del cónyuge es obligatorio',
      exacto: false,
    }),
  ),
  fechaNacimiento: fechaNoFutura(
    'La fecha de nacimiento del cónyuge es obligatoria',
    'La fecha de nacimiento debe ser anterior a hoy',
  ),
});

/** Hijo/a (ModalHijos). */
export const esquemaHijo = yup.object({
  nombreFamiliar: yup.string().trim().required('El nombre del hijo es obligatorio'),
  apellidoFamiliar: yup.string().trim().required('El apellido del hijo es obligatorio'),
  tipoDocFamiliar: opcionObligatoria(MSG_TIPO_DOC),
  docFamiliar: yup.string().when('tipoDocFamiliar', (tipoArray: any[], schema: yup.StringSchema) =>
    numeroDocumentoSegunTipo(tipoArray, schema, {
      soloNumeros: 'Solo debe contener números',
      largo: 'Debe contener exactamente 8 dígitos',
      obligatorio: 'El número de documento es obligatorio',
      exacto: false,
    }),
  ),
  generoHijos: opcionObligatoria('El sexo es obligatorio'),
  aCargo: opcionObligatoria('Debe indicar si el hijo está a cargo'),
  fechaNacimiento: fechaNoFutura(
    'La fecha de nacimiento del hijo es obligatoria',
    'La fecha de nacimiento debe ser anterior a hoy',
  ),
});
