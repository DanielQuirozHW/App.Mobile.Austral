import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { queryClient, registrarRefetchAlVolverALaApp } from '../../config/api/queryClient';
import { ThemeProvider } from '../theme/theme';

/**
 * Providers de la app, de afuera hacia adentro:
 * SafeAreaProvider → KeyboardProvider → ThemeProvider → QueryClientProvider.
 * La navegación (NavigationContainer) se suma adentro en la etapa 4.
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => registrarRefetchAlVolverALaApp(), []);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};
