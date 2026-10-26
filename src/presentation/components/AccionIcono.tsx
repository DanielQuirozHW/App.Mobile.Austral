import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, platformSpecific, spacing } from '../utils/responsive';
import { AppIcon, type AppIconName } from './AppIcon';

interface AccionIconoProps {
  icono: AppIconName;
  /** Texto para lectores de pantalla (por ejemplo "Ver", "Editar", "Eliminar"). */
  etiqueta: string;
  onPress: () => void;
  peligro?: boolean;
  disabled?: boolean;
}

/** Botón de ícono para las acciones de una fila: fondo suave del color de la acción (primario o peligro). */
export const AccionIcono: React.FC<AccionIconoProps> = ({ icono, etiqueta, onPress, peligro = false, disabled = false }) => {
  const { globalColors } = useThemeColors();
  const color = peligro ? globalColors.danger : globalColors.accentPrimary;
  const fondo = peligro ? globalColors.dangerLight : globalColors.accentPrimaryMuted;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled }}
      hitSlop={spacing.xs}
      android_ripple={{ color: globalColors.hairline, borderless: true }}
      style={({ pressed }) => [styles.boton, { backgroundColor: fondo }, pressed && styles.presionado, disabled && styles.deshabilitado]}
    >
      <AppIcon name={icono} size={iconSizes.lg} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  boton: {
    minWidth: platformSpecific.minTouchTarget,
    minHeight: platformSpecific.minTouchTarget,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: { opacity: 0.7 },
  deshabilitado: { opacity: 0.4 },
});
