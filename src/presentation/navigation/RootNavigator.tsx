// Navegador raíz. Reemplaza al guard de rutas del portal: según el estado de sesión y de puesto se muestran
// unas pantallas u otras (al cambiar el estado, react-navigation hace la transición solo).
//   - Firebase todavía no resolvió la sesión                -> Cargando
//   - sin usuario con `empleadoid` (criterio del portal)  -> Login
//   - usuario con varios puestos que aún no eligió       -> SeleccionarPuesto
//   - resto                                              -> Inicio + Licencias y vacaciones + Perfil (Formación,
//                                                           Trayectoria, Extensión, Gestión académica y Docencia)
//                                                           (+ Datos personales para docente / codocente)
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { escucharSesion } from '../../application/auth/authService';
import { LoadingScreen } from '../components/LoadingScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SeleccionarPuestoScreen } from '../screens/auth/SeleccionarPuestoScreen';
import { DatosPersonalesScreen } from '../screens/legajo/DatosPersonalesScreen';
import { LicenciasScreen } from '../screens/licencias/LicenciasScreen';
import { DocenciaScreen } from '../screens/perfil/DocenciaScreen';
import { ExtensionScreen } from '../screens/perfil/ExtensionScreen';
import { FormacionScreen } from '../screens/perfil/FormacionScreen';
import { GestionAcademicaScreen } from '../screens/perfil/GestionAcademicaScreen';
import { TrayectoriaScreen } from '../screens/perfil/TrayectoriaScreen';
import { useAuthStore } from '../stores/authStore';
import { puedeVerLegajo, useRolStore } from '../stores/rolStore';
import type { RootStackParams } from './tipos';

const Stack = createNativeStackNavigator<RootStackParams>();

const CargandoScreen: React.FC = () => <LoadingScreen />;

export const RootNavigator: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const cargandoSesion = useAuthStore((s) => s.loading);
  const cargandoRol = useRolStore((s) => s.loading);
  const seleccionPendiente = useRolStore((s) => s.seleccionPendiente);
  const role = useRolStore((s) => s.role);
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
        <>
          <Stack.Screen name="Inicio" component={InicioScreen} />
          {puedeVerLegajo(role) ? (
            <Stack.Screen
              name="DatosPersonales"
              component={DatosPersonalesScreen}
              options={{ headerShown: true, title: 'Datos personales', animation: 'slide_from_right' }}
            />
          ) : null}
          <Stack.Screen
            name="Licencias"
            component={LicenciasScreen}
            options={{ headerShown: true, title: 'Licencias y vacaciones', animation: 'slide_from_right' }}
          />
          {/* Perfil: el menú del portal lo muestra a todos los roles (navigation/vertical/index.tsx). */}
          <Stack.Screen
            name="Formacion"
            component={FormacionScreen}
            options={{ headerShown: true, title: 'Formación', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Trayectoria"
            component={TrayectoriaScreen}
            options={{ headerShown: true, title: 'Trayectoria profesional', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Extension"
            component={ExtensionScreen}
            options={{ headerShown: true, title: 'Extensión', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="GestionAcademica"
            component={GestionAcademicaScreen}
            options={{ headerShown: true, title: 'Gestión académica', animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Docencia"
            component={DocenciaScreen}
            options={{ headerShown: true, title: 'Docencia', animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
