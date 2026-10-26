// Perfil > Gestión académica: tipos, mapeo, payloads y validaciones.
// Port de Portal-Austral-Dev -> perfil/gestion-academica/page.tsx, hooks/gestion-academica/*,
// columns/gestion-academica/* y perfil/_components/gestion-academica/modales/*.
import * as yup from 'yup';
import { aFechaApi } from '../legajo/fechas';
import {
  FV,
  fechaDeFila,
  opcionDeFila,
  opcionRequerida,
  texto,
  type Fila,
  type OpcionDeLista,
  type OpcionONull,
} from './comun';
import { esOtrasEntidadesAcademicas } from './extension';
import type { Opcion, OpcionSelect } from '../legajo/tipos';

const MAXIMO_INT = 2147483647;

// ---------------------------------------------------------------------------
// Cargos en gestión académica Austral (solo lectura)
// ---------------------------------------------------------------------------

export interface CargoGestion {
  id: string;
  cargo: string;
  unidadAcademica: string;
  dedicacionSemanal: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  esMayorCargo: boolean;
}

/** Marca el cargo de mayor dedicación semanal (el primero si hay empate), como useGetCargos del portal. */
export const mapearCargos = (filas: Fila[]): CargoGestion[] => {
  const horas = (f: Fila): number => Number(f?.new_dedicacionsemanalenhoras) || 0;
  const mayor = filas.length ? filas.reduce((max, actual) => (horas(actual) > horas(max) ? actual : max)) : null;
  const idMayor = mayor?.new_posicion_histid;
  return filas.map((f) => ({
    id: texto(f?.new_posicion_histid),
    cargo: texto(f?.['pos.new_name']),
    unidadAcademica: texto(f?.[`pos.new_unidadorganizativa${FV}`]),
    dedicacionSemanal: texto(f?.new_dedicacionsemanalenhoras),
    fechaInicio: fechaDeFila(f, 'new_fechadesde'),
    fechaFin: fechaDeFila(f, 'new_fechahasta'),
    esMayorCargo: f?.new_posicion_histid === idMayor,
  }));
};

/** Cargo con mayor dedicación; si no hay, el primero de la lista (igual que el portal). */
export const cargoMayorDedicacion = (cargos: CargoGestion[]): string =>
  cargos.find((c) => c.esMayorCargo)?.cargo || cargos[0]?.cargo || '';

// ---------------------------------------------------------------------------
// Encargos en gestión académica Austral
// ---------------------------------------------------------------------------

/**
 * Lista de tipos tal como la define el portal (ModalEncargosGestion y useGetEncargos). El código de Docencia es
 * 10000000 en el portal (ocho dígitos, no nueve como los demás): se respeta tal cual y se anota en la documentación.
 */
export const TIPOS_ENCARGO: OpcionDeLista[] = [
  { value: 10000000, label: 'Docencia' },
  { value: 100000001, label: 'Gestión' },
  { value: 100000002, label: 'Investigación' },
  { value: 100000003, label: 'Otro' },
];

export const TIPO_ENCARGO_OTRO = 100000003;

export interface Encargo {
  id: string;
  encargo: string;
  tipo: OpcionDeLista[];
  unidadAcademica: Opcion;
  propuestaFormativa: string;
  dedicacionSemanal: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  reportaA: string;
  descripcion: string;
  /** Texto libre heredado (new_otraunidad): el portal ya no lo edita. */
  otraUnidad: string;
  /** Lookup "Otra entidad académica" (new_otraentidadacademica); null si no hay. */
  otraEntidadAcademica: OpcionSelect | null;
  otroTipo: string;
}

/**
 * Tipos del encargo (new_tipo_multisel): llega un código o varios separados por coma. Los códigos que no están en la
 * lista se conservan; para mostrarlos se usa el texto formateado del CRM ("A; B") si coincide la cantidad.
 */
