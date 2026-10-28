// Color de cada módulo en la grilla de Inicio y en las pantallas de subopciones. El ícono va sobre un fondo suave de
// este color. En modo oscuro se usan variantes más claras: los tonos del modo claro (el azul de Legajo, por ejemplo) casi no
// se distinguen sobre fondo oscuro. Los id son los del árbol de navigation/modulosMenu.ts.
const PALETA_CLARA = ['#2E3092', '#0E8FA8', '#6A4CC2', '#E07B00', '#2E9E5B', '#D6336C', '#B7791F', '#4A5A8A'];
const PALETA_OSCURA = ['#8F93F5', '#4FC3D7', '#B39BFF', '#FFB155', '#5FD08A', '#FF7DAE', '#F0C15A', '#9DB0E8'];

const CLARO_POR_ID: Record<string, string> = {
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

const OSCURO_POR_ID: Record<string, string> = {
  legajo: '#8F93F5',
  perfil: '#B39BFF',
  licencias: '#4FC3D7',
  'plan-de-trabajo': '#FFB155',
  gdd: '#5FD08A',
  indicadores: '#FF7DAE',
  'funciones-sa': '#F0C15A',
  'funciones-vraa': '#9DB0E8',
  'referente-mathu': '#D08BEA',
  'app-notificaciones': '#FF7A7E',
  'app-ajustes': '#A9B0CE',
};

/**
 * Color del módulo `id` (hexadecimal de 6 dígitos). Si no tiene uno asignado, uno de la paleta según su posición.
 * `oscuro`: true en modo oscuro.
 */
export const colorDeModulo = (id: string, indice = 0, oscuro = false): string => {
  const porId = oscuro ? OSCURO_POR_ID : CLARO_POR_ID;
  const paleta = oscuro ? PALETA_OSCURA : PALETA_CLARA;
  return porId[id] ?? paleta[indice % paleta.length];
};
