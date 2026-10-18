import React, { useMemo } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { OverlayCerrandoSesion } from '../components/OverlayCerrandoSesion';
import { ToastHost } from '../components/ToastHost';
import { useThemeColors } from '../theme/theme';
import { crearTemaDeNavegacion } from './navigationTheme';
import { RootNavigator } from './RootNavigator';

/** Contenedor de navegación con el tema del portal, los avisos (toasts) y el overlay de cierre de sesión por encima de todo. */
export const AppNavigation: React.FC = () => {
  const { globalColors, isDark } = useThemeColors();
  const tema = useMemo(() => crearTemaDeNavegacion(globalColors, isDark), [globalColors, isDark]);

  return (
    <View style={{ flex: 1, backgroundColor: globalColors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <NavigationContainer theme={tema}>
        <RootNavigator />
      </NavigationContainer>
      <ToastHost />
      <OverlayCerrandoSesion />
    </View>
  );
};