export const mapearTiposEncargo = (valor: unknown, etiqueta: unknown): OpcionDeLista[] => {
  if (valor === null || valor === undefined || valor === '') return [];
  const codigos = typeof valor === 'string' && valor.includes(',') ? valor.split(',') : [valor];
  const etiquetas = texto(etiqueta)
    .split(';')
    .map((e) => e.trim())
    .filter(Boolean);
  return codigos.map((c, i) => {
    const numero = parseInt(String(c).trim(), 10);
    const conocida = TIPOS_ENCARGO.find((o) => o.value === numero);
    if (conocida) return { value: conocida.value, label: conocida.label };
    return { value: numero, label: etiquetas.length === codigos.length ? etiquetas[i] : String(c).trim() };
  });
};

export const mapearEncargo = (f: Fila): Encargo => {
  const unidad = opcionDeFila(f, '_new_unidadacademica_value');
  const otraId = f?._new_otraentidadacademica_value;
  return {
    id: texto(f?.new_encargosid),
    encargo: texto(f?.new_encargo),
    tipo: mapearTiposEncargo(f?.new_tipo_multisel, f?.[`new_tipo_multisel${FV}`]),
    unidadAcademica: unidad,
    propuestaFormativa: texto(f?.new_propuestaformativa),
    dedicacionSemanal: texto(f?.new_dedicacionsemanalenhoras),
    fechaInicio: fechaDeFila(f, 'new_fechadeinicio'),
    fechaFin: fechaDeFila(f, 'new_fechadefinalizacion'),
    reportaA: texto(f?.new_reportaa),
    descripcion: texto(f?.new_descripciondelencargo),
    otraUnidad: texto(f?.new_otraunidad),
    otraEntidadAcademica: otraId
      ? { value: texto(otraId), label: texto(f?.[`_new_otraentidadacademica_value${FV}`]) }
      : null,
    otroTipo: texto(f?.new_otrotipo),
  };
};

export interface FormularioEncargo {
  encargo: string;
  tipo: OpcionDeLista[];
  otroTipo: string;
  unidadAcademica: OpcionONull;
  otraUnidad: string;
  otraEntidadAcademica: OpcionONull;
  propuestaFormativa: string;
  dedicacionSemanal: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  reportaA: string;
  descripcion: string;
}

export const encargoAFormulario = (e?: Encargo): FormularioEncargo => ({
  encargo: e?.encargo ?? '',
  tipo: e?.tipo ?? [],
  otroTipo: e?.otroTipo ?? '',
  unidadAcademica:
    e && e.unidadAcademica.value ? { value: String(e.unidadAcademica.value), label: texto(e.unidadAcademica.label) } : null,
  otraUnidad: e?.otraUnidad ?? '',
  otraEntidadAcademica: e?.otraEntidadAcademica
    ? { value: e.otraEntidadAcademica.value, label: e.otraEntidadAcademica.label }
    : null,
  propuestaFormativa: e?.propuestaFormativa ?? '',
  dedicacionSemanal: e?.dedicacionSemanal ?? '',
  fechaInicio: e?.fechaInicio ?? null,
  fechaFin: e?.fechaFin ?? null,
  reportaA: e?.reportaA ?? '',
  descripcion: e?.descripcion ?? '',
});

/**
 * Cuerpo de POST NuevoEncargo / PUT EditarEncargo (useCargarEncargosGestion del portal).
 * - `new_otraentidadacademica` va solo con "Otras Entidades Académicas" elegida; con cualquier otra entidad va vacío y la
 *   API limpia la que hubiera quedado de antes.
 * - `new_otraunidad`: igual que el portal, al crear va el texto del formulario (siempre vacío, ya no hay campo) y al
 *   editar va vacío (el portal lee `datos.otraunidad`, que no existe).
 */
