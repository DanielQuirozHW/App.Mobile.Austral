// Tipos, mapeo de filas del CRM, cálculo del máximo nivel y armado de payloads de Perfil > Formación.
// Port de Portal-Austral-Dev -> src/hooks/formacion/*, src/stores/useFormacionStore.ts y
// src/app/(dashboard)/perfil/formacion/page.tsx y sus modales.
import { aFechaApi } from '../legajo/fechas';
import { mapearAdjunto } from '../legajo/mapeo';
import type { Adjunto, Opcion, OpcionSelect } from '../legajo/tipos';
import {
  FV,
  anioAFechaApi,
  anioADiaApi,
  anioDeFila,
  booleanAOpcion,
  fechaDeFila,
  opcionABoolean,
  opcionDeAnio,
  opcionDeFila,
  opcionDeLista,
  opcionDeListaPorEtiqueta,
  opcionONull,
  texto,
  type ArchivoDeFormulario,
  type Fila,
  type OpcionONull,
} from './comun';
import {
  CARRERA_POSDOCTORAL,
  EDUCACION_BASICA,
  EDUCACION_BASICA_SECUNDARIO_COMPLETO,
  EJES_FORMATIVOS,
  ESPECIALIDADES,
  ESTADOS_CERTIFICACION,
  ESTADOS_ESPECIALIDAD,
  ESTADOS_POSDOCTORAL,
  ESTADOS_TITULO,
  ESTADO_FINALIZADO,
  IDIOMAS,
  IDIOMA_OTRO,
  NIVELES_IDIOMA,
  ORIGENES_CERTIFICACION,
  TIPOS_CARRERA_POSGRADO,
  TIPOS_CARRERA_PREGRADO,
  TIPOS_FORMACION_CERTIFICACION,
  TIPOS_FORMACION_ESPECIALIDAD,
} from './formacionOpciones';

// ---------------------------------------------------------------------------
// Datos del empleado que usa la pantalla (tarjeta superior)
// ---------------------------------------------------------------------------

export interface DatosFormacionEmpleado {
  educacionBasica: OpcionONull;
  linkLinkedin: string;
  linkResearch: string;
}

/** Primera fila de new_empleado (atributos new_tituloseducacionbasica, new_linklinkedin y new_linkresearchgate). */
export const mapearEmpleadoFormacion = (fila: Fila): DatosFormacionEmpleado => ({
  educacionBasica: opcionDeLista(fila?.new_tituloseducacionbasica, EDUCACION_BASICA),
  linkLinkedin: texto(fila?.new_linklinkedin),
  linkResearch: texto(fila?.new_linkresearchgate),
});

// ---------------------------------------------------------------------------
// Títulos
// ---------------------------------------------------------------------------

export type CategoriaTitulo = 'pregrado' | 'posgrado' | 'posdoctoral';

export interface Titulo {
  id: string;
  /** new_tipodecarrera con el texto del CRM. */
  tipo: Opcion;
  denominacion: string;
  pais: Opcion;
  institucion: Opcion;
  otraInstitucion: string;
  /** Año de inicio de cursada (yyyy). */
  anioInicio: string;
  /** statuscode con el texto del CRM. */
  estado: Opcion;
  anioObtencion: string;
  tituloTesis: string;
  becado: OpcionONull;
  institucionFinanciadora: string;
  adjuntos: Adjunto[];
}

export const mapearTitulo = (fila: Fila, adjuntosPorTitulo: Record<string, Adjunto[]>): Titulo => {
  const id = texto(fila?.new_universidadporcontactoid);
  return {
    id,
    tipo: opcionDeFila(fila, 'new_tipodecarrera'),
    denominacion: texto(fila?.new_titulo),
    pais: opcionDeFila(fila, '_new_pais_value'),
    institucion: opcionDeFila(fila, '_new_institucionotorgante_value'),
    otraInstitucion: texto(fila?.new_institucionotorganteotro),
    anioInicio: anioDeFila(fila, 'new_fechadeingreso'),
    estado: opcionDeFila(fila, 'statuscode'),
    anioObtencion: anioDeFila(fila, 'new_fechaegreso'),
    tituloTesis: texto(fila?.new_titulodelatesis),
    becado: booleanAOpcion(fila?.new_lorealizoconunabeca, fila?.[`new_lorealizoconunabeca${FV}`]),
    institucionFinanciadora: texto(fila?.new_institucionfinanciadoraseleccionada).trim(),
    adjuntos: adjuntosPorTitulo[id] ?? [],
  };
};

