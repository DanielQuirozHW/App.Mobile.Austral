// Navegador raíz. Reemplaza al guard de rutas del portal: según el estado de sesión y de puesto se muestran
// unas pantallas u otras (al cambiar el estado, react-navigation hace la transición solo).
//   - Firebase todavía no resolvió la sesión                -> Cargando
//   - sin usuario con `empleadoid` (criterio del portal)  -> Login
//   - usuario con varios puestos que aún no eligió       -> SeleccionarPuesto
//   - resto                                              -> Inicio + Notificaciones + Ajustes + Mi perfil y sus
//                                                           secciones + Licencias y vacaciones + Plan de trabajo
//                                                           (Datos personales para docente / codocente; Plan de trabajo
//                                                           solo para docente: allowedRoles ["docente"] de
//                                                           planes-de-trabajo/page.tsx)
//
// MVP DE DEMOSTRACIÓN (docs/ALCANCE-MVP.md): todos los módulos están registrados y figuran en el menú, pero solo los que
// tienen `enDemo: true` en navigation/modulosMenu.ts muestran su pantalla real; el resto abre ModuloVacioScreen.
// Documentación: el menú del portal (navigation/vertical/index.tsx) la muestra a todos los roles. Falta leer el guard
// del layout del dashboard por si restringe algo más (ver docs/PENDIENTES.md).
import React, { useEffect } from 'react';
import { createNativeStackNavigator, type NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { escucharSesion } from '../../application/auth/authService';
import { LoadingScreen } from '../components/LoadingScreen';
import { BotonMenu } from '../components/menu/BotonMenu';
import { EncabezadoVisibleContext } from '../components/Screen';
import { AjustesScreen } from '../screens/ajustes/AjustesScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { ModuloVacioScreen } from '../screens/ModuloVacioScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SeleccionarPuestoScreen } from '../screens/auth/SeleccionarPuestoScreen';
import { DatosPersonalesScreen } from '../screens/legajo/DatosPersonalesScreen';
import { DocumentacionScreen } from '../screens/legajo/DocumentacionScreen';
import { LicenciasScreen } from '../screens/licencias/LicenciasScreen';
import { NotificacionesScreen } from '../screens/notificaciones/NotificacionesScreen';
import { DocenciaScreen } from '../screens/perfil/DocenciaScreen';
import { ExtensionScreen } from '../screens/perfil/ExtensionScreen';
import { FormacionScreen } from '../screens/perfil/FormacionScreen';
import { GestionAcademicaScreen } from '../screens/perfil/GestionAcademicaScreen';
import { InvestigacionScreen } from '../screens/perfil/InvestigacionScreen';
import { MiPerfilScreen } from '../screens/perfil/MiPerfilScreen';
import { TrayectoriaScreen } from '../screens/perfil/TrayectoriaScreen';
import { PlanTrabajoDetalleScreen } from '../screens/pta/PlanTrabajoDetalleScreen';
import { PlanTrabajoScreen } from '../screens/pta/PlanTrabajoScreen';
import { useAuthStore } from '../stores/authStore';
import { puedeVerLegajo, useRolStore } from '../stores/rolStore';
import { moduloEnDemo, type RutaDeMenu } from './modulosMenu';
import type { RootStackParams } from './tipos';

const Stack = createNativeStackNavigator<RootStackParams>();

const CargandoScreen: React.FC = () => <LoadingScreen />;

/**
 * Envuelve una pantalla que se muestra debajo del encabezado nativo para que `Screen` no sume dos veces la zona
 * segura de arriba. Se llama una sola vez por pantalla, a nivel de módulo (no dentro de un render).
 */
const conEncabezado = (Componente: React.ComponentType): React.FC => {
  const Envuelta: React.FC = () => (
    <EncabezadoVisibleContext.Provider value>
      <Componente />
    </EncabezadoVisibleContext.Provider>
  );
  return Envuelta;
};

/** La pantalla real si el módulo está en la demostración; si no, la pantalla vacía. */
const moduloODemo = (ruta: RutaDeMenu, real: React.ComponentType): React.FC =>
  conEncabezado(moduloEnDemo(ruta) ? real : ModuloVacioScreen);

const Notificaciones = moduloODemo('Notificaciones', NotificacionesScreen);
const MiPerfil = moduloODemo('MiPerfil', MiPerfilScreen);
const DatosPersonales = moduloODemo('DatosPersonales', DatosPersonalesScreen);
const Documentacion = moduloODemo('Documentacion', DocumentacionScreen);
const Licencias = moduloODemo('Licencias', LicenciasScreen);
const Formacion = moduloODemo('Formacion', FormacionScreen);
const Trayectoria = moduloODemo('Trayectoria', TrayectoriaScreen);
const Extension = moduloODemo('Extension', ExtensionScreen);
const GestionAcademica = moduloODemo('GestionAcademica', GestionAcademicaScreen);
const Docencia = moduloODemo('Docencia', DocenciaScreen);
const Investigacion = moduloODemo('Investigacion', InvestigacionScreen);
const PlanesDeTrabajo = moduloODemo('PlanesDeTrabajo', PlanTrabajoScreen);
const PlanTrabajoDetalle = conEncabezado(PlanTrabajoDetalleScreen);
const Ajustes = moduloODemo('Ajustes', AjustesScreen);

const renderBotonMenu = (): React.ReactElement => <BotonMenu />;

/** Opciones comunes de las pantallas con encabezado: título, transición y botón del menú a la derecha. */
const opciones = (title: string): NativeStackNavigationOptions => ({
  headerShown: true,
  title,
  animation: 'slide_from_right',
  headerRight: renderBotonMenu,
});

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
          <Stack.Screen name="Notificaciones" component={Notificaciones} options={opciones('Notificaciones')} />
          <Stack.Screen name="MiPerfil" component={MiPerfil} options={opciones('Mi perfil')} />
          {puedeVerLegajo(role) ? (
            <Stack.Screen name="DatosPersonales" component={DatosPersonales} options={opciones('Datos personales')} />
          ) : null}
          <Stack.Screen name="Documentacion" component={Documentacion} options={opciones('Documentación')} />
          <Stack.Screen name="Licencias" component={Licencias} options={opciones('Licencias y vacaciones')} />
          {/* Perfil: el menú del portal lo muestra a todos los roles (navigation/vertical/index.tsx). */}
          <Stack.Screen name="Formacion" component={Formacion} options={opciones('Formación')} />
          <Stack.Screen name="Trayectoria" component={Trayectoria} options={opciones('Trayectoria profesional')} />
          <Stack.Screen name="Extension" component={Extension} options={opciones('Extensión')} />
          <Stack.Screen name="GestionAcademica" component={GestionAcademica} options={opciones('Gestión académica')} />
          <Stack.Screen name="Docencia" component={Docencia} options={opciones('Docencia')} />
          <Stack.Screen name="Investigacion" component={Investigacion} options={opciones('Investigación')} />
          <Stack.Screen name="Ajustes" component={Ajustes} options={opciones('Ajustes')} />
          {role === 'docente' ? (
            <>
              <Stack.Screen name="PlanesDeTrabajo" component={PlanesDeTrabajo} options={opciones('Plan de trabajo')} />
              {moduloEnDemo('PlanesDeTrabajo') ? (
                <Stack.Screen
                  name="PlanTrabajoDetalle"
                  component={PlanTrabajoDetalle}
                  options={opciones('Plan de Trabajo Anual')}
                />
              ) : null}
            </>
          ) : null}
        </>
      )}
    </Stack.Navigator>
  );
};