export const armarPayloadEncargo = (
  empleadoId: string,
  d: FormularioEncargo,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_encargosid: id } : {}),
  new_colaborador: empleadoId,
  new_encargo: d.encargo || '',
  new_tipo_multisel: (d.tipo ?? []).map((t) => t.value).join(','),
  new_otrotipo: d.otroTipo || '',
  new_unidadacademica: d.unidadAcademica?.value || '',
  new_otraunidad: id ? '' : d.otraUnidad || '',
  new_otraentidadacademica: esOtrasEntidadesAcademicas(d.unidadAcademica) ? (d.otraEntidadAcademica?.value ?? '') : '',
  new_propuestaformativa: d.propuestaFormativa || '',
  new_dedicacionsemanalenhoras: Number(d.dedicacionSemanal) || 0,
  new_fechadeinicio: d.fechaInicio ? aFechaApi(d.fechaInicio) : null,
  new_fechadefinalizacion: d.fechaFin ? aFechaApi(d.fechaFin) : null,
  new_reportaa: d.reportaA || '',
  new_descripciondelencargo: d.descripcion || '',
});

const dedicacionSemanal = (requerida: string, minimoUno: boolean) => {
  let base = yup
    .string()
    .required(requerida)
    .test('numero', 'La dedicación semanal debe ser un número', (v) => !v || !Number.isNaN(Number(v)))
    .test('positivo', 'La dedicación semanal debe ser un número positivo', (v) => !v || Number(v) > 0)
    .test('entero', 'La dedicación semanal debe ser un número entero', (v) => !v || Number.isInteger(Number(v)));
  if (minimoUno) {
    base = base.test('minimo', 'La dedicación semanal debe ser mayor a 0', (v) => !v || Number(v) >= 1);
  }
  return base.test(
    'maximo',
    'La dedicación semanal no puede ser mayor a 2.147.483.647',
    (v) => !v || Number(v) <= MAXIMO_INT,
  );
};

const dia = (f: Date): number => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

const esFechaValida = yup.date().nullable().typeError('Debe ser una fecha válida');

export const esquemaEncargo = yup.object({
  encargo: yup.string().trim().required('El encargo es obligatorio'),
  tipo: yup.array().min(1, 'Debe seleccionar al menos un tipo').required('El tipo es requerido'),
  otroTipo: yup.string().test('otro-tipo', 'Otro es requerido', function (valor) {
    const tipos = (this.parent.tipo ?? []) as OpcionDeLista[];
    const hayOtro = tipos.some((t) => t.label === 'Otro');
    return !hayOtro || Boolean(valor && valor.trim());
  }),
  unidadAcademica: opcionRequerida('La entidad académica es requerida'),
  otraEntidadAcademica: yup
    .object()
    .nullable()
    .test('otra-entidad', 'La otra entidad académica es requerida', function (valor) {
      return !esOtrasEntidadesAcademicas(this.parent.unidadAcademica) || Boolean(valor && (valor as any).value);
    }),
  dedicacionSemanal: dedicacionSemanal('La dedicación semanal es requerida', false),
  fechaInicio: esFechaValida.required('La fecha de inicio es requerida'),
  fechaFin: esFechaValida.test(
    'fin-orden',
    'La fecha de finalización debe ser igual o posterior a la fecha de inicio',
    function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      if (!valor || !inicio) return true;
      return dia(valor) >= dia(inicio);
    },
  ),
  reportaA: yup.string().trim().required('Reporta a es requerido'),
});

// ---------------------------------------------------------------------------
// Cargos / encargos en gestión académica externos
// ---------------------------------------------------------------------------

export const ESTADO_VIGENTE = 100000000;
export const ESTADO_FINALIZADO = 100000001;

export const ESTADOS_EXTERNO: OpcionDeLista[] = [
  { value: ESTADO_VIGENTE, label: 'Vigente' },
  { value: ESTADO_FINALIZADO, label: 'Finalizado' },
];

export interface CargoEncargoExterno {
  id: string;
  cargoEncargo: string;
  institucion: string;
  pais: Opcion;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  estado: Opcion;
  dedicacionSemanal: string;
}

