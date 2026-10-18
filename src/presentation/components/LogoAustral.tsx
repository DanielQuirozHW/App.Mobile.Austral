import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { logoHorizontalBlanco, logoHorizontalColor } from '../../assets/images/logos';
import { useThemeColors } from '../theme/theme';
import { scale } from '../utils/responsive';
import { AppText } from './AppText';

/**
 * Logo institucional (login/page.tsx: claro -> logo-horizontal-color, oscuro -> logo-horizontal-blanco,
 * ancho 260, máximo 80 % del contenedor). Sin los archivos copiados, muestra el nombre en texto.
 */
export const LogoAustral: React.FC = () => {
  const { isDark } = useThemeColors();
  const fuente = isDark ? logoHorizontalBlanco : logoHorizontalColor;

  if (!fuente) {
    return (
      <View style={styles.contenedor}>
        <AppText variant="h3" tone="primary">
          Universidad Austral
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Image source={fuente} resizeMode="contain" accessibilityLabel="Universidad Austral" style={styles.imagen} />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { alignSelf: 'center', maxWidth: '80%', alignItems: 'center' },
  imagen: { width: scale(260), height: scale(80) },
});
