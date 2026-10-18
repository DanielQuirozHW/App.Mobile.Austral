// Fechas del legajo. El portal usa dayjs; acá date-fns (ver docs/STACK.md).
import { format, isValid, parse, parseISO } from 'date-fns';

/**
 * Convierte lo que llega del CRM o del formulario en Date.
 * Acepta Date, "yyyy-MM-dd", ISO con hora y "dd/MM/yyyy". Devuelve null si no se puede.
 */
export const parsearFecha = (valor: unknown): Date | null => {
  if (valor instanceof Date) return isValid(valor) ? valor : null;
  if (typeof valor !== 'string' || valor.trim() === '') return null;
  const texto = valor.trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(texto)) {
    const fecha = parse(texto.slice(0, 10), 'dd/MM/yyyy', new Date());
    return isValid(fecha) ? fecha : null;
  }
  const fecha = parseISO(texto);
  return isValid(fecha) ? fecha : null;
};

/** "yyyy-MM-dd" (formato que manda el portal al guardar) o '' si no hay fecha. */
export const aFechaApi = (valor: unknown): string => {
  const fecha = parsearFecha(valor);
  return fecha ? format(fecha, 'yyyy-MM-dd') : '';
};

/** "dd/MM/yyyy" para mostrar, o ''. */
export const aFechaVisible = (valor: unknown): string => {
  const fecha = parsearFecha(valor);
  return fecha ? format(fecha, 'dd/MM/yyyy') : '';
};

/**
 * createdon del CRM (UTC) -> "dd/MM/yyyy HH:mm" en hora local, como convertirUTCaLocal del portal.
 * Si el texto no trae zona horaria se interpreta como UTC.
 */
export const utcALocalVisible = (valor: unknown): string | null => {
  if (typeof valor !== 'string' || valor.trim() === '') return null;
  const texto = valor.trim();
  const conZona = /(Z|[+-]\d{2}:?\d{2})$/.test(texto) ? texto : `${texto}Z`;
  const fecha = parseISO(conZona);
  return isValid(fecha) ? format(fecha, 'dd/MM/yyyy HH:mm') : null;
};

/** ¿La fecha es anterior o igual a hoy? (la regla del portal es max = hoy). */
export const noEsFutura = (fecha: Date): boolean => fecha.getTime() <= Date.now();
