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
  const fondo =
    tipo === 'info'
      ? globalColors.infoLight
      : tipo === 'exito'
        ? globalColors.successLight
        : tipo === 'advertencia'
          ? globalColors.warningLight
          : globalColors.surface;
  const tono = tipo === 'exito' ? 'success' : tipo === 'advertencia' ? 'warning' : tipo === 'info' ? 'primary' : 'secondary';

  return (
    <View style={[styles.caja, { backgroundColor: fondo }]}>
      <AppText variant="overline" tone={tono}>
        {texto}
      </AppText>
    </View>
  );
};

const createStyles = (_c: ColorTokens) =>
  StyleSheet.create({
    caja: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: borderRadius.xs,
    },
  });
