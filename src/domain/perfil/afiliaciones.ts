// Perfil > Investigación > Afiliaciones: perfiles, categorización externa, categorización PRINUAR, pertenencia a centros
// y jurados - tribunal.
// Port de Portal-Austral-Dev -> perfil/investigacion/perfil/{perfiles,categorizacion-externa,pertenencia,jurados}/page.tsx,
// hooks/investigacion-perfil/* y columns/investigacion/*.
import * as yup from 'yup';
import { aFechaApi } from '../legajo/fechas';
import type { Opcion, OpcionSelect } from '../legajo/tipos';
import {
  esFechaFutura,
  fechaDeFila,
  fechaOpcional,
  fechaRequerida,
  FV,
  opcionDeFila,
  opcionDeLista,
  opcionOpcional,
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

/** Sí / No con código numérico (1 / 0), como los usa el CRM en estos formularios. */
export const SI_NO_NUM: OpcionDeLista[] = [
  { value: 1, label: 'Si' },
  { value: 0, label: 'No' },
];

export const LINEAS_PRIORITARIAS_UA: OpcionDeLista[] = [
  { value: 100000000, label: 'Tecnologías aplicadas a la salud' },
  { value: 100000001, label: 'Medicina de precisión, investigación traslacional y clínica' },
  { value: 100000002, label: 'Sociedad, democracia y calidad institucional' },
  { value: 100000003, label: 'Cuidado, bienestar y florecimiento humano' },
  { value: 100000004, label: 'Innovación, transformación digital y sostenibilidad' },
];

export const TIPO_ACTIVIDAD_EVALUACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Evaluación de personal CyT' },
  { value: 100000001, label: 'Jurado trabajo final / tesis' },
  { value: 100000002, label: 'Jurado de premios' },
  { value: 100000003, label: 'Evaluación de trabajos en revistas CyT' },
  { value: 100000004, label: 'Otro' },
];
const TIPO_ACTIVIDAD_OTRO = 100000004;

export const ROL_JURADO: OpcionDeLista[] = [
  { value: 100000000, label: 'Par consultor' },
  { value: 100000001, label: 'Miembro de comisión asesora' },
  { value: 100000002, label: 'Coordinador de comisión asesora' },
  { value: 100000003, label: 'Coordinador alterno de comisión asesora' },
  { value: 100000004, label: 'Miembro de comité evaluación' },
  { value: 100000005, label: 'Otro' },
];
const ROL_OTRO = 100000005;

const CAT_CONICET = 100000000;
const CAT_CIC = 100000001;
const CAT_AGENCIA = 100000002;
const CAT_OTRA = 100000003;

export const CATEGORIZACION_EXTERNA: OpcionDeLista[] = [
  { value: CAT_CONICET, label: 'CONICET' },
  { value: CAT_CIC, label: 'CIC' },
  { value: CAT_AGENCIA, label: 'Agencia' },
  { value: CAT_OTRA, label: 'Otro' },
];

const TIPO_INVESTIGADOR = 100000000;
export const TIPO_CATEGORIZACION: OpcionDeLista[] = [
  { value: TIPO_INVESTIGADOR, label: 'Investigador' },
  { value: 100000001, label: 'Becario' },
];

const CONICET_INVESTIGADOR: OpcionDeLista[] = [
  { value: 100000000, label: 'Asistente' },
  { value: 100000001, label: 'Adjunto' },
  { value: 100000002, label: 'Independiente' },
  { value: 100000003, label: 'Principal' },
  { value: 100000004, label: 'Superior' },
  { value: 100000005, label: 'Jubilado' },
];
const CONICET_BECARIO: OpcionDeLista[] = [
  { value: 100000006, label: 'Beca doctoral general' },
  { value: 100000007, label: 'Beca doctoral cofinanciada' },
  { value: 100000008, label: 'Beca de finalización de doctorado general' },
  { value: 100000009, label: 'Beca de finalización de doctorado cofinanciada' },
  { value: 100000010, label: 'Beca posdoctoral general' },
  { value: 100000011, label: 'Beca posdoctoral cofinanciada' },
];
const CIC_INVESTIGADOR: OpcionDeLista[] = [
  { value: 100000000, label: 'Superior' },
  { value: 100000001, label: 'Principal' },
  { value: 100000002, label: 'Independiente' },
  { value: 100000003, label: 'Adjunto' },
  { value: 100000004, label: 'Asistente' },
  { value: 100000005, label: 'Emérito' },
  { value: 100000006, label: 'Honorario' },
];
const CIC_BECARIO: OpcionDeLista[] = [
  { value: 100000007, label: 'Beca doctoral' },
  { value: 100000008, label: 'Beca posdoctoral general' },
  { value: 100000009, label: 'Beca cofinanciada' },
];

