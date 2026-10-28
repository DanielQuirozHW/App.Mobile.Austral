// Mosaico de un módulo en la grilla de Inicio: cuadro de color con ícono blanco y el nombre debajo. Tres por fila.
// Los módulos que todavía no tienen contenido se ven atenuados y con la etiqueta "Próximamente".
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppIcon, type AppIconName } from '../AppIcon';
import { AppText } from '../AppText';

interface ModuloTileProps {
  titulo: string;
  icono: AppIconName;
  /** Color del cuadro. */
  color: string;
  onPress: () => void;
  proximamente?: boolean;
  /** Cantidad para la insignia roja (por ejemplo, notificaciones pendientes). 0 no la muestra. */
  insignia?: number;
}

export const ModuloTile: React.FC<ModuloTileProps> = ({
  titulo,
  icono,
  color,
  onPress,
  proximamente = false,
  insignia = 0,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={proximamente ? `${titulo}, próximamente` : titulo}
      style={({ pressed }) => [styles.mosaico, pressed && styles.presionado]}
    >
      <View style={[styles.cuadro, { backgroundColor: color }, proximamente && styles.apagado]}>
        <AppIcon name={icono} size={iconSizes.xxl} color="#FFFFFF" />
        {insignia > 0 ? (
          <View style={styles.insignia}>
            <AppText variant="caption" style={styles.insigniaTexto}>
              {insignia > 99 ? '99+' : String(insignia)}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="subtitle2" style={styles.titulo} numberOfLines={2}>
        {titulo}
      </AppText>
      {proximamente ? (
        <AppText variant="caption" tone="tertiary" style={styles.titulo}>
          Próximamente
        </AppText>
      ) : null}
    </Pressable>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    mosaico: {
      width: '33.3333%',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    presionado: { opacity: 0.8, transform: [{ scale: 0.96 }] },
    cuadro: {
      width: scale(64),
      height: scale(64),
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      ...platformSpecific.shadow(2),
    },
    apagado: { opacity: 0.45 },
    titulo: { textAlign: 'center' },
    insignia: {
      position: 'absolute',
      top: -scale(6),
      right: -scale(6),
      minWidth: scale(22),
      height: scale(22),
      paddingHorizontal: scale(5),
      borderRadius: scale(11),
      backgroundColor: c.danger,
      borderWidth: 2,
      borderColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    insigniaTexto: { color: c.dangerOn, fontSize: scale(11), lineHeight: scale(13), fontWeight: '700' },
  });
