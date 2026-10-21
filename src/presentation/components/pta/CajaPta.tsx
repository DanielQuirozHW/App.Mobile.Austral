// Caja con título de las pestañas del Plan de Trabajo (cada punto numerado del portal: "1. Clases", "5. Total horas...").
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface Props {
  titulo: string;
  children: React.ReactNode;
}

export const CajaPta: React.FC<Props> = ({ titulo, children }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  return (
    <View style={styles.card}>
      <View style={styles.encabezado}>
        <AppText variant="h6">{titulo}</AppText>
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
      ...platformSpecific.shadow(2),
    },
    encabezado: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    cuerpo: { padding: spacing.lg, gap: spacing.md },
  });