export const CATEGORIAS_AGENCIA: OpcionDeLista[] = [
  { value: 100000000, label: 'Beca Inicial' },
  { value: 100000001, label: 'Beca Superior' },
];

export const CATEGORIAS_PRINUAR: OpcionDeLista[] = [
  { value: 100000000, label: 'I' },
  { value: 100000001, label: 'II' },
  { value: 100000002, label: 'III' },
  { value: 100000003, label: 'IV' },
  { value: 100000004, label: 'V' },
];

/** Categorías CONICET según el tipo elegido (investigador o becario). */
export const categoriasConicetPorTipo = (tipo: OpcionONull): OpcionDeLista[] =>
  esValor(tipo, TIPO_INVESTIGADOR) ? CONICET_INVESTIGADOR : CONICET_BECARIO;

/** Categorías CIC según el tipo elegido (investigador o becario). */
export const categoriasCicPorTipo = (tipo: OpcionONull): OpcionDeLista[] =>
  esValor(tipo, TIPO_INVESTIGADOR) ? CIC_INVESTIGADOR : CIC_BECARIO;

const CONICET_TODAS = [...CONICET_INVESTIGADOR, ...CONICET_BECARIO];
const CIC_TODAS = [...CIC_INVESTIGADOR, ...CIC_BECARIO];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

type OpcionLaxa = { value?: unknown; label?: unknown } | null | undefined;

const fv = (fila: Fila, atributo: string): string => texto(fila?.[`${atributo}${FV}`]);

export const tieneValor = (op: OpcionLaxa): boolean =>
  op !== null && op !== undefined && op.value !== null && op.value !== undefined && op.value !== '';

export const esValor = (op: OpcionLaxa, valor: number | string): boolean =>
  tieneValor(op) && String(op?.value) === String(valor);

/** "Otra" / "Otro" / "Otros" / "Otras" (por etiqueta) o el valor "Otra", como isOtroLugar del portal. */
export const esOtra = (op: OpcionLaxa): boolean => {
  if (!op) return false;
  const etiqueta = texto(op.label).trim().toLowerCase();
  return ['otra', 'otro', 'otros', 'otras'].includes(etiqueta) || texto(op.value).toLowerCase() === 'otra';
};

export const OPCION_OTRA: OpcionSelect = { value: 'Otra', label: 'Otra' };

/** Booleano o 1 / 0 del CRM -> opción Si / No; null si no hay dato. */
const siNoDeValor = (valor: unknown): OpcionONull => {
  if (valor === true || valor === 1 || valor === '1' || valor === 'true') return SI_NO_NUM[0];
  if (valor === false || valor === 0 || valor === '0' || valor === 'false') return SI_NO_NUM[1];
  return null;
};

const dia = (f: Date): number => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

const finNoAnteriorCon = (mensaje: string) =>
  fechaOpcional().test('fin-orden', mensaje, function (valor) {
    const inicio = this.parent.fechaInicio as Date | null;
    if (!valor || !inicio) return true;
    return dia(valor) >= dia(inicio);
  });

/** Mensaje de la categorización externa y PRINUAR del portal (la regla permite igual: v >= inicio). */
const FIN_EXTERNA = 'La fecha de fin no puede ser anterior o igual a la fecha de inicio';

const inicioNoPosterior = (mensaje: string) =>
  fechaRequerida('La fecha de inicio es obligatoria').test('inicio-orden', mensaje, function (valor) {
    const fin = this.parent.fechaFin as Date | null;
    if (!valor || !fin) return true;
    return dia(valor) <= dia(fin);
  });

const otroSiValor = (
  campo: string,
  valor: number,
  mensaje: string,
  mensajeMaximo = 'Máximo 100 caracteres',
  maximo = 100,
) =>
  yup
    .string()
    .max(maximo, mensajeMaximo)
    .test(`otro-${campo}`, mensaje, function (v) {
      return !esValor(this.parent[campo], valor) || Boolean(v && v.trim());
    });

// ---------------------------------------------------------------------------
// Perfiles
// ---------------------------------------------------------------------------

export interface PerfilInvestigacion {
  id: string;
  orcid: string;
  googleScholar: string;
  researchGate: string;
  lineasUA: OpcionONull;
  linea: OpcionONull;
}

/** new_empleado del propio usuario (hooks/investigacion-perfil/useGetPerfiles). */
export const mapearPerfil = (f: Fila): PerfilInvestigacion => {
  const lineasUA = siNoDeValor(f?.new_lineasinvestua);
  return {
    id: texto(f?.new_empleadoid),
    orcid: texto(f?.new_orcid),
    googleScholar: texto(f?.new_googlescholar),
    researchGate: texto(f?.new_research_gate),
    lineasUA,
    linea: esValor(lineasUA, 1) ? opcionDeLista(f?.new_lineadeinvestigacion, LINEAS_PRIORITARIAS_UA) : null,
  };
};

