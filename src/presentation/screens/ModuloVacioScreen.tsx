// Pantalla vacía de los módulos que no forman parte de la demostración (docs/ALCANCE-MVP.md). El módulo figura en el
// menú, pero no tiene contenido: el título sale de navigation/modulosMenu.ts según la ruta que se abrió.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AppButton } from '../components/AppButton';
import { AppIcon } from '../components/AppIcon';
import { AppText } from '../components/AppText';
import { Screen } from '../components/Screen';
import { irAModulo } from '../navigation/navigationRef';
import { tituloDeRuta } from '../navigation/modulosMenu';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { iconSizes, scale, spacing } from '../utils/responsive';

export const ModuloVacioScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const route = useRoute();

  return (
    <Screen>
      <View style={styles.centro}>
        <View style={styles.circulo}>
          <AppIcon name="construct-outline" size={iconSizes.xxxl} color={globalColors.accentPrimary} />
        </View>
        <AppText variant="h5" style={styles.texto}>
          {tituloDeRuta(route.name)}
        </AppText>
        <AppText variant="body2" tone="secondary" style={styles.texto}>
          Este módulo todavía no está disponible en la versión de demostración.
        </AppText>
        <AppButton title="Volver al inicio" variant="secondary" icon="home-outline" onPress={() => irAModulo('Inicio')} />
      </View>
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
    circulo: {
      width: scale(80),
      height: scale(80),
      borderRadius: scale(40),
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    texto: { textAlign: 'center' },
  });
