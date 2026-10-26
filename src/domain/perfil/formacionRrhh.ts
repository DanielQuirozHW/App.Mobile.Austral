// Perfil > Investigación > Actividad I+D > Formación de recursos humanos: formación de tesistas y dirección de
// investigadores y/o becarios.
// Port de Portal-Austral-Dev -> perfil/investigacion/actividad-i+d/formacion-rrhh/page.tsx,
// perfil/_components/investigacion/actividad-i+d/formacion-rrhh/modales/{ModalTesistas,ModalDireccion}.tsx,
// hooks/investigacion-perfil/{useGetFormacionInvestigacionRRHH,useCargarEditarFormacionTesistas,
// useCargarEditarInvestigadoresBecarios}.ts y columns/investigacion/columnsTesistas.tsx.
import * as yup from 'yup';
import type { Opcion, OpcionSelect } from '../legajo/tipos';
import { esValor, tieneValor } from './afiliaciones';
import {
  booleanAOpcion,
  esFechaFutura,
  fechaDeFila,
  fechaOpcional,
  fechaRequerida,
  opcionABoolean,
  opcionDeFila,
  opcionDeLista,
  opcionRequerida,
  texto,
  type Fila,
  type OpcionDeLista,
  type OpcionONull,
} from './comun';
import { diaADocenciaApi, opcionDeCatalogo } from './docencia';

// ---------------------------------------------------------------------------
// Listas fijas (las mismas que los selects del portal)
// ---------------------------------------------------------------------------

const UA = 100000000;
const OTRO = 100000001;

export const PERTENENCIA_RRHH: OpcionDeLista[] = [
  { value: UA, label: 'Universidad Austral' },
  { value: OTRO, label: 'Otro' },
];

export const FORMACION_TESISTA: OpcionDeLista[] = [
  { value: 100000000, label: 'Dirección de Tesis de doctorado' },
  { value: 100000001, label: 'Dirección de Tesis y/o Trabajo Final de maestría' },
  { value: 100000002, label: 'Dirección de Trabajo Final de Especialización' },
  { value: 100000003, label: 'Dirección de Trabajo Final de Grado' },
];

const DEFENDIDA = 100000000;
const EN_PREPARACION = 100000002;

export const ESTADO_TESIS: OpcionDeLista[] = [
  { value: DEFENDIDA, label: 'Defendida' },
  { value: 100000001, label: 'Presentada' },
  { value: EN_PREPARACION, label: 'En preparación' },
];

/** Años previstos de finalización: de 1990 a 2032, como el selector del portal. */
export const ANIOS_PREVISTOS: OpcionDeLista[] = Array.from({ length: 2032 - 1990 + 1 }, (_, i) => ({
  value: 1990 + i,
  label: String(1990 + i),
}));