export interface FormularioPerfil {
  orcid: string;
  googleScholar: string;
  researchGate: string;
  lineasUA: OpcionONull;
  linea: OpcionONull;
}

export const perfilAFormulario = (p: PerfilInvestigacion | null | undefined): FormularioPerfil => ({
  orcid: p?.orcid ?? '',
  googleScholar: p?.googleScholar ?? '',
  researchGate: p?.researchGate ?? '',
  lineasUA: p?.lineasUA ?? null,
  linea: p?.linea ?? null,
});

/** Cuerpo de PUT api/hrfactors/investigacion/perfil (hooks/investigacion-perfil/useCargarNuevoPerfil del portal). */
export const armarPayloadPerfil = (empleadoId: string, f: FormularioPerfil): Record<string, unknown> => {
  const relacionado = esValor(f.lineasUA, 1);
  return {
    new_empleadoid: empleadoId,
    new_orcid: f.orcid.trim() || null,
    new_googlescholar: f.googleScholar.trim() || null,
    new_research_gate: f.researchGate.trim() || null,
    new_lineasinvestua: Number(f.lineasUA?.value ?? 0),
    new_lineadeinvestigacion: relacionado && tieneValor(f.linea) ? Number(f.linea?.value) : 0,
  };
};

export const esquemaPerfil = yup.object({
  orcid: yup.string(),
  googleScholar: yup.string(),
  researchGate: yup.string(),
  lineasUA: opcionRequerida(
    'Debe indicar si está directamente relacionado con alguna de las líneas prioritarias de investigación de la UA',
  ),
  linea: opcionOpcional().test('linea-obligatoria', 'La línea de investigación es obligatoria', function (v) {
    return !esValor(this.parent.lineasUA, 1) || tieneValor(v as OpcionLaxa);
  }),
});

// ---------------------------------------------------------------------------
// Pertenencia a centros de investigación / HUA
// ---------------------------------------------------------------------------

export interface Pertenencia {
  id: string;
  centro: OpcionONull;
  pertenencia: Opcion;
  pertenenciaTexto: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  /** Con fecha de fin anterior a hoy: solo se puede ver. */
  historica: boolean;
}

/** Texto que muestra la lista: la pertenencia del catálogo o, si no hay, el texto libre. */
export const etiquetaDePertenencia = (p: Pertenencia): string => p.pertenencia.label || p.pertenenciaTexto || '';

export const mapearPertenencias = (filas: Fila[]): Pertenencia[] =>
  filas.map((f) => {
    const fechaFin = fechaDeFila(f, 'new_fechafin');
    return {
      id: texto(f?.new_pertenenciaacentrosid),
      centro: siNoDeValor(f?.new_pertcentro_insthua),
      pertenencia: opcionDeFila(f, '_new_pertenencia_value'),
      pertenenciaTexto: texto(f?.new_pertenencia_texto),
      fechaInicio: fechaDeFila(f, 'new_fechainicio'),
      fechaFin,
      historica: fechaFin !== null && dia(fechaFin) < dia(new Date()),
    };
  });

