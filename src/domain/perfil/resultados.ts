// Perfil > Investigación > Resultados / Impacto I+D: Estancias y Participación en jornadas, congresos y eventos.
// Port de Portal-Austral-Dev -> perfil/investigacion/resultados-impacto-i+d/{estancias,participacion-jornadas}/page.tsx,
// perfil/_components/investigacion/resultados-impacto-i+d/{estancias,participacion}/modales/*,
// hooks/investigacion-perfil/{useCargarEditarFormacionEstancias,useCargarEditarParticipacionJornadas,useGetEstancias,
// useGetParticipaciones}.ts y store/useInvestigacionDocenciaStore.ts.
import * as yup from 'yup';
import type { Opcion, OpcionSelect } from '../legajo/tipos';
import { esValor } from './afiliaciones';
import {
  fechaDeFila,
  fechaOpcional,
  fechaRequerida,
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

const dia = (f: Date): number => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

/** Texto obligatorio con tope de caracteres. */
const textoConTope = (mensajeRequerido: string, mensajeMaximo: string, maximo = 100) =>
  yup.string().trim().max(maximo, mensajeMaximo).required(mensajeRequerido);

/** Texto que solo es obligatorio si el select `campo` tiene el valor `valor` (el "Otro/a" de cada lista). */
const otroSiValor = (campo: string, valor: number, mensaje: string, mensajeMaximo: string, maximo = 100) =>
  yup
    .string()
    .max(maximo, mensajeMaximo)
    .test(`otro-${campo}`, mensaje, function (v) {
      return !esValor(this.parent[campo], valor) || Boolean(v && v.trim());
    });

// ---------------------------------------------------------------------------
// Estancias
// ---------------------------------------------------------------------------

const ESTANCIA_OTROS = 100000003;

export const TIPO_ACTIVIDAD_ESTANCIA: OpcionDeLista[] = [
  { value: 100000000, label: 'Tareas de investigación y desarrollo' },
  { value: 100000001, label: 'Tareas de docencia' },
  { value: 100000002, label: 'Formación académica' },
  { value: ESTANCIA_OTROS, label: 'Otros' },
];

export interface Estancia {
  id: string;
  tipoActividad: OpcionONull;
  otraActividad: string;
  institucion: string;
  pais: Opcion;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const mapearEstancias = (filas: Fila[]): Estancia[] =>
  filas.map((f) => ({
    id: texto(f?.new_estanciasid),
    tipoActividad: opcionDeLista(f?.new_tipodeactividadrealizada, TIPO_ACTIVIDAD_ESTANCIA),
    otraActividad: texto(f?.new_otraactividad),
    institucion: texto(f?.new_institucion),
    pais: opcionDeFila(f, '_new_pais_value'),
    fechaInicio: fechaDeFila(f, 'new_fechadeinicio'),
    fechaFin: fechaDeFila(f, 'new_fechadefin'),
  }));

export interface FormularioEstancia {
  tipoActividad: OpcionONull;
  otraActividad: string;
  institucion: string;
  pais: OpcionONull;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const estanciaAFormulario = (e: Estancia | undefined, paises: OpcionSelect[]): FormularioEstancia => ({
  tipoActividad: e?.tipoActividad ?? null,
  otraActividad: e?.otraActividad ?? '',
  institucion: e?.institucion ?? '',
  pais: opcionDeCatalogo(e?.pais, paises),
  fechaInicio: e?.fechaInicio ?? null,
  fechaFin: e?.fechaFin ?? null,
});

export const estanciaEsOtros = (tipo: OpcionONull): boolean => esValor(tipo, ESTANCIA_OTROS);

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/estancias (hooks/investigacion-perfil/useCargarEditarFormacionEstancias).
 * El alta manda new_colaborador y new_estanciasid vacío; la edición manda el id. new_name no tiene campo en el
 * formulario del portal: viaja vacío.
 * A VERIFICAR: el portal manda las fechas tal como las guarda su formulario; acá van en el formato de las demás
 * pantallas de Perfil (diaADocenciaApi).
 */
export const armarPayloadEstancia = (empleadoId: string, f: FormularioEstancia, id?: string): Record<string, unknown> => ({
  ...(id ? { new_estanciasid: id } : { new_colaborador: empleadoId, new_estanciasid: '' }),
  new_name: '',
  new_tipodeactividadrealizada: f.tipoActividad?.value || 0,
  new_otraactividad: estanciaEsOtros(f.tipoActividad) ? f.otraActividad : '',
  new_institucion: f.institucion || '',
  new_pais: f.pais?.value || '',
  new_fechadeinicio: diaADocenciaApi(f.fechaInicio) ?? '',
  new_fechadefin: diaADocenciaApi(f.fechaFin) ?? '',
});

export const esquemaEstancia = yup.object({
  // El portal no exige el tipo de actividad realizada.
  tipoActividad: opcionOpcional(),
  otraActividad: otroSiValor(
    'tipoActividad',
    ESTANCIA_OTROS,
    'Debe especificar el tipo de actividad',
    "El campo 'Otro' no puede tener más de 100 caracteres",
  ),
  institucion: textoConTope('La institución es obligatoria', 'La institución no puede tener más de 100 caracteres'),
  pais: opcionRequerida('El País es obligatorio.'),
  fechaInicio: fechaRequerida('La fecha de inicio es obligatoria').test(
    'inicio-orden',
    'La fecha de inicio no puede ser superior a la fecha de fin.',
    function (valor) {
      const fin = this.parent.fechaFin as Date | null;
      if (!valor || !fin) return true;
      return dia(valor) <= dia(fin);
    },
  ),
  fechaFin: fechaOpcional().test(
    'fin-orden',
    'La fecha de fin no puede ser anterior a la fecha de inicio.',
    function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      if (!valor || !inicio) return true;
      return dia(valor) >= dia(inicio);
    },
  ),
});

// ---------------------------------------------------------------------------
// Participación en jornadas, congresos y eventos
// ---------------------------------------------------------------------------

const ACTIVIDAD_OTRO = 100000003;
const PARTICIPACION_OTRO = 100000006;

export const TIPO_ACTIVIDAD_JORNADA: OpcionDeLista[] = [
  { value: 100000000, label: 'Congreso' },
  { value: 100000001, label: 'Jornada' },
  { value: 100000002, label: 'Evento' },
  { value: ACTIVIDAD_OTRO, label: 'Otro' },
];

export const TIPO_PARTICIPACION_JORNADA: OpcionDeLista[] = [
  { value: 100000000, label: 'Asistente' },
  { value: 100000001, label: 'Organizador general' },
  { value: 100000002, label: 'Miembro del comité organizador' },
  { value: 100000003, label: 'Miembro del comité científico-tecnológico' },
  { value: 100000004, label: 'Coordinador/moderador' },
  { value: 100000005, label: 'Relator' },
  { value: PARTICIPACION_OTRO, label: 'Otro' },
];

export interface Jornada {
  id: string;
  nombre: string;
  tipoActividad: OpcionONull;
  otraActividad: string;
  lugar: string;
  tipoParticipacion: OpcionONull;
  otraParticipacion: string;
  fecha: Date | null;
}

export const mapearJornadas = (filas: Fila[]): Jornada[] =>
  filas.map((f) => ({
    id: texto(f?.new_participacioneneventosycongresosid),
    nombre: texto(f?.new_name),
    tipoActividad: opcionDeLista(f?.new_tipodeactividad, TIPO_ACTIVIDAD_JORNADA),
    otraActividad: texto(f?.new_otraactividad),
    lugar: texto(f?.new_lugar),
    tipoParticipacion: opcionDeLista(f?.new_tipodeparticipacion, TIPO_PARTICIPACION_JORNADA),
    otraParticipacion: texto(f?.new_otraparticipacion),
    fecha: fechaDeFila(f, 'new_fecha'),
  }));

export interface FormularioJornada {
  nombre: string;
  tipoActividad: OpcionONull;
  otraActividad: string;
  lugar: string;
  tipoParticipacion: OpcionONull;
  otraParticipacion: string;
  fecha: Date | null;
}

export const jornadaAFormulario = (j: Jornada | undefined): FormularioJornada => ({
  nombre: j?.nombre ?? '',
  tipoActividad: j?.tipoActividad ?? null,
  otraActividad: j?.otraActividad ?? '',
  lugar: j?.lugar ?? '',
  tipoParticipacion: j?.tipoParticipacion ?? null,
  otraParticipacion: j?.otraParticipacion ?? '',
  fecha: j?.fecha ?? null,
});

export const jornadaActividadEsOtro = (tipo: OpcionONull): boolean => esValor(tipo, ACTIVIDAD_OTRO);
export const jornadaParticipacionEsOtro = (tipo: OpcionONull): boolean => esValor(tipo, PARTICIPACION_OTRO);

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/participacionJornadas
 * (hooks/investigacion-perfil/useCargarEditarParticipacionJornadas). El alta y la edición mandan new_colaborador;
 * la edición agrega el id.
 */
export const armarPayloadJornada = (empleadoId: string, f: FormularioJornada, id?: string): Record<string, unknown> => ({
  ...(id ? { new_participacioneneventosycongresosid: id } : {}),
  new_colaborador: empleadoId,
  new_name: f.nombre || '',
  new_tipodeactividad: f.tipoActividad?.value || 0,
  new_otraactividad: jornadaActividadEsOtro(f.tipoActividad) ? f.otraActividad : '',
  new_lugar: f.lugar || '',
  new_tipodeparticipacion: f.tipoParticipacion?.value || 0,
  new_otraparticipacion: jornadaParticipacionEsOtro(f.tipoParticipacion) ? f.otraParticipacion : '',
  new_fecha: diaADocenciaApi(f.fecha) ?? '',
});

export const esquemaJornada = yup.object({
  nombre: textoConTope('El nombre es obligatorio', 'El nombre no puede exceder 100 caracteres'),
  tipoActividad: opcionRequerida('El tipo de actividad es obligatorio'),
  otraActividad: otroSiValor(
    'tipoActividad',
    ACTIVIDAD_OTRO,
    'Debe especificar el tipo de actividad',
    'El tipo de actividad no puede exceder 100 caracteres',
  ),
  lugar: textoConTope('El lugar es requerido', 'El lugar no puede exceder 100 caracteres'),
  tipoParticipacion: opcionRequerida('El Tipo de participación es obligatorio'),
  otraParticipacion: otroSiValor(
    'tipoParticipacion',
    PARTICIPACION_OTRO,
    'Debe especificar el tipo de participación',
    'El tipo de participación no puede exceder 100 caracteres',
  ),
  fecha: fechaRequerida('La fecha es obligatoria'),
});
