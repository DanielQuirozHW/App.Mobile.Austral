// Rutas de la app. Equivalen a las páginas del portal:
//   Login -> (blank)/login, SeleccionarPuesto -> (blank)/seleccionar-puesto, Inicio -> "/",
//   DatosPersonales -> (dashboard)/legajo/datos-personales
// No hay registro ni recuperar contraseña: las cuentas con usuario y contraseña se crean desde Firebase (decisión 36).
export type RootStackParams = {
  Cargando: undefined;
  Login: undefined;
  SeleccionarPuesto: undefined;
  Inicio: undefined;
  DatosPersonales: undefined;
};
