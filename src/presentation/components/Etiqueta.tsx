import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { borderRadius, spacing } from '../utils/responsive';
import { AppText } from './AppText';

interface EtiquetaProps {
  texto: string;
  tipo?: 'neutro' | 'info' | 'exito' | 'advertencia';
}

/** Insignia chica (Chip del portal: "A CARGO", "Documento requerido"). */
export const Etiqueta: React.FC<EtiquetaProps> = ({ texto, tipo = 'neutro' }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  // El neutro usa surfaceSecondary: con surface (igual al fondo de la tarjeta) la insignia no se veía en ningún modo.
  const fondo =
    tipo === 'info'
      ? globalColors.infoLight
      : tipo === 'exito'
        ? globalColors.successLight
        : tipo === 'advertencia'
          ? globalColors.warningLight
          : globalColors.surfaceSecondary;
  const tono = tipo === 'exito' ? 'success' : tipo === 'advertencia' ? 'warning' : tipo === 'info' ? 'primary' : 'secondary';

  return (
    <View style={[styles.caja, { backgroundColor: fondo }]}>
      <AppText variant="overline" tone={tono}>
        {texto}
      </AppText>
    </View>
  );
};

// Chip del portal (overrides/chip.ts): radio 6.
const createStyles = (_c: ColorTokens) =>
  StyleSheet.create({
    caja: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: borderRadius.sm,
    },
  });
