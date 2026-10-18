// Esquemas de validación de los modales de Perfil > Formación. Reglas y mensajes: los de los modales del portal
// (Portal-Austral-Dev -> perfil/_components/formacion/modales/*). Los textos que el portal no define (formación
// posdoctoral y algunos de beca) están marcados como adaptados.
import * as yup from 'yup';
import {
  esFechaFutura,
  fechaOpcional,
  fechaRequerida,
  opcionOpcional,
  opcionRequerida,
  opcionABoolean,
} from './comun';
import {
  ESPECIALIDAD_OTRA,
  ESTADO_CERTIFICACION_FINALIZADO,
  ESTADO_FINALIZADO,
  IDIOMA_OTRO,
  ORIGEN_EXTERNA,
  ORIGEN_INTERNA,
  TIPO_FORMACION_ESPECIALIDAD_OTRO,
} from './formacionOpciones';
import { esOpcionOtras, type CategoriaTitulo } from './formacion';

const esOtraInstitucion = (opcion: any): boolean =>
  typeof opcion?.label === 'string' && opcion.label.toLowerCase().includes('otra');

const MSG_OBTENCION_ORDEN = 'El año de obtención debe ser mayor o igual al año de inicio de cursada';

/** Títulos de pregrado/grado, posgrado y formación posdoctoral. `exigirAdjunto`: el título todavía no tiene constancias. */
export const esquemaTitulo = (categoria: CategoriaTitulo, exigirAdjunto: boolean) => {
  const posdoctoral = categoria === 'posdoctoral';
  return yup.object({
    tipo: posdoctoral ? opcionOpcional() : opcionRequerida('El tipo es requerido'),
    denominacion: yup
      .string()
      .trim()
      .required(posdoctoral ? 'La denominación de la formación es requerida' : 'La denominación del título es requerida'),
    pais: opcionRequerida('El país es requerido'),
    institucion: opcionRequerida('La institución es requerida'),
    otraInstitucion: yup
      .string()
      .max(100, 'El nombre de la otra institución no puede exceder los 100 caracteres')
      .test('otra-requerida', 'La otra institución es requerida', function (valor) {
        return !esOtraInstitucion(this.parent.institucion) || Boolean(valor && valor.trim());
      }),
    anioInicio: opcionRequerida('El año de inicio es requerido'),
    estado: opcionRequerida('El estado es requerido'),
    anioObtencion: yup
      .mixed<any>()
      .nullable()
      .test('obtencion-requerida', 'El año de obtención es requerido cuando el estado es finalizado', function (valor) {
        const finalizado = !posdoctoral && Number(this.parent.estado?.value) === ESTADO_FINALIZADO;
        return !finalizado || Boolean(valor?.value);
      })
      .test('obtencion-orden', MSG_OBTENCION_ORDEN, function (valor) {
        const inicio = Number(this.parent.anioInicio?.value);
        const obtencion = Number(valor?.value);
        if (!inicio || !obtencion) return true;
        return obtencion >= inicio;
      }),
    tituloTesis: yup.string().max(200, 'El título de la tesis no puede exceder los 200 caracteres'),
    becado: posdoctoral ? opcionRequerida('Debe indicar si lo realizó con una beca') : opcionOpcional(),
    institucionFinanciadora: yup
      .string()
      .test(
        'financiadora-requerida',
        posdoctoral
          ? 'La institución financiadora es requerida'
          : 'La institución financiadora es requerida si realizó la carrera con beca',
        function (valor) {
          return opcionABoolean(this.parent.becado) !== true || Boolean(valor && valor.trim());
        },
      ),
    archivosAdjuntos: yup
      .mixed<any>()
      .test('adjunto-requerido', 'Debe adjuntar el título para guardarlo con estado Finalizado', function (valor) {
        if (!exigirAdjunto || posdoctoral) return true;
        if (Number(this.parent.estado?.value) !== ESTADO_FINALIZADO) return true;
        return Array.isArray(valor) && valor.length > 0;
      }),
  });
};