export interface FormularioPertenencia {
  centro: OpcionONull;
  pertenencia: OpcionONull;
  pertenenciaTexto: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const pertenenciaAFormulario = (
  p: Pertenencia | undefined,
  catalogo: OpcionSelect[],
): FormularioPertenencia => ({
  centro: p?.centro ?? null,
  pertenencia: esValor(p?.centro, 1) ? opcionDeCatalogo(p?.pertenencia, catalogo) : null,
  pertenenciaTexto: esValor(p?.centro, 1) ? '' : (p?.pertenenciaTexto ?? ''),
  fechaInicio: p?.fechaInicio ?? null,
  fechaFin: p?.fechaFin ?? null,
});

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/perteneciaACentros (hooks/investigacion-perfil/useCargarEditarPertenenciaHUA).
 * El portal manda el Date tal cual (JSON); la app manda la medianoche de Argentina (UTC-3), que es el mismo instante.
 */
export const armarPayloadPertenencia = (
  empleadoId: string,
  f: FormularioPertenencia,
  id?: string,
): Record<string, unknown> => {
  const finVencido = f.fechaFin !== null && dia(f.fechaFin) < dia(new Date());
  return {
    ...(id ? { new_pertenenciaacentrosid: id } : { new_colaborador: empleadoId }),
    new_pertcentro_insthua: Number(f.centro?.value) || 0,
    new_pertenencia: f.pertenencia?.value || '',
    new_fechainicio: diaADocenciaApi(f.fechaInicio) ?? '',
    new_fechafin: diaADocenciaApi(f.fechaFin) ?? '',
    new_statuscode: finVencido ? 100000001 : 100000000,
    new_pertenencia_texto: f.pertenenciaTexto || '',
  };
};

/** Textos de error iguales a los de ModalPertenencia del portal. */
export const esquemaPertenencia = yup.object({
  centro: opcionRequerida('La pertenencia a centro/instituto es obligatoria'),
  pertenencia: opcionOpcional().test('pertenencia-obligatoria', 'El tipo de pertenencia es obligatorio', function (v) {
    return !esValor(this.parent.centro, 1) || tieneValor(v as OpcionLaxa);
  }),
  pertenenciaTexto: yup
    .string()
    .max(99, 'Máximo 99 caracteres')
    .test('texto-obligatorio', 'La pertenencia es obligatoria', function (v) {
      return !esValor(this.parent.centro, 0) || Boolean(v && v.trim());
    }),
  fechaInicio: inicioNoPosterior('La fecha de inicio no puede ser posterior a la fecha fin'),
  fechaFin: finNoAnteriorCon('La fecha de fin no puede ser anterior a la fecha de inicio'),
});

// ---------------------------------------------------------------------------
// Jurados - tribunal
// ---------------------------------------------------------------------------

export interface JuradoTribunal {
  id: string;
  tipoActividad: OpcionONull;
  otraActividad: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  institucion: string;
  rol: OpcionONull;
  otroRol: string;
  pais: Opcion;
  ciudad: string;
  observaciones: string;
}

export const mapearJurados = (filas: Fila[]): JuradoTribunal[] =>
  filas.map((f) => ({
    id: texto(f?.new_participacionencomitesyjuradosid),
    tipoActividad: opcionDeLista(f?.new_tipodeactividaddeevaluacion, TIPO_ACTIVIDAD_EVALUACION),
    otraActividad: texto(f?.new_otraactividad),
    fechaInicio: fechaDeFila(f, 'new_fechadeinicio'),
    fechaFin: fechaDeFila(f, 'new_fechadefin'),
    institucion: texto(f?.new_institucionconvocantedelaevaluacion),
    rol: opcionDeLista(f?.new_rol, ROL_JURADO),
    otroRol: texto(f?.new_otrorol),
    pais: opcionDeFila(f, '_new_pais_value'),
    ciudad: texto(f?.new_ciudad),
    observaciones: texto(f?.new_observaciones),
  }));

export interface FormularioJurado {
  tipoActividad: OpcionONull;
  otraActividad: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  institucion: string;
  rol: OpcionONull;
  otroRol: string;
  pais: OpcionONull;
  ciudad: string;
  observaciones: string;
}

export const juradoAFormulario = (j: JuradoTribunal | undefined, paises: OpcionSelect[]): FormularioJurado => ({
  tipoActividad: j?.tipoActividad ?? null,
  otraActividad: j?.otraActividad ?? '',
  fechaInicio: j?.fechaInicio ?? null,
  fechaFin: j?.fechaFin ?? null,
  institucion: j?.institucion ?? '',
  rol: j?.rol ?? null,
  otroRol: j?.otroRol ?? '',
  pais: opcionDeCatalogo(j?.pais, paises),
  ciudad: j?.ciudad ?? '',
  observaciones: j?.observaciones ?? '',
});

/** Cuerpo de POST / PUT api/hrfactors/investigacion/juradosTribunal (hooks/investigacion-perfil/useCargarEditarJuradosTribunal). */
export const armarPayloadJurado = (empleadoId: string, f: FormularioJurado, id?: string): Record<string, unknown> => ({
  ...(id ? { new_participacionencomitesyjuradosid: id } : { new_colaborador: empleadoId }),
  new_tipodeactividaddeevaluacion: f.tipoActividad?.value,
  new_otraactividad: esValor(f.tipoActividad, TIPO_ACTIVIDAD_OTRO) ? f.otraActividad : '',
  new_fechadeinicio: diaADocenciaApi(f.fechaInicio),
  new_fechadefin: diaADocenciaApi(f.fechaFin),
  new_institucionconvocantedelaevaluacion: f.institucion,
  new_rol: f.rol?.value,
  new_otrorol: esValor(f.rol, ROL_OTRO) ? f.otroRol : '',
  new_pais: f.pais?.value,
  new_ciudad: f.ciudad,
  new_observaciones: f.observaciones || '',
});

/** Textos de error iguales a los de ModalJuradoTribunal del portal. */
export const esquemaJurado = yup.object({
  tipoActividad: opcionRequerida('El tipo de actividad de evaluación es obligatorio'),
  otraActividad: otroSiValor(
    'tipoActividad',
    TIPO_ACTIVIDAD_OTRO,
    'Debe especificar el tipo de actividad',
    'El tipo de actividad no puede exceder 100 caracteres',
  ),
  fechaInicio: inicioNoPosterior('La fecha de inicio no puede ser superior a la fecha de fin.').test(
    'inicio-no-futura',
    'La fecha de inicio no puede ser mayor a la fecha actual.',
    (valor) => !valor || !esFechaFutura(valor),
  ),
  fechaFin: finNoAnteriorCon('La fecha de fin no puede ser anterior a la fecha de inicio.'),
  institucion: yup
    .string()
    .trim()
    .max(100, 'La institución convocante no puede exceder 100 caracteres')
    .required('La institución convocante es obligatoria'),
  rol: opcionRequerida('El rol es obligatorio'),
  otroRol: otroSiValor('rol', ROL_OTRO, 'Debe especificar el rol', 'El rol no puede exceder 100 caracteres'),
  pais: opcionRequerida('El País es obligatorio.'),
  ciudad: yup.string().trim().max(100, 'La ciudad no puede exceder 100 caracteres').required('La ciudad es obligatoria'),
  observaciones: yup.string().max(500, 'Máximo 500 caracteres'),
});

// ---------------------------------------------------------------------------
// Categorización externa vigente (new_empleado)
// ---------------------------------------------------------------------------

export interface FormularioExterna {
  ua: OpcionONull;
  categoria: OpcionONull;
  tipo: OpcionONull;
  categoriaConicet: OpcionONull;
  categoriaCic: OpcionONull;
  categoriaAgencia: OpcionONull;
  otraCategoria: OpcionONull;
  textoOtraCategoria: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  lugar: OpcionONull;
  otroLugar: string;
  unidadCertificante: string;
}

export type ExternaVigente = Omit<FormularioExterna, 'lugar'> & { lugar: Opcion };

export const mapearExternaVigente = (f: Fila | undefined): ExternaVigente => {
  const fila = f ?? {};
  const ua = siNoDeValor(fila.new_lugardetrabajo_univaustral);
  return {
    ua,
    categoria: opcionDeLista(fila.new_categorizacionexterna_opglob, CATEGORIZACION_EXTERNA),
    tipo: opcionDeLista(fila.new_tipodecategorizacionconicet, TIPO_CATEGORIZACION),
    categoriaConicet: opcionDeLista(fila.new_categoria_conicet, CONICET_TODAS),
    categoriaCic: opcionDeLista(fila.new_categoria_cic, CIC_TODAS),
    categoriaAgencia: opcionDeLista(fila.new_categoriainvestigador_agencia, CATEGORIAS_AGENCIA),
    otraCategoria: siNoDeValor(fila.new_categoriainvestigadorotra),
    textoOtraCategoria: texto(fila.new_categoriaotra),
    fechaInicio: fechaDeFila(fila, 'new_fechadeingresoinicio_catexterna'),
    fechaFin: fechaDeFila(fila, 'new_fechadefin_catexterna'),
    lugar: opcionDeFila(fila, esValor(ua, 1) ? '_new_lugardetrabajoagencia_value' : '_new_lugardetrabajoinsotor_value'),
    otroLugar: texto(fila.new_lugardetrabajootro),
    unidadCertificante: texto(fila.new_categoexter_unidadcertificante),
  };
};

/** Lugares de trabajo de la categorización externa: unidades organizativas si es la UA; si no, instituciones + "Otra". */
export const lugaresExterna = (
  ua: OpcionONull,
  unidades: OpcionSelect[],
  instituciones: OpcionSelect[],
): OpcionSelect[] => {
  if (esValor(ua, 1)) return unidades;
  return instituciones.some((i) => esOtra(i)) ? instituciones : [...instituciones, OPCION_OTRA];
};

export const externaAFormulario = (
  v: ExternaVigente | null | undefined,
  unidades: OpcionSelect[],
  instituciones: OpcionSelect[],
): FormularioExterna => {
  if (!v) {
    return {
      ua: null,
      categoria: null,
      tipo: null,
      categoriaConicet: null,
      categoriaCic: null,
      categoriaAgencia: null,
      otraCategoria: null,
      textoOtraCategoria: '',
      fechaInicio: null,
      fechaFin: null,
      lugar: null,
      otroLugar: '',
      unidadCertificante: '',
    };
  }
  const lista = lugaresExterna(v.ua, unidades, instituciones);
  let lugar: OpcionONull = null;
  if (tieneValor(v.lugar)) lugar = opcionDeCatalogo(v.lugar, lista);
  else if (v.otroLugar && !esValor(v.ua, 1)) lugar = { value: OPCION_OTRA.value, label: OPCION_OTRA.label };
  return { ...v, lugar };
};

export const EXTERNA_CONICET = CAT_CONICET;
export const EXTERNA_CIC = CAT_CIC;
export const EXTERNA_AGENCIA = CAT_AGENCIA;
export const EXTERNA_OTRA = CAT_OTRA;

/**
 * Cuerpo de PUT api/hrfactors/investigacion/categorizacionExterna/vigente (buildExternaPayload del portal).
 * Diferencias conscientes: a las columnas que no corresponden a la categoría elegida se les manda null (el portal las
 * arma según la categoría); con "Otra" el lugar no se manda como lookup (el portal pasaría el texto "Otra" como id);
 * la unidad certificante no se manda porque el portal tampoco la manda en este endpoint.
 *
 * Lugar de trabajo cuando NO es la UA: el portal LEE ese lookup de _new_lugardetrabajoinsotor_value
 * (hooks/investigacion-perfil/useGetCategorizacionExterna), pero su hook de escritura (useCargarEditarCategorizacionExterna)
 * lo manda en new_lugardetrabajouniv. La API v1 (CategorizacionExternaService.SetVigenteAsync) tiene los tres campos
 * (LugarDeTrabajoUnivId, LugarDeTrabajoAgenciaId, LugarDeTrabajoInsOtorId) y no se puede ver desde el código cómo el
 * endpoint hrfactors mapea new_lugardetrabajouniv. La app lee y escribe insotor, así que lo que guarda es lo mismo que
 * después muestra el portal. Pendiente de confirmar con quien conozca el CRM.
 */
export const armarPayloadExterna = (empleadoId: string, f: FormularioExterna): Record<string, unknown> => {
  const categoria = Number(f.categoria?.value) || null;
  const esUA = esValor(f.ua, 1);
  const conicet = categoria === CAT_CONICET;
  const cic = categoria === CAT_CIC;
  const agencia = categoria === CAT_AGENCIA;
  const otra = categoria === CAT_OTRA;
  const lugarOtra = esOtra(f.lugar);
  const lugarId = tieneValor(f.lugar) && !lugarOtra ? texto(f.lugar?.value) : '';
  const payload: Record<string, unknown> = {
    new_empleadoid: empleadoId,
    new_lugardetrabajo_univaustral: Number(f.ua?.value ?? 0),
    new_categorizacionexterna_opglob: categoria,
    new_categoria_investigador_conicet: '',
    new_tipodecategorizacionconicet: (conicet || cic) && tieneValor(f.tipo) ? Number(f.tipo?.value) : null,
    new_categoria_conicet: conicet && tieneValor(f.categoriaConicet) ? Number(f.categoriaConicet?.value) : null,
    new_categoria_cic: cic && tieneValor(f.categoriaCic) ? Number(f.categoriaCic?.value) : null,
    new_categoriainvestigador_agencia: agencia && tieneValor(f.categoriaAgencia) ? Number(f.categoriaAgencia?.value) : null,
    new_categoriainvestigadorotra: otra && tieneValor(f.otraCategoria) ? Number(f.otraCategoria?.value) : null,
    new_categoriaotra: otra && esValor(f.otraCategoria, 1) ? f.textoOtraCategoria : '',
    new_fechadeingresoinicio_catexterna: diaADocenciaApi(f.fechaInicio),
    new_fechadefin_catexterna: f.fechaFin ? aFechaApi(f.fechaFin) : null,
    new_lugardetrabajouniv: null,
    new_lugardetrabajoagencia: null,
    new_lugardetrabajoinsotor: null,
    new_lugardetrabajoconicet: null,
    new_lugardetrabajootro: lugarOtra ? f.otroLugar || '' : '',
  };
  if (lugarId) {
    if (esUA) payload.new_lugardetrabajoagencia = lugarId;
    else payload.new_lugardetrabajoinsotor = lugarId;
  }
  return payload;
};

/**
 * Esquema de la categorización externa (textos iguales a schemaExterna de categorizacion-externa/page.tsx del portal).
 * `bloqueado` = el formulario se abrió con una categoría ya cargada: solo se puede
 * tocar la fecha de fin, así que no se exige nada más (el portal bloquea el resto de los campos).
 */
export const esquemaExterna = (bloqueado: boolean) => {
  const categoriaEs = (padre: any, ...valores: number[]) => valores.some((v) => esValor(padre.categoria, v));
  const opcionSi = (nombre: string, mensaje: string, condicion: (padre: any) => boolean) =>
    opcionOpcional().test(nombre, mensaje, function (v) {
      return bloqueado || !condicion(this.parent) || tieneValor(v as OpcionLaxa);
    });
  const textoSi = (nombre: string, mensaje: string, condicion: (padre: any) => boolean) =>
    yup
      .string()
      .max(100, 'Máximo 100 caracteres')
      .test(nombre, mensaje, function (v) {
        return bloqueado || !condicion(this.parent) || Boolean(v && v.trim());
      });
  const tieneCategoria = (padre: any) => tieneValor(padre.categoria);
  return yup.object({
    ua: opcionOpcional().test('ua-obligatoria', 'El lugar de trabajo Universidad Austral es requerido', function (v) {
      return bloqueado || tieneValor(v as OpcionLaxa);
    }),
    // Con lugar de trabajo en la UA el formulario queda bloqueado (la categoría la carga el área central).
    categoria: opcionSi('categoria-requerida', 'La categorización externa es requerida', (p) => !esValor(p.ua, 1)),
    tipo: opcionSi('tipo-obligatorio', 'El tipo de categorización es requerido', (p) => categoriaEs(p, CAT_CONICET, CAT_CIC)),
    categoriaConicet: opcionSi(
      'conicet-obligatoria',
      'La categoría es requerida',
      (p) => categoriaEs(p, CAT_CONICET) && tieneValor(p.tipo),
    ),
    categoriaCic: opcionSi(
      'cic-obligatoria',
      'La categoría es requerida',
      (p) => categoriaEs(p, CAT_CIC) && tieneValor(p.tipo),
    ),
    categoriaAgencia: opcionSi('agencia-obligatoria', 'La categoría es requerida', (p) => categoriaEs(p, CAT_AGENCIA)),
    otraCategoria: opcionSi('otra-obligatoria', 'Otra categoría es requerida', (p) => categoriaEs(p, CAT_OTRA)),
    textoOtraCategoria: textoSi(
      'texto-otra-obligatorio',
      'La categoría es requerida',
      (p) => categoriaEs(p, CAT_OTRA) && esValor(p.otraCategoria, 1),
    ),
    fechaInicio: fechaOpcional().test('inicio-obligatoria', 'La fecha de inicio es requerida', function (v) {
      return bloqueado || !tieneCategoria(this.parent) || Boolean(v);
    }),
    fechaFin: finNoAnteriorCon(FIN_EXTERNA),
    // El esquema del portal exige el lugar de trabajo con cualquier categoría (también con "Otra").
    lugar: opcionSi('lugar-obligatorio', 'El lugar de trabajo es requerido', (p) =>
      categoriaEs(p, CAT_CONICET, CAT_CIC, CAT_AGENCIA, CAT_OTRA),
    ),
    otroLugar: textoSi('otro-lugar-obligatorio', 'Debe especificar el lugar de trabajo', (p) =>
      esOtra(p.lugar) && tieneCategoria(p),
    ),
    unidadCertificante: textoSi(
      'unidad-obligatoria',
      'La unidad certificante es requerida',
      (p) => categoriaEs(p, CAT_CONICET) && esValor(p.ua, 1),
    ),
  });
};

// ---------------------------------------------------------------------------
// Categorización PRINUAR vigente (new_empleado)
// ---------------------------------------------------------------------------

export interface FormularioPrinuar {
  ua: OpcionONull;
  categoria: OpcionONull;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  lugar: OpcionONull;
  otroLugar: string;
}

export type PrinuarVigente = Omit<FormularioPrinuar, 'lugar'> & { lugar: Opcion };

export const mapearPrinuarVigente = (f: Fila | undefined): PrinuarVigente => {
  const fila = f ?? {};
  const ua = siNoDeValor(fila.new_lugardetrabajo_univaustral_prinuar);
  return {
    ua,
    categoria: opcionDeLista(fila.new_categoriainvestigador_prinuar, CATEGORIAS_PRINUAR),
    fechaInicio: fechaDeFila(fila, 'new_fechadeingresoiniciocatprinuar'),
    fechaFin: fechaDeFila(fila, 'new_fechadefincatprinuar'),
    lugar: opcionDeFila(
      fila,
      esValor(ua, 1) ? '_new_lugardetrabajoprinuar_unidorg_value' : '_new_lugardetrabajoprinuarinstitucionotorgante_value',
    ),
    otroLugar: texto(fila.new_prinuarotra),
  };
};

/** Lugares de trabajo PRINUAR: unidades organizativas si es la UA; si no, instituciones otorgantes. */
export const lugaresPrinuar = (
  ua: OpcionONull,
  unidades: OpcionSelect[],
  instituciones: OpcionSelect[],
): OpcionSelect[] => (esValor(ua, 1) ? unidades : instituciones);

export const prinuarAFormulario = (
  v: PrinuarVigente | null | undefined,
  unidades: OpcionSelect[],
  instituciones: OpcionSelect[],
): FormularioPrinuar => {
  if (!v) return { ua: null, categoria: null, fechaInicio: null, fechaFin: null, lugar: null, otroLugar: '' };
  const lista = lugaresPrinuar(v.ua, unidades, instituciones);
  let lugar: OpcionONull = null;
  if (tieneValor(v.lugar)) lugar = opcionDeCatalogo(v.lugar, lista);
  else if (v.otroLugar) {
    const otra = lista.find((o) => esOtra(o));
    lugar = otra ? { value: otra.value, label: otra.label } : null;
  }
  return { ...v, lugar };
};

/** Cuerpo de PUT / POST api/hrfactors/investigacion/categorizacionPrinuar/vigente (buildPrinuarPayload del portal). */
export const armarPayloadPrinuar = (empleadoId: string, f: FormularioPrinuar): Record<string, unknown> => {
  const esUA = esValor(f.ua, 1);
  const otra = esOtra(f.lugar);
  const payload: Record<string, unknown> = {
    new_empleadoid: empleadoId,
    new_lugardetrabajo_univaustral_prinuar: esUA,
    new_categoriainvestigador_prinuar: tieneValor(f.categoria) ? Number(f.categoria?.value) : null,
    new_fechadeingresoiniciocatprinuar: diaADocenciaApi(f.fechaInicio),
    new_fechadefincatprinuar: diaADocenciaApi(f.fechaFin),
    new_lugardetrabajoprinuar_universidad: null,
    new_lugardetrabajoprinuarinstitucionotorgante: null,
    new_lugardetrabajoprinuar_unidorg: null,
    new_prinuarotra: otra ? f.otroLugar || '' : '',
  };
  payload[esUA ? 'new_lugardetrabajoprinuar_unidorg' : 'new_lugardetrabajoprinuarinstitucionotorgante'] =
    tieneValor(f.lugar) ? texto(f.lugar?.value) : null;
  return payload;
};

/**
 * Igual que la externa: con una categoría ya cargada solo se edita la fecha de fin y no se exige el resto.
 * Textos iguales a schemaPrinuar de categorizacion-externa/page.tsx del portal.
 */
export const esquemaPrinuar = (bloqueado: boolean) =>
  yup.object({
    ua: opcionOpcional().test('ua-obligatoria', 'El lugar de trabajo Universidad Austral Prinuar es requerido', function (v) {
      return bloqueado || tieneValor(v as OpcionLaxa);
    }),
    categoria: opcionOpcional().test('categoria-obligatoria', 'La categoría Prinuar es requerida', function (v) {
      return bloqueado || tieneValor(v as OpcionLaxa);
    }),
    fechaInicio: fechaOpcional().test('inicio-obligatoria', 'La fecha de inicio es requerida', function (v) {
      return bloqueado || Boolean(v);
    }),
    fechaFin: finNoAnteriorCon(FIN_EXTERNA),
    lugar: opcionOpcional().test('lugar-obligatorio', 'El lugar de trabajo Prinuar es requerido', function (v) {
      return bloqueado || tieneValor(v as OpcionLaxa);
    }),
    otroLugar: yup
      .string()
      .max(100, 'Máximo 100 caracteres')
      .test('otro-lugar-obligatorio', 'Debe especificar el lugar de trabajo', function (v) {
        return bloqueado || !esOtra(this.parent.lugar) || Boolean(v && v.trim());
      }),
  });

// ---------------------------------------------------------------------------
// Históricos (solo lectura)
// ---------------------------------------------------------------------------

export interface CategorizacionExternaHistorica {
  id: string;
  categorizacion: string;
  categoria: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  otroLugar: string;
}

const fechaVisibleDeFila = (f: Fila, atributo: string): string => {
  const fecha = fechaDeFila(f, atributo);
  if (!fecha) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(fecha.getDate())}/${p(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
};

export const mapearExternasHistoricas = (filas: Fila[]): CategorizacionExternaHistorica[] =>
  filas.map((f) => ({
    id: texto(f?.new_categorizacionexternaid),
    categorizacion: texto(f?.new_categorizacionexterna_historico),
    categoria: texto(f?.new_categoriainvestigadorconicet).trim(),
    fechaInicio: fechaVisibleDeFila(f, 'new_fechadeinicio'),
    fechaFin: fechaVisibleDeFila(f, 'new_fechadefin'),
    lugar: texto(f?.new_lugardetrabajo_historico),
    otroLugar: texto(f?.new_lugardetrabajo_otro),
  }));

export interface CategorizacionPrinuarHistorica {
  id: string;
  categoria: string;
  fechaInicio: string;
  fechaFin: string;
  lugar: string;
  otroLugar: string;
}

export const mapearPrinuarHistoricas = (filas: Fila[]): CategorizacionPrinuarHistorica[] =>
  filas.map((f) => ({
    id: texto(f?.new_categorizacionprinuarid),
    categoria: fv(f, 'new_categoriaprinuar'),
    fechaInicio: fechaVisibleDeFila(f, 'new_fechadeinicio'),
    fechaFin: fechaVisibleDeFila(f, 'new_fechadefin'),
    lugar: texto(f?.new_lugardetrabajo_historico),
    otroLugar: texto(f?.new_lugardetrabajoprinuar_otro),
  }));