/** Agrupa las notas (alias `aj` de la consulta de adjuntos) por título. */
export const agruparNotasPorTitulo = (notas: unknown): Record<string, Adjunto[]> => {
  const grupos: Record<string, Adjunto[]> = {};
  if (!Array.isArray(notas)) return grupos;
  for (const nota of notas) {
    const tituloId = nota?.['aj.new_universidadporcontactoid'];
    if (!tituloId) continue;
    (grupos[tituloId] ||= []).push(mapearAdjunto(nota));
  }
  return grupos;
};

const esFinalizado = (estado: OpcionONull | Opcion | undefined): boolean =>
  Number(estado?.value) === ESTADO_FINALIZADO;

// Tipos de carrera -> nivel que cuenta para el máximo nivel de formación, de mayor a menor (page.tsx de formación).
const JERARQUIA_NIVEL: Array<{ carrera: number; nivel: Opcion }> = [
  { carrera: 100000004, nivel: { value: 100000003, label: 'Doctorado' } },
  { carrera: 100000003, nivel: { value: 100000002, label: 'Maestría' } },
  { carrera: 100000002, nivel: { value: 100000001, label: 'Especialización' } },
  { carrera: 100000001, nivel: { value: 100000000, label: 'Grado' } },
  { carrera: 100000006, nivel: { value: 100000005, label: 'Pregrado' } },
];

/**
 * Máximo nivel de formación: el más alto entre los títulos de pregrado/grado y posgrado FINALIZADOS. Sin títulos
 * finalizados, "Secundario" si la educación básica es secundario completo y "N/A" en cualquier otro caso. La formación
 * posdoctoral no entra en el cálculo.
 */
export const calcularNivelMaximo = (titulos: Titulo[], educacionBasica: OpcionONull): Opcion => {
  const finalizados = new Set(titulos.filter((t) => esFinalizado(t.estado)).map((t) => Number(t.tipo.value)));
  for (const { carrera, nivel } of JERARQUIA_NIVEL) {
    if (finalizados.has(carrera)) return nivel;
  }
  if (Number(educacionBasica?.value) === EDUCACION_BASICA_SECUNDARIO_COMPLETO) {
    return { value: 100000004, label: 'Secundario' };
  }
  return { value: 100000006, label: 'N/A' };
};

export interface FormularioTitulo {
  tipo: OpcionONull;
  denominacion: string;
  pais: OpcionONull;
  institucion: OpcionONull;
  otraInstitucion: string;
  anioInicio: OpcionONull;
  estado: OpcionONull;
  anioObtencion: OpcionONull;
  tituloTesis: string;
  becado: OpcionONull;
  institucionFinanciadora: string;
  archivosAdjuntos: ArchivoDeFormulario[];
}

export const tituloAFormulario = (titulo: Titulo | undefined, categoria: CategoriaTitulo): FormularioTitulo => ({
  tipo:
    categoria === 'posdoctoral'
      ? null
      : opcionDeLista(
          titulo?.tipo.value,
          categoria === 'pregrado' ? TIPOS_CARRERA_PREGRADO : TIPOS_CARRERA_POSGRADO,
        ),
  denominacion: titulo?.denominacion ?? '',
  pais: opcionONull(titulo?.pais),
  institucion: opcionONull(titulo?.institucion),
  otraInstitucion: titulo?.otraInstitucion ?? '',
  anioInicio: opcionDeAnio(titulo?.anioInicio),
  estado: opcionDeLista(titulo?.estado.value, categoria === 'posdoctoral' ? ESTADOS_POSDOCTORAL : ESTADOS_TITULO),
  anioObtencion: opcionDeAnio(titulo?.anioObtencion),
  tituloTesis: titulo?.tituloTesis ?? '',
  becado: titulo?.becado ?? null,
  institucionFinanciadora: titulo?.institucionFinanciadora ?? '',
  archivosAdjuntos: [],
});

/**
 * Cuerpo de POST / PUT api/hrfactors/titulosgradoposgrado (useCargarTitulosGrado del portal).
 * Posgrado y posdoctoral suman la beca y la institución financiadora.
 */
