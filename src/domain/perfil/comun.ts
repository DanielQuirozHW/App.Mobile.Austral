// Piezas compartidas por las pantallas de Perfil (Formación, Trayectoria y las que siguen).
// Port de los helpers que repiten los hooks y modales de Portal-Austral-Dev -> src/app/(dashboard)/perfil/**.
import { endOfDay, isValid } from 'date-fns';
import * as yup from 'yup';
import { parsearFecha } from '../legajo/fechas';
import { opcionONull, type OpcionONull } from '../legajo/formulario';
import type { Opcion } from '../legajo/tipos';

export { opcionONull };
export type { OpcionONull };

/** Texto formateado que el CRM agrega a OptionSets, lookups, fechas y booleanos. */
export const FV = '@OData.Community.Display.V1.FormattedValue';

export type Fila = Record<string, any>;

export type Modo = 'nuevo' | 'editar' | 'ver';

/** Elemento de una lista fija de opciones. */
export interface OpcionDeLista {
  value: number | string;
  label: string;
}

/** Archivo elegido en el dispositivo (misma forma que ArchivoElegido de infrastructure/archivos). */
export interface ArchivoDeFormulario {
  uri: string;
  name: string;
  type: string;
  tamanio?: number;
}

export const texto = (valor: unknown): string => (valor === null || valor === undefined ? '' : String(valor));

/**
 * Opción { value, label } de una columna del CRM: el valor crudo y su texto formateado.
 * Si se pasa `lista`, la etiqueta sale de la lista fija (la misma que muestran los selects del portal).
 */
export const opcionDeFila = (fila: Fila, atributo: string, lista?: OpcionDeLista[]): Opcion => {
  const value = fila?.[atributo] ?? null;
  const delCrm = fila?.[`${atributo}${FV}`] ?? null;
  const delCatalogo =
    lista && value !== null ? lista.find((o) => String(o.value) === String(value))?.label : undefined;
  return { value, label: delCatalogo ?? delCrm };
};

/** Opción de una lista fija a partir de su código; null si no hay código. */
export const opcionDeLista = (valor: unknown, lista: OpcionDeLista[]): OpcionONull => {
  if (valor === null || valor === undefined || valor === '') return null;
  const encontrada = lista.find((o) => String(o.value) === String(valor));
  return encontrada ? { value: encontrada.value, label: encontrada.label } : { value: valor as any, label: String(valor) };
};

/** Opción de una lista fija a partir de su etiqueta (el CRM a veces devuelve solo el texto). */
export const opcionDeListaPorEtiqueta = (etiqueta: unknown, lista: OpcionDeLista[]): OpcionONull => {
  const buscada = texto(etiqueta).trim().toLowerCase();
  if (!buscada) return null;
  const encontrada = lista.find((o) => o.label.toLowerCase() === buscada);
  return encontrada ? { value: encontrada.value, label: encontrada.label } : null;
};

// ---------------------------------------------------------------------------
// Fechas
// ---------------------------------------------------------------------------

/**
 * Fecha que devuelve el CRM en su texto formateado ("D/M/YY" o "DD/MM/YYYY"). Los años de 2 dígitos > 70 son 19xx y
 * el resto 20xx; la fecha queda a las 12:00 locales para que la zona horaria no la corra de día (igual que el portal).
 */
export const parsearFechaCrm = (valor: unknown): Date | null => {
  if (valor instanceof Date) return isValid(valor) ? valor : null;
  if (typeof valor !== 'string' || valor.trim() === '') return null;
  const t = valor.trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?!\d)/.exec(t);
  if (m) {
    const dosDigitos = m[3].length === 2;
    const anio = dosDigitos ? (Number(m[3]) > 70 ? 1900 + Number(m[3]) : 2000 + Number(m[3])) : Number(m[3]);
    const fecha = new Date(anio, Number(m[2]) - 1, Number(m[1]), 12, 0, 0, 0);
    return isValid(fecha) ? fecha : null;
  }
  const fecha = parsearFecha(t);
  return fecha ? new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0, 0) : null;
};

/** Fecha de una columna del CRM (texto formateado si lo hay; si no, el valor crudo). */
export const fechaDeFila = (fila: Fila, atributo: string): Date | null =>
  parsearFechaCrm(fila?.[`${atributo}${FV}`] ?? fila?.[atributo]);

