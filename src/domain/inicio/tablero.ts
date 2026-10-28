// Reglas del Tablero de Inicio. Port de Portal-Austral-Dev -> src/app/(dashboard)/page.tsx.
// Funciones puras: reciben las filas crudas del CRM y la fecha de "ahora" y devuelven lo que dibujan las tarjetas.
import { differenceInCalendarDays, format, isValid, parse, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { UserData } from '../auth/tipos';
import { FRASES_MENSUALES, type FraseMensual } from './frasesMensuales';

// ---------- Feriados ----------

interface FilaFeriado {
  new_diasferiadosid: string;
  new_name: string;
  new_fecha: string;
}

export interface FeriadoProximo {
  dia: number;
  /** Abreviatura en mayúsculas, sin punto (ej.: "DIC"). */
  mes: string;
  nombre: string;
  /** Día de la semana en minúsculas (ej.: "martes"); la tarjeta lo muestra con la primera en mayúscula. */
  diaSemana: string;
  diasRestantes: number;
}

const esFilaFeriado = (x: unknown): x is FilaFeriado =>
  typeof x === 'object' && x !== null && 'new_fecha' in x && 'new_name' in x && 'new_diasferiadosid' in x;

/**
 * parseFeriadoDate del portal: "YYYY-MM-DD…" toma solo la fecha (sin zona horaria), "D/M/YYYY" se lee día primero y el
 * resto lo interpreta el motor de fechas.
 */
export const leerFechaDeFeriado = (crudo: unknown): Date => {
  const texto = String(crudo ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) return parse(texto.slice(0, 10), 'yyyy-MM-dd', new Date());
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(texto)) {
    const [dia, mes, anio] = texto.split('/').map(Number);
    return new Date(anio < 100 ? 2000 + anio : anio, mes - 1, dia);
  }
  return new Date(texto);
};

/** Los tres próximos feriados desde hoy (inclusive), en orden de fecha. Filas que no son un array o sin fecha válida se ignoran. */
export const calcularProximosFeriados = (filas: unknown, ahora: Date): FeriadoProximo[] => {
  const hoy = startOfDay(ahora);
  const lista: unknown[] = Array.isArray(filas) ? filas : [];
  return lista
    .filter(esFilaFeriado)
    .map((fila) => ({ fila, fecha: leerFechaDeFeriado(fila.new_fecha) }))
    .filter(({ fecha }) => isValid(fecha) && startOfDay(fecha).getTime() >= hoy.getTime())
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .slice(0, 3)
    .map(({ fila, fecha }) => ({
      dia: fecha.getDate(),
      mes: format(fecha, 'MMM', { locale: es }).replace('.', '').toUpperCase(),
      nombre: fila.new_name,
      diaSemana: format(fecha, 'EEEE', { locale: es }),
      diasRestantes: differenceInCalendarDays(startOfDay(fecha), hoy),
    }));
};

// ---------- Cumpleaños ----------

interface FilaEmpleado {
  new_empleadoid: string;
  new_name: string;
  '_new_unidadorganizativa_value@OData.Community.Display.V1.FormattedValue'?: string | null;
  new_fechanacimiento: string | null;
}

export interface PersonaCumpleanios {
  nombre: string;
  apellido: string;
  unidad: string;
  iniciales: string;
}

const esFilaEmpleado = (x: unknown): x is FilaEmpleado =>
  typeof x === 'object' && x !== null && 'new_empleadoid' in x && 'new_fechanacimiento' in x;

// Argentina no tiene horario de verano desde 2009: siempre UTC-3. El portal usa Intl con la zona
// America/Argentina/Buenos_Aires; acá se resta el desplazamiento fijo para no depender de Intl en el celular.
const DESPLAZAMIENTO_ARGENTINA_MS = -3 * 60 * 60 * 1000;

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEPT', 'OCT', 'NOV', 'DIC'];

