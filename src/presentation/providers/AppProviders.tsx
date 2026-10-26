import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { queryClient, registrarRefetchAlVolverALaApp } from '../../config/api/queryClient';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '../theme/theme';

/**
 * Providers de la app, de afuera hacia adentro:
 * SafeAreaProvider → KeyboardProvider → ThemeProvider → ErrorBoundary → QueryClientProvider.
 * La navegación (NavigationContainer) va adentro, en AppNavigation.
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => registrarRefetchAlVolverALaApp(), []);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
};
