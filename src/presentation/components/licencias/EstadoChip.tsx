import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { tonoDeEstado, type TonoEstado } from '../../../domain/licencias/estados';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface EstadoChipProps {
  /** statuscode de la solicitud: define el color. */
  estado: number | null | undefined;
  /** Texto del estado tal como lo escribe el portal. */
  texto: string;
}

const coloresDeTono = (tono: TonoEstado, c: ColorTokens): { fondo: string; texto: string } => {
  switch (tono) {
    case 'exito':
      return { fondo: c.successLight, texto: c.success };
    case 'info':
      return { fondo: c.infoLight, texto: c.info };
    case 'advertencia':
      return { fondo: c.warningLight, texto: c.warning };
    case 'peligro':
      return { fondo: c.dangerLight, texto: c.danger };
    default:
      return { fondo: c.surfaceSecondary, texto: c.textSecondary };
  }
};

/** Insignia de estado (StatusBadge del portal). */
export const EstadoChip: React.FC<EstadoChipProps> = ({ estado, texto }) => {
  const { globalColors } = useThemeColors();
  const colores = useMemo(() => coloresDeTono(tonoDeEstado(estado), globalColors), [estado, globalColors]);
  if (!texto) return null;
  return (
    <View style={[styles.caja, { backgroundColor: colores.fondo }]}>
      <AppText variant="caption" style={[styles.texto, { color: colores.texto }]}>
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
