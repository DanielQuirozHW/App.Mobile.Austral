// Proyectos de investigación y sus participantes.
// Port de Portal-Austral-Dev -> perfil/investigacion/actividad-i+d/proyectos-investigacion/** (page, modales y columnas),
// hooks/investigacion-perfil/{useGetProyectosDeInvestigacion,useCargarEditarProyectos,useGetParticipantesProyecto,
// useCargarEditarParticipanteProyecto}.ts y columns/investigacion/{columnsProyectos,columnsParticipantesProyecto}.tsx.
import { format } from 'date-fns';
import * as yup from 'yup';
import { mensajeDeErrorApi } from '../../config/api/apiError';
import type { Opcion, OpcionSelect } from '../legajo/tipos';
import {
  FV,
  fechaDeFila,
  fechaRequerida,
  opcionDeFila,
  opcionDeLista,
  opcionONull,
  opcionRequerida,
  texto,
  type Fila,
  type Modo,
  type OpcionDeLista,
  type OpcionONull,
} from './comun';

/** Los modales de proyecto tienen un cuarto modo: responder la invitación a participar. */
export type ModoProyecto = Modo | 'responder';

// ---------------------------------------------------------------------------
// Listas fijas y códigos
// ---------------------------------------------------------------------------

export const ESTADO_PROYECTO = {
  PENDIENTE: 1,
  VALIDACION_SI: 100000000,
  BORRADOR: 100000001,
  PUBLICADO: 100000002,
  RECHAZADO: 100000003,
} as const;

export const ESTADOS_PROYECTO: OpcionDeLista[] = [
  { value: ESTADO_PROYECTO.PENDIENTE, label: 'Pendiente' },
  { value: ESTADO_PROYECTO.VALIDACION_SI, label: 'Validación SI' },
  { value: ESTADO_PROYECTO.BORRADOR, label: 'Borrador' },
  { value: ESTADO_PROYECTO.PUBLICADO, label: 'Publicado' },
  { value: ESTADO_PROYECTO.RECHAZADO, label: 'Rechazado' },
];

/** Respuesta del usuario a la invitación a un proyecto (statuscode de la participación). */
export const PARTICIPACION = {
  PENDIENTE: 1,
  APROBADO: 100000000,
  RECHAZADO: 100000001,
} as const;

export const LINEAS_INVESTIGACION: OpcionDeLista[] = [
  { value: 100000000, label: 'Tecnologías aplicadas a la salud' },
  { value: 100000001, label: 'Medicina de precisión, investigación traslacional y clínica' },
  { value: 100000002, label: 'Sociedad, democracia y calidad institucional' },
  { value: 100000003, label: 'Cuidado, bienestar y florecimiento humano' },
  { value: 100000004, label: 'Innovación, transformación digital y sostenibilidad' },
];

export const DURACIONES: OpcionDeLista[] = [
  { value: 100000000, label: 'Anual' },
  { value: 100000001, label: 'Plurianual' },
  { value: 100000002, label: 'Bianual' },
];

export const OPCIONES_RELACION: OpcionDeLista[] = [
  { value: 1, label: 'Si' },
  { value: 0, label: 'No' },
];

export const LUGAR = { UA: 100000000, OTRO: 100000001 } as const;

export const LUGARES_TRABAJO: OpcionDeLista[] = [
  { value: LUGAR.UA, label: 'Universidad Austral' },
  { value: LUGAR.OTRO, label: 'Otro' },
];

export const ROL = {
  DIRECTOR: 100000000,
  CODIRECTOR: 100000001,
  INVESTIGADOR: 100000002,
  INTEGRANTE_EN_FORMACION: 100000003,
  COLABORADOR_EXTERNO: 100000004,
} as const;

export const ROLES_UA: OpcionDeLista[] = [
  { value: ROL.DIRECTOR, label: 'Director' },
  { value: ROL.CODIRECTOR, label: 'Codirector' },
  { value: ROL.INVESTIGADOR, label: 'Investigador' },
  { value: ROL.INTEGRANTE_EN_FORMACION, label: 'Integrante en formación' },
];

export const ROLES_OTRO: OpcionDeLista[] = [
  { value: ROL.DIRECTOR, label: 'Director' },
  { value: ROL.CODIRECTOR, label: 'Codirector' },
  { value: ROL.COLABORADOR_EXTERNO, label: 'Colaborador externo' },
];

export const ROLES_TODOS: OpcionDeLista[] = [...ROLES_UA, { value: ROL.COLABORADOR_EXTERNO, label: 'Colaborador externo' }];

/** En UA, estos roles solo los pueden tener empleados con título de Doctorado. */
export const ROLES_QUE_REQUIEREN_DOCTORADO: number[] = [ROL.DIRECTOR, ROL.CODIRECTOR, ROL.INVESTIGADOR];
export const NIVEL_DOCTORADO = 100000003;
export const MSG_REQUIERE_DOCTORADO =
  'Para los roles Director, Codirector e Investigador en UA, el participante debe tener título de Doctorado.';

