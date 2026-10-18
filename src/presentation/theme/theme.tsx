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

/**
 * Elige la paleta clara u oscura según el modo del sistema.
 * No hay selector manual de tema: no está en el alcance.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useColorScheme() === 'dark';

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
