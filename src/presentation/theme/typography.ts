import { scaleFont } from '../utils/responsive';

// Escala tipográfica de la app mobile.
//
// Decisión de diseño (docs/DECISION-UI-MOBILE.md): la app usa la tipografía del sistema (Roboto en Android,
// San Francisco en iOS) y una escala pensada para el celular: texto de lectura de 16, títulos más grandes, sin
// mayúsculas forzadas. Ya no se usa Montserrat, así que no hace falta registrar fuentes en los proyectos nativos.
// Ajuste fino: los títulos grandes llevan un espaciado de letras levemente negativo (en negrita y a tamaño grande, la
// tipografía del sistema se ve suelta) y los textos chicos (13) en lugar de 12, para que se lean sin esfuerzo.
//
// `fontFamilies` se conserva por compatibilidad con código que todavía lo importe: todas apuntan al sistema.
export const fontFamilies = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

type Peso = '400' | '500' | '600' | '700';

export interface TextToken {
  fontFamily?: string;
  fontWeight: Peso;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
}

const make = (
  peso: Peso,
  size: number,
  lineHeightFactor: number,
  letterSpacing?: number,
  uppercase?: boolean,
): TextToken => ({
  fontWeight: peso,
  fontSize: scaleFont(size),
  lineHeight: Math.round(scaleFont(size) * lineHeightFactor),
  ...(letterSpacing !== undefined ? { letterSpacing } : {}),
  ...(uppercase ? { textTransform: 'uppercase' as const } : {}),
});

export const typography = {
  h1: make('700', 28, 1.2, -0.4),
  h2: make('700', 24, 1.25, -0.3),
  h3: make('600', 20, 1.3, -0.2),
  h4: make('600', 18, 1.3, -0.1),
  h5: make('600', 16, 1.3),
  h6: make('600', 16, 1.3),
  subtitle1: make('600', 16, 1.4),
  subtitle2: make('600', 14, 1.4),
  body1: make('400', 16, 1.45),
  body2: make('400', 14, 1.45),
  button: make('600', 16, 1.2, 0.2),
  label: make('600', 13, 1.3, 0.1), // etiqueta de campo
  caption: make('500', 13, 1.35, 0.1),
  overline: make('600', 12, 1.3, 0.3), // rótulo de grupo (ya sin mayúsculas forzadas)
  helper: make('400', 13, 1.35), // texto de ayuda y error de campo
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
