// Perfil > Investigación > Actividad I+D > Financiamientos: propio de la UA y externo a la UA.
// Port de Portal-Austral-Dev -> perfil/investigacion/actividad-i+d/financiamientos/page.tsx,
// perfil/_components/investigacion/actividad-i+d/financiamientos/modales/{ModalFinanciamientoUA,ModalFinanciamientoExterno}.tsx,
// hooks/investigacion-perfil/* y columns/investigacion/{columnsFinanciamientos,columnsFinanciamientoEXTERNO}.tsx.
// Los textos de error son los de los modales del portal.
import * as yup from 'yup';
import { aFechaApi } from '../legajo/fechas';
import { esValor } from './afiliaciones';
import {
  esFechaFutura,
  fechaDeFila,
  fechaOpcional,
  fechaRequerida,
  FV,
  opcionDeLista,
  opcionRequerida,
  texto,
  type Fila,
  type OpcionDeLista,
  type OpcionONull,
} from './comun';

// ---------------------------------------------------------------------------
// Listas fijas (las mismas que los selects del portal)
// ---------------------------------------------------------------------------

export const ROL_FINANCIAMIENTO: OpcionDeLista[] = [
  { value: 100000000, label: 'Investigador responsable' },
  { value: 100000001, label: 'Integrante' },
];

const PRESENTADO = 100000000;
const RECHAZADO = 100000001;
const EN_EJECUCION = 100000002;
const FINALIZADO = 100000003;

export const ESTADO_FINANCIAMIENTO_PROPIO: OpcionDeLista[] = [
  { value: PRESENTADO, label: 'Presentado' },
  { value: RECHAZADO, label: 'Rechazado' },
  { value: EN_EJECUCION, label: 'En ejecución' },
  { value: FINALIZADO, label: 'Finalizado' },
];

export const ESTADO_FINANCIAMIENTO_EXTERNO: OpcionDeLista[] = [
  { value: PRESENTADO, label: 'Presentado' },
  { value: RECHAZADO, label: 'Rechazado' },
  { value: EN_EJECUCION, label: 'En Ejecución' },
  { value: FINALIZADO, label: 'Finalizado' },
];

const TIPO_CONCURSO_UA = 100000000;
const TIPO_OTRO = 100000003;

export const TIPO_FINANCIAMIENTO: OpcionDeLista[] = [
  { value: TIPO_CONCURSO_UA, label: 'Concurso Interno de Investigación UA' },
  { value: 100000001, label: 'Concurso Interno ProyectAR' },
  { value: 100000002, label: 'Concurso Clase Magistral de Investigación' },
  { value: TIPO_OTRO, label: 'Otro' },
];

export const MODALIDAD_FINANCIAMIENTO: OpcionDeLista[] = [
  { value: 100000000, label: 'Modalidad 1 - Trayectoria' },
  { value: 100000001, label: 'Modalidad 2 - Iniciación' },
  { value: 100000002, label: 'Modalidad 3A - Doctorandos' },
  { value: 100000003, label: 'Modalidad 3B - Maestrandos' },
  { value: 100000004, label: 'Modalidad 4 – Graduados y Estudiantes de Grado' },
  { value: 100000005, label: 'Modalidad 5 – Proyectos Interdisciplinarios' },
  { value: 100000006, label: 'Modalidad 6 – Proyectos Interfacultades' },
  { value: 100000007, label: 'Modalidad 7 - Data Science' },
  { value: 100000008, label: 'Modalidad 8 - PDTS' },
  { value: 100000009, label: 'Modalidad 9 – Transferencia' },
  { value: 100000010, label: 'Modalidad HUA' },
  { value: 100000011, label: 'Modalidad HUC' },
];

export const MONEDA_FINANCIAMIENTO: OpcionDeLista[] = [
  { value: 100000000, label: 'Pesos' },
  { value: 100000001, label: 'Euros' },
  { value: 100000002, label: 'Dólares' },
  { value: 100000003, label: 'Otro' },
];

export const DESTINO_FINANCIAMIENTO: OpcionDeLista[] = [
  { value: 100000000, label: 'Financiamiento para el proyecto' },
  { value: 100000001, label: 'Equipamiento e Insumos' },
  { value: 100000002, label: 'Movilidad' },
  { value: 100000003, label: 'Becas' },
  { value: 100000004, label: 'Otros' },
];

/** Símbolo que antepone la tabla del portal al monto, según la moneda. */
export const simboloDeMoneda = (moneda: OpcionONull): string => {
  switch (String(moneda?.value ?? '')) {
    case '100000000':
      return '$';
    case '100000001':
      return '€';
    case '100000002':
      return 'US$';
    default:
      return '';
  }
};