export const armarPayloadTitulo = (
  empleadoId: string,
  categoria: CategoriaTitulo,
  datos: FormularioTitulo,
  id?: string,
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    ...(id ? { new_universidadporcontactoid: id } : {}),
    new_empleado: empleadoId,
    new_universidad: datos.institucion?.value || '',
    new_institucionotorganteotro: datos.otraInstitucion || '',
    new_pais: datos.pais?.value || '',
    new_titulo: datos.denominacion || '',
    new_tipodecarrera: categoria === 'posdoctoral' ? CARRERA_POSDOCTORAL : datos.tipo?.value || 0,
    new_fechadeingreso: anioAFechaApi(datos.anioInicio?.value),
    new_fechaegreso: anioAFechaApi(datos.anioObtencion?.value),
    new_titulodelatesis: datos.tituloTesis || '',
    statuscode: datos.estado?.value || 0,
  };
  if (categoria === 'pregrado') return payload;

  const becado = opcionABoolean(datos.becado) === true;
  // new_lorealizoconunabeca: `becado.value || null` ("No" se envía como null).
  payload.new_lorealizoconunabeca = becado ? true : null;
  const financiadora = datos.institucionFinanciadora ?? '';
  if (categoria === 'posdoctoral') {
    // Sin beca y sin institución se manda un espacio; con beca, el texto recortado.
    payload.new_institucionfinanciadoraseleccionada = becado ? financiadora.trim() : financiadora || ' ';
  } else {
    payload.new_institucionfinanciadoraseleccionada = financiadora;
  }
  return payload;
};

// ---------------------------------------------------------------------------
// Especialidad certificada por organismo/s de salud
// ---------------------------------------------------------------------------

export interface Especialidad {
  id: string;
  tipoFormacion: Opcion;
  otroTipoFormacion: string;
  especialidad: Opcion;
  otraEspecialidad: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: Opcion;
  anioObtencion: string;
}

export const mapearEspecialidad = (fila: Fila): Especialidad => ({
  id: texto(fila?.new_especialidadcertificadosaludid),
  tipoFormacion: opcionDeFila(fila, 'new_tipodeformacionincluida'),
  otroTipoFormacion: texto(fila?.new_tipodeformacionincluidaotro),
  especialidad: opcionDeFila(fila, 'new_especialidad'),
  otraEspecialidad: texto(fila?.new_especialidadotro),
  fechaInicio: fechaDeFila(fila, 'new_fechadeinicio'),
  fechaFin: fechaDeFila(fila, 'new_fechadefin'),
  estado: opcionDeFila(fila, 'statuscode'),
  anioObtencion: anioDeFila(fila, 'new_anodeobtenciondelaultimacertificacin'),
});

export interface FormularioEspecialidad {
  tipoFormacion: OpcionONull;
  otroTipoFormacion: string;
  especialidad: OpcionONull;
  otraEspecialidad: string;
  fechaInicio: Date | null;
  estado: OpcionONull;
  fechaFin: Date | null;
  anioObtencion: OpcionONull;
}

export const especialidadAFormulario = (e?: Especialidad): FormularioEspecialidad => ({
  tipoFormacion: opcionDeLista(e?.tipoFormacion.value, TIPOS_FORMACION_ESPECIALIDAD),
  otroTipoFormacion: e?.otroTipoFormacion ?? '',
  especialidad: opcionDeLista(e?.especialidad.value, ESPECIALIDADES),
  otraEspecialidad: e?.otraEspecialidad ?? '',
  fechaInicio: e?.fechaInicio ?? null,
  estado: opcionDeLista(e?.estado.value, ESTADOS_ESPECIALIDAD),
  fechaFin: e?.fechaFin ?? null,
  anioObtencion: opcionDeAnio(e?.anioObtencion),
});

export const armarPayloadEspecialidad = (
  empleadoId: string,
  datos: FormularioEspecialidad,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_especialidadcertificadosaludid: id } : {}),
  new_empleadoid: empleadoId,
  new_especialidad: datos.especialidad?.value || '',
  new_especialidadotro: datos.otraEspecialidad || '',
  new_fechadeinicio: aFechaApi(datos.fechaInicio),
  new_fechadefin: aFechaApi(datos.fechaFin),
  new_tipodeformacionincluida: datos.tipoFormacion?.value || '',
  new_tipodeformacionincluidaotro: datos.otroTipoFormacion || '',
  new_anodeobtenciondelaultimacertificacin: anioADiaApi(datos.anioObtencion?.value),
  statuscode: datos.estado?.value || 0,
});

// ---------------------------------------------------------------------------
// Certificaciones / Capacitaciones
// ---------------------------------------------------------------------------

export interface Certificacion {
  id: string;
  /** Origen: Interna / Externa Austral (new_tipo). */
  tipoCapacitacion: Opcion;
  tipoFormacion: Opcion;
  otroTipoFormacion: string;
  /** Eje formativo (new_segmento). */
  segmento: Opcion;
  otroSegmento: string;
  denominacion: string;
  institucion: string;
  duracionMeses: string;
  cargaHoraria: string;
  estado: Opcion;
  fechaInicio: Date | null;
  fechaObtencion: Date | null;
  fechaFin: Date | null;
  area: string;
  tipoCapacitacionInterna: string;
}

