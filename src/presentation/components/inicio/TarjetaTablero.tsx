// Tarjeta con encabezado del Tablero de Inicio (CumpleaniosCard y ProximosFeriadosCard del portal comparten esta forma:
// encabezado con ícono y título, línea divisoria y contenido).
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, scale, spacing } from '../../utils/responsive';
import { AppIcon, type AppIconName } from '../AppIcon';
import { AppText } from '../AppText';

interface TarjetaTableroProps {
  icono: AppIconName;
  /** Color del ícono: 'secundario' (cian) en cumpleaños, el del texto en feriados. */
  colorIcono: string;
  titulo: string;
  /** Contenido a la derecha del encabezado (fecha, contador). */
  derecha?: React.ReactNode;
  children: React.ReactNode;
}

export const TarjetaTablero: React.FC<TarjetaTableroProps> = ({ icono, colorIcono, titulo, derecha, children }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <View style={styles.card}>
      <View style={styles.encabezado}>
        <View style={styles.titulo}>
          <AppIcon name={icono} size={scale(20)} color={colorIcono} />
          <AppText variant="h5" style={styles.tituloTexto}>
            {titulo}
          </AppText>
        </View>
        {derecha}
      </View>
      {children}
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
    },
    encabezado: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.hairline,
    },
    titulo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
    tituloTexto: { fontWeight: '700', flexShrink: 1 },
  });