export const CARRERA_BECARIO: OpcionDeLista[] = [
  { value: 100000000, label: 'Investigador' },
  { value: 100000001, label: 'Becario' },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const dia = (f: Date): number => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

/** Colaborador (lookup) como opción { value: id, label: nombre }; null si no hay. */
const colaboradorDeFila = (fila: Fila, atributo: string): Opcion => opcionDeFila(fila, atributo);

/** Texto obligatorio solo si la pertenencia vale `valor`. */
const textoSiPertenencia = (campo: string, valor: number, mensaje: string, maximo: number, mensajeMax: string) =>
  yup
    .string()
    .max(maximo, mensajeMax)
    .test(`req-${campo}-${valor}`, mensaje, function (v) {
      return !esValor(this.parent[campo], valor) || Boolean(v && v.trim());
    });

/** Colaborador obligatorio solo si la pertenencia es la Universidad Austral. */
const colaboradorSiUA = (campo: string, mensaje: string) =>
  yup
    .mixed()
    .nullable()
    .test(`req-ua-${campo}`, mensaje, function (v) {
      return !esValor(this.parent[campo], UA) || tieneValor(v as any);
    });

const nombreDe = (colaborador: OpcionONull, otro: string): string =>
  colaborador?.label ? String(colaborador.label) : otro || '';

// ---------------------------------------------------------------------------
// Formación de tesistas
// ---------------------------------------------------------------------------

export interface Tesista {
  id: string;
  formacion: OpcionONull;
  pertenenciaDirector: OpcionONull;
  director: Opcion;
  directorOtro: string;
  otroDirector: string;
  directorNombre: string;
  pertenenciaCodirector: OpcionONull;
  codirector: Opcion;
  codirectorOtro: string;
  otroCodirector: string;
  codirectorNombre: string;
  titulo: string;
  pertenenciaTesista: OpcionONull;
  tesista: string;
  tesistaBusqueda: string;
  institucionPrograma: OpcionONull;
  programa: string;
  sede: string;
  fechaInicio: Date | null;
  estado: OpcionONull;
  anioPrevisto: number | null;
  fechaDefensa: Date | null;
}

export const mapearTesistas = (filas: Fila[]): Tesista[] =>
  filas.map((f) => {
    const pertenenciaTesista = opcionDeLista(f?.new_pertenenciadeltesista, PERTENENCIA_RRHH);
    const principal = texto(f?.new_tesista_principal);
    const otro = texto(f?.new_tesista_otro);
    const anio = Number(f?.new_anoprevistodelapresentacion);
    return {
      id: texto(f?.new_formaciontesistasid),
      formacion: opcionDeLista(f?.new_formacion, FORMACION_TESISTA),
      pertenenciaDirector: opcionDeLista(f?.new_pertenenciadirector, PERTENENCIA_RRHH),
      director: colaboradorDeFila(f, '_new_director_busqueda_value'),
      directorOtro: texto(f?.new_director_otro),
      otroDirector: texto(f?.new_otro_director),
      directorNombre: texto(f?.new_director_principal),
      pertenenciaCodirector: opcionDeLista(f?.new_pertenenciacodirector, PERTENENCIA_RRHH),
      codirector: colaboradorDeFila(f, '_new_codirector_busqueda_value'),
      codirectorOtro: texto(f?.new_codirector_otro),
      otroCodirector: texto(f?.new_otro_codirector),
      codirectorNombre: texto(f?.new_codirector_principal),
      titulo: texto(f?.new_name),
      pertenenciaTesista,
      tesista: esValor(pertenenciaTesista, OTRO) ? otro || principal : principal || otro,
      tesistaBusqueda: texto(f?.['_new_tesista_busqueda_value']),
      institucionPrograma: opcionDeLista(f?.new_instituciondelprograma, PERTENENCIA_RRHH),
      programa: texto(f?.new_programa),
      sede: texto(f?.new_sededepresentacion),
      fechaInicio: fechaDeFila(f, 'new_fechainicio'),
      estado: opcionDeLista(f?.new_estado, ESTADO_TESIS),
      anioPrevisto: Number.isFinite(anio) && anio > 0 ? anio : null,
      fechaDefensa: fechaDeFila(f, 'new_fechadeladefensa'),
    };
  });

export interface FormularioTesista {
  formacion: OpcionONull;
  pertenenciaDirector: OpcionONull;
  director: OpcionONull;
  directorOtro: string;
  otroDirector: string;
  pertenenciaCodirector: OpcionONull;
  codirector: OpcionONull;
  codirectorOtro: string;
  otroCodirector: string;
  titulo: string;
  pertenenciaTesista: OpcionONull;
  tesista: string;
  institucionPrograma: OpcionONull;
  programa: string;
  sede: string;
  fechaInicio: Date | null;
  estado: OpcionONull;
  anioPrevisto: OpcionONull;
  fechaDefensa: Date | null;
  /** Lookup del tesista que el portal conserva sin mostrar. */
  tesistaBusqueda: string;
}

export const tesistaAFormulario = (t: Tesista | undefined, colaboradores: OpcionSelect[]): FormularioTesista => ({
  formacion: t?.formacion ?? null,
  pertenenciaDirector: t?.pertenenciaDirector ?? null,
  director: opcionDeCatalogo(t?.director, colaboradores),
  directorOtro: t?.directorOtro ?? '',
  otroDirector: t?.otroDirector ?? '',
  pertenenciaCodirector: t?.pertenenciaCodirector ?? null,
  codirector: opcionDeCatalogo(t?.codirector, colaboradores),
  codirectorOtro: t?.codirectorOtro ?? '',
  otroCodirector: t?.otroCodirector ?? '',
  titulo: t?.titulo ?? '',
  pertenenciaTesista: t?.pertenenciaTesista ?? null,
  tesista: t?.tesista ?? '',
  institucionPrograma: t?.institucionPrograma ?? null,
  programa: t?.programa ?? '',
  sede: t?.sede ?? '',
  fechaInicio: t?.fechaInicio ?? null,
  estado: t?.estado ?? null,
  anioPrevisto: t?.anioPrevisto ? opcionDeLista(t.anioPrevisto, ANIOS_PREVISTOS) : null,
  fechaDefensa: t?.fechaDefensa ?? null,
  tesistaBusqueda: t?.tesistaBusqueda ?? '',
});

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/formacionTesistas (hooks/investigacion-perfil/useCargarEditarFormacionTesistas).
 * Diferencias conscientes: el PUT no manda new_colaborador (el portal manda un texto vacío), los textos de director /
 * codirector que no corresponden a la pertenencia elegida se mandan vacíos (el portal arrastra el valor viejo) y el año
 * previsto / la fecha de defensa solo van con el estado que los pide (el portal manda lo que haya quedado cargado).
 */
export const armarPayloadTesista = (
  empleadoId: string,
  f: FormularioTesista,
  id?: string,
): Record<string, unknown> => {
  const dirUA = esValor(f.pertenenciaDirector, UA);
  const dirOtro = esValor(f.pertenenciaDirector, OTRO);
  const codUA = esValor(f.pertenenciaCodirector, UA);
  const codOtro = esValor(f.pertenenciaCodirector, OTRO);
  const director = dirUA ? f.director : null;
  const codirector = codUA ? f.codirector : null;
  return {
    ...(id ? { new_formaciontesistasid: id } : { new_colaborador: empleadoId }),
    new_formacion: f.formacion?.value || 0,
    new_pertenenciadirector: f.pertenenciaDirector?.value || 0,
    new_director_busqueda: director?.value || '',
    new_director_otro: dirOtro ? f.directorOtro : '',
    new_director_principal: nombreDe(director, dirOtro ? f.directorOtro : ''),
    new_pertenenciacodirector: f.pertenenciaCodirector?.value || 0,
    new_codirector_busqueda: codirector?.value || '',
    new_codirector_otro: codOtro ? f.codirectorOtro : '',
    new_codirector_principal: nombreDe(codirector, codOtro ? f.codirectorOtro : ''),
    new_name: f.titulo || '',
    new_pertenenciadeltesista: f.pertenenciaTesista?.value || 0,
    new_tesista_busqueda: f.tesistaBusqueda || '',
    new_tesista_otro: esValor(f.pertenenciaTesista, OTRO) ? f.tesista : '',
    new_tesista_principal: f.tesista || '',
    new_instituciondelprograma: f.institucionPrograma?.value || 0,
    new_programa: f.programa || '',
    new_sededepresentacion: f.sede || '',
    new_estado: f.estado?.value || 0,
    new_anoprevistodelapresentacion: esValor(f.estado, EN_PREPARACION) ? f.anioPrevisto?.value || 0 : 0,
    new_fechadeladefensa: esValor(f.estado, DEFENDIDA) ? diaADocenciaApi(f.fechaDefensa) : null,
    new_fechainicio: diaADocenciaApi(f.fechaInicio),
    new_otro_director: dirOtro ? f.otroDirector : '',
    new_otro_codirector: codOtro ? f.otroCodirector : '',
  };
};

export const esquemaTesista = yup.object({
  formacion: opcionRequerida('El campo formación es obligatorio'),
  director: colaboradorSiUA('pertenenciaDirector', 'El campo director es obligatorio'),
  directorOtro: textoSiPertenencia(
    'pertenenciaDirector',
    OTRO,
    'El campo otro director es obligatorio',
    100,
    'El campo otro director debe tener máximo 100 caracteres',
  ),
  otroDirector: textoSiPertenencia(
    'pertenenciaDirector',
    OTRO,
    'El campo otro es obligatorio',
    100,
    'El campo otro debe tener máximo 100 caracteres',
  ),
  codirector: colaboradorSiUA('pertenenciaCodirector', 'El campo codirector es obligatorio'),
  codirectorOtro: textoSiPertenencia(
    'pertenenciaCodirector',
    OTRO,
    'El campo otro codirector es obligatorio',
    100,
    'El campo otro codirector debe tener máximo 100 caracteres',
  ),
  otroCodirector: textoSiPertenencia(
    'pertenenciaCodirector',
    OTRO,
    'El campo otro es obligatorio',
    100,
    'El campo otro debe tener máximo 100 caracteres',
  ),
  titulo: yup.string().max(100, 'El campo título del trabajo debe tener máximo 100 caracteres'),
  pertenenciaTesista: opcionRequerida('El campo pertenencia del tesista es obligatorio'),
  // El portal tiene dos campos (tesista UA y "otro tesista") con textos distintos; acá es un solo campo.
  tesista: yup.string().test('tesista', 'El campo tesista es obligatorio', function (v) {
    const pertenencia = this.parent.pertenenciaTesista as OpcionONull;
    if (!tieneValor(pertenencia)) return true;
    const otro = esValor(pertenencia, OTRO);
    const valor = v ?? '';
    if (!valor.trim()) {
      return this.createError({
        message: otro ? 'El campo otro tesista es obligatorio' : 'El campo tesista es obligatorio',
      });
    }
    if (valor.length > 100) {
      return this.createError({
        message: otro
          ? 'El campo otro tesista debe tener máximo 100 caracteres'
          : 'El campo tesista debe tener máximo 100 caracteres',
      });
    }
    return true;
  }),
  institucionPrograma: opcionRequerida('El campo institución del programa es obligatorio'),
  programa: yup
    .string()
    .trim()
    .max(100, 'El campo programa debe tener máximo 100 caracteres')
    .required('El campo programa es obligatorio'),
  sede: yup.string().max(100, 'El campo sede de presentación debe tener máximo 100 caracteres'),
  fechaInicio: fechaRequerida('El campo fecha de inicio es obligatorio'),
  estado: opcionRequerida('El campo estado es obligatorio'),
  anioPrevisto: yup
    .mixed()
    .nullable()
    .test('anio-req', 'El campo año previsto de finalización es obligatorio', function (v) {
      return !esValor(this.parent.estado, EN_PREPARACION) || tieneValor(v as any);
    })
    .test(
      'anio-no-anterior',
      'El año previsto de preparación no puede ser anterior al año de inicio.',
      function (v) {
        const inicio = this.parent.fechaInicio as Date | null;
        if (!esValor(this.parent.estado, EN_PREPARACION) || !tieneValor(v as any) || !inicio) return true;
        return Number((v as any).value) >= inicio.getFullYear();
      },
    ),
  fechaDefensa: fechaOpcional().test('defensa-req', 'El campo fecha de defensa es obligatorio', function (v) {
    return !esValor(this.parent.estado, DEFENDIDA) || Boolean(v);
  }),
});

// ---------------------------------------------------------------------------
// Dirección de investigadores y/o becarios
// ---------------------------------------------------------------------------

export interface DireccionBecario {
  id: string;
  pertenenciaDirector: OpcionONull;
  director: Opcion;
  directorOtro: string;
  directorNombre: string;
  pertenenciaCodirector: OpcionONull;
  codirector: Opcion;
  codirectorOtro: string;
  codirectorNombre: string;
  carrera: OpcionONull;
  pertenenciaBecario: OpcionONull;
  becario: Opcion;
  becarioOtro: string;
  becarioNombre: string;
  institucion: OpcionONull;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  enCurso: OpcionONull;
}

export const mapearDirecciones = (filas: Fila[]): DireccionBecario[] =>
  filas.map((f) => ({
    id: texto(f?.new_direcciondeinvestigadoresbecariosid),
    pertenenciaDirector: opcionDeLista(f?.new_pertenenciadirector, PERTENENCIA_RRHH),
    director: colaboradorDeFila(f, '_new_directorbusqueda_value'),
    directorOtro: texto(f?.new_directorotro),
    directorNombre: texto(f?.new_directorprincipal),
    pertenenciaCodirector: opcionDeLista(f?.new_pertenenciacodirector, PERTENENCIA_RRHH),
    codirector: colaboradorDeFila(f, '_new_codirectorbusqueda_value'),
    codirectorOtro: texto(f?.new_codirectorotro),
    codirectorNombre: texto(f?.new_codirectorprincipal),
    carrera: opcionDeLista(f?.new_carrera, CARRERA_BECARIO),
    pertenenciaBecario: opcionDeLista(f?.new_pertenenciadelinvestigadorbecario, PERTENENCIA_RRHH),
    becario: colaboradorDeFila(f, '_new_investigadorbecariobusqueda_value'),
    becarioOtro: texto(f?.new_investigadorbecariootro),
    becarioNombre: texto(f?.new_investigadorbecarioprincipal),
    institucion:
      f?.new_institucion !== null && f?.new_institucion !== undefined
        ? { value: f.new_institucion, label: texto(f?.['new_institucion@OData.Community.Display.V1.FormattedValue']) }
        : null,
    fechaInicio: fechaDeFila(f, 'new_fechadeinicio'),
    fechaFin: fechaDeFila(f, 'new_fechadefin'),
    enCurso: booleanAOpcion(f?.new_encurso, f?.['new_encurso@OData.Community.Display.V1.FormattedValue']),
  }));

export interface FormularioDireccion {
  pertenenciaDirector: OpcionONull;
  director: OpcionONull;
  directorOtro: string;
  pertenenciaCodirector: OpcionONull;
  codirector: OpcionONull;
  codirectorOtro: string;
  carrera: OpcionONull;
  pertenenciaBecario: OpcionONull;
  becario: OpcionONull;
  becarioOtro: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  enCurso: OpcionONull;
  /** Institución que el portal conserva sin mostrar. */
  institucion: OpcionONull;
}

export const direccionAFormulario = (
  d: DireccionBecario | undefined,
  colaboradores: OpcionSelect[],
): FormularioDireccion => ({
  pertenenciaDirector: d?.pertenenciaDirector ?? null,
  director: opcionDeCatalogo(d?.director, colaboradores),
  directorOtro: d?.directorOtro ?? '',
  pertenenciaCodirector: d?.pertenenciaCodirector ?? null,
  codirector: opcionDeCatalogo(d?.codirector, colaboradores),
  codirectorOtro: d?.codirectorOtro ?? '',
  carrera: d?.carrera ?? null,
  pertenenciaBecario: d?.pertenenciaBecario ?? null,
  becario: opcionDeCatalogo(d?.becario, colaboradores),
  becarioOtro: d?.becarioOtro ?? '',
  fechaInicio: d?.fechaInicio ?? null,
  fechaFin: d?.fechaFin ?? null,
  enCurso: d?.enCurso ?? null,
  institucion: d?.institucion ?? null,
});

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/investigadoresBecarios (hooks/investigacion-perfil/useCargarEditarInvestigadoresBecarios).
 * Diferencia consciente: el portal, al editar, manda el id del colaborador en new_investigadorbecarioprincipal (en vez de
 * su nombre, como al crear); acá se manda siempre el nombre. Con "En curso" la fecha de fin va nula (el portal la vacía en
 * el formulario).
 */
export const armarPayloadDireccion = (
  empleadoId: string,
  f: FormularioDireccion,
  id?: string,
): Record<string, unknown> => {
  const dirUA = esValor(f.pertenenciaDirector, UA);
  const dirOtro = esValor(f.pertenenciaDirector, OTRO);
  const codUA = esValor(f.pertenenciaCodirector, UA);
  const codOtro = esValor(f.pertenenciaCodirector, OTRO);
  const becUA = esValor(f.pertenenciaBecario, UA);
  const becOtro = esValor(f.pertenenciaBecario, OTRO);
  const director = dirUA ? f.director : null;
  const codirector = codUA ? f.codirector : null;
  const becario = becUA ? f.becario : null;
  const enCurso = opcionABoolean(f.enCurso) === true;
  return {
    ...(id ? { new_direcciondeinvestigadoresbecariosid: id } : { new_colaborador: empleadoId }),
    new_pertenenciadirector: f.pertenenciaDirector?.value || 0,
    new_name: '',
    new_directorbusqueda: director?.value || '',
    new_directorotro: dirOtro ? f.directorOtro : '',
    new_directorprincipal: nombreDe(director, dirOtro ? f.directorOtro : ''),
    new_pertenenciacodirector: f.pertenenciaCodirector?.value || 0,
    new_codirectorbusqueda: codirector?.value || '',
    new_codirectorotro: codOtro ? f.codirectorOtro : '',
    new_codirectorprincipal: nombreDe(codirector, codOtro ? f.codirectorOtro : ''),
    new_carrera: f.carrera?.value || 0,
    new_pertenenciadelinvestigadorbecario: f.pertenenciaBecario?.value || 0,
    new_investigadorbecariobusqueda: becario?.value || '',
    new_investigadorbecariootro: becOtro ? f.becarioOtro : '',
    new_investigadorbecarioprincipal: nombreDe(becario, becOtro ? f.becarioOtro : ''),
    new_institucion: f.institucion?.value || 0,
    new_fechadeinicio: diaADocenciaApi(f.fechaInicio),
    new_fechadefin: enCurso ? null : diaADocenciaApi(f.fechaFin),
    new_encurso: enCurso ? 1 : 0,
  };
};

const colaboradorSiUAObligatorio = (campo: string, mensaje: string) => colaboradorSiUA(campo, mensaje);

export const esquemaDireccion = yup.object({
  director: colaboradorSiUAObligatorio('pertenenciaDirector', 'El director es obligatorio'),
  directorOtro: yup
    .string()
    .trim()
    .max(100, 'El nombre del director no puede exceder 100 caracteres')
    .test('dir-otro', 'Debe especificar el director', function (v) {
      return !esValor(this.parent.pertenenciaDirector, OTRO) || Boolean(v && v.trim());
    }),
  codirector: colaboradorSiUAObligatorio('pertenenciaCodirector', 'El codirector es obligatorio'),
  codirectorOtro: yup
    .string()
    .trim()
    .max(100, 'El nombre del codirector no puede exceder 100 caracteres')
    .test('cod-otro', 'Debe especificar el codirector', function (v) {
      return !esValor(this.parent.pertenenciaCodirector, OTRO) || Boolean(v && v.trim());
    }),
  pertenenciaBecario: opcionRequerida('La pertenencia del investigador/becario es obligatoria'),
  becario: colaboradorSiUAObligatorio('pertenenciaBecario', 'El investigador/becario es obligatorio'),
  becarioOtro: yup
    .string()
    .trim()
    .max(100, 'El nombre del investigador/becario no puede exceder 100 caracteres')
    .test('bec-otro', 'Debe especificar el investigador/becario', function (v) {
      return !esValor(this.parent.pertenenciaBecario, OTRO) || Boolean(v && v.trim());
    }),
  enCurso: opcionRequerida('En Curso es obligatorio'),
  fechaInicio: fechaRequerida('La fecha de inicio es obligatoria').test(
    'inicio-orden',
    'La fecha de inicio no puede ser mayor a la fecha de fin',
    function (v) {
      const fin = this.parent.fechaFin as Date | null;
      const enCurso = opcionABoolean(this.parent.enCurso) === true;
      if (!v || !fin || enCurso) return true;
      return dia(v) <= dia(fin);
    },
  ),
  fechaFin: fechaOpcional()
    .test('fin-req', 'La fecha de fin es obligatoria', function (v) {
      return opcionABoolean(this.parent.enCurso) !== false || Boolean(v);
    })
    .test('fin-futura', 'La fecha de fin no puede ser mayor a la fecha actual', function (v) {
      if (!v || opcionABoolean(this.parent.enCurso) !== false) return true;
      return !esFechaFutura(v);
    })
    .test('fin-orden', 'La fecha de fin no puede ser menor a la fecha de inicio', function (v) {
      const inicio = this.parent.fechaInicio as Date | null;
      if (!v || !inicio || opcionABoolean(this.parent.enCurso) !== false) return true;
      return dia(v) >= dia(inicio);
    }),
});
