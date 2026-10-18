// Esquemas de validación de los modales de Perfil > Trayectoria profesional.
// Reglas y mensajes: los de los modales del portal (Portal-Austral-Dev -> perfil/_components/trayectoria/*).
import * as yup from 'yup';
import { esFechaFutura, fechaOpcional, fechaRequerida, opcionOpcional, opcionRequerida } from './comun';
import { DEDICACION_TOTAL, MAXIMO_ENTERO, SECTOR_OTRO } from './trayectoriaOpciones';

const MSG_300 = 'Máximo 300 caracteres';

const indiceMes = (f: Date): number => f.getFullYear() * 12 + f.getMonth();

/** Experiencia laboral fuera del ámbito académico. */
export const esquemaExperiencia = yup.object({
  cargo: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El cargo es requerido'),
  institucion: yup
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres')
    .required('La institución/empresa es requerida'),
  sector: opcionRequerida('El sector/industria es requerido'),
  otroSector: yup
    .string()
    .max(200, 'Máximo 200 caracteres')
    .test('otro-sector', 'El sector/industria es requerido', function (valor) {
      return Number(this.parent.sector?.value) !== SECTOR_OTRO || Boolean(valor && valor.trim());
    }),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida')
    .test(
      'inicio-no-futura',
      'La fecha de inicio no puede ser mayor a la fecha actual',
      (valor) => !valor || !esFechaFutura(valor),
    )
    .test('inicio-orden', 'La fecha de inicio no puede ser mayor a la fecha de fin', function (valor) {
      const fin = this.parent.fechaFin as Date | null;
      return !valor || !fin || valor.getTime() <= fin.getTime();
    }),
  fechaFin: fechaOpcional()
    .test('fin-no-futura', 'La fecha de fin no puede ser mayor a la fecha actual', (valor) => !valor || !esFechaFutura(valor))
    .test('fin-orden', 'La fecha de fin no puede ser menor a la fecha de inicio', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      return !valor || !inicio || valor.getTime() >= inicio.getTime();
    }),
  dedicacion: yup
    .string()
    .required('La dedicación horaria semanal es requerida')
    .test('entero', 'Debe ser un número entero', (valor) => !valor || Number.isInteger(Number(valor)))
    .test('minimo', 'Debe ser mayor o igual a 0', (valor) => !valor || Number(valor) >= 0)
    .test('maximo', 'No puede ser mayor a 40 horas semanales', (valor) => !valor || Number(valor) <= 40),
  personasACargo: yup
    .string()
    .test('entero', 'Debe ser un número entero', (valor) => !valor || Number.isInteger(Number(valor)))
    .test('minimo', 'Debe ser mayor o igual a 0', (valor) => !valor || Number(valor) >= 0)
    .test('maximo', 'El máximo permitido es 2.147.483.647', (valor) => !valor || Number(valor) <= MAXIMO_ENTERO),
  responsabilidades: yup.string().max(300, MSG_300),
  logros: yup.string().max(300, MSG_300),
});

/** Consultorías externas. */
export const esquemaConsultoria = yup.object({
  tema: yup.string().trim().max(300, MSG_300).required('El tema es obligatorio'),
  cliente: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El cliente es obligatorio'),
  fechaInicio: fechaRequerida('La fecha de inicio es obligatoria'),
  fechaFin: fechaOpcional().test('fin-orden', 'La fecha de fin no puede ser menor a la fecha de inicio', function (valor) {
    const inicio = this.parent.fechaInicio as Date | null;
    return !valor || !inicio || valor.getTime() >= inicio.getTime();
  }),
  tipoDedicacion: opcionRequerida('El tipo de dedicación es obligatorio'),
  dedicacion: yup
    .string()
    .required('La dedicación horaria es obligatoria')
    .test('minimo', 'La dedicación horaria debe ser mayor o igual a 0', (valor) => !valor || Number(valor) >= 0)
    .test('maximo', 'La dedicación horaria no puede exceder las 40 horas', function (valor) {
      const total = Number(this.parent.tipoDedicacion?.value) === DEDICACION_TOTAL;
      return total || !valor || Number(valor) <= 40;
    }),
  financiamiento: opcionOpcional(),
  resultados: yup.string().max(1000, 'Máximo 1000 caracteres'),
});

/** Comités profesionales o técnicos. */
export const esquemaComite = yup.object({
  nombre: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El nombre del comité es requerido'),
  cargo: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El cargo es requerido'),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida').test(
    'inicio-no-futura',
    'La fecha de inicio no puede ser mayor a la fecha actual',
    (valor) => !valor || !esFechaFutura(valor),
  ),
  fechaFin: fechaOpcional()
    .test('fin-no-futura', 'La fecha de fin no puede ser mayor a la fecha actual', (valor) => !valor || !esFechaFutura(valor))
    .test('fin-orden', 'La fecha de fin no puede ser menor a la fecha de inicio', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      return !valor || !inicio || valor.getTime() >= inicio.getTime();
    }),
  ambito: opcionRequerida('El ámbito es requerido'),
  contribuciones: yup.string().max(1000, 'Máximo 1000 caracteres'),
});

/** Licencia profesional / membresías / asociaciones. Las fechas son mes y año. */
export const esquemaLicenciaProfesional = yup.object({
  tipo: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El tipo es requerido'),
  organismo: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El organismo emisor es requerido'),
  fechaObtencion: fechaRequerida('La fecha de obtención es requerida').test(
    'obtencion-no-futura',
    'La fecha de obtención no puede ser mayor a la fecha actual',
    (valor) => !valor || !esFechaFutura(valor),
  ),
  vigenciaHasta: fechaOpcional().test(
    'vigencia-orden',
    'La vigencia debe ser posterior a la fecha de obtención',
    function (valor) {
      const obtencion = this.parent.fechaObtencion as Date | null;
      return !valor || !obtencion || indiceMes(valor) > indiceMes(obtencion);
    },
  ),
});

/** Reconocimientos profesionales. */
export const esquemaReconocimiento = yup.object({
  tipo: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El tipo de reconocimiento es obligatorio'),
  nombre: yup.string().trim().max(200, 'Máximo 200 caracteres').required('El nombre del reconocimiento es obligatorio'),
  institucion: yup
    .string()
    .trim()
    .max(200, 'Máximo 200 caracteres')
    .required('La institución otorgante es obligatoria'),
  ambito: opcionRequerida('El ámbito es obligatorio'),
  fecha: fechaRequerida('La fecha de otorgamiento es obligatoria').test(
    'fecha-no-futura',
    'La fecha de otorgamiento no puede ser mayor a la fecha actual',
    (valor) => !valor || !esFechaFutura(valor),
  ),
});
