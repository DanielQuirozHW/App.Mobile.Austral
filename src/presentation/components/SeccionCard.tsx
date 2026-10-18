import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../utils/responsive';
import { AppText } from './AppText';

interface SeccionCardProps {
  numero?: number;
  titulo: string;
  descripcion?: string;
  /** Resalta la tarjeta (por ejemplo cuando falta cargar al cónyuge). */
  resaltada?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Tarjeta de una sección del legajo: número, título, descripción y campos. */
export const SeccionCard: React.FC<SeccionCardProps> = ({
  numero,
  titulo,
  descripcion,
  resaltada = false,
  style,
  children,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors, resaltada), [globalColors, resaltada]);

  return (
    <View style={[styles.card, style]}>
      <View style={styles.encabezado}>
        {numero !== undefined ? (
          <View style={styles.numero}>
            <AppText variant="subtitle2" tone="inverse">
              {numero}
            </AppText>
          </View>
        ) : null}
        <View style={styles.titulos}>
          <AppText variant="h6">{titulo}</AppText>
          {descripcion ? (
            <AppText variant="caption" tone="secondary">
              {descripcion}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.cuerpo}>{children}</View>
    </View>
  );
};

const createStyles = (c: ColorTokens, resaltada: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: resaltada ? 2 : 1,
      borderColor: resaltada ? c.danger : c.border,
      padding: spacing.lg,
      gap: spacing.lg,
      ...platformSpecific.shadow(2),
    },
    encabezado: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    numero: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.round,
      backgroundColor: c.accentPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulos: { flex: 1, gap: spacing.xxs },
    cuerpo: { gap: spacing.md },
  });
