import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { coloresDeInsignia } from '../../theme/estadoColores';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface EstadoChipProps {
  /** Texto del estado tal como lo escribe el portal. Define el color (StatusBadge del portal). */
  texto: string;
  /** No interviene en el color: el portal elige la paleta por la etiqueta, no por el código. */
  estado?: number | null;
}

/** Insignia de estado (StatusBadge del portal). */
export const EstadoChip: React.FC<EstadoChipProps> = ({ texto }) => {
  const { isDark } = useThemeColors();
  const colores = useMemo(() => coloresDeInsignia(texto, isDark), [texto, isDark]);
  if (!texto) return null;
  return (
    <View style={[styles.caja, { backgroundColor: colores.fondo }]}>
      <AppText variant="caption" numberOfLines={1} style={[styles.texto, { color: colores.color }]}>
        {texto}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  caja: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  texto: { fontWeight: '600' },
});