export const ESTADO_PARTICIPANTE = {
  PENDIENTE: 1,
  APROBADO: 100000000,
  RECHAZADO: 100000001,
  BAJA: 100000002,
  DESVINCULADO: 100000003,
} as const;

export const ESTADOS_PARTICIPANTE: OpcionDeLista[] = [
  { value: ESTADO_PARTICIPANTE.PENDIENTE, label: 'Pendiente' },
  { value: ESTADO_PARTICIPANTE.APROBADO, label: 'Aprobado' },
  { value: ESTADO_PARTICIPANTE.RECHAZADO, label: 'Rechazado' },
  { value: ESTADO_PARTICIPANTE.BAJA, label: 'Baja' },
  { value: ESTADO_PARTICIPANTE.DESVINCULADO, label: 'Desvinculado UA' },
];

/** Tipo de unidad del organigrama que se muestra como "Unidad Académica" y como sede de ejecución. */
export const TIPO_UNIDAD_ACADEMICA = 100000010;
export const NOMBRE_OTRA = 'Otra';

export const MAXIMOS = {
  titulo: 500,
  palabrasClave: 100,
  resumen: 2000,
  abstract: 2000,
  otrasSedes: 100,
  codigo: 11,
  motivoBaja: 2000,
} as const;

/** Valor numérico de una opción (los códigos del CRM llegan como número o como texto). */
export const valorNumerico = (opcion: { value?: unknown } | null | undefined): number | null => {
  const v = opcion?.value;
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const mismoId = (a: unknown, b: unknown): boolean => {
  const x = texto(a).trim().toLowerCase();
  return x !== '' && x === texto(b).trim().toLowerCase();
};

// ---------------------------------------------------------------------------
// Proyecto
// ---------------------------------------------------------------------------

export interface Proyecto {
  id: string;
  tituloProyecto: string;
  palabrasClave: string;
  resumen: string;
  abstract: string;
  principalesResultados: string;
  areaDisciplinar: Opcion;
  area: Opcion;
  actuacion: Opcion;
  sedeEjecucionPrincipal: Opcion;
  duracion: Opcion;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  codigo: string;
  otrasSedes: string;
  otraAreaInteres: string;
  otraActuacion: string;
  lineaInvestigacion: OpcionONull;
  relacionLineas: OpcionONull;
  statuscode: Opcion;
  motivoRechazo: string;
  /** El usuario creó el proyecto (es el colaborador del registro). */
  esCreador: boolean;
  creadorId: string;
  // Participación del usuario en el proyecto
  rolParticipante: Opcion;
  estadoParticipacion: Opcion;
  participanteId: string;
  lugarTrabajo: Opcion;
  /** Para ordenar: creación de la participación o, si no hay, del proyecto. */
  creadoEn: string;
}

/** El portal pasa el texto formateado del CRM y el formulario lo convierte: "Sí" -> 1, cualquier otra cosa -> 0. */
const relacionDeFila = (fila: Fila): OpcionONull => {
  const etiqueta = texto(fila?.[`new_relacionlineasprioritariasua${FV}`]).trim().toLowerCase();
  const crudo = fila?.new_relacionlineasprioritariasua;
  const afirmativo = etiqueta === 'sí' || etiqueta === 'si' || crudo === true || crudo === 1 || crudo === 'true';
  return afirmativo ? OPCIONES_RELACION[0] : OPCIONES_RELACION[1];
};

const proyectoDeFila = (f: Fila, alias: string, empleadoId: string): Proyecto => {
  const creadorId = texto(f?._new_colaborador_value);
  return {
    id: texto(f?.new_proyectosdeinvestigacinid),
    tituloProyecto: texto(f?.new_name),
    palabrasClave: texto(f?.new_palabrasclave),
    resumen: texto(f?.new_resumen),
    abstract: texto(f?.new_abstract),
    principalesResultados: texto(f?.new_principalesresultados),
    areaDisciplinar: opcionDeFila(f, '_new_agrupador_value'),
    area: opcionDeFila(f, '_new_area_value'),
    actuacion: opcionDeFila(f, '_new_actuacion_value'),
    sedeEjecucionPrincipal: opcionDeFila(f, '_new_sededeejecucionprincipal_value'),
    duracion: opcionDeFila(f, 'new_duracion', DURACIONES),
    fechaInicio: fechaDeFila(f, 'new_fechadeinicio'),
    fechaFin: fechaDeFila(f, 'new_fechadefinalizacin'),
    codigo: texto(f?.new_codigo),
    otrasSedes: texto(f?.new_otrassedesdeejecucion),
    otraAreaInteres: texto(f?.new_otraarea),
    otraActuacion: texto(f?.new_otraareadeactuacion),
    lineaInvestigacion: opcionDeLista(f?.new_lineadeinvestigacion, LINEAS_INVESTIGACION),
    relacionLineas: relacionDeFila(f),
    statuscode: opcionDeFila(f, 'statuscode', ESTADOS_PROYECTO),
    motivoRechazo: texto(f?.new_motivoderechazosi),
    esCreador: mismoId(creadorId, empleadoId),
    creadorId,
    rolParticipante: opcionDeFila(f, `${alias}.new_rol`, ROLES_TODOS),
    estadoParticipacion: opcionDeFila(f, `${alias}.statuscode`, ESTADOS_PARTICIPANTE),
    participanteId: texto(f?.[`${alias}.new_participantesproyectoid`]),
    lugarTrabajo: opcionDeFila(f, `${alias}.new_lugardetrabajo`, LUGARES_TRABAJO),
    creadoEn: texto(f?.[`${alias}.createdon`] ?? f?.createdon),
  };
};

/** alias: 'ac' (proyectos propios, join externo) o 'af' (proyectos como participante, join interno). */
export const mapearProyectos = (filas: Fila[], alias: 'ac' | 'af', empleadoId: string): Proyecto[] =>
  filas.map((f) => proyectoDeFila(f, alias, empleadoId)).filter((p) => p.id !== '');

/**
 * Une las dos lecturas como el portal: primero los propios; de los proyectos como participante se suman los que no están
 * (menos los Borrador de otro creador) y, si ya estaban, se completa la participación. Orden: más reciente primero.
 */
export const combinarProyectos = (propios: Proyecto[], comoParticipante: Proyecto[]): Proyecto[] => {
  const porId = new Map<string, Proyecto>();
  propios.forEach((p) => porId.set(p.id, p));
  comoParticipante.forEach((p) => {
    if (valorNumerico(p.statuscode) === ESTADO_PROYECTO.BORRADOR) return;
    const existente = porId.get(p.id);
    if (!existente) {
      porId.set(p.id, p);
      return;
    }
    porId.set(p.id, {
      ...existente,
      rolParticipante: p.rolParticipante,
      estadoParticipacion: p.estadoParticipacion,
      participanteId: p.participanteId,
      lugarTrabajo: p.lugarTrabajo,
      creadoEn: p.creadoEn || existente.creadoEn,
    });
  });
  return Array.from(porId.values()).sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
};

// --- Permisos sobre una fila (columnsProyectos.tsx, RowOptionsProyectos) ---

const hoyUtc = (): string => new Date().toISOString().slice(0, 10);

/** Histórico: la fecha de fin ya pasó (se compara contra el día de hoy en UTC, como el portal). */
export const esProyectoHistorico = (p: Proyecto): boolean =>
  p.fechaFin !== null && format(p.fechaFin, 'yyyy-MM-dd') < hoyUtc();

/** Invitación pendiente: la fila solo ofrece "Responder". */
export const esPendienteDeRespuesta = (p: Proyecto): boolean =>
  !p.esCreador && valorNumerico(p.estadoParticipacion) === PARTICIPACION.PENDIENTE;

export const puedeEditarProyecto = (p: Proyecto): boolean =>
  !esProyectoHistorico(p) &&
  (p.esCreador ||
    (valorNumerico(p.statuscode) === ESTADO_PROYECTO.PUBLICADO &&
      valorNumerico(p.estadoParticipacion) === PARTICIPACION.APROBADO));

export const puedeEliminarProyecto = (p: Proyecto): boolean => !esProyectoHistorico(p) && p.esCreador;

/** Vincular resultados: el creador o quien ya aprobó su participación. */
export const puedeVincularResultados = (p: Proyecto): boolean =>
  p.esCreador || valorNumerico(p.estadoParticipacion) === PARTICIPACION.APROBADO;

/** El formulario del proyecto está en solo lectura (modales del portal: constante `disabled`). */
export const proyectoDeshabilitado = (modo: ModoProyecto, estadoActual: number | null, esCreador: boolean): boolean => {
  if (modo === 'ver' || modo === 'responder') return true;
  if (estadoActual === ESTADO_PROYECTO.RECHAZADO && !esCreador) return true;
  if (!esCreador && estadoActual === ESTADO_PROYECTO.PENDIENTE) return true;
  if (!esCreador && estadoActual === ESTADO_PROYECTO.VALIDACION_SI) return true;
  const puedeEditarCreador =
    esCreador &&
    (estadoActual === ESTADO_PROYECTO.BORRADOR ||
      estadoActual === ESTADO_PROYECTO.PENDIENTE ||
      estadoActual === ESTADO_PROYECTO.PUBLICADO ||
      estadoActual === ESTADO_PROYECTO.RECHAZADO);
  if (esCreador && modo !== 'nuevo' && !puedeEditarCreador) return true;
  return false;
};

/** Estados que ofrece el select "Estado del proyecto" según el estado actual. */
export const opcionesDeEstadoProyecto = (estadoActual: number | null): OpcionDeLista[] => {
  const solo = (...valores: number[]) => ESTADOS_PROYECTO.filter((o) => valores.includes(Number(o.value)));
  if (estadoActual === ESTADO_PROYECTO.BORRADOR) return solo(ESTADO_PROYECTO.BORRADOR, ESTADO_PROYECTO.PENDIENTE);
  if (estadoActual === ESTADO_PROYECTO.PENDIENTE) return solo(ESTADO_PROYECTO.PENDIENTE, ESTADO_PROYECTO.VALIDACION_SI);
  if (estadoActual === ESTADO_PROYECTO.RECHAZADO) return solo(ESTADO_PROYECTO.RECHAZADO, ESTADO_PROYECTO.VALIDACION_SI);
  if (estadoActual !== null) return solo(estadoActual);
  return ESTADOS_PROYECTO;
};

// ---------------------------------------------------------------------------
// Participantes
// ---------------------------------------------------------------------------

export interface Participante {
  id: string;
  proyectoId: string;
  /** Nombre a mostrar: el del empleado de la UA o el texto libre de un externo. */
  nombreApellido: Opcion;
  /** Texto libre (new_nombreyapellido) de un participante externo. */
  nombreLibre: string;
  /** Empleado de la UA (lookup new_participante). */
  participante: Opcion;
  lugarTrabajo: Opcion;
  rol: Opcion;
  /** Texto del estado que muestra la grilla (razón para el estado). */
  estado: string;
  statusCode: Opcion;
  institucionPertenencia: Opcion;
  otraInstitucion: string;
  motivoBaja: string;
  creadoPor: string;
}

export const mapearParticipantes = (filas: Fila[]): Participante[] =>
  filas
    .map((f): Participante => {
      const statusCode = opcionDeFila(f, 'statuscode', ESTADOS_PARTICIPANTE);
      const nombreLibre = texto(f?.new_nombreyapellido);
      const empleado = texto(f?.[`_new_participante_value${FV}`]).trim();
      return {
        id: texto(f?.new_participantesproyectoid),
        proyectoId: texto(f?._new_proyectoinvestigacion_value),
        nombreApellido: { value: f?._new_participante_value ?? null, label: empleado || nombreLibre },
        nombreLibre,
        participante: { value: f?._new_participante_value ?? null, label: empleado },
        lugarTrabajo: opcionDeFila(f, 'new_lugardetrabajo', LUGARES_TRABAJO),
        rol: opcionDeFila(f, 'new_rol', ROLES_TODOS),
        estado: texto(f?.new_razonparaelestado) || texto(statusCode.label),
        statusCode,
        institucionPertenencia: opcionDeFila(f, '_new_instituciondepertenencia_value'),
        otraInstitucion: texto(f?.new_otrainstitucion),
        motivoBaja: texto(f?.new_motivodebaja),
        creadoPor: texto(f?._new_creadopor_value),
      };
    })
    .filter((p) => p.id !== '');

export const esDirector = (p: Participante): boolean => valorNumerico(p.rol) === ROL.DIRECTOR;

/** Participantes que siguen vinculados (ni de baja ni desvinculados). */
export const participantesActivos = (lista: Participante[]): Participante[] =>
  lista.filter((p) => {
    const estado = valorNumerico(p.statusCode);
    return estado !== ESTADO_PARTICIPANTE.BAJA && estado !== ESTADO_PARTICIPANTE.DESVINCULADO;
  });

/** Editar y eliminar participantes: el creador del proyecto o quien cargó al participante. */
export const puedeEliminarParticipante = (
  p: Participante,
  esCreadorDelProyecto: boolean,
  empleadoId: string,
): boolean => esCreadorDelProyecto || mismoId(p.creadoPor, empleadoId);

// --- Validaciones de los cambios de estado del proyecto (enviarDatos del modal del portal) ---

export interface ParamsValidacionEstado {
  nuevo: boolean;
  estadoActual: number | null;
  estadoNuevo: number | null;
  participantes: Participante[];
  esCreador: boolean;
  empleadoId: string;
}

/** Devuelve el mensaje de error del portal, o null si el cambio de estado es válido. */
export const validarCambioDeEstado = (p: ParamsValidacionEstado): string | null => {
  if (p.nuevo) return null;
  const { estadoActual, estadoNuevo, participantes, esCreador, empleadoId } = p;
  const creadorEsParticipante = participantes.some((x) => mismoId(x.participante.value, empleadoId));
  const directores = participantes.filter(esDirector);

  if (estadoNuevo === ESTADO_PROYECTO.VALIDACION_SI) {
    const activos = participantesActivos(participantes);
    const todosAprobados =
      activos.length > 0 && activos.every((x) => valorNumerico(x.statusCode) === ESTADO_PARTICIPANTE.APROBADO);
    if (!todosAprobados) {
      return "El proyecto solo puede pasar a 'Validación SI' cuando todos los participantes hayan aprobado su participación.";
    }
    if (activos.filter(esDirector).length !== 1) {
      return "El proyecto debe tener exactamente 1 Director para poder pasar a 'Validación SI'.";
    }
    if (esCreador && !creadorEsParticipante) {
      return "El creador debe estar agregado como participante para poder pasar el proyecto a 'Validación SI'.";
    }
  }
  if (estadoActual === ESTADO_PROYECTO.PUBLICADO && estadoNuevo === ESTADO_PROYECTO.BORRADOR) {
    return 'El proyecto ya fue publicado y no puede volver al estado Borrador.';
  }
  if (estadoActual === ESTADO_PROYECTO.PENDIENTE && estadoNuevo === ESTADO_PROYECTO.BORRADOR) {
    return 'El proyecto ya pasó a Pendiente y no puede volver al estado Borrador.';
  }
  if (estadoNuevo === ESTADO_PROYECTO.PENDIENTE) {
    if (participantes.length === 0) return 'Debe agregar al menos un participante antes de pasar el proyecto a Pendiente.';
    if (directores.length !== 1) return 'El proyecto debe tener exactamente 1 Director para poder pasar a Pendiente.';
    if (esCreador && !creadorEsParticipante) {
      return 'El creador debe estar agregado como participante en el proyecto de investigación.';
    }
  }
  if (estadoNuevo === ESTADO_PROYECTO.PUBLICADO) {
    if (participantes.length === 0) return 'Debe agregar al menos un participante antes de publicar el proyecto.';
    if (directores.length !== 1) return 'El proyecto debe tener como mínimo 1 director para poder publicarse.';
    if (esCreador && !creadorEsParticipante) {
      return 'El creador debe estar agregado como participante en el proyecto de investigación.';
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Catálogos
// ---------------------------------------------------------------------------

export interface Colaborador extends OpcionSelect {
  /** Nivel de formación (new_nivel). Doctorado = 100000003. */
  nivel: number | null;
}

export interface UnidadOrganizativa extends OpcionSelect {
  tipo: number | null;
}

export interface AreaDeInteres extends OpcionSelect {
  agrupador: string;
}

export interface ActuacionDeArea extends OpcionSelect {
  area: string;
}

export const mapearColaboradores = (filas: Fila[]): Colaborador[] =>
  filas
    .map((f) => ({
      value: texto(f?.new_empleadoid),
      label: texto(f?.new_name),
      nivel: f?.new_nivel === null || f?.new_nivel === undefined ? null : Number(f.new_nivel),
    }))
    .filter((c) => c.value !== '' && c.label !== '');

export const mapearUnidades = (filas: Fila[]): UnidadOrganizativa[] =>
  filas
    .map((f) => ({
      value: texto(f?.new_unidadorganigramaid),
      label: texto(f?.new_name),
      tipo: f?.new_tipo === null || f?.new_tipo === undefined ? null : Number(f.new_tipo),
    }))
    .filter((u) => u.value !== '' && u.label !== '');

export const mapearAgrupadores = (filas: Fila[]): OpcionSelect[] =>
  filas
    .map((f) => ({ value: texto(f?.new_areasdeinteresid), label: texto(f?.new_name) }))
    .filter((a) => a.value !== '' && a.label !== '');

export const mapearAreas = (filas: Fila[]): AreaDeInteres[] =>
  filas
    .map((f) => ({
      value: texto(f?.new_areasdeinteresid),
      label: texto(f?.new_name),
      agrupador: texto(f?._new_agrupador_value),
    }))
    .filter((a) => a.value !== '' && a.label !== '');

export const mapearActuaciones = (filas: Fila[]): ActuacionDeArea[] =>
  filas
    .map((f) => ({
      value: texto(f?.new_actuacionid),
      label: texto(f?.new_nombre),
      area: texto(f?._new_area_value),
    }))
    .filter((a) => a.value !== '' && a.label !== '');

/** Etiqueta que activa el campo de texto "Otra ..." (área de interés y actuación). */
export const esOtraEtiqueta = (opcion: { label?: unknown } | null | undefined): boolean =>
  texto(opcion?.label).toLowerCase().includes('otra');

// ---------------------------------------------------------------------------
// Formulario del proyecto
// ---------------------------------------------------------------------------

export interface FormularioProyecto {
  tituloProyecto: string;
  palabrasClave: string;
  resumen: string;
  abstract: string;
  areaDisciplinar: OpcionONull;
  area: OpcionONull;
  actuacion: OpcionONull;
  otraAreaInteres: string;
  otraActuacion: string;
  relacionLineas: OpcionONull;
  lineaInvestigacion: OpcionONull;
  sedeEjecucionPrincipal: OpcionONull;
  otrasSedes: string;
  duracion: OpcionONull;
  fechaInicio: Date | null;
  fechaFinalizacion: Date | null;
  codigo: string;
  statuscode: OpcionONull;
  new_motivoderechazosi: string;
}

export const proyectoAFormulario = (p?: Proyecto): FormularioProyecto => ({
  tituloProyecto: p?.tituloProyecto ?? '',
  palabrasClave: p?.palabrasClave ?? '',
  resumen: p?.resumen ?? '',
  abstract: p?.abstract ?? '',
  areaDisciplinar: opcionONull(p?.areaDisciplinar),
  area: opcionONull(p?.area),
  actuacion: opcionONull(p?.actuacion),
  otraAreaInteres: p?.otraAreaInteres ?? '',
  otraActuacion: p?.otraActuacion ?? '',
  relacionLineas: p ? p.relacionLineas : null,
  lineaInvestigacion: p?.lineaInvestigacion ?? null,
  sedeEjecucionPrincipal: opcionONull(p?.sedeEjecucionPrincipal),
  otrasSedes: p?.otrasSedes ?? '',
  duracion: opcionONull(p?.duracion),
  fechaInicio: p?.fechaInicio ?? null,
  fechaFinalizacion: p?.fechaFin ?? null,
  codigo: p?.codigo ?? '',
  statuscode: opcionONull(p?.statuscode),
  new_motivoderechazosi: p?.motivoRechazo ?? '',
});

export const esquemaProyecto = yup.object().shape({
  tituloProyecto: yup.string().trim().required('El título del proyecto es requerido'),
  palabrasClave: yup.string().trim().required('Las palabras clave son requeridas'),
  resumen: yup.string().trim().required('El resumen es requerido'),
  abstract: yup.string().trim().required('El abstract es requerido'),
  areaDisciplinar: opcionRequerida('El área disciplinar es requerida'),
  area: opcionRequerida('El área de interés es requerida'),
  actuacion: opcionRequerida('El área de actuación es requerida'),
  otraAreaInteres: yup.string().when('area', {
    is: (val: any) => esOtraEtiqueta(val),
    then: (schema) => schema.trim().required('Especifique otra área de interés'),
    otherwise: (schema) => schema.nullable(),
  }),
  otraActuacion: yup.string().when('actuacion', {
    is: (val: any) => esOtraEtiqueta(val),
    then: (schema) => schema.trim().required('Especifique otra área de actuación'),
    otherwise: (schema) => schema.nullable(),
  }),
  relacionLineas: opcionRequerida('Debe seleccionar si está relacionado con las líneas prioritarias'),
  lineaInvestigacion: yup.mixed().when('relacionLineas', {
    is: (val: any) => valorNumerico(val) === 1,
    then: (schema) => schema.required('Línea de investigación es requerida'),
    otherwise: (schema) => schema.nullable(),
  }),
  sedeEjecucionPrincipal: opcionRequerida('La sede de ejecución es requerida'),
  duracion: opcionRequerida('La duración es requerida'),
  codigo: yup.string().max(MAXIMOS.codigo, 'El código no puede superar los 11 caracteres').nullable(),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida').test(
    'fecha-inicio',
    'La fecha de inicio no puede ser posterior a la fecha fin',
    function (value) {
      const { fechaFinalizacion } = this.parent;
      if (!value || !fechaFinalizacion) return true;
      return value <= fechaFinalizacion;
    },
  ),
  fechaFinalizacion: yup
    .date()
    .nullable()
    .typeError('Debe ser una fecha válida')
    .test('fecha-fin-valida', 'La fecha de fin no puede ser anterior a la fecha de inicio', function (value) {
      const { fechaInicio } = this.parent;
      if (!value || !fechaInicio) return true;
      return value >= fechaInicio;
    }),
});

const diaApi = (fecha: Date | null): string => (fecha ? format(fecha, 'yyyy-MM-dd') : '');

/** Cuerpo del POST / PUT de la API v1 (toWriteRequest del portal). */
export const armarPayloadProyecto = (datos: FormularioProyecto, existente?: Proyecto): Record<string, unknown> => ({
  titulo: datos.tituloProyecto,
  palabrasClave: datos.palabrasClave,
  resumen: datos.resumen,
  abstract: datos.abstract,
  // El formulario no tiene este campo: en la edición se conserva lo que ya tenía el proyecto.
  principalesResultados: existente?.principalesResultados ?? '',
  relacionLineasPrioritarias: datos.relacionLineas?.value ?? 0,
  lineaInvestigacion: datos.lineaInvestigacion?.value ?? 0,
  duracion: datos.duracion?.value ?? 0,
  fechaInicio: diaApi(datos.fechaInicio),
  fechaFinalizacion: diaApi(datos.fechaFinalizacion),
  codigo: datos.codigo ?? '',
  otrasSedesEjecucion: datos.otrasSedes ?? '',
  sedeEjecucionPrincipalId: datos.sedeEjecucionPrincipal?.value,
  agrupadorId: datos.areaDisciplinar?.value,
  areaId: datos.area?.value,
  otraArea: datos.otraAreaInteres,
  actuacionId: datos.actuacion?.value,
  otraAreaActuacion: datos.otraActuacion,
  estado: datos.statuscode?.value ?? null,
});

const textoDeError = (error: unknown): string => {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  if (typeof data === 'string') return data;
  return data ? JSON.stringify(data) : '';
};

export const MSG_CODIGO_DUPLICADO = 'El código ingresado ya existe. Por favor, ingrese un código único.';

/** Error de alta / edición de proyecto: el código duplicado tiene texto propio; si no, el del servidor. */
export const mensajeDeErrorDeProyecto = (error: unknown, porDefecto: string): string =>
  textoDeError(error).includes('Evitar Código Duplicado') ? MSG_CODIGO_DUPLICADO : mensajeDeErrorApi(error, porDefecto);

// ---------------------------------------------------------------------------
// Formulario del participante
// ---------------------------------------------------------------------------

export interface FormularioParticipante {
  lugarTrabajo: OpcionONull;
  rol: OpcionONull;
  nombreApellido: OpcionONull;
  otroNombre: string;
  instituciones: OpcionONull;
  statusCode: OpcionONull;
  new_otrainstitucion: string;
  new_motivodebaja: string;
}

export const participanteAFormularioVacio = (): FormularioParticipante => ({
  lugarTrabajo: null,
  rol: null,
  nombreApellido: null,
  otroNombre: '',
  instituciones: null,
  statusCode: null,
  new_otrainstitucion: '',
  new_motivodebaja: '',
});

/** Valores del formulario a partir de un participante (hidratación del modal del portal). */
export const participanteAFormulario = (
  p: Participante | undefined,
  unidades: UnidadOrganizativa[],
): FormularioParticipante => {
  if (!p) return participanteAFormularioVacio();
  const esUA = valorNumerico(p.lugarTrabajo) === LUGAR.UA;
  let institucion: OpcionONull = null;
  if (p.institucionPertenencia.value) {
    institucion = opcionONull(p.institucionPertenencia);
  } else if (p.otraInstitucion) {
    const otra = unidades.find((u) => u.label === NOMBRE_OTRA);
    institucion = otra ? { value: otra.value, label: otra.label } : null;
  }
  const nombreLibre = p.nombreLibre || (p.nombreApellido.label && p.nombreApellido.label !== 'undefined' ? p.nombreApellido.label : '');
  return {
    lugarTrabajo: opcionONull(p.lugarTrabajo),
    rol: opcionONull(p.rol),
    nombreApellido: esUA ? opcionONull(p.participante.value ? p.participante : p.nombreApellido) : null,
    otroNombre: esUA ? '' : texto(nombreLibre),
    instituciones: institucion,
    statusCode: opcionONull(p.statusCode),
    new_otrainstitucion: p.otraInstitucion,
    new_motivodebaja: p.motivoBaja,
  };
};

export const esquemaParticipante = yup.object().shape({
  lugarTrabajo: opcionRequerida('El lugar de trabajo es requerido'),
  rol: opcionRequerida('El rol es requerido'),
  instituciones: opcionRequerida('La institución de pertenencia es requerida'),
  nombreApellido: yup.mixed().when('lugarTrabajo', {
    is: (val: any) => valorNumerico(val) === LUGAR.UA,
    then: (schema) => schema.required('Debe seleccionar un empleado de la lista'),
    otherwise: (schema) => schema.nullable(),
  }),
  otroNombre: yup.string().when('lugarTrabajo', {
    is: (val: any) => valorNumerico(val) === LUGAR.OTRO,
    then: (schema) => schema.trim().required('El nombre y apellido es requerido'),
    otherwise: (schema) => schema.nullable(),
  }),
  new_otrainstitucion: yup.string().when('instituciones', {
    is: (val: any) => val?.label === NOMBRE_OTRA,
    then: (schema) => schema.trim().required('Otra institución es requerida'),
    otherwise: (schema) => schema.nullable(),
  }),
  new_motivodebaja: yup.string().when('statusCode', {
    is: (val: any) => valorNumerico(val) === ESTADO_PARTICIPANTE.BAJA,
    then: (schema) =>
      schema
        .trim()
        .required('El motivo de baja es obligatorio')
        .max(MAXIMOS.motivoBaja, 'El motivo de baja no puede superar los 2000 caracteres'),
    otherwise: (schema) => schema.nullable(),
  }),
});

/** Roles que ofrece el select según el lugar de trabajo (un Colaborador externo no puede ser el propio creador). */
export const rolesDeLugar = (lugar: number | null, esElMismoCreador: boolean): OpcionDeLista[] =>
  (lugar === LUGAR.UA ? ROLES_UA : ROLES_OTRO).filter(
    (r) => !esElMismoCreador || Number(r.value) !== ROL.COLABORADOR_EXTERNO,
  );

/** Estados que ofrece el select de un participante existente según su estado inicial. */
export const opcionesDeEstadoParticipante = (modo: Modo, estadoInicial: number | null): OpcionDeLista[] => {
  if (modo === 'nuevo') return ESTADOS_PARTICIPANTE;
  const solo = (...valores: number[]) => ESTADOS_PARTICIPANTE.filter((o) => valores.includes(Number(o.value)));
  switch (estadoInicial) {
    case ESTADO_PARTICIPANTE.PENDIENTE:
      return solo(
        ESTADO_PARTICIPANTE.APROBADO,
        ESTADO_PARTICIPANTE.RECHAZADO,
        ESTADO_PARTICIPANTE.BAJA,
        ESTADO_PARTICIPANTE.DESVINCULADO,
      );
    case ESTADO_PARTICIPANTE.APROBADO:
      return solo(ESTADO_PARTICIPANTE.BAJA, ESTADO_PARTICIPANTE.DESVINCULADO);
    case ESTADO_PARTICIPANTE.RECHAZADO:
      return solo(ESTADO_PARTICIPANTE.PENDIENTE, ESTADO_PARTICIPANTE.BAJA, ESTADO_PARTICIPANTE.DESVINCULADO);
    default:
      return ESTADOS_PARTICIPANTE;
  }
};

export const requiereDoctorado = (lugar: number | null, rol: number | null): boolean =>
  lugar === LUGAR.UA && rol !== null && ROLES_QUE_REQUIEREN_DOCTORADO.includes(rol);

/** Cuerpo del POST / PUT de api/hrfactors/investigacion/participanteDelProyecto. */
export const armarPayloadParticipante = (
  datos: FormularioParticipante,
  proyectoId: string,
  empleadoId: string,
  id?: string,
): Record<string, unknown> => {
  const esUA = valorNumerico(datos.lugarTrabajo) === LUGAR.UA;
  const esOtraInstitucion = datos.instituciones?.label === NOMBRE_OTRA;
  return {
    ...(id ? { new_participantesproyectoid: id } : {}),
    new_proyectoinvestigacion: proyectoId,
    new_lugardetrabajo: datos.lugarTrabajo?.value ?? 0,
    new_participante: esUA ? (datos.nombreApellido?.value ?? null) : null,
    new_nombreyapellido: !esUA ? datos.otroNombre : null,
    new_name: 'string',
    new_rol: datos.rol?.value,
    new_instituciondepertenencia: !esOtraInstitucion ? (datos.instituciones?.value ?? null) : null,
    new_otrainstitucion: esOtraInstitucion ? datos.new_otrainstitucion : null,
    statuscode: datos.statusCode?.value ?? 0,
    new_motivodebaja: datos.new_motivodebaja,
    ...(id ? {} : { new_creadopor: empleadoId }),
  };
};

/**
 * Cuerpo del PUT con el que el usuario responde su invitación (responderParticipacion del portal): el participante
 * completo, con el estado elegido.
 */
export const armarPayloadRespuesta = (p: Participante, statuscode: number): Record<string, unknown> => {
  const esOtraInstitucion = !p.institucionPertenencia.value;
  return {
    new_participantesproyectoid: p.id,
    new_proyectoinvestigacion: p.proyectoId,
    new_lugardetrabajo: p.lugarTrabajo.value ?? 0,
    new_participante: p.participante.value ?? null,
    new_nombreyapellido: p.nombreLibre || null,
    new_name: 'string',
    new_rol: p.rol.value,
    new_instituciondepertenencia: esOtraInstitucion ? null : p.institucionPertenencia.value,
    new_otrainstitucion: esOtraInstitucion ? p.otraInstitucion : null,
    statuscode,
    new_motivodebaja: p.motivoBaja,
  };
};

export const MSG_PARTICIPANTE_DUPLICADO =
  'El participante seleccionado ya se encuentra vinculado a este proyecto. Por favor, seleccione un participante diferente.';

/**
 * Error de alta / edición de participante: el duplicado tiene texto propio. El resto del mensaje del servidor solo se
 * muestra si está en español (lleva tildes o signos de apertura); si no, el portal usa su texto por defecto.
 */
export const mensajeDeErrorDeParticipante = (error: unknown, porDefecto: string): string => {
  const plano = textoDeError(error);
  if (plano.includes('Evitar Colaborador Duplicado')) return MSG_PARTICIPANTE_DUPLICADO;
  const mensaje = mensajeDeErrorApi(error, porDefecto);
  return mensaje !== porDefecto && /[áéíóúÁÉÍÓÚñÑ¿¡]/.test(mensaje) ? mensaje : porDefecto;
};