export const mapearCargoEncargoExterno = (f: Fila): CargoEncargoExterno => ({
  id: texto(f?.new_cargosencargosexternosid),
  cargoEncargo: texto(f?.new_cargoencargo),
  institucion: texto(f?.new_institucion),
  pais: opcionDeFila(f, '_new_pais_value'),
  fechaInicio: fechaDeFila(f, 'new_fechadeinicio'),
  fechaFin: fechaDeFila(f, 'new_fechadefinalizacion'),
  estado: opcionDeFila(f, 'new_estadostatuscode', ESTADOS_EXTERNO),
  dedicacionSemanal: texto(f?.new_dedicacionsemanalenhoras),
});

export interface FormularioCargoEncargoExterno {
  cargoEncargo: string;
  institucion: string;
  pais: OpcionONull;
  dedicacionSemanal: string;
  fechaInicio: Date | null;
  estado: OpcionONull;
  fechaFin: Date | null;
}

/** ¿El estado elegido es "Finalizado"? (el portal mira el código 100000001 o la etiqueta). */
export const esEstadoFinalizado = (estado: OpcionONull | undefined): boolean =>
  Boolean(estado) && (Number(estado?.value) === ESTADO_FINALIZADO || estado?.label === 'Finalizado');

export const externoAFormulario = (e?: CargoEncargoExterno): FormularioCargoEncargoExterno => ({
  cargoEncargo: e?.cargoEncargo ?? '',
  institucion: e?.institucion ?? '',
  pais: e && e.pais.value ? { value: String(e.pais.value), label: texto(e.pais.label) } : null,
  dedicacionSemanal: e?.dedicacionSemanal ?? '',
  fechaInicio: e?.fechaInicio ?? null,
  estado:
    e && e.estado.value !== null && e.estado.value !== undefined
      ? { value: e.estado.value, label: texto(e.estado.label) }
      : null,
  fechaFin: e?.fechaFin ?? null,
});

/** Cuerpo de POST / PUT cargosYEncargosExternos. */
export const armarPayloadExterno = (
  empleadoId: string,
  d: FormularioCargoEncargoExterno,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_cargosencargosexternosid: id } : {}),
  new_colaborador: empleadoId,
  new_cargoencargo: d.cargoEncargo || '',
  new_institucion: d.institucion || '',
  new_pais: d.pais?.value || '',
  new_dedicacionsemanalenhoras: Number(d.dedicacionSemanal) || 0,
  new_estadostatuscode: d.estado ? d.estado.value : 0,
  new_fechadefinalizacion: d.fechaFin ? aFechaApi(d.fechaFin) : null,
  new_fechadeinicio: d.fechaInicio ? aFechaApi(d.fechaInicio) : null,
});

export const esquemaCargoEncargoExterno = yup.object({
  cargoEncargo: yup.string().trim().required('El cargo/encargo es obligatorio'),
  institucion: yup.string().trim().required('La institución es obligatoria'),
  pais: opcionRequerida('El país es obligatorio'),
  dedicacionSemanal: dedicacionSemanal('La dedicación semanal es obligatoria', true),
  fechaInicio: esFechaValida.required('La fecha de inicio es obligatoria'),
  estado: opcionRequerida('El estado es obligatorio'),
  fechaFin: esFechaValida
    .test(
      'fin-obligatoria',
      'La fecha de finalización es obligatoria cuando el estado es "Finalizado"',
      function (valor) {
        return !esEstadoFinalizado(this.parent.estado) || Boolean(valor);
      },
    )
    .test(
      'fin-orden',
      'La fecha de finalización no puede ser anterior a la fecha de inicio',
      function (valor) {
        const inicio = this.parent.fechaInicio as Date | null;
        if (!valor || !inicio) return true;
        return dia(valor) >= dia(inicio);
      },
    ),
});
