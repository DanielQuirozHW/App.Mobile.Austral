// Resolución de funciones de Nombramientos y Promoción a partir del NOMBRE de cada posición del BO.
// Port de Portal-Austral-Dev:
//   src/nombramientos/business/roles.ts
//   src/promocion/business/roles.ts
// No se migran los overrides de desarrollo por localStorage (son de la web).
import { RolNombramientos, RolPromocion } from './enums';

/** Minúsculas, sin acentos, sin puntuación, espacios colapsados. */
export const normalizarTexto = (s?: string | null): string =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Función de Nombramientos de UNA posición, o null si no aplica. El orden de las reglas importa. */
export const resolverFuncionNombramientos = (posicionNombre?: string | null): RolNombramientos | null => {
  const n = normalizarTexto(posicionNombre);
  if (!n) return null;
  // "Asistente ..." nunca es un rol del proceso.
  if (n.includes('asistente')) return null;

  const tokens = n.split(' ');
  if (n.includes('adjunt') && (tokens.includes('sa') || (n.includes('secretari') && n.includes('academic')))) {
    return RolNombramientos.AdSA;
  }
  if (n.includes('adjunt') && (tokens.includes('vraa') || (n.includes('vicerrector') && n.includes('academic')))) {
    return RolNombramientos.AdVRAA;
  }
  if (n.includes('vicerrector') && n.includes('academic')) return RolNombramientos.VRAA;
  if (n.includes('secretari') && n.includes('academic')) return RolNombramientos.SA;
  return null;
};

// Posiciones de Promoción por NOMBRE EXACTO normalizado (misma lista que PosicionesPromocion de la API).
const POSICIONES_PROMOCION: Record<string, RolPromocion> = {
  [normalizarTexto('VICERRECTOR DE ASUNTOS ACADÉMICOS')]: RolPromocion.VRAA,
  [normalizarTexto('ADJUNTO VRAA')]: RolPromocion.AdVRAA,
  [normalizarTexto('SECRETARIO ACADEMICO')]: RolPromocion.SA,
  [normalizarTexto('ADJUNTO SA')]: RolPromocion.AdSA,
  [normalizarTexto('REFERENTE MATHU')]: RolPromocion.ReferenteMathu,
};

/** Función de Promoción de UNA posición, o null si no aplica. */
export const resolverFuncionPromocion = (posicionNombre?: string | null): RolPromocion | null =>
  POSICIONES_PROMOCION[normalizarTexto(posicionNombre)] ?? null;

/** Funciones de Nombramientos efectivas del usuario (array; vacío si no cumple ninguna). */
export const funcionesEfectivas = (
  user?: { funcionNombramientos?: RolNombramientos[] | RolNombramientos | null } | null,
): RolNombramientos[] => {
  const funcion = user?.funcionNombramientos;
  if (!funcion) return [];
  return Array.isArray(funcion) ? funcion : [funcion];
};

export const tieneAlgunaFuncion = (
  user: Parameters<typeof funcionesEfectivas>[0],
  ...funciones: RolNombramientos[]
): boolean => funcionesEfectivas(user).some((f) => funciones.includes(f));

/** Funciones de Promoción efectivas: las propias; si no hay, las compartidas de Nombramientos. */
export const funcionesPromocionEfectivas = (
  user?: {
    funcionPromocion?: RolPromocion[] | RolPromocion | null;
    funcionNombramientos?: string[] | string | null;
  } | null,
): RolPromocion[] => {
  const propias = user?.funcionPromocion;
  if (propias) return Array.isArray(propias) ? propias : [propias];

  const heredadas = user?.funcionNombramientos;
  if (!heredadas) return [];
  const lista = Array.isArray(heredadas) ? heredadas : [heredadas];
  const validos = Object.values(RolPromocion) as string[];
  return lista.filter((f) => validos.includes(f)) as RolPromocion[];
};

export const tieneAlgunaFuncionPromocion = (
  user: Parameters<typeof funcionesPromocionEfectivas>[0],
  ...funciones: RolPromocion[]
): boolean => funcionesPromocionEfectivas(user).some((f) => funciones.includes(f));

export const esSAoAdSA = (roles: RolPromocion[]): boolean =>
  roles.includes(RolPromocion.SA) || roles.includes(RolPromocion.AdSA);

export const esVRAAoAdVRAA = (roles: RolPromocion[]): boolean =>
  roles.includes(RolPromocion.VRAA) || roles.includes(RolPromocion.AdVRAA);

export const esReferenteMathu = (roles: RolPromocion[]): boolean => roles.includes(RolPromocion.ReferenteMathu);