/** Monto para mostrar: símbolo + texto formateado del CRM (o el número crudo). */
export const montoVisible = (moneda: OpcionONull, montoFormato: string, monto: string): string =>
  `${simboloDeMoneda(moneda)} ${montoFormato || monto}`.trim();

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const dia = (f: Date): number => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

const diaApi = (f: Date | null | undefined): string | null => (f ? aFechaApi(f) : null);

const numeroDeMonto = (v: string): number => Number(v.trim().replace(',', '.'));

const MONTO_MAXIMO = 100000000000;
const MAX_NOMBRE = 500;

const esquemaMonto = yup
  .string()
  .trim()
  .required('El monto es requerido')
  .test('numero', 'Debe ingresar un monto válido', (v) => !v || Number.isFinite(numeroDeMonto(v)))
  .test('minimo', 'El monto debe ser mayor o igual a 0', (v) => !v || !(numeroDeMonto(v) < 0))
  .test('maximo', 'El monto máximo permitido es 100,000,000,000', (v) => !v || !(numeroDeMonto(v) > MONTO_MAXIMO))
  .test('decimales', 'El monto admite hasta 2 decimales', (v) => !v || !/[.,]\d{3,}/.test(v));

const requiereOtorgamiento = (estado: OpcionONull): boolean =>
  esValor(estado, PRESENTADO) || esValor(estado, EN_EJECUCION) || esValor(estado, FINALIZADO);

const montoDeFormulario = (monto: string): number => {
  const n = numeroDeMonto(monto || '');
  return Number.isFinite(n) ? n : 0;
};

// ---------------------------------------------------------------------------
// Financiamiento propio de la UA
// ---------------------------------------------------------------------------

export interface FinanciamientoPropio {
  id: string;
  nombre: string;
  rol: OpcionONull;
  estado: OpcionONull;
  tipo: OpcionONull;
  otroTipo: string;
  modalidad: OpcionONull;
  moneda: OpcionONull;
  monto: string;
  montoFormato: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  fechaOtorgamiento: Date | null;
}

export const mapearFinanciamientosPropios = (filas: Fila[]): FinanciamientoPropio[] =>
  filas.map((f) => ({
    id: texto(f?.new_financiamientopropiodelauaid),
    nombre: texto(f?.new_name),
    rol: opcionDeLista(f?.new_rol, ROL_FINANCIAMIENTO),
    estado: opcionDeLista(f?.new_estado, ESTADO_FINANCIAMIENTO_PROPIO),
    tipo: opcionDeLista(f?.new_tipofinanciamiento, TIPO_FINANCIAMIENTO),
    otroTipo: texto(f?.new_otrofinanciamiento),
    modalidad: opcionDeLista(f?.new_modalidad, MODALIDAD_FINANCIAMIENTO),
    moneda: opcionDeLista(f?.new_moneda_opcion, MONEDA_FINANCIAMIENTO),
    monto: texto(f?.new_monto),
    montoFormato: texto(f?.[`new_monto${FV}`]),
    fechaInicio: fechaDeFila(f, 'new_fechainicio'),
    fechaFin: fechaDeFila(f, 'new_fechafin'),
    fechaOtorgamiento: fechaDeFila(f, 'new_fechaotorgamiento'),
  }));

export interface FormularioFinanciamientoPropio {
  nombre: string;
  rol: OpcionONull;
  estado: OpcionONull;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  tipo: OpcionONull;
  otroTipo: string;
  modalidad: OpcionONull;
  moneda: OpcionONull;
  monto: string;
  fechaOtorgamiento: Date | null;
}

export const propioAFormulario = (f: FinanciamientoPropio | undefined): FormularioFinanciamientoPropio => ({
  nombre: f?.nombre ?? '',
  rol: f?.rol ?? null,
  estado: f?.estado ?? null,
  fechaInicio: f?.fechaInicio ?? null,
  fechaFin: f?.fechaFin ?? null,
  tipo: f?.tipo ?? null,
  otroTipo: f?.otroTipo ?? '',
  modalidad: f?.modalidad ?? null,
  moneda: f?.moneda ?? null,
  monto: f?.monto ?? '',
  fechaOtorgamiento: f?.fechaOtorgamiento ?? null,
});

/** ¿El tipo pide modalidad? Solo el Concurso Interno de Investigación UA. */
export const pideModalidad = (tipo: OpcionONull): boolean => esValor(tipo, TIPO_CONCURSO_UA);