/** Día, mes (1 a 12) y rótulo ("26 OCT") de hoy en Argentina. */
export const fechaDeHoyEnArgentina = (ahora: Date): { dia: number; mes: number; anio: number; rotulo: string; clave: string } => {
  const ar = new Date(ahora.getTime() + DESPLAZAMIENTO_ARGENTINA_MS);
  const dia = ar.getUTCDate();
  const mes = ar.getUTCMonth() + 1;
  const anio = ar.getUTCFullYear();
  const dd = String(dia).padStart(2, '0');
  return {
    dia,
    mes,
    anio,
    rotulo: `${dd} ${MESES_CORTOS[mes - 1]}`,
    clave: `${anio}-${String(mes).padStart(2, '0')}-${dd}`,
  };
};

/** Empleados activos cuyo día y mes de nacimiento (en UTC, como el portal) coinciden con hoy en Argentina. */
export const calcularCumpleaniosDeHoy = (filas: unknown, ahora: Date): PersonaCumpleanios[] => {
  const hoy = fechaDeHoyEnArgentina(ahora);
  const lista: unknown[] = Array.isArray(filas) ? filas : [];
  return lista
    .filter(esFilaEmpleado)
    .filter((empleado) => {
      if (!empleado.new_fechanacimiento) return false;
      const nacimiento = new Date(empleado.new_fechanacimiento);
      return nacimiento.getUTCDate() === hoy.dia && nacimiento.getUTCMonth() + 1 === hoy.mes;
    })
    .map((empleado) => {
      const partes = (empleado.new_name ?? '').trim().split(/\s+/);
      // Las iniciales salen solo de las palabras con letras: el CRM escribe "APELLIDO , NOMBRE" y la coma suelta quedaba
      // como una "palabra" (las iniciales eran "R,").
      const palabras = partes.filter((parte) => /[A-Za-z\u00C0-\u017F]/.test(parte.charAt(0)));
      return {
        nombre: partes[0] ?? empleado.new_name ?? '',
        apellido: partes.slice(1).join(' '),
        unidad: empleado['_new_unidadorganizativa_value@OData.Community.Display.V1.FormattedValue'] ?? '',
        iniciales: palabras
          .map((palabra) => palabra[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
      };
    });
};

// ---------- Frase del mes ----------

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Ciclo del portal: junio de 2026 = primera frase (índice 0); avanza una por mes y se repite cada 18 meses.
 * Usa la fecha del dispositivo, como el portal.
 */
export const fraseDelMesActual = (ahora: Date): FraseMensual =>
  FRASES_MENSUALES[((((ahora.getFullYear() - 2026) * 12 + (ahora.getMonth() - 5)) % 18) + 18) % 18];

/** "octubre de 2026" (el portal usa toLocaleString('es-AR', { month: 'long', year: 'numeric' })). */
export const periodoDelMes = (ahora: Date): string => `${MESES[ahora.getMonth()]} de ${ahora.getFullYear()}`;

// ---------- Saludo ----------

/** Formato del CRM: "Apellido [Apellido2…], Nombre [Nombre2…]". Sin coma se toma la primera palabra. */
const primerNombre = (nombreCompleto?: string): string | null => {
  if (!nombreCompleto) return null;
  const recortado = nombreCompleto.trim();
  const coma = recortado.indexOf(',');
  if (coma !== -1) {
    const primeraPalabra = recortado
      .slice(coma + 1)
      .trim()
      .split(/\s+/)[0];
    if (primeraPalabra) return primeraPalabra;
  }
  return recortado.split(/\s+/)[0] || null;
};

/** Nombre para "Bienvenido, …": `user.nombre` si existe, si no el primer nombre de `fullname`; primera letra en mayúscula y el resto en minúscula. */
export const nombreParaBienvenida = (user: Pick<UserData, 'nombre' | 'fullname'> | null | undefined): string => {
  const crudo = user?.nombre ?? primerNombre(user?.fullname) ?? 'Usuario';
  return crudo === 'Usuario' ? crudo : crudo.charAt(0) + crudo.slice(1).toLowerCase();
};
