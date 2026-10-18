import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { TypographyToken, textDefaults, textDefaultsLocked } from '../theme/typography';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning';

interface AppTextProps extends TextProps {
  /** Token de la escala tipográfica del portal (h1…h6, body1, body2, button, label, caption, overline, helper). Por defecto body1. */
  variant?: TypographyToken;
  /** Color semántico, tomado del tema. */
  tone?: TextTone;
  /** true: el texto no escala con el tamaño de fuente del sistema. */
  locked?: boolean;
}

/**
 * Único componente de texto de la app. Usa la escala tipográfica y los colores del tema.
 * includeFontPadding va como estilo (es un estilo de Text en Android, no una prop).
 */
export const AppText: React.FC<AppTextProps> = ({
  variant = 'body1',
  tone = 'default',
  locked = false,
  style,
  ...rest
}) => {
  const { globalColors, typography } = useThemeColors();

  const colorPorTono: Record<TextTone, string> = {
    default: globalColors.text,
    secondary: globalColors.textSecondary,
    tertiary: globalColors.textTertiary,
    inverse: globalColors.textInverse,
    primary: globalColors.accentPrimary,
    danger: globalColors.danger,
    success: globalColors.success,
    warning: globalColors.warning,
  };

  return (
    <Text
      {...(locked ? textDefaultsLocked : textDefaults)}
      {...rest}
      style={[typography[variant], styles.base, { color: colorPorTono[tone] }, style]}
    />
  );
};

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