/** ¿El tipo es "Otro"? */
export const tipoEsOtro = (tipo: OpcionONull): boolean => esValor(tipo, TIPO_OTRO);

/** ¿Para este estado la fecha de fin es obligatoria? */
export const estadoPideFechaFin = (estado: OpcionONull): boolean => esValor(estado, FINALIZADO);

/** ¿Para este estado la fecha de otorgamiento es obligatoria? */
export const estadoPideOtorgamiento = requiereOtorgamiento;

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/financiamientoPropioUa (hooks/investigacion-perfil de financiamiento propio).
 * DIFERENCIA CONSCIENTE: el portal, al editar, lee datos.tipoFinanciamiento y datos.modalidad (campos que no existen) y
 * manda 0 en los dos; acá se manda el tipo y la modalidad elegidos. Además, otro financiamiento y modalidad solo van con el
 * tipo que los pide (el portal manda lo que haya quedado cargado).
 */
export const armarPayloadPropio = (
  empleadoId: string,
  f: FormularioFinanciamientoPropio,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_financiamientopropiodelauaid: id } : { new_colaborador: empleadoId }),
  new_name: f.nombre,
  new_rol: f.rol?.value || 0,
  new_estado: f.estado?.value || 0,
  new_fechainicio: diaApi(f.fechaInicio) ?? '',
  new_fechafin: diaApi(f.fechaFin) ?? '',
  new_tipofinanciamiento: f.tipo?.value || 0,
  new_otrofinanciamiento: tipoEsOtro(f.tipo) ? f.otroTipo : '',
  new_modalidad: pideModalidad(f.tipo) ? f.modalidad?.value || 0 : 0,
  new_moneda_opcion: f.moneda?.value || 0,
  new_monto: montoDeFormulario(f.monto),
  new_fechaotorgamiento: diaApi(f.fechaOtorgamiento) ?? '',
});

export const esquemaPropio = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(MAX_NOMBRE, `El nombre del subsidio no puede exceder ${MAX_NOMBRE} caracteres`)
    .required('El nombre del subsidio es requerido'),
  rol: opcionRequerida('El rol es requerido'),
  estado: opcionRequerida('El estado es requerido'),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida').test(
    'inicio-orden',
    'La fecha de inicio no puede ser posterior a la fecha de fin.',
    function (valor) {
      const fin = this.parent.fechaFin as Date | null;
      if (!valor || !fin) return true;
      return dia(valor) <= dia(fin);
    },
  ),
  fechaFin: fechaOpcional()
    .test('fin-requerida', 'La fecha de fin es requerida para el estado seleccionado', function (valor) {
      return !estadoPideFechaFin(this.parent.estado) || Boolean(valor);
    })
    .test('fin-orden', 'La fecha de fin no puede ser anterior a la fecha de inicio.', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      if (!valor || !inicio) return true;
      return dia(valor) >= dia(inicio);
    }),
  tipo: opcionRequerida('El tipo de financiamiento es requerido'),
  otroTipo: yup
    .string()
    .max(100, 'El otro financiamiento no puede exceder 100 caracteres')
    .test('otro-tipo', 'Debe especificar el tipo de financiamiento', function (valor) {
      return !tipoEsOtro(this.parent.tipo) || Boolean(valor && valor.trim());
    }),
  modalidad: yup
    .mixed()
    .nullable()
    .test(
      'modalidad',
      "La modalidad es requerida cuando se selecciona 'Concurso Interno de Investigación UA'",
      function (valor) {
        return !pideModalidad(this.parent.tipo) || Boolean((valor as any)?.value);
      },
    ),
  moneda: opcionRequerida('La moneda es requerida'),
  monto: esquemaMonto,
  fechaOtorgamiento: fechaOpcional()
    .test('otorgamiento-requerida', 'La fecha de otorgamiento es requerida para el estado seleccionado', function (valor) {
      return !estadoPideOtorgamiento(this.parent.estado) || Boolean(valor);
    })
    .test('otorgamiento-inicio', 'La fecha de otorgamiento no puede ser menor a la fecha de inicio', function (valor) {
      const inicio = this.parent.fechaInicio as Date | null;
      if (!valor || !inicio) return true;
      return dia(valor) >= dia(inicio);
    })
    .test(
      'otorgamiento-futura',
      'Si estado es igual a Finalizado o Presentado, la fecha de otorgamiento no puede ser superior al día de hoy.',
      function (valor) {
        const estado = this.parent.estado as OpcionONull;
        if (!valor || !(esValor(estado, FINALIZADO) || esValor(estado, PRESENTADO))) return true;
        return !esFechaFutura(valor);
      },
    ),
});

