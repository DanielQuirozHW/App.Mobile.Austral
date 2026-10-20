// Plan de Trabajo Anual (PTA): opciones de los selects.
// Las listas fijas son los OptionSets del CRM; los catálogos vienen de la API y se ordenan / filtran como el portal
// (Portal-Austral-Dev -> modales de plan-de-trabajo y useAutocompletadosStore).
import type { OpcionDeLista } from '../perfil/comun';
import type { OpcionSelect } from '../legajo/tipos';
import {
  MODALIDAD_EXCLUIDA_ID,
  NIVELES_CLASE,
  OPC_AVANCE_TESIS,
  OPC_ESTADO_PUBLICACION,
  OPC_ETAPA_FORMACION,
  OPC_FINANCIAMIENTO,
  OPC_FORMA_DICTADO,
  OPC_GRADO_AVANCE,
  OPC_NIVEL_JURADO,
  OPC_TEACHING,
  OPC_TIPO_CLASE,
  OPC_TIPO_CONGRESO,
  OPC_TIPO_DIVULGACION,
  OPC_TIPO_PARTICIPACION,
  OPC_TIPO_PUBLICACION,
  OPC_UNIDAD_MEDIDA,
  ORDEN_MODALIDADES,
  ORDEN_UNIVERSIDADES,
  TITULOS_TESIS,
  UNIVERSIDAD_EXCLUIDA,
} from './constantes';
import type { CampoPta, ClaveOpciones } from './tipos';

/** Elemento de un catálogo que depende de otro (disciplina -> gran área, especialidad -> disciplina). */
export interface OpcionConPadre extends OpcionSelect {
  padre: string | null;
}

export interface CatalogosPta {
  universidades: OpcionSelect[];
  modalidades: OpcionSelect[];
  gradosAcademicos: OpcionSelect[];
  agrupadores: OpcionSelect[];
  disciplinas: OpcionConPadre[];
  especialidades: OpcionConPadre[];
}

export const CATALOGOS_VACIOS: CatalogosPta = {
  universidades: [],
  modalidades: [],
  gradosAcademicos: [],
  agrupadores: [],
  disciplinas: [],
  especialidades: [],
};

const norm = (s: string): string => s.trim().toLowerCase();

interface ReglasDeOrden {
  /** Etiquetas que se descartan. */
  quitar?: string[];
  /** true: solo quedan las etiquetas de la lista de orden (las demás se descartan). */
  soloListadas?: boolean;
}

/** Ordena por la lista dada. Las etiquetas que no están en la lista van al final (salvo `soloListadas`). */
const ordenar = (lista: OpcionSelect[], orden: string[], reglas: ReglasDeOrden = {}): OpcionSelect[] => {
  const quitar = (reglas.quitar ?? []).map(norm);
  const posicion = (o: OpcionSelect): number => {
    const i = orden.findIndex((n) => norm(n) === norm(o.label));
    return i < 0 ? orden.length : i;
  };
  return lista
    .filter((o) => !quitar.includes(norm(o.label)))
    .filter((o) => !reglas.soloListadas || posicion(o) < orden.length)
    .map((o, indice) => ({ o, indice }))
    .sort((a, b) => posicion(a.o) - posicion(b.o) || a.indice - b.indice)
    .map(({ o }) => o);
};

const FIJAS: Partial<Record<ClaveOpciones, OpcionDeLista[]>> = {
  unidadMedida: OPC_UNIDAD_MEDIDA,
  formaDictado: OPC_FORMA_DICTADO,
  teaching: OPC_TEACHING,
  tipoClase: OPC_TIPO_CLASE,
  financiamiento: OPC_FINANCIAMIENTO,
  estadoPublicacion: OPC_ESTADO_PUBLICACION,
  tipoPublicacion: OPC_TIPO_PUBLICACION,
  tipoCongreso: OPC_TIPO_CONGRESO,
  tipoParticipacion: OPC_TIPO_PARTICIPACION,
  tipoDivulgacion: OPC_TIPO_DIVULGACION,
  avanceTesis: OPC_AVANCE_TESIS,
  nivelJurado: OPC_NIVEL_JURADO,
  gradoAvance: OPC_GRADO_AVANCE,
  etapaFormacion: OPC_ETAPA_FORMACION,
};

/** Opciones de una lista sin aplicar dependencias entre selects (sirve para ubicar el valor inicial). */
export const opcionesBase = (clave: ClaveOpciones, cat: CatalogosPta): OpcionDeLista[] => {
  const fija = FIJAS[clave];
  if (fija) return fija;
  switch (clave) {
    case 'universidades':
      return ordenar(cat.universidades, ORDEN_UNIVERSIDADES, { quitar: [UNIVERSIDAD_EXCLUIDA] });
    case 'universidadesJurado':
      return ordenar(cat.universidades, ORDEN_UNIVERSIDADES, { quitar: [UNIVERSIDAD_EXCLUIDA, 'Otra'] });
    case 'modalidades':
      return ordenar(
        cat.modalidades.filter((m) => norm(m.value) !== MODALIDAD_EXCLUIDA_ID),
        ORDEN_MODALIDADES,
      );
    case 'nivelesClase':
      return ordenar(cat.gradosAcademicos, NIVELES_CLASE, { soloListadas: true });
    case 'titulosTesis':
      return ordenar(cat.gradosAcademicos, TITULOS_TESIS, { soloListadas: true });
    case 'agrupadores':
      return cat.agrupadores;
    case 'disciplinas':
      return cat.disciplinas.map(({ value, label }) => ({ value, label }));
    case 'especialidades':
      return cat.especialidades.map(({ value, label }) => ({ value, label }));
    default:
      return [];
  }
};

/** Opciones que ve el usuario: la disciplina depende de la gran área y la especialidad, de la disciplina. */
export const opcionesDeCampo = (campo: CampoPta, cat: CatalogosPta, valores: any): OpcionDeLista[] => {
  if (!campo.opciones) return [];
  if (campo.opciones === 'disciplinas') {
    const agrupador = valores?.agrupador?.value;
    return cat.disciplinas
      .filter((d) => agrupador !== undefined && agrupador !== null && d.padre === agrupador)
      .map(({ value, label }) => ({ value, label }));
  }
  if (campo.opciones === 'especialidades') {
    const area = valores?.areas?.value;
    return cat.especialidades
      .filter((e) => area !== undefined && area !== null && e.padre === area)
      .map(({ value, label }) => ({ value, label }));
  }
  return opcionesBase(campo.opciones, cat);
};

/** ¿La opción elegida tiene esa etiqueta? ("Otra", "Otro"). */
export const etiquetaEs = (opcion: any, esperada: string): boolean =>
  typeof opcion?.label === 'string' && norm(opcion.label) === norm(esperada);

/** ¿La opción elegida tiene ese código? */
export const codigoEs = (opcion: any, codigo: number): boolean =>
  opcion?.value !== null && opcion?.value !== undefined && Number(opcion.value) === codigo;
