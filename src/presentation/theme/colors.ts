// Tokens de color de la app. Son los del portal de Austral.
//
// Fuente (HW-Austral/Portal-Austral-Dev):
//   - src/@core/theme/palette/index.ts  (paleta "Austral UI Kit v2", modo claro y oscuro)
//   - src/app/(blank)/login-portal/page.tsx  (colores propios de la pantalla de ingreso)
//
// Los tokens marcados "derivado" no existen tal cual en el portal: son variantes con transparencia
// de colores del portal, necesarias para fondos de estado, superposición y sombras.
//
// Diferencias de la app mobile (docs/DECISION-UI-MOBILE.md):
//  - `textSecondary` y `textTertiary` son más oscuros que los del portal (en modo claro) y más claros (en modo oscuro):
//    los grises del portal se leían poco en un celular, sobre todo los textos chicos. Contraste cercano a 5:1 o más;
//  - en modo oscuro, fondo, tarjeta y borde están un poco más separados entre sí, y el borde de los campos es más
//    visible, para que se distingan las tarjetas y los campos;
//  - `info` e `infoLight` (avisos informativos) usan el cian de la marca también en modo claro, como en el oscuro: en
//    claro el aviso era una caja gris lavanda apagada. El cian del texto/ícono es un tono más profundo (#0B7A91)
//    para que se lea sobre fondo claro;
//  - los tokens `hero*` son de la tarjeta de saludo de Inicio y de la portada del perfil. En claro es el azul de la
//    marca con círculos cian; en oscuro es un verde azulado profundo con borde cian (un bloque cian pleno encandila
//    sobre fondo oscuro).
//
// Regla: ningún componente escribe colores a mano. Todo sale de useThemeColors().globalColors.

export const lightColors = {
  // Primario: azul Austral (palette.primary, customColors.azulPrimario / azulDark / azulLight)
  primary: '#2E3092',
  primaryLight: '#E8E9F6',
  primaryDark: '#1E2270',
  // palette.primary.light del portal (customColors.azulMid en claro, #9FE6F0 en oscuro). Lo usa la barra de vacaciones.
  primaryMid: '#B0B3E0',

  // Secundario: cian de acento (palette.secondary, customColors.cianAcento / cianLight)
  secondary: '#4FC3D7',
  secondaryLight: '#E0F6FA',
  secondaryDark: '#3AABBF',

  // Fondos (bodyBg, paperBg, tableHeaderBg)
  background: '#F7F8FC',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#E8E9F6',
  inputBackground: '#FFFFFF',
  inputDisabled: '#F7F8FC', // derivado: el portal solo atenúa el borde del campo deshabilitado

  // Texto (palette.text). Secundario y terciario: más oscuros que los del portal (ver arriba).
  text: '#1A1C4B',
  textSecondary: '#4E5075',
  textTertiary: '#6A6D92',
  textInverse: '#FFFFFF',

  // Bordes. `border` es el divisor del portal (palette.divider): borde de tarjetas, diálogos, tablas y líneas.
  // `inputBorder` es el borde de los campos (overrides/input.ts, notchedOutline): un poco más marcado.
  border: 'rgba(46, 48, 146, 0.15)',
  borderLight: 'rgba(46, 48, 146, 0.15)',
  hairline: 'rgba(46, 48, 146, 0.15)',
  inputBorder: 'rgba(46, 48, 146, 0.25)',

  // Estados (palette.success / warning / error / info). Las variantes "Light" son derivadas.
  success: '#43A047',
  successLight: 'rgba(67, 160, 71, 0.14)',
  warning: '#FFB400',
  warningLight: 'rgba(255, 180, 0, 0.14)',
  danger: '#FF4C51',
  dangerLight: 'rgba(255, 76, 81, 0.14)',
  dangerOn: '#FFFFFF',
  info: '#0B7A91',
  infoLight: 'rgba(79, 195, 215, 0.16)',

  overlay: 'rgba(26, 28, 75, 0.5)', // derivado
  shadow: 'rgba(46, 48, 146, 0.20)', // sombra de los botones (overrides/button.ts)

  // Acentos semánticos
  accentPrimary: '#2E3092',
  accentPrimaryMuted: 'rgba(46, 48, 146, 0.08)', // palette.action.selected
  accentPrimaryOn: '#FFFFFF',
  accentCta: '#4FC3D7',
  accentCtaMuted: 'rgba(79, 195, 215, 0.14)', // derivado
  accentCtaOn: '#1A1C4B',
  accentBeige: '#F5EDD8', // customColors.beigeAcento

  // Tarjeta de saludo de Inicio y portada del perfil (propios de la app)
  heroBackground: '#2E3092',
  heroBorder: 'transparent',
  heroText: '#FFFFFF',
  heroTextMuted: 'rgba(255, 255, 255, 0.85)',
  heroChip: 'rgba(255, 255, 255, 0.18)',
  heroChipAction: 'rgba(255, 255, 255, 0.28)',
  heroCircle: 'rgba(79, 195, 215, 0.24)',

  // Pantalla de ingreso (login-portal/page.tsx)
  authBackground: '#FFF3E9',
  authInk: '#000000',
  authButtonBg: '#2E3092',
  authButtonText: '#FFFFFF',
  authButtonPressed: '#CDDEF2',
};

