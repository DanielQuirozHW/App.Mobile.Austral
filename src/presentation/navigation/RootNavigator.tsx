// Navegador raíz. Reemplaza al guard de rutas del portal: según el estado de sesión y de puesto se muestran
// unas pantallas u otras (al cambiar el estado, react-navigation hace la transición solo).
//   - Firebase todavía no resolvió la sesión              -> Cargando
//   - sin usuario con `empleadoid` (criterio del portal)  -> Login
//   - usuario con varios puestos que aún no eligió       -> SeleccionarPuesto
//   - resto                                              -> Inicio
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { escucharSesion } from '../../application/auth/authService';
import { LoadingScreen } from '../components/LoadingScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SeleccionarPuestoScreen } from '../screens/auth/SeleccionarPuestoScreen';
import { useAuthStore } from '../stores/authStore';
import { useRolStore } from '../stores/rolStore';
import type { RootStackParams } from './tipos';

const Stack = createNativeStackNavigator<RootStackParams>();

const CargandoScreen: React.FC = () => <LoadingScreen />;

export const RootNavigator: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const cargandoSesion = useAuthStore((s) => s.loading);
  const cargandoRol = useRolStore((s) => s.loading);
  const seleccionPendiente = useRolStore((s) => s.seleccionPendiente);
  const sincronizarRol = useRolStore((s) => s.sincronizarConUsuario);

  // Se escucha la sesión de Firebase una sola vez, al montar.
  useEffect(() => {
    const dejarDeEscuchar = escucharSesion();
    return dejarDeEscuchar;
  }, []);

  // Cada vez que cambia el usuario se recalcula el puesto elegido (roleContext del portal).
  useEffect(() => {
    void sincronizarRol(user);
  }, [user, sincronizarRol]);

  const autenticado = Boolean(user?.empleadoid);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {cargandoSesion || (autenticado && cargandoRol) ? (
        <Stack.Screen name="Cargando" component={CargandoScreen} />
      ) : !autenticado ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : seleccionPendiente ? (
        <Stack.Screen name="SeleccionarPuesto" component={SeleccionarPuestoScreen} />
      ) : (
        <Stack.Screen name="Inicio" component={InicioScreen} />
      )}
    </Stack.Navigator>
  );
};
