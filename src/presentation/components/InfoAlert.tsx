import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, spacing } from '../utils/responsive';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

interface InfoAlertProps {
  tipo?: 'info' | 'advertencia' | 'error';
  children: React.ReactNode;
}

/**
 * Aviso en línea (Alert estándar de MUI del portal, overrides/alerts.ts): fondo con el color del estado en
 * transparencia, barra de 3 px a la izquierda, ícono del color del estado y texto del color de texto del tema.
 */
export const InfoAlert: React.FC<InfoAlertProps> = ({ tipo = 'info', children }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(), []);
  const color = tipo === 'error' ? globalColors.danger : tipo === 'advertencia' ? globalColors.warning : globalColors.info;
  const icono = tipo === 'info' ? 'information-circle' : 'warning';
  const fondo =
    tipo === 'error' ? globalColors.dangerLight : tipo === 'advertencia' ? globalColors.warningLight : globalColors.infoLight;

  return (
    <View accessibilityRole="alert" style={[styles.caja, { backgroundColor: fondo, borderLeftColor: color }]}>
      <AppIcon name={icono} size={iconSizes.lg} color={color} />
      <View style={styles.texto}>
        {typeof children === 'string' ? <AppText variant="body2">{children}</AppText> : children}
      </View>
    </View>
  );
};

const createStyles = () =>
  StyleSheet.create({
    caja: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderLeftWidth: 3,
      borderRadius: borderRadius.md,
    },
    texto: { flex: 1, gap: spacing.xs },
  });