export type ColorTokens = Record<keyof typeof lightColors, string>;

export const darkColors: ColorTokens = {
  primary: '#4FC3D7',
  primaryLight: 'rgba(79, 195, 215, 0.14)',
  primaryDark: '#3AABBF',
  primaryMid: '#9FE6F0',

  secondary: '#4FC3D7',
  secondaryLight: 'rgba(79, 195, 215, 0.12)',
  secondaryDark: '#3AABBF',

  background: '#0D0F13',
  card: '#161920',
  surface: '#161920',
  surfaceElevated: '#1D2029',
  surfaceSecondary: '#1D2029',
  inputBackground: '#161920',
  inputDisabled: '#1D2029',

  text: '#F0F2FF',
  textSecondary: '#A9B0CE',
  textTertiary: '#8089AB',
  textInverse: '#0E1014',

  border: 'rgba(255, 255, 255, 0.10)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  hairline: 'rgba(255, 255, 255, 0.10)',
  inputBorder: 'rgba(79, 195, 215, 0.28)',

  success: '#66BB6A',
  successLight: 'rgba(102, 187, 106, 0.18)',
  warning: '#FFA726',
  warningLight: 'rgba(255, 167, 38, 0.18)',
  danger: '#FF6B6B',
  dangerLight: 'rgba(255, 107, 107, 0.18)',
  dangerOn: '#F0F2FF',
  info: '#4FC3D7',
  infoLight: 'rgba(79, 195, 215, 0.12)',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.30)',

  accentPrimary: '#4FC3D7',
  accentPrimaryMuted: 'rgba(79, 195, 215, 0.12)',
  accentPrimaryOn: '#0A2A30',
  accentCta: '#4FC3D7',
  accentCtaMuted: 'rgba(79, 195, 215, 0.16)',
  accentCtaOn: '#0E1014',
  accentBeige: '#F5EDD8',

  heroBackground: '#182D33',
  heroBorder: 'rgba(79, 195, 215, 0.30)',
  heroText: '#F0F2FF',
  heroTextMuted: '#A9B0CE',
  heroChip: 'rgba(255, 255, 255, 0.08)',
  heroChipAction: 'rgba(79, 195, 215, 0.24)',
  heroCircle: 'rgba(79, 195, 215, 0.10)',

  authBackground: '#2E3092',
  authInk: '#FFFFFF',
  authButtonBg: '#FFFFFF',
  authButtonText: '#2E3092',
  authButtonPressed: '#D9DEE4',
};
