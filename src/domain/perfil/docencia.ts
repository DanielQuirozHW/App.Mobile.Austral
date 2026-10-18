// Perfil > Docencia: tipos, mapeos, payloads y validaciones de las cinco subpáginas del portal.
// Port de Portal-Austral-Dev -> perfil/docencia/{categorizacion-docente,nombramientos,promocion,docencia,
// asesoramiento-academico}/page.tsx, hooks/docencia/*, columns/docencia/* y
// perfil/_components/docencia/*.
// Categorización, Nombramientos y Promoción son de solo lectura (el back office los carga). Docencia U. Austral,
// Docencia externa y Asesoramiento académico son ABM.
import { endOfDay } from 'date-fns';
import * as yup from 'yup';
import type { Opcion, OpcionSelect } from '../legajo/tipos';
import {
  esFechaFutura,
  fechaDeFila,
  fechaOpcional,
  fechaRequerida,
  FV,
  opcionDeFila,
  opcionDeLista,
  opcionRequerida,
  parsearFechaCrm,
  texto,
  type Fila,
  type OpcionDeLista,
  type OpcionONull,
} from './comun';

/** Texto formateado del CRM de una columna (OptionSet, lookup `_x_value`, fecha o número). */
const fv = (fila: Fila, atributo: string): string => texto(fila?.[`${atributo}${FV}`]);

// ---------------------------------------------------------------------------
// Listas fijas (las mismas que los selects del portal)
// ---------------------------------------------------------------------------

export const REGIMEN_DE_DICTADO: OpcionDeLista[] = [
  { value: 100000004, label: 'Semanal' },
  { value: 100000003, label: 'Mensual' },
  { value: 100000002, label: 'Bimestral' },
  { value: 100000006, label: 'Trimestral' },
  { value: 100000001, label: 'Cuatrimestral' },
  { value: 100000000, label: 'Semestral' },
  { value: 100000005, label: 'Anual' },
];

export const UNIDAD_DE_MEDIDA: OpcionDeLista[] = [
  { value: 100000000, label: 'Bloques' },
  { value: 100000001, label: 'Horas' },
  { value: 100000002, label: 'Días' },
];

export const CARGO_DOCENCIA_EXTERNA: OpcionDeLista[] = [
  { value: 100000000, label: 'Ayudante de primera' },
  { value: 100000001, label: 'Ayudante de segunda' },
  { value: 100000002, label: 'Docente autorizado' },
  { value: 100000003, label: 'Jefe de trabajos prácticos' },
  { value: 100000004, label: 'Profesor adjunto' },
  { value: 100000005, label: 'Profesor asociado' },
  { value: 100000006, label: 'Profesor titular' },
  { value: 100000007, label: 'Profesor consultor' },
  { value: 100000008, label: 'Profesor emérito' },
  { value: 100000009, label: 'Profesor honorario' },
  { value: 100000010, label: 'Profesor libre' },
  { value: 100000011, label: 'Profesor visitante' },
  { value: 100000012, label: 'Profesor invitado' },
  { value: 100000013, label: 'Otro de nivel superior' },
];

export const DEDICACION_EXTERNA: OpcionDeLista[] = [
  { value: 100000000, label: 'Exclusiva' },
  { value: 100000001, label: 'Semi exclusiva' },
  { value: 100000002, label: 'Simple' },
];

/** Niveles que ofrece el select de Docencia U. Austral, en este orden (el portal filtra el catálogo de grado académico). */
export const NIVELES_DOCENCIA_UA = [
  'Pregrado',
  'Grado',
  'Posgrado',
  'Curso',
  'Curso de Ingreso',
  'Programa',
  'Diplomatura',
  'Otro',
];

/** Modalidades que ofrece el select de Docencia U. Austral. */
export const MODALIDADES_DOCENCIA_UA = ['Presencial', 'Distancia'];

const normalizar = (t: string): string => t.trim().toLowerCase();

/** Deja solo las opciones cuyas etiquetas están en `etiquetas`, en ese orden. */
export const filtrarPorEtiquetas = (catalogo: OpcionSelect[], etiquetas: string[]): OpcionSelect[] =>
  etiquetas
    .map((e) => catalogo.find((o) => normalizar(o.label) === normalizar(e)))
    .filter((o): o is OpcionSelect => Boolean(o));