/** Especialidad certificada por organismo/s de salud. */
export const esquemaEspecialidad = yup.object({
  tipoFormacion: opcionRequerida('El tipo es requerido'),
  otroTipoFormacion: yup
    .string()
    .max(200, 'Máximo 200 caracteres')
    .test('otro-tipo', 'El otro tipo de formación es requerido', function (valor) {
      return Number(this.parent.tipoFormacion?.value) !== TIPO_FORMACION_ESPECIALIDAD_OTRO || Boolean(valor && valor.trim());
    }),
  especialidad: opcionRequerida('La especialidad es requerida'),
  otraEspecialidad: yup
    .string()
    .max(200, 'Máximo 200 caracteres')
    .test('otra-especialidad', 'La otra especialidad es requerida', function (valor) {
      return Number(this.parent.especialidad?.value) !== ESPECIALIDAD_OTRA || Boolean(valor && valor.trim());
    }),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida').test(
    'inicio-no-futura',
    'La fecha de inicio no puede ser mayor a la fecha actual',
    (valor) => !valor || !esFechaFutura(valor),
  ),
  estado: opcionRequerida('El estado es requerido'),
  fechaFin: fechaOpcional()
    .test('fin-requerida', 'La fecha de fin es requerida si el estado es finalizado', function (valor) {
      return Number(this.parent.estado?.value) !== ESTADO_FINALIZADO || Boolean(valor);
    })
    .test('fin-orden', 'La fecha de fin debe ser igual o posterior a la fecha de inicio', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      return !valor || !inicio || valor.getTime() >= inicio.getTime();
    })
    .test('fin-no-futura', 'La fecha de fin no puede ser mayor a la fecha actual', function (valor) {
      return Number(this.parent.estado?.value) !== ESTADO_FINALIZADO || !valor || !esFechaFutura(valor);
    }),
  anioObtencion: yup
    .mixed<any>()
    .nullable()
    .test('obtencion-requerida', 'El año de obtención es requerido si el estado es finalizado', function (valor) {
      return Number(this.parent.estado?.value) !== ESTADO_FINALIZADO || Boolean(valor?.value);
    })
    .test('obtencion-orden', 'El año de obtención no puede ser anterior al año de inicio', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      const obtencion = Number(valor?.value);
      return !inicio || !obtencion || obtencion >= inicio.getFullYear();
    })
    .test('obtencion-no-futura', 'El año de obtención no puede ser mayor a la fecha actual', function (valor) {
      const obtencion = Number(valor?.value);
      return !obtencion || obtencion <= new Date().getFullYear();
    }),
});

