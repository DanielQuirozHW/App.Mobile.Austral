import { scaleFont } from '../utils/responsive';

// Escala tipográfica del portal de Austral.
// Fuente (HW-Austral/Portal-Austral-Dev): src/@core/theme/typography/index.ts (escala "normal")
// y src/styles/fonts.ts (Montserrat, pesos 400/500/600/700).
//
// En React Native el peso se elige con el nombre de la fuente (una familia por peso), no con
// fontWeight. Los archivos de fuente tienen que llamarse y estar registrados con estos nombres
// (ver docs/SETUP-NATIVO.md).
export const fontFamilies = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semibold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
} as const;

export interface TextToken {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
}

const make = (
  family: string,
  size: number,
  lineHeightFactor: number,
  letterSpacing?: number,
  uppercase?: boolean,
): TextToken => ({
  fontFamily: family,
  fontSize: scaleFont(size),
  lineHeight: Math.round(scaleFont(size) * lineHeightFactor),
  ...(letterSpacing !== undefined ? { letterSpacing } : {}),
  ...(uppercase ? { textTransform: 'uppercase' as const } : {}),
});

// Tamaños en px de la escala "normal" del portal (rem × 16). El interletrado en em del portal
// se pasó a px (em × tamaño).
export const typography = {
  h1: make(fontFamilies.bold, 28, 1.2),
  h2: make(fontFamilies.semibold, 22, 1.25),
  h3: make(fontFamilies.semibold, 17, 1.3),
  h4: make(fontFamilies.semibold, 16, 1.3, 0.15),
  h5: make(fontFamilies.medium, 15, 1.3, 0),
  h6: make(fontFamilies.medium, 14, 1.3, 0.15),
  subtitle1: make(fontFamilies.semibold, 14, 1.5, 0.15),
  subtitle2: make(fontFamilies.medium, 12, 1.5, 0.1),
  body1: make(fontFamilies.regular, 14, 1.5, 0.15),
  body2: make(fontFamilies.regular, 12, 1.5, 0.15),
  button: make(fontFamilies.bold, 13, 1.2, 0.52, true), // mayúsculas, 0.04em
  label: make(fontFamilies.semibold, 11, 1.35, 0.44), // etiqueta de campo (MuiInputLabel)
  caption: make(fontFamilies.medium, 11, 1.35, 0.88), // 0.08em
  overline: make(fontFamilies.semibold, 11, 1.35, 1.54, true), // 0.14em
  helper: make(fontFamilies.regular, 11, 1.35), // texto de ayuda y error de campo (MuiFormHelperText)
} as const;

export type TypographyToken = keyof typeof typography;

/** Texto que respeta el tamaño de fuente del sistema hasta 130 %. */
export const textDefaults = {
  allowFontScaling: true as const,
  maxFontSizeMultiplier: 1.3,
};

/** Texto que nunca escala (botones, tabs, badges chicos). */
export const textDefaultsLocked = {
  allowFontScaling: false as const,
  maxFontSizeMultiplier: 1,
};
