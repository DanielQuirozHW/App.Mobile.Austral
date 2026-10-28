// Tarjeta de un módulo en la grilla de Inicio. Dos por fila. El ícono va sobre un fondo suave del color del módulo (no
// relleno pleno): se ve más liviano y los colores conviven mejor. Los módulos que todavía no tienen contenido usan un
// fondo gris y la etiqueta "Próximamente" en ámbar (el color de "pendiente"), sin atenuar toda la tarjeta
// (docs/DECISION-UI-MOBILE.md). Entra con una animación en cascada (`demora`).
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { Aparece } from '../Aparece';
import { AppIcon, type AppIconName } from '../AppIcon';
import { AppText } from '../AppText';

interface ModuloTileProps {
  titulo: string;
  icono: AppIconName;
  /** Color del módulo (hexadecimal de 6 dígitos). */
  color: string;
  /** Qué hay adentro, en una línea corta. Se omite si es "Próximamente". */
  descripcion?: string;
  onPress: () => void;
  proximamente?: boolean;
  /** Milisegundos de espera de la animación de entrada. */
  demora?: number;
}

export const ModuloTile: React.FC<ModuloTileProps> = ({
  titulo,
  icono,
  color,
  descripcion,
  onPress,
  proximamente = false,
  demora = 0,
}) => {
  const { globalColors, isDark } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  // Fondo del ícono: el color del módulo con transparencia (algo más marcada en oscuro, donde se pierde más).
  const fondoIcono = proximamente ? globalColors.surfaceSecondary : `${color}${isDark ? '33' : '1F'}`;

  return (
    <Aparece demora={demora} style={styles.celda}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={proximamente ? `${titulo}, próximamente` : titulo}
        android_ripple={{ color: globalColors.hairline }}
        style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
      >
        <View style={[styles.cuadro, { backgroundColor: fondoIcono }]}>
          <AppIcon name={icono} size={iconSizes.lg} color={proximamente ? globalColors.textSecondary : color} />
        </View>
        <View style={styles.textos}>
          <AppText variant="subtitle1" tone={proximamente ? 'secondary' : 'default'} numberOfLines={2}>
            {titulo}
          </AppText>
          {proximamente ? (
            <View style={styles.etiqueta}>
              <AppText variant="caption" style={styles.etiquetaTexto}>
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
    </Aparece>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    celda: { width: '48%' },
    tarjeta: {
      width: '100%',
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
    textos: { gap: spacing.xxs },
    etiqueta: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xxs + 1,
      borderRadius: borderRadius.round,
      backgroundColor: c.soonBackground,
    },
    etiquetaTexto: { fontWeight: '700', color: c.soonText },
  });
