import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, useThemeColors } from '../theme/theme';
import { scale } from '../utils/responsive';
import { Screen } from './Screen';

const Fondo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { globalColors } = useThemeColors();
  return (
    <Screen
      scroll
      style={{ backgroundColor: globalColors.accentBeige }}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.columna}>{children}</View>
    </Screen>
  );
};

/**
 * Fondo de las pantallas de ingreso. El portal las arma con un tema claro propio y fondo beige (#F5EDD8),
 * así que se ven igual aunque el sistema esté en modo oscuro (login/page.tsx).
 */
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider modo="light">
    <Fondo>{children}</Fondo>
  </ThemeProvider>
);

const styles = StyleSheet.create({
  contenido: { flexGrow: 1, justifyContent: 'center' },
  columna: { width: '100%', maxWidth: scale(480), alignSelf: 'center' },
});
