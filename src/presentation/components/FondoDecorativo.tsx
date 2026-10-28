// Motivo decorativo de fondo: dos círculos y un anillo semitransparentes. Va dentro de un contenedor con
// `overflow: 'hidden'` y esquinas redondeadas. Se usa en la tarjeta de saludo de Inicio y en la portada del perfil cuando
// no hay foto, así ambas comparten el mismo estilo (docs/DECISION-UI-MOBILE.md). Los colores salen de los tokens `hero*`,
// así que cambia solo con el modo claro u oscuro. No recibe toques.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { scale } from '../utils/responsive';

export const FondoDecorativo: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.circuloGrande} />
      <View style={styles.circuloChico} />
      <View style={styles.anillo} />
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    circuloGrande: {
      position: 'absolute',
      top: -scale(50),
      right: -scale(40),
      width: scale(180),
      height: scale(180),
      borderRadius: scale(90),
      backgroundColor: c.heroCircle,
    },
    circuloChico: {
      position: 'absolute',
      bottom: -scale(30),
      right: scale(60),
      width: scale(90),
      height: scale(90),
      borderRadius: scale(45),
      backgroundColor: c.heroCircle,
    },
    anillo: {
      position: 'absolute',
      top: scale(16),
      right: scale(130),
      width: scale(48),
      height: scale(48),
      borderRadius: scale(24),
      borderWidth: 2,
      borderColor: c.heroCircle,
    },
  });
