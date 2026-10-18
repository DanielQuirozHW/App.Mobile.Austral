import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { ColorTokens } from '../theme/colors';
import { iconSizes, platformSpecific, spacing } from '../utils/responsive';
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
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const colorDeTexto = (variant: ButtonVariant, disabled: boolean, c: ColorTokens): string => {
  if (disabled) return c.textTertiary;
  if (variant === 'primary') return c.accentPrimaryOn;
  if (variant === 'danger') return c.dangerOn;
  return c.accentPrimary;
};

const createStyles = (c: ColorTokens, variant: ButtonVariant, disabled: boolean) => {
  const fondo = disabled
    ? c.inputDisabled
    : variant === 'primary'
      ? c.accentPrimary
      : variant === 'danger'
        ? c.danger
        : 'transparent';
  const borde = disabled ? c.border : variant === 'secondary' ? c.accentPrimary : 'transparent';

  return StyleSheet.create({
    button: {
      minHeight: platformSpecific.minTouchTarget,
      borderRadius: platformSpecific.buttonRadius,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: fondo,
      borderWidth: 1,
      borderColor: borde,
    },
    pressed: { opacity: 0.85 },
  });
};

export const AppButton = React.memo(function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const { globalColors } = useThemeColors();
  const inactivo = disabled || loading;
  const styles = useMemo(
    () => createStyles(globalColors, variant, inactivo),
    [globalColors, variant, inactivo],
  );
  const color = colorDeTexto(variant, inactivo, globalColors);

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
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {icon ? <AppIcon name={icon} size={iconSizes.md} color={color} /> : null}
          <AppText variant="button" locked style={{ color }}>
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
});