/** Catálogo con id y nombre (grado académico, modalidad de dictado, instituciones). */
export const mapearCatalogoPorNombre = (idAtributo: string) => (fila: Fila): OpcionSelect => ({
  value: texto(fila?.[idAtributo]),
  label: texto(fila?.new_name),
});

/** Al editar, la opción llega como { id, texto }: se busca en el catálogo por id o por nombre y, si no está, se conserva. */
export const opcionDeCatalogo = (opcion: Opcion | undefined, catalogo: OpcionSelect[]): OpcionONull => {
  if (!opcion) return null;
  const valor = texto(opcion.value);
  const etiqueta = texto(opcion.label);
  if (!valor && !etiqueta) return null;
  const encontrada = catalogo.find((c) => (valor !== '' && c.value === valor) || (etiqueta !== '' && c.label === etiqueta));
  return encontrada ? { value: encontrada.value, label: encontrada.label } : { value: valor || etiqueta, label: etiqueta };
};

const descendentePorFecha = <T>(items: T[], fecha: (i: T) => Date | null): T[] =>
  [...items].sort((a, b) => (fecha(b)?.getTime() ?? 0) - (fecha(a)?.getTime() ?? 0));

// ---------------------------------------------------------------------------
// Categorización docente (solo lectura)
// ---------------------------------------------------------------------------

export interface CategorizacionVigente {
  id: string;
  unidadAcademica: string;
  tipoCarrera: string;
  categoriaDocente: string;
  nivel: string;
  agrupador: string;
  fechaInicio: string;
}

/** new_empleado del propio usuario: la categorización vigente. */
export const mapearCategorizacionVigente = (fila: Fila): CategorizacionVigente => ({
  id: texto(fila?.new_empleadoid),
  unidadAcademica: fv(fila, '_new_unidadorganizativa_value'),
  tipoCarrera: fv(fila, 'new_tipodecarreradocente'),
  categoriaDocente: fv(fila, '_new_categoriadocente_value'),
  nivel: fv(fila, 'new_nivelua'),
  agrupador: fv(fila, '_new_agrupadordecategorias_value'),
  fechaInicio: fv(fila, 'new_fechainiciocategoria'),
});

export interface CategorizacionHistorica {
  id: string;
  unidadAcademica: string;
  categoriaDocente: string;
  categoriaAsimilable: string;
  fechaInicio: string;
  fechaFin: string;
  dedicacion: string;
  fechaInicioDate: Date | null;
}

/** Solo se muestran las que tienen fecha de fin y esa fecha ya pasó (o es hoy), como el portal. */
export const mapearCategorizacionesHistoricas = (filas: Fila[]): CategorizacionHistorica[] =>
  descendentePorFecha(
    filas
      .filter((f) => {
        const fin = fechaDeFila(f, 'new_fechafincategoria');
        return fin !== null && !esFechaFutura(fin);
      })
      .map((f) => ({
        id: texto(f?.new_historicocategoriasdocenteid),
        unidadAcademica: fv(f, '_new_unidadacademicaperteneciente_value'),
        categoriaDocente: fv(f, '_new_categoriadocente_value'),
        categoriaAsimilable: fv(f, '_new_categoriaasimilablea_value'),
        fechaInicio: fv(f, 'new_fechainiciocategoria'),
        fechaFin: fv(f, 'new_fechafincategoria'),
        dedicacion: fv(f, 'new_dedicacion'),
        fechaInicioDate: fechaDeFila(f, 'new_fechainiciocategoria'),
      })),
    (c) => c.fechaInicioDate,
  );

// ---------------------------------------------------------------------------
// Nombramientos (solo lectura)
// ---------------------------------------------------------------------------

/** Vigente 1, Próximo a vencer 100000001, Vencido 100000002, Aprobado 100000005 (los estados en trámite no se muestran). */
export const ESTADOS_NOMBRAMIENTO_VISIBLES = [1, 100000001, 100000002, 100000005];

export interface Nombramiento {
  id: string;
  condicion: string;
  categoria: string;
  unidadAcademica: string;
  fechaNombramiento: string;
  duracion: string;
  resolucion: string;
  estado: string;
  cicloLectivo: string;
  fechaDate: Date | null;
}

