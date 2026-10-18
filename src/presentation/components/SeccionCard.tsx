import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../utils/responsive';
import { AppText } from './AppText';

interface SeccionCardProps {
  numero: number;
  titulo: string;
  descripcion?: string;
  /** Elemento a la derecha del encabezado (por ejemplo un ícono de ayuda). */
  accionEncabezado?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Tarjeta de una sección del legajo (SeccionCard de datos-personales/page.tsx): número de dos dígitos, título y campos. */
export const SeccionCard: React.FC<SeccionCardProps> = ({
  numero,
  titulo,
  descripcion,
  accionEncabezado,
  style,
  children,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.encabezado}>
        <View style={styles.numero}>
          <AppText variant="subtitle2" tone="primary">
            {String(numero).padStart(2, '0')}
          </AppText>
        </View>
        <View style={styles.titulos}>
          <AppText variant="h6">{titulo}</AppText>
          {descripcion ? (
            <AppText variant="caption" tone="secondary">
              {descripcion}
            </AppText>
          ) : null}
        </View>
        {accionEncabezado}
      </View>
      <View style={styles.cuerpo}>{children}</View>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
      ...platformSpecific.shadow(2),
    },
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    numero: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.round,
      backgroundColor: c.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulos: { flex: 1, gap: spacing.xxs },
    cuerpo: { padding: spacing.lg, gap: spacing.md },
  });
