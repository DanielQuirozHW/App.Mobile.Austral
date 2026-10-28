import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, useThemeColors } from '../theme/theme';
import { scale } from '../utils/responsive';
import { Screen } from './Screen';

const Fondo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { globalColors } = useThemeColors();
  return (
    <Screen scroll style={{ backgroundColor: globalColors.background }} contentContainerStyle={styles.contenido}>
      <View style={styles.columna}>{children}</View>
    </Screen>
  );
};

/**
 * Fondo de las pantallas de ingreso. Siempre en modo claro (como el ingreso del portal), con el fondo limpio de la app
 * en lugar del beige del portal (docs/DECISION-UI-MOBILE.md).
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