/** Año (como texto) de una columna de fecha del CRM; '' si no hay. */
export const anioDeFila = (fila: Fila, atributo: string): string => {
  const fecha = fechaDeFila(fila, atributo);
  return fecha ? String(fecha.getFullYear()) : '';
};

const pad = (n: number, largo = 2): string => String(n).padStart(largo, '0');

/**
 * Año -> fecha para la API, como lo manda el portal en los títulos:
 *   dayjs(new Date(anio, 0, 2)).utcOffset(180).format("YYYY-MM-DDTHH:mm:ssZ")
 * (2 de enero, expresado con desplazamiento +03:00). '' si no hay año.
 */
export const anioAFechaApi = (anio: unknown): string => {
  const n = Number(anio);
  if (!anio || !Number.isFinite(n) || n <= 0) return '';
  const local = new Date(n, 0, 2);
  const desplazada = new Date(local.getTime() + 180 * 60000);
  return (
    `${pad(desplazada.getUTCFullYear(), 4)}-${pad(desplazada.getUTCMonth() + 1)}-${pad(desplazada.getUTCDate())}` +
    `T${pad(desplazada.getUTCHours())}:${pad(desplazada.getUTCMinutes())}:${pad(desplazada.getUTCSeconds())}+03:00`
  );
};

/** Año -> "YYYY-01-02" (el portal usa el día 2 para que no caiga en el 31/12 por la zona horaria). */
export const anioADiaApi = (anio: unknown): string => {
  const n = Number(anio);
  return anio && Number.isFinite(n) && n > 0 ? `${pad(n, 4)}-01-02` : '';
};

export const ANIO_MINIMO = 1925;

/** Opciones del selector de año (del actual hacia atrás), como el CustomYearSelect del portal. */
export const opcionesDeAnios = (): OpcionDeLista[] => {
  const actual = new Date().getFullYear();
  const anios: OpcionDeLista[] = [];
  for (let a = actual; a >= ANIO_MINIMO; a -= 1) anios.push({ value: String(a), label: String(a) });
  return anios;
};

export const opcionDeAnio = (anio: unknown): OpcionONull => {
  const t = texto(anio).trim();
  return t ? { value: t, label: t } : null;
};

/** ¿La fecha es posterior al final del día de hoy? */
export const esFechaFutura = (fecha: Date): boolean => fecha.getTime() > endOfDay(new Date()).getTime();

// ---------------------------------------------------------------------------
// Sí / No
// ---------------------------------------------------------------------------

/** Los selects del formulario guardan texto; 'true' / 'false' se convierten al enviar. */
export const OPCIONES_SI_NO: OpcionDeLista[] = [
  { value: 'true', label: 'Si' },
  { value: 'false', label: 'No' },
];

/** Booleano del CRM (o su texto "Sí" / "Si" / "No") -> opción del select. */
export const booleanAOpcion = (valor: unknown, etiqueta?: unknown): OpcionONull => {
  if (valor === true || valor === 'true') return OPCIONES_SI_NO[0];
  if (valor === false || valor === 'false') return OPCIONES_SI_NO[1];
  const e = texto(etiqueta).trim().toLowerCase();
  if (e === 'sí' || e === 'si') return OPCIONES_SI_NO[0];
  if (e === 'no') return OPCIONES_SI_NO[1];
  return null;
};

export const opcionABoolean = (opcion: OpcionONull): boolean | null =>
  opcion?.value === 'true' ? true : opcion?.value === 'false' ? false : null;

// ---------------------------------------------------------------------------
// Validación (yup)
// ---------------------------------------------------------------------------

/** Opción { value, label } obligatoria; un null avisa con el mensaje en español. */
export const opcionRequerida = (mensaje: string) =>
  yup
    .object()
    .shape({ value: yup.mixed().required(mensaje) })
    .nullable()
    .required(mensaje);

export const opcionOpcional = () => yup.object().nullable();

export const textoRequerido = (mensaje: string) => yup.string().trim().required(mensaje);

export const fechaRequerida = (mensaje: string) => yup.date().nullable().typeError(mensaje).required(mensaje);

export const fechaOpcional = () => yup.date().nullable().typeError('La fecha no es válida');

/** Texto sobrante para el contador "N caracteres restantes" del portal. */
export const caracteresRestantes = (valor: unknown, maximo: number): string =>
  `${Math.max(maximo - texto(valor).length, 0)} caracteres restantes`;
