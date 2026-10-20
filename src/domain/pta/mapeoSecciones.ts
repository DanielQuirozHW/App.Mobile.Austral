// Plan de Trabajo Anual (PTA): mapeo de las filas de cada sección.
// Port de los useGet* de Portal-Austral-Dev -> hooks/plan-de-trabajo/ (nombres de campo iguales a los del portal).
import { texto, type Fila } from '../perfil/comun';
import { fv, mayus, opt } from './mapeo';
import type { FuenteSeccion, RegistroPta } from './tipos';

const crudo = (fila: Fila, atributo: string): any => fila?.[atributo] ?? null;
const idPlan = (fila: Fila): string => texto(fila?._new_plandetrabajo_value);

/** El CRM devuelve el "Team Teaching" como booleano: se normaliza a 1 / 0. */
const teaching = (fila: Fila): { value: number | null; label: string } => {
  const bruto = fila?.new_teamteaching;
  if (bruto === true || bruto === 1) return { value: 1, label: 'SÍ' };
  if (bruto === false || bruto === 0) return { value: 0, label: 'NO' };
  return { value: null, label: '' };
};

const mapearClase = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_tpa_clasesid),
  nombre: mayus(fila?.new_name),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  unidadAcademica: opt(fila, '_new_unidadacadmica_value'),
  tipo: opt(fila, 'new_tipo'),
  tiempoPreparacion: crudo(fila, 'new_tiempodepreparacion'),
  tiempoDictado: crudo(fila, 'new_tiempodedictado'),
  teamTeaching: teaching(fila),
  statecode: fila?.statecode ?? 0,
  nivel: opt(fila, '_new_nivel_value'),
  modalidad: opt(fila, '_new_modalidad_value'),
  horatotal: crudo(fila, 'new_horatotal'),
  idPlanTrabajo: idPlan(fila),
  materia: mayus(fila?.new_materia),
  carrera: mayus(fila?.new_carrera),
  evaluacion: crudo(fila, 'new_evaluacion'),
  desarrolloMaterial: crudo(fila, 'new_desarrollomaterialcampus'),
  otraUnidadAcademica: mayus(fila?.new_otraunidadacademica),
  otraModalidad: texto(fila?.new_otramodalidad),
  otroNivel: texto(fila?.new_otronivel),
  // Llega como texto (la etiqueta): el formulario la busca por etiqueta.
  formaDictado: fv(fila, 'new_formadictado'),
  totalUnidades: crudo(fila, 'new_totalunidades'),
});

const mapearArea = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_areasinteresid),
  areas: opt(fila, '_new_area_value'),
  agrupador: opt(fila, '_new_agrupador_value'),
  actuacion: opt(fila, '_new_actuacion_value'),
  otro: mayus(fila?.new_otro),
  statecode: fila?.statecode ?? 0,
  idPlanTrabajo: idPlan(fila),
});

const mapearProyecto = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_proyectosinvestigacionid),
  proyecto: mayus(fila?.new_descripciondelproyecto),
  unidadAcademica: opt(fila, '_new_unidadacademicainstituto_value'),
  lineaInvestigacion: mayus(fila?.new_lineadeinvestigacion),
  director: mayus(fila?.new_directordelalineadeinvestigacion),
  financiamiento: opt(fila, 'new_financiamiento'),
  cantidad: crudo(fila, 'new_cantidad'),
  horasTotales: crudo(fila, 'new_horastotales'),
  statecode: fila?.statecode ?? 0,
  idPlanTrabajo: idPlan(fila),
  otraUnidadAcademica: mayus(fila?.new_otraunidadacademica),
});

const mapearPublicacion = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_publicacionesprevistasid),
  nombre: mayus(fila?.new_name),
  revista: mayus(fila?.new_revistayoeditorial),
  tipoPublicacion: opt(fila, 'new_tipodepublicacion'),
  statuscode: opt(fila, 'statuscode'),
  idPlanTrabajo: idPlan(fila),
});

const mapearCongreso = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_congresosid),
  nombre: mayus(fila?.new_name),
  tipoParticipacion: opt(fila, 'new_tipodeparticipacionesperada'),
  tipoCongreso: opt(fila, 'new_tipodecongreso'),
  nombreArticulo: mayus(fila?.new_nombredelarticuloapresentar),
  lugar: mayus(fila?.new_lugar),
  fechaModal: crudo(fila, 'new_fecha'),
  idPlanTrabajo: idPlan(fila),
  otroTipoParticipacion: mayus(fila?.new_otrotipodeparticipacion),
});

