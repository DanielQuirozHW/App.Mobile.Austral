import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { iconSizes, platformSpecific, spacing } from '../utils/responsive';
import { AppIcon, type AppIconName } from './AppIcon';

interface AccionIconoProps {
  icono: AppIconName;
  /** Texto para lectores de pantalla (por ejemplo "Ver", "Editar", "Eliminar"). */
  etiqueta: string;
  onPress: () => void;
  peligro?: boolean;
  disabled?: boolean;
}

/** Botón de ícono para las acciones de una fila. */
export const AccionIcono: React.FC<AccionIconoProps> = ({ icono, etiqueta, onPress, peligro = false, disabled = false }) => {
  const { globalColors } = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled }}
      hitSlop={spacing.xs}
      android_ripple={{ color: globalColors.hairline, borderless: true }}
      style={[styles.boton, disabled && styles.deshabilitado]}
    >
      <AppIcon name={icono} size={iconSizes.lg} color={peligro ? globalColors.danger : globalColors.accentPrimary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  boton: {
    minWidth: platformSpecific.minTouchTarget,
    minHeight: platformSpecific.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deshabilitado: { opacity: 0.4 },
});
