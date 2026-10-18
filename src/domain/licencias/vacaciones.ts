// Reglas de vacaciones. Port de Portal-Austral-Dev -> src/hooks/useVacaciones.ts (elegirPeriodoSolicitable)
// y de VacacionesPanel (progreso).
import { diaCrm } from './fechasCrm';
import type { PeriodoVacaciones } from './tipos';

/**
 * Período en el que hoy se puede solicitar: los que todavía no vencieron, ordenados por vencimiento,
 * y el primero. Se compara como texto yyyy-MM-dd (nunca por UTC). Sin período vigente devuelve null.
 * `hoy` es yyyy-MM-dd.
 */
export const elegirPeriodoSolicitable = (periodos: PeriodoVacaciones[], hoy: string): PeriodoVacaciones | null => {
  const vigentes = periodos.filter((p) => {
    const vencimiento = diaCrm(p.vencimientoIso);
    return vencimiento !== null && vencimiento >= hoy;
  });
  if (vigentes.length === 0) return null;
  return [...vigentes].sort((a, b) => String(a.vencimientoIso).localeCompare(String(b.vencimientoIso)))[0];
};

export interface ProgresoVacaciones {
  /** Sin total no hay barra con segmentos. */
  hayTotal: boolean;
  porcentajeGozados: number;
  porcentajeSolicitados: number;
  porcentajePendientes: number;
  gozados: number;
  solicitados: number;
  pendientes: number;
}

const acotar = (n: number, minimo: number, maximo: number): number => Math.min(Math.max(n ?? 0, minimo), maximo);

/**
 * Barra "Progreso de Vacaciones" del portal: el total es lo pendiente; lo gozado suma 2 días por
 * cada penalidad aplicada; si los porcentajes pasan 100 se normalizan.
 */
export const calcularProgreso = (p: PeriodoVacaciones): ProgresoVacaciones => {
  const total = Math.max(p.diasPendientes || 0, 0);
  if (!total) {
    return {
      hayTotal: false,
      porcentajeGozados: 0,
      porcentajeSolicitados: 0,
      porcentajePendientes: 0,
      gozados: p.diasGozados,
      solicitados: p.diasSolicitados,
      pendientes: 0,
    };
  }
  const vGozados = acotar(p.diasGozados + p.penalidadesAplicadas * 2, 0, total);
  const vSolicitados = acotar(p.diasSolicitados, 0, total);
  const vPendientes = acotar(p.diasPendientes, 0, total);

  let pG = (vGozados / total) * 100;
  let pS = (vSolicitados / total) * 100;
  let pP = (vPendientes / total) * 100;
  const suma = pG + pS + pP;
  if (suma > 100) {
    const k = 100 / suma;
    pG *= k;
    pS *= k;
    pP *= k;
  }
  return {
    hayTotal: true,
    porcentajeGozados: pG,
    porcentajeSolicitados: pS,
    porcentajePendientes: pP,
    gozados: p.diasGozados,
    solicitados: p.diasSolicitados,
    pendientes: vPendientes,
  };
};