export const mapearNombramientos = (filas: Fila[]): Nombramiento[] =>
  descendentePorFecha(
    filas.map((f) => ({
      id: texto(f?.new_nombramientosdocentesid),
      condicion: fv(f, 'new_condicion'),
      categoria: fv(f, '_new_categoria_value'),
      unidadAcademica: fv(f, '_new_unidadacademica_value'),
      fechaNombramiento: fv(f, 'new_fecha'),
      duracion: fv(f, 'new_duracionvigencia'),
      resolucion: texto(f?.new_resolucioncpcscd),
      estado: fv(f, 'statuscode'),
      cicloLectivo: fv(f, '_new_ciclolectivo_value'),
      fechaDate: fechaDeFila(f, 'new_fecha'),
    })),
    (n) => n.fechaDate,
  );

// ---------------------------------------------------------------------------
// Promoción (solo lectura)
// ---------------------------------------------------------------------------

export interface Promocion {
  id: string;
  anioConvocatoria: string;
  categoriaOrigen: string;
  nivelOrigen: string;
  categoriaPromovida: string;
  nivelPromovido: string;
  fechaPresentacion: string;
  estado: string;
  fechaResolucion: string;
  resolucion: string;
}

export const mapearPromociones = (filas: Fila[]): Promocion[] =>
  filas.map((f) => ({
    id: texto(f?.new_promociondocenteid),
    anioConvocatoria: texto(f?.new_anoconvocatoria),
    categoriaOrigen: fv(f, '_new_categoriaorigen_value'),
    nivelOrigen: fv(f, 'new_nivelorigen'),
    categoriaPromovida: fv(f, '_new_categoriapromovida_value'),
    nivelPromovido: fv(f, 'new_nivelpromovido'),
    fechaPresentacion: fv(f, 'new_fechapresentacion'),
    estado: fv(f, 'statuscode'),
    fechaResolucion: fv(f, 'new_fecharesolucion'),
    resolucion: texto(f?.new_resolucion),
  }));

// ---------------------------------------------------------------------------
// Fechas para la API
// ---------------------------------------------------------------------------

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Fecha de docencia para la API. El portal manda dayjs(fecha).utcOffset(180).format("YYYY-MM-DDTHH:mm:ssZ"): la
 * medianoche de Argentina (UTC-3) expresada con desplazamiento +03:00, o sea "YYYY-MM-DDT06:00:00+03:00".
 * Se arma desde el día calendario elegido para que no dependa de la zona horaria del dispositivo.
 */