// ---------------------------------------------------------------------------
// Financiamiento externo a la UA
// ---------------------------------------------------------------------------

export interface FinanciamientoExterno {
  id: string;
  nombre: string;
  rol: OpcionONull;
  estado: OpcionONull;
  destino: OpcionONull;
  institucion: string;
  moneda: OpcionONull;
  monto: string;
  montoFormato: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  fechaOtorgamiento: Date | null;
}

export const mapearFinanciamientosExternos = (filas: Fila[]): FinanciamientoExterno[] =>
  filas.map((f) => ({
    id: texto(f?.new_financiamientoexternoalauaid),
    nombre: texto(f?.new_name),
    rol: opcionDeLista(f?.new_rol, ROL_FINANCIAMIENTO),
    estado: opcionDeLista(f?.new_estado, ESTADO_FINANCIAMIENTO_EXTERNO),
    destino: opcionDeLista(f?.new_destinodelfinanciamiento, DESTINO_FINANCIAMIENTO),
    institucion: texto(f?.new_institucionotorgante),
    moneda: opcionDeLista(f?.new_moneda, MONEDA_FINANCIAMIENTO),
    monto: texto(f?.new_monto),
    montoFormato: texto(f?.[`new_monto${FV}`]),
    fechaInicio: fechaDeFila(f, 'new_fechainicio'),
    fechaFin: fechaDeFila(f, 'new_fechafin'),
    fechaOtorgamiento: fechaDeFila(f, 'new_fechadeotorgamiento'),
  }));

export interface FormularioFinanciamientoExterno {
  nombre: string;
  rol: OpcionONull;
  estado: OpcionONull;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  destino: OpcionONull;
  institucion: string;
  moneda: OpcionONull;
  monto: string;
  fechaOtorgamiento: Date | null;
}

export const externoAFormulario = (f: FinanciamientoExterno | undefined): FormularioFinanciamientoExterno => ({
  nombre: f?.nombre ?? '',
  rol: f?.rol ?? null,
  estado: f?.estado ?? null,
  fechaInicio: f?.fechaInicio ?? null,
  fechaFin: f?.fechaFin ?? null,
  destino: f?.destino ?? null,
  institucion: f?.institucion ?? '',
  moneda: f?.moneda ?? null,
  monto: f?.monto ?? '',
  fechaOtorgamiento: f?.fechaOtorgamiento ?? null,
});

/**
 * Cuerpo de POST / PUT api/hrfactors/investigacion/financiamientoExternoUa.
 * Como el portal, el PUT también manda new_colaborador y las actividades que financia van vacías.
 */
export const armarPayloadExterno = (
  empleadoId: string,
  f: FormularioFinanciamientoExterno,
  id?: string,
): Record<string, unknown> => ({
  ...(id ? { new_financiamientoexternoalauaid: id } : {}),
  new_colaborador: empleadoId,
  new_name: f.nombre,
  new_rol: f.rol?.value || 0,
  new_estado: f.estado?.value || 0,
  new_fechainicio: diaApi(f.fechaInicio),
  new_fechafin: diaApi(f.fechaFin),
  new_destinodelfinanciamiento: f.destino?.value || 0,
  new_actividadesquefinancia: [],
  new_otraactividad: '',
  new_institucionotorgante: f.institucion,
  new_moneda: f.moneda?.value || 0,
  new_monto: montoDeFormulario(f.monto),
  new_fechadeotorgamiento: diaApi(f.fechaOtorgamiento),
});

export const esquemaExterno = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(MAX_NOMBRE, `El nombre no puede exceder los ${MAX_NOMBRE} caracteres`)
    .required('El nombre del subsidio es requerido'),
  rol: opcionRequerida('El rol es requerido'),
  estado: opcionRequerida('El estado es requerido'),
  fechaInicio: fechaRequerida('La fecha de inicio es requerida'),
  fechaFin: fechaOpcional(),
  destino: opcionRequerida('El destino del financiamiento es requerido'),
  institucion: yup
    .string()
    .trim()
    .max(MAX_NOMBRE, `La institución otorgante no puede exceder los ${MAX_NOMBRE} caracteres`)
    .required('La institución otorgante es requerida'),
  moneda: opcionRequerida('La moneda es requerida'),
  monto: esquemaMonto,
  fechaOtorgamiento: fechaOpcional().test(
    'otorgamiento-requerida',
    'La fecha de otorgamiento es requerida para el estado seleccionado',
    function (valor) {
      return !estadoPideOtorgamiento(this.parent.estado) || Boolean(valor);
    },
  ),
});
