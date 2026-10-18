// Tipo de contratación del empleado. Port de Portal-Austral-Dev -> src/configs/tipoContratacion.ts
//
// La sección Familia (cónyuge e hijos/as) es exclusiva de relación de dependencia y esta es la única
// fuente de esa regla. El CRM puede devolver el código como string y la etiqueta lleva tilde:
// por eso se tolera número o string, y la etiqueta con o sin tilde.
import type { Opcion } from './tipos';

/** Código del OptionSet para "Relación de dependencia". */
export const COD_RELACION_DEPENDENCIA = 100000000;

const normalizar = (texto?: string | null): string =>
  String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/** El código como número, o null si todavía no llegó. */
const codigo = (tipo?: Partial<Opcion> | null): number | null => {
  const num = Number(tipo?.value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

/**
 * true mientras el legajo no resolvió el dato. No habilita nada, pero tampoco puede habilitar bajas:
 * un dato que el usuario no ve no tiene que disparar la eliminación de un familiar.
 */
export const contratacionIndeterminada = (tipo?: Partial<Opcion> | null): boolean =>
  codigo(tipo) === null && normalizar(tipo?.label) === '';

export const esRelacionDependencia = (tipo?: Partial<Opcion> | null): boolean => {
  const cod = codigo(tipo);
  if (cod !== null) return cod === COD_RELACION_DEPENDENCIA;
  return normalizar(tipo?.label) === 'relacion de dependencia';
};