export const mapearCertificacion = (fila: Fila): Certificacion => ({
  id: texto(fila?.new_certificaciones_capacitacionesid),
  tipoCapacitacion: opcionDeFila(fila, 'new_tipo'),
  tipoFormacion: opcionDeFila(fila, 'new_tipodeformacion'),
  otroTipoFormacion: texto(fila?.new_tipodeformacionotro),
  segmento: opcionDeFila(fila, 'new_segmento'),
  otroSegmento: texto(fila?.new_segmentootro),
  denominacion: texto(fila?.new_denominaciondelacertificacion),
  institucion: texto(fila?.new_institucionorganismootorgante),
  duracionMeses: texto(fila?.new_duracionenmeses),
  cargaHoraria: texto(fila?.new_cargahoraria),
  estado: opcionDeFila(fila, 'statuscode'),
  fechaInicio: fechaDeFila(fila, 'new_fechadeinicio'),
  fechaObtencion: fechaDeFila(fila, 'new_fechadeobtenciondelacertificacion'),
  fechaFin: fechaDeFila(fila, 'new_fechadefinalizacion'),
  area: texto(fila?.new_areacapacitadora),
  tipoCapacitacionInterna: texto(fila?.new_tipodecapacitacion),
});

export interface FormularioCertificacion {
  tipoCapacitacion: OpcionONull;
  tipoFormacion: OpcionONull;
  otroTipoFormacion: string;
  segmento: OpcionONull;
  otroSegmento: string;
  denominacion: string;
  institucion: string;
  area: string;
  duracionMeses: string;
  cargaHoraria: string;
  estado: OpcionONull;
  fechaInicio: Date | null;
  fechaObtencion: Date | null;
  fechaFin: Date | null;
  /** No se muestra en el formulario del portal: se conserva lo que ya tenía el registro. */
  tipoCapacitacionInterna: string;
}

export const certificacionAFormulario = (c?: Certificacion): FormularioCertificacion => ({
  tipoCapacitacion: opcionDeLista(c?.tipoCapacitacion.value, ORIGENES_CERTIFICACION),
  tipoFormacion: opcionDeLista(c?.tipoFormacion.value, TIPOS_FORMACION_CERTIFICACION),
  otroTipoFormacion: c?.otroTipoFormacion ?? '',
  segmento: opcionDeLista(c?.segmento.value, EJES_FORMATIVOS),
  otroSegmento: c?.otroSegmento ?? '',
  denominacion: c?.denominacion ?? '',
  institucion: c?.institucion ?? '',
  area: c?.area ?? '',
  duracionMeses: c?.duracionMeses ?? '',
  cargaHoraria: c?.cargaHoraria ?? '',
  estado: opcionDeLista(c?.estado.value, ESTADOS_CERTIFICACION),
  fechaInicio: c?.fechaInicio ?? null,
  fechaObtencion: c?.fechaObtencion ?? null,
  fechaFin: c?.fechaFin ?? null,
  tipoCapacitacionInterna: c?.tipoCapacitacionInterna ?? '',
});

export const armarPayloadCertificacion = (
  empleadoId: string,
  datos: FormularioCertificacion,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_certificaciones_capacitacionesid: id } : {}),
  new_empleadoid: empleadoId,
  new_tipo: datos.tipoCapacitacion?.value || 0,
  new_tipodeformacion: datos.tipoFormacion?.value || 0,
  new_tipodeformacionotro: datos.otroTipoFormacion || '',
  new_segmento: datos.segmento?.value || 0,
  new_segmentootro: datos.otroSegmento || '',
  new_areacapacitadora: datos.area || '',
  new_denominaciondelacertificacion: datos.denominacion || '',
  new_fechadeinicio: aFechaApi(datos.fechaInicio),
  new_fechadefinalizacion: aFechaApi(datos.fechaFin),
  new_fechadeobtenciondelacertificacion: aFechaApi(datos.fechaObtencion),
  new_tipodecapacitacion: datos.tipoCapacitacionInterna || '',
  new_cargahoraria: Number(datos.cargaHoraria) || 0,
  new_duracionenmeses: Number(datos.duracionMeses) || 0,
  new_institucionorganismootorgante: datos.institucion || '',
  statuscode: datos.estado?.value || 0,
});

// ---------------------------------------------------------------------------
// Idioma
// ---------------------------------------------------------------------------

