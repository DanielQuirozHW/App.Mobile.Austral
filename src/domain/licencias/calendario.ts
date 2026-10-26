// Calendario de licencias y vacaciones. Port de Portal-Austral-Dev -> CalendarioWrapper, ModalCalendario y
// useLicenciasCalendario. El portal usa react-big-calendar; en la app es una grilla mensual propia.
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns';
import type { Feriado, SolicitudDeEquipo } from './tipos';

export type TipoEvento = 'vacaciones' | 'licencia' | 'feriado';

export interface EventoCalendario {
  id: string;
  titulo: string;
  tipo: TipoEvento;
  /** yyyy-MM-dd */
  desde: string;
  hasta: string;
  empleadoName: string;
  /** Solicitud de origen (null en los feriados). */
  solicitud: SolicitudDeEquipo | null;
  feriado: Feriado | null;
}

/** El portal no dibuja las canceladas ni las no aprobadas. */
const ESTADOS_OCULTOS = ['Cancelada', 'No Aprobada'];

export const armarEventos = (solicitudes: SolicitudDeEquipo[], feriados: Feriado[]): EventoCalendario[] => {
  const eventos: EventoCalendario[] = [];
  solicitudes.forEach((s) => {
    if (ESTADOS_OCULTOS.includes(s.estadoName)) return;
    if (!s.desdeIso || !s.hastaIso) return;
    const tipo = s.tipoDeLicencia.label || 'VACACIONES';
    eventos.push({
      id: s.id,
      titulo: `${tipo} - ${s.empleadoName}`,
      tipo: s.vacaciones ? 'vacaciones' : 'licencia',
      desde: s.desdeIso,
      hasta: s.hastaIso,
      empleadoName: s.empleadoName,
      solicitud: s,
      feriado: null,
    });
  });
  feriados.forEach((f) => {
    if (!f.dia) return;
    eventos.push({
      id: `feriado-${f.id}`,
      titulo: f.nombre || 'Feriado',
      tipo: 'feriado',
      desde: f.dia,
      hasta: f.dia,
      empleadoName: '',
      solicitud: null,
      feriado: f,
    });
  });
  return eventos;
};

export const eventosDelDia = (eventos: EventoCalendario[], dia: string): EventoCalendario[] =>
  eventos.filter((e) => e.desde <= dia && dia <= e.hasta);

/**
 * Color por persona, igual que colorFromName de Portal-Austral-Dev (calendar/Calendar.tsx):
 * hash = char + ((hash << 5) - hash), hue = |hash| % 360, hsl(hue, 65%, 50%) (45% en modo oscuro).
 * El desplazamiento trabaja en 32 bits con signo, por eso no se simplifica a hash * 31.
 */
export const colorDePersona = (nombre: string, oscuro: boolean): string => {
  let hash = 0;
  for (let i = 0; i < nombre.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, ${oscuro ? 45 : 50}%)`;
};

/** Colores del chip de estado en el detalle (ModalCalendario). */
export const colorDeEstadoCalendario = (estadoName: string): string => {
  switch (estadoName) {
    case 'Aprobada':
      return '#1b5e20';
    case 'Vigente':
      return '#2e7d32';
    case 'Gozada':
      return '#004d40';
    case 'Solicitada':
      return '#0d47a1';
    case 'En curso':
      return '#01579b';
    case 'Requiere Más Información':
    case 'Pendiente de validación por Dirección de Personas':
    case 'Solicitada. Pendiente Certificado':
      return '#bf360c';
    case 'No Aprobada':
      return '#b71c1c';
    case 'Cancelada':
      return '#4e342e';
    case 'Inactivo':
      return '#424242';
    case 'Feriado':
      return '#4a148c';
    default:
      return '#1565c0';
  }
};

export interface CeldaDeMes {
  /** yyyy-MM-dd */
  dia: string;
  /** false: pertenece al mes anterior o al siguiente (relleno de la grilla). */
  delMes: boolean;
}

export const NOMBRES_DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const tituloDeMes = (mes: Date): string => `${NOMBRES_MESES[mes.getMonth()]} ${mes.getFullYear()}`;

export const mesSiguiente = (mes: Date, pasos: number): Date => addMonths(mes, pasos);

/** Semanas (lunes a domingo) que cubren el mes. */
export const construirMes = (mes: Date): CeldaDeMes[][] => {
  const inicioMes = startOfMonth(mes);
  const finMes = endOfMonth(mes);
  // getDay: 0 domingo..6 sábado -> lunes = 0.
  const relleno = (inicioMes.getDay() + 6) % 7;
  const rellenoFinal = 6 - ((finMes.getDay() + 6) % 7);
  const inicio = new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 1 - relleno);
  const fin = new Date(finMes.getFullYear(), finMes.getMonth(), finMes.getDate() + rellenoFinal);
  const celdas = eachDayOfInterval({ start: inicio, end: fin }).map((d) => ({
    dia: format(d, 'yyyy-MM-dd'),
    delMes: d.getMonth() === mes.getMonth(),
  }));
  const semanas: CeldaDeMes[][] = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
};
