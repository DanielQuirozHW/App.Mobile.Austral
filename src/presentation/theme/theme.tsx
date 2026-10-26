import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useModoColorStore } from '../stores/modoColorStore';
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
 * Elige la paleta clara u oscura. Si no se fuerza un modo, manda la preferencia del usuario (Ajustes):
 * 'sistema' sigue al celular, 'claro' y 'oscuro' lo fijan. La preferencia se guarda en el almacenamiento local.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, modo }) => {
  const sistemaOscuro = useColorScheme() === 'dark';
  const preferencia = useModoColorStore((s) => s.preferencia);
  const cargarPreferencia = useModoColorStore((s) => s.cargar);

  useEffect(() => {
    void cargarPreferencia();
  }, [cargarPreferencia]);

  const isDark = modo ? modo === 'dark' : preferencia === 'sistema' ? sistemaOscuro : preferencia === 'oscuro';

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
