// Plan de Trabajo Anual (PTA): fechas que el CRM devuelve en UTC.
// El portal las muestra con dayjs.utc(valor).format('DD/MM/YYYY'): se toma la parte de fecha tal como viene.
import { texto } from '../perfil/comun';

const PARTES = /^(\d{4})-(\d{2})-(\d{2})/;

/** "2026-03-10T00:00:00Z" -> "10/03/2026"; '' si no hay fecha. */
export const fechaUtcVisible = (valor: unknown): string => {
  const m = PARTES.exec(texto(valor));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
};

/** La misma fecha como Date local a las 12:00 (para que la zona horaria no la corra de día); null si no hay. */
export const fechaUtcADate = (valor: unknown): Date | null => {
  const m = PARTES.exec(texto(valor));
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0) : null;
};
