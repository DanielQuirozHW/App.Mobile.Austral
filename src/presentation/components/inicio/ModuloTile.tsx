// Tarjeta de un módulo en la grilla de Inicio: cuadro de color con ícono blanco, el nombre y una línea que dice qué
// hay adentro. Dos por fila. Los módulos que todavía no tienen contenido se ven atenuados y con la etiqueta
// "Próximamente" (docs/DECISION-UI-MOBILE.md).
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
  /** Color del cuadro del ícono. */
  color: string;
  /** Qué hay adentro, en una línea corta. Se omite si es "Próximamente". */
  descripcion?: string;
  onPress: () => void;
  proximamente?: boolean;
}

export const ModuloTile: React.FC<ModuloTileProps> = ({
  titulo,
  icono,
  color,
  descripcion,
  onPress,
  proximamente = false,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={proximamente ? `${titulo}, próximamente` : titulo}
      android_ripple={{ color: globalColors.hairline }}
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
    >
      <View style={[styles.cuadro, { backgroundColor: color }, proximamente && styles.apagado]}>
        <AppIcon name={icono} size={iconSizes.lg} color="#FFFFFF" />
      </View>
      <View style={styles.textos}>
        <AppText variant="subtitle1" numberOfLines={2} style={proximamente ? styles.textoApagado : undefined}>
          {titulo}
        </AppText>
        {proximamente ? (
          <View style={styles.etiqueta}>
            <AppText variant="caption" tone="tertiary">
              Próximamente
            </AppText>
          </View>
        ) : descripcion ? (
          <AppText variant="caption" tone="secondary" numberOfLines={2}>
            {descripcion}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    tarjeta: {
      width: '48%',
      minHeight: scale(128),
      padding: spacing.lg,
      gap: spacing.md,
      backgroundColor: c.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
      ...platformSpecific.shadow(2),
    },
    presionada: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    cuadro: {
      width: scale(46),
      height: scale(46),
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    apagado: { opacity: 0.5 },
    textos: { gap: spacing.xxs },
    textoApagado: { opacity: 0.7 },
    etiqueta: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: borderRadius.round,
      backgroundColor: c.surfaceSecondary,
    },
  });
