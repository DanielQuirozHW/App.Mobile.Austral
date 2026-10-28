import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { ColorTokens } from '../theme/colors';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../utils/responsive';
import { AppIcon, AppIconName } from './AppIcon';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: AppIconName;
  /** true: el ícono va después del texto. */
  iconAlFinal?: boolean;
  /** true: botón grande (alto 56), para la acción principal de una pantalla. */
  grande?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const colorDeTexto = (variant: ButtonVariant, disabled: boolean, c: ColorTokens): string => {
  if (disabled) return c.textTertiary;
  if (variant === 'primary') return c.accentPrimaryOn;
  if (variant === 'danger') return c.dangerOn;
  return c.accentPrimary;
};

// Botones de la app mobile: alto cómodo para el pulgar (52, o 56 el grande), esquinas redondeadas y texto sin
// mayúsculas. primary = relleno, secondary = con borde del color primario.
const createStyles = (c: ColorTokens, variant: ButtonVariant, disabled: boolean, grande: boolean) => {
  const fondo = disabled
    ? c.inputDisabled
    : variant === 'primary'
      ? c.accentPrimary
      : variant === 'danger'
        ? c.danger
        : 'transparent';
  const borde = disabled ? c.border : variant === 'secondary' ? c.accentPrimary : 'transparent';
  const conSombra = !disabled && variant !== 'secondary';

  return StyleSheet.create({
    button: {
      minHeight: Math.max(platformSpecific.minTouchTarget, scale(grande ? 56 : 52)),
      borderRadius: grande ? borderRadius.xl : borderRadius.button,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: fondo,
      borderWidth: 1.5,
      borderColor: borde,
      ...(conSombra ? platformSpecific.shadow(2) : {}),
    },
    pressed: {
      opacity: 0.88,
      transform: [{ scale: 0.98 }],
      backgroundColor: variant === 'secondary' ? c.primaryLight : fondo,
    },
  });
};

export const AppButton = React.memo(function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconAlFinal = false,
  grande = false,
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const { globalColors } = useThemeColors();
  const inactivo = disabled || loading;
  const styles = useMemo(
    () => createStyles(globalColors, variant, inactivo, grande),
    [globalColors, variant, inactivo, grande],
  );
  const color = colorDeTexto(variant, inactivo, globalColors);

  // Con `loading` se cambia el ícono final por un spinner y se mantiene el texto ("Ingresando...").
  const iconoInicio = icon && !iconAlFinal ? <AppIcon name={icon} size={iconSizes.md} color={color} /> : null;
  const iconoFinal = loading ? (
    <ActivityIndicator color={color} size="small" />
  ) : icon && iconAlFinal ? (
    <AppIcon name={icon} size={iconSizes.md} color={color} />
  ) : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      android_ripple={{ color: globalColors.hairline }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactivo, busy: loading }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      {iconoInicio}
      <AppText variant="button" locked style={{ color }}>
        {title}
      </AppText>
      {iconoFinal}
    </Pressable>
  );
});
