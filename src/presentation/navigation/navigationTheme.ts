import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import type { ColorTokens } from '../theme/colors';

/**
 * Tema de react-navigation armado con los colores del portal. Se parte del tema por defecto para conservar `fonts`.
 */
export const crearTemaDeNavegacion = (c: ColorTokens, isDark: boolean): Theme => {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: c.accentPrimary,
      background: c.background,
      card: c.card,
      text: c.text,
      border: c.hairline,
      notification: c.danger,
    },
  };
};
