// Plan de Trabajo Anual (PTA): mapeo de los catálogos que se leen por FetchXML.
// Port de useAutocompletadosStore de Portal-Austral-Dev.
import { texto, type Fila } from '../perfil/comun';
import type { OpcionSelect } from '../legajo/tipos';
import type { OpcionConPadre } from './opciones';

export const mapearGradoAcademico = (fila: Fila): OpcionSelect => ({
  value: texto(fila?.new_gradoacadmicoid),
  label: texto(fila?.new_name),
});

export const mapearModalidad = (fila: Fila): OpcionSelect => ({
  value: texto(fila?.new_modalidaddedictadoid),
  label: texto(fila?.new_name),
});

/** Gran Área. */
export const mapearAgrupador = (fila: Fila): OpcionSelect => ({
  value: texto(fila?.new_areasdeinteresid),
  label: texto(fila?.new_name),
});

/** Disciplina primaria: guarda el agrupador al que pertenece. */
export const mapearDisciplina = (fila: Fila): OpcionConPadre => ({
  value: texto(fila?.new_areasdeinteresid),
  label: texto(fila?.new_name),
  padre: fila?._new_agrupador_value ? texto(fila._new_agrupador_value) : null,
});

/** Especialidad: guarda la disciplina a la que pertenece. */
export const mapearEspecialidad = (fila: Fila): OpcionConPadre => ({
  value: texto(fila?.new_actuacionid),
  label: texto(fila?.new_nombre),
  padre: fila?._new_area_value ? texto(fila._new_area_value) : null,
});