export interface Idioma {
  id: string;
  /** Texto del idioma (new_idiomalist formateado). */
  idioma: string;
  nivel: Opcion;
  otroIdioma: string;
}

export const mapearIdioma = (fila: Fila): Idioma => ({
  id: texto(fila?.new_idiomaporcontactoid),
  idioma: texto(fila?.[`new_idiomalist${FV}`]),
  nivel: opcionDeFila(fila, 'new_nivel'),
  otroIdioma: texto(fila?.new_idiomatxt),
});

export interface FormularioIdioma {
  idioma: OpcionONull;
  otroIdioma: string;
  nivel: OpcionONull;
}

export const idiomaAFormulario = (i?: Idioma): FormularioIdioma => ({
  // Al editar, el idioma llega como texto: la opción se busca por su etiqueta.
  idioma: opcionDeListaPorEtiqueta(i?.idioma, IDIOMAS),
  otroIdioma: i?.otroIdioma ?? '',
  nivel: opcionDeLista(i?.nivel.value, NIVELES_IDIOMA),
});

export const armarPayloadIdioma = (
  empleadoId: string,
  datos: FormularioIdioma,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_idiomaporcontactoid: id } : {}),
  new_empleado: empleadoId,
  new_nivel: datos.nivel?.value,
  new_idioma: datos.idioma?.value,
  // El texto del otro idioma solo corresponde cuando el idioma elegido es "Otro".
  new_idiomaOtro: Number(datos.idioma?.value) === IDIOMA_OTRO ? datos.otroIdioma : '',
});

// ---------------------------------------------------------------------------
// Áreas de expertise - áreas de actuación
// ---------------------------------------------------------------------------

export interface AreaExpertise {
  id: string;
  area: Opcion;
  actuacion: Opcion;
  agrupador: Opcion;
  otraActuacion: string;
  otraArea: string;
}

export const mapearAreaExpertise = (fila: Fila): AreaExpertise => ({
  id: texto(fila?.new_pta_areasinteresid),
  area: opcionDeFila(fila, '_new_area_value'),
  actuacion: opcionDeFila(fila, '_new_actuacion_value'),
  agrupador: opcionDeFila(fila, '_new_agrupador_value'),
  otraActuacion: texto(fila?.new_otro),
  otraArea: texto(fila?.new_area_otro),
});

/** Área de interés del catálogo: lleva el id de su agrupador. */
export interface AreaInteres extends OpcionSelect {
  agrupador: string | null;
}

/** Actuación del catálogo: lleva el id de su área. */
export interface Actuacion extends OpcionSelect {
  areaId: string | null;
}

export const mapearAgrupador = (fila: Fila): OpcionSelect => ({
  value: texto(fila?.new_areasdeinteresid),
  label: texto(fila?.new_name),
});

export const mapearAreaInteres = (fila: Fila): AreaInteres => ({
  value: texto(fila?.new_areasdeinteresid),
  label: texto(fila?.new_name),
  agrupador: fila?._new_agrupador_value ?? null,
});

export const mapearActuacion = (fila: Fila): Actuacion => ({
  value: texto(fila?.new_actuacionid),
  label: texto(fila?.new_nombre),
  areaId: fila?._new_area_value ?? null,
});

export const mapearInstitucion = (fila: Fila): OpcionSelect => ({
  value: texto(fila?.new_institucionotorganteid),
  label: texto(fila?.new_name),
});

export interface FormularioAreaExpertise {
  agrupador: OpcionONull;
  area: OpcionONull;
  actuacion: OpcionONull;
  otraArea: string;
  otraActuacion: string;
}

export const areaExpertiseAFormulario = (a?: AreaExpertise): FormularioAreaExpertise => ({
  agrupador: opcionONull(a?.agrupador),
  area: opcionONull(a?.area),
  actuacion: opcionONull(a?.actuacion),
  otraArea: a?.otraArea ?? '',
  otraActuacion: a?.otraActuacion ?? '',
});

/** El portal considera "otras" a toda opción cuya etiqueta contenga esa palabra. */
export const esOpcionOtras = (opcion: OpcionONull | Opcion | undefined): boolean =>
  typeof opcion?.label === 'string' && opcion.label.toLowerCase().includes('otras');

export const armarPayloadAreaExpertise = (
  empleadoId: string,
  datos: FormularioAreaExpertise,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_pta_areasinteresid: id } : {}),
  new_empleadoid: empleadoId,
  new_area: datos.area?.value || '',
  new_actuacion: datos.actuacion?.value || '',
  new_agrupador: datos.agrupador?.value || '',
  new_otro: datos.otraActuacion || '',
  new_area_otro: datos.otraArea || '',
});