export const diaADocenciaApi = (fecha: Date | null | undefined): string | null => {
  if (!fecha || Number.isNaN(fecha.getTime())) return null;
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T06:00:00+03:00`;
};

const dia = (f: Date): number => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

const finNoAnterior = fechaOpcional().test(
  'fin-orden',
  'La fecha de fin debe ser igual o posterior a la fecha de inicio',
  function (valor) {
    const inicio = this.parent.fechaInicio as Date | null;
    if (!valor || !inicio) return true;
    return dia(valor) >= dia(inicio);
  },
);

const otroSi = (campo: string, etiqueta: string, mensaje: string, maximo = 100) =>
  yup
    .string()
    .max(maximo, `Máximo ${maximo} caracteres`)
    .test(`otro-${campo}`, mensaje, function (valor) {
      return this.parent[campo]?.label !== etiqueta || Boolean(valor && valor.trim());
    });

// ---------------------------------------------------------------------------
// Docencia Universidad Austral (ABM)
// ---------------------------------------------------------------------------

export interface DocenciaUA {
  id: string;
  unidadAcademica: Opcion;
  nivel: Opcion;
  otroNivel: string;
  carrera: string;
  materia: string;
  regimen: Opcion;
  unidadMedida: Opcion;
  dedicacion: string;
  modalidad: Opcion;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const mapearDocenciasUA = (filas: Fila[]): DocenciaUA[] =>
  descendentePorFecha(
    filas.map((f) => ({
      id: texto(f?.new_docenciaid),
      unidadAcademica: opcionDeFila(f, '_new_unidadacademica_value'),
      nivel: opcionDeFila(f, '_new_nivel_value'),
      otroNivel: texto(f?.new_otronivel),
      carrera: texto(f?.new_carrerapropuestaformativa),
      materia: texto(f?.new_materiaarea),
      regimen: opcionDeFila(f, 'new_regimendedictado', REGIMEN_DE_DICTADO),
      unidadMedida: opcionDeFila(f, 'new_unidaddemedida', UNIDAD_DE_MEDIDA),
      dedicacion: texto(f?.new_dedicacionhorariatotal),
      modalidad: opcionDeFila(f, '_new_modalidaddedictado_value'),
      fechaInicio: fechaDeFila(f, 'new_fechainicio'),
      fechaFin: fechaDeFila(f, 'new_fechafin'),
    })),
    (d) => d.fechaInicio,
  );

export interface FormularioDocenciaUA {
  unidadAcademica: OpcionONull;
  nivel: OpcionONull;
  otroNivel: string;
  carrera: string;
  materia: string;
  regimen: OpcionONull;
  unidadMedida: OpcionONull;
  dedicacion: string;
  modalidad: OpcionONull;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export interface CatalogosDocenciaUA {
  unidades: OpcionSelect[];
  niveles: OpcionSelect[];
  modalidades: OpcionSelect[];
}

export const docenciaUAAFormulario = (d: DocenciaUA | undefined, c: CatalogosDocenciaUA): FormularioDocenciaUA => ({
  unidadAcademica: opcionDeCatalogo(d?.unidadAcademica, c.unidades),
  nivel: opcionDeCatalogo(d?.nivel, c.niveles),
  otroNivel: d?.otroNivel ?? '',
  carrera: d?.carrera ?? '',
  materia: d?.materia ?? '',
  regimen: d ? opcionDeLista(d.regimen.value, REGIMEN_DE_DICTADO) : null,
  unidadMedida: d ? opcionDeLista(d.unidadMedida.value, UNIDAD_DE_MEDIDA) : null,
  dedicacion: d?.dedicacion ?? '',
  modalidad: opcionDeCatalogo(d?.modalidad, c.modalidades),
  fechaInicio: d?.fechaInicio ?? null,
  fechaFin: d?.fechaFin ?? null,
});

/**
 * Cuerpo de POST / PUT api/hrfactors/docencia (hooks/docencia/useCargarDocenciaUAustral del portal).
 * DIFERENCIA CONSCIENTE: el portal no manda new_otronivel al editar; acá se manda siempre (vacío si el nivel no es "Otro").
 */
export const armarPayloadDocenciaUA = (
  empleadoId: string,
  d: FormularioDocenciaUA,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_docenciaid: id } : {}),
  new_colaborador: empleadoId,
  new_unidadacademica: d.unidadAcademica?.value || '',
  new_nivel: d.nivel?.value || '',
  new_modalidaddedictado: d.modalidad?.value || '',
  new_materiaarea: d.materia || '',
  new_carrerapropuestaformativa: d.carrera || '',
  new_unidaddemedida: d.unidadMedida?.value || 0,
  new_regimendedictado: d.regimen?.value || 0,
  new_dedicacionhorariatotal: Number(d.dedicacion) || 0,
  new_fechainicio: diaADocenciaApi(d.fechaInicio),
  new_fechafin: diaADocenciaApi(d.fechaFin),
  new_otronivel: d.nivel?.label === 'Otro' ? d.otroNivel || '' : '',
});

export const esquemaDocenciaUA = yup.object({
  unidadAcademica: opcionRequerida('La unidad académica es requerida'),
  nivel: opcionRequerida('El nivel es requerido'),
  otroNivel: otroSi('nivel', 'Otro', 'El otro nivel es requerido'),
  carrera: yup.string().trim().max(100, 'Máximo 100 caracteres').required('La carrera / propuesta formativa es requerida'),
  materia: yup.string().trim().max(100, 'Máximo 100 caracteres').required('La materia / área es requerida'),
  regimen: opcionRequerida('El régimen de dictado es requerido'),
  unidadMedida: opcionRequerida('La unidad de medida es requerida'),
  dedicacion: yup
    .string()
    .required('La dedicación total es requerida')
    .test('entero', 'La dedicación total debe ser un número entero', (v) => !v || Number.isInteger(Number(v)))
    .test('minimo', 'La dedicación total debe ser mayor o igual a 1', (v) => !v || Number(v) >= 1)
    .test('maximo', 'La dedicación total es demasiado grande', (v) => !v || Number(v) <= 100000000000),
  modalidad: opcionRequerida('La modalidad de dictado es requerida'),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida'),
  fechaFin: finNoAnterior,
});

// ---------------------------------------------------------------------------
// Docencia externa (ABM)
// ---------------------------------------------------------------------------

export interface DocenciaExterna {
  id: string;
  asignatura: string;
  carrera: string;
  institucion: Opcion;
  otraInstitucion: string;
  unidadAcademica: string;
  cargo: Opcion;
  otroCargo: string;
  nivel: Opcion;
  otroNivel: string;
  regimen: Opcion;
  dedicacionHoraria: string;
  dedicacion: Opcion;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export const mapearDocenciasExternas = (filas: Fila[]): DocenciaExterna[] =>
  descendentePorFecha(
    filas.map((f) => ({
      id: texto(f?.new_docenciaexternaid),
      asignatura: texto(f?.new_asignaturaactividadcurricular),
      carrera: texto(f?.new_carrerapropuestaformativa),
      institucion: opcionDeFila(f, '_new_institucion_value'),
      otraInstitucion: texto(f?.new_otrainstitucion),
      unidadAcademica: texto(f?.new_unidadacademicafacultad),
      cargo: opcionDeFila(f, 'new_cargo', CARGO_DOCENCIA_EXTERNA),
      otroCargo: texto(f?.new_otrocargo),
      nivel: opcionDeFila(f, '_new_nivel_value'),
      otroNivel: texto(f?.cr20a_otronivel),
      regimen: opcionDeFila(f, 'new_regimendedictado', REGIMEN_DE_DICTADO),
      dedicacionHoraria: texto(f?.new_dedicacionhoraria),
      dedicacion: opcionDeFila(f, 'new_dedicacion', DEDICACION_EXTERNA),
      fechaInicio: fechaDeFila(f, 'new_fechainicio'),
      fechaFin: fechaDeFila(f, 'new_fechafin'),
    })),
    (d) => d.fechaInicio,
  );

export interface FormularioDocenciaExterna {
  asignatura: string;
  carrera: string;
  institucion: OpcionONull;
  otraInstitucion: string;
  unidadAcademica: string;
  cargo: OpcionONull;
  otroCargo: string;
  nivel: OpcionONull;
  otroNivel: string;
  regimen: OpcionONull;
  dedicacionHoraria: string;
  dedicacion: OpcionONull;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

export interface CatalogosDocenciaExterna {
  instituciones: OpcionSelect[];
  niveles: OpcionSelect[];
}

export const docenciaExternaAFormulario = (
  d: DocenciaExterna | undefined,
  c: CatalogosDocenciaExterna,
): FormularioDocenciaExterna => ({
  asignatura: d?.asignatura ?? '',
  carrera: d?.carrera ?? '',
  institucion: opcionDeCatalogo(d?.institucion, c.instituciones),
  otraInstitucion: d?.otraInstitucion ?? '',
  unidadAcademica: d?.unidadAcademica ?? '',
  cargo: d ? opcionDeLista(d.cargo.value, CARGO_DOCENCIA_EXTERNA) : null,
  otroCargo: d?.otroCargo ?? '',
  nivel: opcionDeCatalogo(d?.nivel, c.niveles),
  otroNivel: d?.otroNivel ?? '',
  regimen: d ? opcionDeLista(d.regimen.value, REGIMEN_DE_DICTADO) : null,
  dedicacionHoraria: d?.dedicacionHoraria ?? '',
  dedicacion: d ? opcionDeLista(d.dedicacion.value, DEDICACION_EXTERNA) : null,
  fechaInicio: d?.fechaInicio ?? null,
  fechaFin: d?.fechaFin ?? null,
});

/** Cuerpo de POST / PUT api/hrfactors/docenciaexterna (hooks/docencia/useCargarDocenciaExterna del portal). */
export const armarPayloadDocenciaExterna = (
  empleadoId: string,
  d: FormularioDocenciaExterna,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_docenciaexternaid: id } : {}),
  new_colaborador: empleadoId,
  new_asignaturaactividadcurricular: d.asignatura || '',
  new_carrerapropuestaformativa: d.carrera || '',
  new_institucion: d.institucion?.value || '',
  new_unidadacademicafacultad: d.unidadAcademica || '',
  new_cargo: d.cargo?.value || 0,
  new_nivel: d.nivel?.value || '',
  new_regimendedictado: d.regimen?.value || 0,
  new_dedicacionhoraria: Number(d.dedicacionHoraria) || 0,
  new_dedicacion: d.dedicacion?.value || 0,
  new_fechainicio: diaADocenciaApi(d.fechaInicio),
  new_fechafin: diaADocenciaApi(d.fechaFin),
  new_otrocargo: d.cargo?.label === 'Otro de nivel superior' ? d.otroCargo || '' : '',
  new_otrainstitucion: d.institucion?.label === 'Otra' ? d.otraInstitucion || '' : '',
  cr20a_otronivel: d.nivel?.label === 'Otro' ? d.otroNivel || '' : '',
});

export const esquemaDocenciaExterna = yup.object({
  asignatura: yup
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .required('La asignatura / actividad curricular es requerida'),
  carrera: yup.string().trim().max(100, 'Máximo 100 caracteres').required('La carrera / propuesta formativa es requerida'),
  institucion: opcionRequerida('La institución es requerida'),
  otraInstitucion: otroSi('institucion', 'Otra', 'La otra institución es requerida'),
  unidadAcademica: yup
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .required('La unidad académica / facultad es requerida'),
  cargo: opcionRequerida('El cargo es requerido'),
  otroCargo: otroSi('cargo', 'Otro de nivel superior', 'El otro cargo es requerido'),
  nivel: opcionRequerida('El nivel es requerido'),
  otroNivel: otroSi('nivel', 'Otro', 'El otro nivel es requerido'),
  regimen: opcionRequerida('El régimen de dictado es requerido'),
  dedicacionHoraria: yup
    .string()
    .required('La dedicación horaria es requerida')
    .test('numero', 'La dedicación horaria debe ser un número', (v) => !v || !Number.isNaN(Number(v)))
    .test('rango', 'La dedicación horaria debe estar entre 0 y 1000', (v) => !v || (Number(v) >= 0 && Number(v) <= 1000)),
  dedicacion: opcionRequerida('La dedicación es requerida'),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida'),
  fechaFin: finNoAnterior,
});

// ---------------------------------------------------------------------------
// Asesoramiento académico (ABM)
// ---------------------------------------------------------------------------

export interface Asesoramiento {
  id: string;
  cantidadAlumnos: string;
  anio: string;
  unidadAcademica: Opcion;
}

export const mapearAsesoramientos = (filas: Fila[]): Asesoramiento[] =>
  [...filas]
    .map((f) => ({
      id: texto(f?.new_asesoramientoacademicoid),
      cantidadAlumnos: texto(f?.new_cantidadalumnosasignados),
      anio: texto(f?.new_ano),
      unidadAcademica: opcionDeFila(f, '_new_unidadacademica_value'),
    }))
    .sort((a, b) => Number(b.anio) - Number(a.anio));

export interface FormularioAsesoramiento {
  cantidadAlumnos: string;
  anio: string;
  unidadAcademica: OpcionONull;
}

export const asesoramientoAFormulario = (
  a: Asesoramiento | undefined,
  unidades: OpcionSelect[],
): FormularioAsesoramiento => ({
  cantidadAlumnos: a?.cantidadAlumnos ?? '',
  anio: a?.anio ?? '',
  unidadAcademica: opcionDeCatalogo(a?.unidadAcademica, unidades),
});

/** Cuerpo de POST / PUT api/hrfactors/asesoramientoAcademico (hooks/docencia/useCargarAsesoramiento del portal). */
export const armarPayloadAsesoramiento = (
  empleadoId: string,
  d: FormularioAsesoramiento,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_asesoramientoacademicoid: id } : {}),
  new_colaborador: empleadoId,
  new_cantidadalumnosasignados: Number(d.cantidadAlumnos) || 0,
  new_ano: Number(d.anio) || 0,
  new_unidadacademica: d.unidadAcademica?.value || '',
});

export const esquemaAsesoramiento = yup.object({
  cantidadAlumnos: yup
    .string()
    .required('La cantidad de alumnos asignados es requerida')
    .test('entero', 'La cantidad debe ser un número entero', (v) => !v || Number.isInteger(Number(v)))
    .test('rango', 'La cantidad debe estar entre 1 y 999', (v) => !v || (Number(v) >= 1 && Number(v) <= 999)),
  anio: yup
    .string()
    .required('El año es requerido')
    .test('cuatro', 'El año debe tener 4 dígitos', (v) => !v || /^\d{4}$/.test(v))
    .test('rango', 'El año debe estar entre 2000 y 2100', (v) => !v || (Number(v) >= 2000 && Number(v) <= 2100)),
  unidadAcademica: opcionRequerida('La unidad académica es requerida'),
});

// Reexportes que usa la pantalla.
export { parsearFechaCrm, endOfDay };
