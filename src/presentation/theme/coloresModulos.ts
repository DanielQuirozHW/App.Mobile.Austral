// Color de cada módulo en la grilla de Inicio y en las pantallas de subopciones. Cada módulo tiene un color propio
// (cuadro de color con ícono blanco), que funciona igual en modo claro y oscuro. Los id son los del árbol de
// navigation/modulosMenu.ts.
const PALETA = ['#2E3092', '#0E8FA8', '#6A4CC2', '#E07B00', '#2E9E5B', '#D6336C', '#B7791F', '#4A5A8A'];

const POR_ID: Record<string, string> = {
  legajo: '#2E3092',
  perfil: '#6A4CC2',
  licencias: '#0E8FA8',
  'plan-de-trabajo': '#E07B00',
  gdd: '#2E9E5B',
  indicadores: '#D6336C',
  'funciones-sa': '#B7791F',
  'funciones-vraa': '#4A5A8A',
  'referente-mathu': '#8E3FA6',
  'app-notificaciones': '#E5484D',
  'app-ajustes': '#5A5C80',
};

/** Color del módulo `id`; si no tiene uno asignado, uno de la paleta según su posición. */
export const colorDeModulo = (id: string, indice = 0): string => POR_ID[id] ?? PALETA[indice % PALETA.length];