/** Certificaciones / Capacitaciones. */
export const esquemaCertificacion = yup.object({
  tipoCapacitacion: opcionRequerida('El origen de formación es requerido'),
  tipoFormacion: opcionRequerida('El tipo de formación es requerido'),
  segmento: opcionRequerida('El eje formativo es requerido'),
  otroTipoFormacion: yup
    .string()
    .max(200, 'Máximo 200 caracteres')
    .test('otro-tipo', 'Otro tipo de formación es requerido', function (valor) {
      return this.parent.tipoFormacion?.label !== 'Otro' || Boolean(valor && valor.trim());
    }),
  otroSegmento: yup.string().max(200, 'Máximo 200 caracteres'),
  denominacion: yup.string().trim().max(200, 'Máximo 200 caracteres').required('La denominación es requerida'),
  institucion: yup
    .string()
    .max(200, 'Máximo 200 caracteres')
    .test('institucion', 'La institución es requerida', function (valor) {
      return Number(this.parent.tipoCapacitacion?.value) !== ORIGEN_EXTERNA || Boolean(valor && valor.trim());
    }),
  area: yup
    .string()
    .max(200, 'Máximo 200 caracteres')
    .test('area', 'El área es requerida', function (valor) {
      return Number(this.parent.tipoCapacitacion?.value) !== ORIGEN_INTERNA || Boolean(valor && valor.trim());
    }),
  duracionMeses: yup
    .string()
    .test('duracion', 'La duración es requerida', function (valor) {
      return Number(this.parent.tipoCapacitacion?.value) !== ORIGEN_EXTERNA || Boolean(valor && valor.trim());
    })
    .test('duracion-max', 'El valor máximo permitido es 2.147.483.647', (valor) => !valor || Number(valor) <= 2147483647),
  cargaHoraria: yup
    .string()
    .test('carga', 'La carga horaria es requerida', function (valor) {
      return Number(this.parent.tipoCapacitacion?.value) !== ORIGEN_EXTERNA || Boolean(valor && valor.trim());
    })
    .test('carga-max', 'El valor máximo permitido es 2.147.483.647', (valor) => !valor || Number(valor) <= 2147483647),
  estado: opcionRequerida('El estado es requerido'),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida').test(
    'inicio-no-futura',
    'La fecha de inicio no puede ser mayor a la fecha actual',
    (valor) => !valor || !esFechaFutura(valor),
  ),
  fechaObtencion: fechaOpcional()
    .test('obtencion-requerida', 'La fecha de obtención es requerida', function (valor) {
      const { tipoCapacitacion, estado } = this.parent;
      const exige =
        Number(tipoCapacitacion?.value) === ORIGEN_EXTERNA && Number(estado?.value) === ESTADO_CERTIFICACION_FINALIZADO;
      return !exige || Boolean(valor);
    })
    .test('obtencion-orden', 'La fecha de obtención debe ser igual o posterior a la fecha de inicio', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      return !valor || !inicio || valor.getTime() >= inicio.getTime();
    })
    .test('obtencion-no-futura', 'La fecha de obtención no puede ser mayor a la fecha actual', function (valor) {
      const { tipoCapacitacion, estado } = this.parent;
      const exige =
        Number(tipoCapacitacion?.value) === ORIGEN_EXTERNA && Number(estado?.value) === ESTADO_CERTIFICACION_FINALIZADO;
      return !exige || !valor || !esFechaFutura(valor);
    }),
  fechaFin: fechaOpcional()
    .test('fin-orden', 'La fecha de finalización debe ser igual o posterior a la fecha de inicio', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      return !valor || !inicio || valor.getTime() >= inicio.getTime();
    })
    .test('fin-no-futura', 'La fecha de finalización no puede ser mayor a la fecha actual', function (valor) {
      return Number(this.parent.estado?.value) !== ESTADO_CERTIFICACION_FINALIZADO || !valor || !esFechaFutura(valor);
    })
    .test('fin-requerida', 'La fecha de finalización es requerida', function (valor) {
      const { tipoCapacitacion, estado } = this.parent;
      const exige =
        Number(tipoCapacitacion?.value) === ORIGEN_INTERNA && Number(estado?.value) === ESTADO_CERTIFICACION_FINALIZADO;
      return !exige || Boolean(valor);
    }),
});

/** Idioma. */
export const esquemaIdioma = yup.object({
  idioma: opcionRequerida('El idioma es requerido'),
  otroIdioma: yup
    .string()
    .max(100, 'Máximo 100 caracteres')
    .test('otro-idioma', 'El otro idioma es requerido', function (valor) {
      return Number(this.parent.idioma?.value) !== IDIOMA_OTRO || Boolean(valor && valor.trim());
    }),
  nivel: opcionRequerida('El nivel es requerido'),
});

/** Áreas de expertise - áreas de actuación. */
export const esquemaAreaExpertise = yup.object({
  agrupador: opcionRequerida('El agrupador es requerido'),
  area: opcionRequerida('El área es requerida'),
  actuacion: opcionRequerida('La actuación es requerida'),
  otraArea: yup.string().test('otra-area', 'Otra área es requerido', function (valor) {
    return !esOpcionOtras(this.parent.area) || Boolean(valor && valor.trim());
  }),
  otraActuacion: yup.string().test('otra-actuacion', 'Otra actuación es requerido', function (valor) {
    return !esOpcionOtras(this.parent.actuacion) || Boolean(valor && valor.trim());
  }),
});
