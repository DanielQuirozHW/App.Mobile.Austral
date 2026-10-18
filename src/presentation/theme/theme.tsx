import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorTokens, darkColors, lightColors } from './colors';
import { typography } from './typography';

interface ThemeContextValue {
  globalColors: ColorTokens;
  isDark: boolean;
  typography: typeof typography;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * Fuerza el modo. La pantalla de ingreso del portal arma su propio tema claro
   * (login/page.tsx: createTheme con mode 'light'), así que se ve igual aunque el sistema esté en oscuro.
   */
  modo?: 'light' | 'dark';
}

/**
 * Elige la paleta clara u oscura según el modo del sistema (o el modo forzado).
 * No hay selector manual de tema: no está en el alcance.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, modo }) => {
  const sistemaOscuro = useColorScheme() === 'dark';
  const isDark = modo ? modo === 'dark' : sistemaOscuro;

  const value = useMemo<ThemeContextValue>(
    () => ({ globalColors: isDark ? darkColors : lightColors, isDark, typography }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeColors = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeColors debe usarse dentro de ThemeProvider');
  }
  return context;
};
