// Tokens de color de la app. Son los del portal de Austral.
//
// Fuente (HW-Austral/Portal-Austral-Dev):
//   - src/@core/theme/palette/index.ts  (paleta "Austral UI Kit v2", modo claro y oscuro)
//   - src/app/(blank)/login-portal/page.tsx  (colores propios de la pantalla de ingreso)
//
// Los tokens marcados "derivado" no existen tal cual en el portal: son variantes con transparencia
// de colores del portal, necesarias para fondos de estado, superposición y sombras.
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

  // Texto (palette.text)
  text: '#1A1C4B',
  textSecondary: '#5A5C80',
  textTertiary: '#9496B8',
  textInverse: '#FFFFFF',

  // Bordes: borde de campo (overrides/input.ts) y divisor (palette.divider)
  border: 'rgba(46, 48, 146, 0.25)',
  borderLight: 'rgba(46, 48, 146, 0.15)',
  hairline: 'rgba(46, 48, 146, 0.15)',

  // Estados (palette.success / warning / error / info). Las variantes "Light" son derivadas.
  success: '#43A047',
  successLight: 'rgba(67, 160, 71, 0.14)',
  warning: '#FFB400',
  warningLight: 'rgba(255, 180, 0, 0.14)',
  danger: '#FF4C51',
  dangerLight: 'rgba(255, 76, 81, 0.14)',
  dangerOn: '#FFFFFF',
  info: '#2E3092',
  infoLight: 'rgba(46, 48, 146, 0.08)',

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

  background: '#0E1014',
  card: '#15171D',
  surface: '#15171D',
  surfaceElevated: '#1C1F27',
  surfaceSecondary: '#1C1F27',
  inputBackground: '#15171D',
  inputDisabled: '#1C1F27',

  text: '#F0F2FF',
  textSecondary: '#9BA3C2',
  textTertiary: '#5A6080',
  textInverse: '#0E1014',

  border: 'rgba(79, 195, 215, 0.12)',
  borderLight: 'rgba(255, 255, 255, 0.08)',
  hairline: 'rgba(255, 255, 255, 0.08)',

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

  authBackground: '#2E3092',
  authInk: '#FFFFFF',
  authButtonBg: '#FFFFFF',
  authButtonText: '#2E3092',
  authButtonPressed: '#D9DEE4',
};
