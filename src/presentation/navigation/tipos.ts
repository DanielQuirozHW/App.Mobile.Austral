// Rutas de la app. Equivalen a las páginas del portal:
//   Login -> (blank)/login, SeleccionarPuesto -> (blank)/seleccionar-puesto, Inicio -> "/",
//   DatosPersonales -> (dashboard)/legajo/datos-personales,
//   Licencias -> (dashboard)/licencias (licencias, vacaciones, calendario y gestión del equipo),
//   Formacion -> (dashboard)/perfil/formacion, Trayectoria -> (dashboard)/perfil/trayectoria,
//   Extension -> (dashboard)/perfil/extension
// No hay registro ni recuperar contraseña: las cuentas con usuario y contraseña se crean desde Firebase (decisión 36).
export type RootStackParams = {
  Cargando: undefined;
  Login: undefined;
  SeleccionarPuesto: undefined;
  Inicio: undefined;
  DatosPersonales: undefined;
  Licencias: { seccion?: 'licencias' | 'vacaciones' | 'calendario' | 'equipo' } | undefined;
  Formacion: undefined;
  Trayectoria: undefined;
  Extension: undefined;
};
