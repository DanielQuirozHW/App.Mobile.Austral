// Cajas "Totales registrados" (horas y días) de cada pestaña de actividad.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

export interface TotalPta {
  etiqueta: string;
  valor: string;
}

interface Props {
  totales: TotalPta[];
  titulo?: string;
}

export const TotalesPta: React.FC<Props> = ({ totales, titulo = 'Totales registrados' }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  return (
    <View style={styles.contenedor}>
      <AppText variant="subtitle2">{titulo}</AppText>
      <View style={styles.fila}>
        {totales.map((t) => (
          <View key={t.etiqueta} style={styles.caja}>
            <AppText variant="caption" tone="secondary">
              {t.etiqueta}
            </AppText>
            <AppText variant="h6" tone="primary">
              {t.valor || '—'}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenedor: { gap: spacing.sm },
    fila: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    caja: {
      flexGrow: 1,
      minWidth: '40%',
      gap: spacing.xxs,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: c.surfaceSecondary,
      borderWidth: 1,
      borderColor: c.border,
    },
  });
