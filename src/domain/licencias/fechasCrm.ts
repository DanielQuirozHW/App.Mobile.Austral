// Fechas del CRM. Port de Portal-Austral-Dev -> src/@core/utils/fechaCrm.
// Regla del portal: los días se comparan como texto yyyy-MM-dd y NUNCA se convierten por UTC,
// porque un día convertido puede correrse al anterior o al siguiente.
import { differenceInCalendarDays, format } from 'date-fns';
import { aFechaApi, parsearFecha } from '../legajo/fechas';

/** Primeros 10 caracteres si tienen forma yyyy-MM-dd; null en cualquier otro caso. */
export const diaCrm = (valor: unknown): string | null => {
  if (typeof valor !== 'string') return null;
  const dia = valor.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : null;
};

/** Hoy en la zona local, como yyyy-MM-dd. */
export const hoyCrm = (ahora: Date = new Date()): string => format(ahora, 'yyyy-MM-dd');

/** yyyy-MM-dd -> dd/MM/yyyy, o '' si no hay día. */
export const diaAVisible = (dia: string | null | undefined): string =>
  dia ? `${dia.slice(8, 10)}/${dia.slice(5, 7)}/${dia.slice(0, 4)}` : '';

/** Date elegido en un formulario -> yyyy-MM-dd local, o null. */
export const diaDeFecha = (fecha: Date | null | undefined): string | null => {
  if (!fecha) return null;
  return aFechaApi(fecha) || null;
};

/** Días entre dos fechas, ambas incluidas (fin.diff(inicio, 'days') + 1 del portal). null si falta una o fin < inicio. */
export const diasInclusivos = (desde: unknown, hasta: unknown): number | null => {
  const a = parsearFecha(desde);
  const b = parsearFecha(hasta);
  if (!a || !b) return null;
  const dias = differenceInCalendarDays(b, a);
  return dias < 0 ? null : dias + 1;
};
