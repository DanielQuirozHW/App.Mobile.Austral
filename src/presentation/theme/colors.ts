// Tokens de color de la app.
//
// Los NOMBRES de los tokens siguen los del prototipo de referencia para que las reglas de UI
// (docs/contexto/prototipo-estructura.md) se apliquen igual. Los VALORES son los del prototipo
// y son provisorios: pertenecen a la marca de ese prototipo, no a la de Austral.
// Pendiente de Daniel: definir la paleta de la app (ver docs/PENDIENTES.md).
//
// Regla: ningún componente escribe colores a mano. Todo sale de useThemeColors().globalColors.

export const lightColors = {
  primary: '#2B70B8',
  primaryLight: 'rgba(43, 112, 184, 0.12)',
  primaryDark: '#1C5391',

  secondary: '#2E8E9D',
  secondaryLight: 'rgba(46, 142, 157, 0.14)',
  secondaryDark: '#1D6C78',

  background: '#F5F5F8',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F1EEF7',
  inputBackground: '#F8F7FB',
  inputDisabled: '#EAE7F0',

  text: '#14101F',
  textSecondary: '#5C5868',
  textTertiary: '#8F889B',
  textInverse: '#F2EEF8',

  border: '#DFD9E8',
  borderLight: '#F2EFF7',
  hairline: 'rgba(20, 16, 32, 0.08)',

  success: '#2E9D6E',
  successLight: 'rgba(46, 157, 110, 0.14)',
  warning: '#D48B12',
  warningLight: 'rgba(212, 139, 18, 0.14)',
  danger: '#D14A54',
  dangerLight: 'rgba(209, 74, 84, 0.14)',
  dangerOn: '#FFFFFF',
  info: '#5A6FD4',
  infoLight: 'rgba(90, 111, 212, 0.14)',

  overlay: 'rgba(20, 16, 31, 0.5)',
  shadow: 'rgba(20, 16, 31, 0.08)',

  accentPrimary: '#2B70B8',
  accentPrimaryMuted: 'rgba(43, 112, 184, 0.12)',
  accentPrimaryOn: '#FFFFFF',
  accentCta: '#E06D10',
  accentCtaMuted: 'rgba(224, 109, 16, 0.12)',
  accentCtaOn: '#FFFFFF',
};

export type ColorTokens = Record<keyof typeof lightColors, string>;

export const darkColors: ColorTokens = {
  primary: '#7BB3E8',
  primaryLight: 'rgba(123, 179, 232, 0.18)',
  primaryDark: '#4A8EC4',

  secondary: '#5BC7D5',
  secondaryLight: 'rgba(91, 199, 213, 0.18)',
  secondaryDark: '#2E8E9D',

  background: '#0E0B16',
  card: '#1E182C',
  surface: '#1E182C',
  surfaceElevated: '#282236',
  surfaceSecondary: '#332B44',
  inputBackground: '#201A30',
  inputDisabled: '#191421',

  text: '#F2EEF8',
  textSecondary: '#B0A8C0',
  textTertiary: '#7A7388',
  textInverse: '#14101F',

  border: '#3B3548',
  borderLight: '#2B2634',
  hairline: 'rgba(255, 255, 255, 0.08)',

  success: '#4FBC8F',
  successLight: 'rgba(79, 188, 143, 0.22)',
  warning: '#E5A53C',
  warningLight: 'rgba(229, 165, 60, 0.22)',
  danger: '#E37480',
  dangerLight: 'rgba(227, 116, 128, 0.22)',
  dangerOn: '#14101F',
  info: '#8897E0',
  infoLight: 'rgba(136, 151, 224, 0.22)',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.5)',

  accentPrimary: '#7BB3E8',
  accentPrimaryMuted: 'rgba(123, 179, 232, 0.16)',
  accentPrimaryOn: '#0B1A26',
  accentCta: '#F58A3B',
  accentCtaMuted: 'rgba(245, 138, 59, 0.18)',
  accentCtaOn: '#14101F',
};
