import { Dimensions, PixelRatio, Platform, ViewStyle } from 'react-native';

// Referencia de diseño: iPhone X/11 Pro en iOS (375) y Pixel/Samsung en Android (360).
const DESIGN_WIDTH = Platform.OS === 'ios' ? 375 : 360;

// Se calcula UNA sola vez al iniciar. La app es vertical: la orientación se bloquea en los
// proyectos nativos (ver docs/SETUP-NATIVO.md). Si se permitiera rotar, estos valores quedarían viejos.
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const factor = SCREEN_WIDTH / DESIGN_WIDTH;

/** Escala proporcional al ancho. Para dimensiones fijas (tamaños, paddings, radios). */
export const scale = (size: number): number => Math.round(size * factor);

/** Escala de fuente acotada: entre 85 % y 108 % del tamaño base, para evitar textos desproporcionados. */
export const scaleFont = (size: number): number => {
  const acotado = Math.min(Math.max(size * factor, size * 0.85), size * 1.08);
  return Math.round(PixelRatio.roundToNearestPixel(acotado));
};

export const spacing = {
  xxs: scale(2),
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
};

export const borderRadius = {
  xs: scale(6),
  sm: scale(8),
  md: scale(12),
  input: scale(14),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(30),
  round: scale(999),
};

export const iconSizes = {
  xs: scale(12),
  sm: scale(16),
  md: scale(20),
  lg: scale(24),
  xl: scale(28),
  xxl: scale(32),
  xxxl: scale(40),
};

/** Tamaños de fuente por plataforma (iOS usa un punto más en cada escalón). */
export const platformFontSizes = {
  xs: Platform.OS === 'ios' ? scaleFont(11) : scaleFont(10),
  sm: Platform.OS === 'ios' ? scaleFont(13) : scaleFont(12),
  md: Platform.OS === 'ios' ? scaleFont(15) : scaleFont(14),
  lg: Platform.OS === 'ios' ? scaleFont(17) : scaleFont(16),
  xl: Platform.OS === 'ios' ? scaleFont(19) : scaleFont(18),
  xxl: Platform.OS === 'ios' ? scaleFont(22) : scaleFont(20),
  xxxl: Platform.OS === 'ios' ? scaleFont(26) : scaleFont(24),
  huge: Platform.OS === 'ios' ? scaleFont(30) : scaleFont(28),
  massive: Platform.OS === 'ios' ? scaleFont(34) : scaleFont(32),
};

/** Control del escalado de fuente del sistema (Dynamic Type / tamaño de fuente de Android). */
export const fontScaling = {
  /** Headers, badges, tabs: nunca crecen. */
  none: { allowFontScaling: false as const, maxFontSizeMultiplier: 1 },
  /** Subtítulos y botones secundarios: crecen poco. */
  limited: { allowFontScaling: true as const, maxFontSizeMultiplier: 1.2 },
  /** Contenido informativo: crece con tope. */
  full: { allowFontScaling: true as const, maxFontSizeMultiplier: 1.5 },
};

export const platformSpecific = {
  /** Alto mínimo de un elemento táctil: 44 pt en iOS, 48 dp en Android. */
  minTouchTarget: Platform.OS === 'ios' ? scale(44) : scale(48),

  /**
   * Sombra por plataforma. En Android usa elevation: no combinar con overflow: 'hidden' en el mismo View
   * (separar un contenedor de sombra de otro interno que recorta).
   */
  shadow: (elevation: number = 4): ViewStyle =>
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: elevation * 0.03,
        shadowRadius: elevation * 1.5,
      },
      android: { elevation },
      default: {},
    }),

  cardRadius: Platform.OS === 'ios' ? borderRadius.xl : borderRadius.lg,
  buttonRadius: Platform.OS === 'ios' ? borderRadius.xxl : borderRadius.lg,
};
