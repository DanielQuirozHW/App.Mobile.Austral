import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

export interface LineaDeTarjeta {
  label: string;
  valor: string;
}

interface TarjetaSolicitudProps {
  titulo: string;
  subtitulo?: string;
  /** Normalmente un EstadoChip. */
  estado?: React.ReactNode;
  lineas: LineaDeTarjeta[];
  /** Botones de acción de la fila (ver, cancelar, responder). */
  acciones?: React.ReactNode;
}

/** Fila de una grilla del portal, adaptada al celular como tarjeta. */
export const TarjetaSolicitud: React.FC<TarjetaSolicitudProps> = ({ titulo, subtitulo, estado, lineas, acciones }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <View style={styles.card}>
      <View style={styles.encabezado}>
        <AppText variant="subtitle2" style={styles.titulo}>
          {titulo}
        </AppText>
        {subtitulo ? (
          <AppText variant="caption" tone="secondary">
            {subtitulo}
          </AppText>
        ) : null}
        {estado}
      </View>
      <View style={styles.lineas}>
        {lineas.map((linea) => (
          <View key={linea.label} style={styles.linea}>
            <AppText variant="caption" tone="secondary">
              {linea.label}
            </AppText>
            <AppText variant="body2">{linea.valor || '—'}</AppText>
          </View>
        ))}
      </View>
      {acciones ? <View style={styles.acciones}>{acciones}</View> : null}
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
      padding: spacing.lg,
      gap: spacing.md,
      ...platformSpecific.shadow(1),
    },
    encabezado: { gap: spacing.xs },
    titulo: { fontWeight: '600' },
    lineas: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm, columnGap: spacing.lg },
    linea: { minWidth: '40%', gap: spacing.xxs },
    acciones: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
  });