const mapearDivulgacion = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_divulgacionesid),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  tipo: opt(fila, 'new_tipo'),
  cantidadPreparacion: crudo(fila, 'new_cantidadpreparacion'),
  cantidadDivulgacion: crudo(fila, 'new_cantidaddivulgacion'),
  horasPreparacion: crudo(fila, 'new_horaspreparacin'),
  horasDivulgacion: crudo(fila, 'new_horasdivulgacin'),
  horasTotales: crudo(fila, 'new_horastotales'),
  idPlanTrabajo: idPlan(fila),
  otroTipo: mayus(fila?.new_otrotipo),
});

const mapearTesis = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_direcciontesisid),
  nombreAlumno: mayus(fila?.new_nombredelalumno),
  tituloObtener: opt(fila, '_new_tituloaobtener_value'),
  unidadAcademica: opt(fila, '_new_unidadacadmica_value'),
  avance: opt(fila, 'new_avance'),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  tiempoAsignado: crudo(fila, 'new_tiempoasignado'),
  idPlanTrabajo: idPlan(fila),
  horasTotales: fv(fila, 'new_horastotales') || texto(fila?.new_horastotales),
  otraUnidadAcademica: mayus(fila?.new_otraunidadacademica),
});

const mapearJurado = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_juradotrabajosfinalesid),
  cantidad: crudo(fila, 'new_cantidad'),
  horasTotales: crudo(fila, 'new_horastotales'),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  tipo: opt(fila, 'new_tipojurado'),
  unidadAcademica: opt(fila, '_new_unidadacadmica_value'),
  idPlanTrabajo: idPlan(fila),
});

const mapearCargo = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_cargos_encargosid),
  cargo: opt(fila, '_new_cargo_value'),
  horasTotales: crudo(fila, 'new_horastotales'),
  tiempoAsignado: crudo(fila, 'new_tiempoasignado'),
  unidadAcademica: opt(fila, '_new_unidadacademicadelcargo_value'),
  propuestaFormativa: mayus(fila?.new_propuestaformativa),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  idPlanTrabajo: idPlan(fila),
});

const mapearEncargo = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_cargos_encargosid),
  horasTotales: crudo(fila, 'new_horastotales'),
  tiempoAsignado: crudo(fila, 'new_tiempoasignado'),
  unidadAcademica: opt(fila, '_new_unidadacadmica_value'),
  propuestaFormativa: mayus(fila?.new_propuestaformativa),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  otraUnidadAcademica: mayus(fila?.new_otraunidadacademica),
  // El portal no lo pasa a mayúsculas.
  encargo: texto(fila?.new_encargo),
  idPlanTrabajo: idPlan(fila),
});

const mapearExtension = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_extensionid),
  actividad: mayus(fila?.new_actividad),
  cantidad: crudo(fila, 'new_cantidad'),
  horasReloj: crudo(fila, 'new_horasreloj'),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  unidadAcademica: opt(fila, '_new_unidadacadmica_value'),
  idPlanTrabajo: idPlan(fila),
  otraUnidadAcademica: mayus(fila?.new_otraunidadacademica),
});

const mapearTransferencia = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_transferenciaid),
  actividad: mayus(fila?.new_tipodeactividad),
  unidadAcademica: opt(fila, '_new_unidadacadmica_value'),
  nombre: mayus(fila?.new_name),
  horasDedicadas: crudo(fila, 'new_horasdedicadas'),
  idPlanTrabajo: idPlan(fila),
  otraUnidadAcademica: mayus(fila?.new_otraunidadacademica),
});

const mapearFormacion = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_formacionesid),
  nombre: mayus(fila?.new_name),
  institucion: mayus(fila?.new_institucionorganismocapacitador),
  gradoAvance: opt(fila, 'new_gradodeavance'),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  cantidad: crudo(fila, 'new_cantidad'),
  capacitador: texto(fila?.new_capacitador),
  tema: opt(fila, 'new_tema'),
  estapaFormacion: opt(fila, 'new_etapadeformacion'),
  horasTotales: crudo(fila, 'new_horastotales'),
  idPlanTrabajo: idPlan(fila),
});

const mapearBloque = (fila: Fila): RegistroPta => ({
  id: texto(fila?.new_pta_bloquesid),
  actividad: mayus(fila?.new_name),
  unidadMedida: opt(fila, 'new_unidaddemedida'),
  cantidad: crudo(fila, 'new_cantidad'),
  horasTotales: crudo(fila, 'new_horastotales'),
  idPlanTrabajo: idPlan(fila),
});

export const MAPEADORES: Record<FuenteSeccion, (fila: Fila) => RegistroPta> = {
  clases: mapearClase,
  areas: mapearArea,
  proyectos: mapearProyecto,
  publicaciones: mapearPublicacion,
  congresos: mapearCongreso,
  divulgaciones: mapearDivulgacion,
  tesis: mapearTesis,
  jurados: mapearJurado,
  cargos: mapearCargo,
  encargos: mapearEncargo,
  extension: mapearExtension,
  transferencia: mapearTransferencia,
  formaciones: mapearFormacion,
  bloques: mapearBloque,
};
