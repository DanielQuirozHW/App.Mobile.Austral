import { scaleFont } from '../utils/responsive';

// Escala tipográfica. Poppins para títulos y valores destacados; opensans-regular para el resto.
// Los nombres de archivo de las fuentes tienen que resolver estas dos familias en cada plataforma
// (ver docs/SETUP-NATIVO.md).
const DISPLAY_FAMILY = 'Poppins';
const BODY_FAMILY = 'opensans-regular';

type Weight = '400' | '500' | '600' | '700';

export interface TextToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: Weight;
  lineHeight: number;
  letterSpacing?: number;
}

const make = (
  family: string,
  size: number,
  weight: Weight,
  lineHeightFactor: number,
  letterSpacing?: number,
): TextToken => ({
  fontFamily: family,
  fontSize: scaleFont(size),
  fontWeight: weight,
  lineHeight: Math.round(scaleFont(size) * lineHeightFactor),
  ...(letterSpacing !== undefined ? { letterSpacing } : {}),
});

export const typography = {
  displayLg: make(DISPLAY_FAMILY, 40, '700', 1.2, -0.5),
  displayMd: make(DISPLAY_FAMILY, 32, '700', 1.2, -0.4), // títulos de pantalla
  titleLg: make(DISPLAY_FAMILY, 22, '600', 1.3, -0.2), // títulos de sección
  titleMd: make(DISPLAY_FAMILY, 17, '600', 1.3), // títulos de tarjeta
  bodyLg: make(BODY_FAMILY, 17, '400', 1.45), // cuerpo primario
  bodyMd: make(BODY_FAMILY, 15, '400', 1.45), // cuerpo secundario
  labelMd: make(BODY_FAMILY, 13, '500', 1.35, 0.2), // etiquetas
  caption: make(BODY_FAMILY, 11, '500', 1.35, 0.3), // metadatos
  button: make(DISPLAY_FAMILY, 15, '600', 1.2, 0.2), // texto de botones
} as const;

export type TypographyToken = keyof typeof typography;

/** Texto que respeta el tamaño de fuente del sistema hasta 130 %. */
export const textDefaults = {
  allowFontScaling: true as const,
  maxFontSizeMultiplier: 1.3,
};

/** Texto que nunca escala (tabs, badges chicos). */
export const textDefaultsLocked = {
  allowFontScaling: false as const,
  maxFontSizeMultiplier: 1,
};
