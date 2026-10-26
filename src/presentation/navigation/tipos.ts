// Rutas de la app. Equivalen a las páginas del portal:
//   Login -> (blank)/login, SeleccionarPuesto -> (blank)/seleccionar-puesto, Inicio -> "/",
//   Notificaciones -> (dashboard)/notificaciones,
//   DatosPersonales -> (dashboard)/legajo/datos-personales,
//   Documentacion -> (dashboard)/legajo/documentacion,
//   Licencias -> (dashboard)/licencias (licencias, vacaciones, calendario y gestión del equipo),
//   Formacion -> (dashboard)/perfil/formacion, Trayectoria -> (dashboard)/perfil/trayectoria,
//   Extension -> (dashboard)/perfil/extension, GestionAcademica -> (dashboard)/perfil/gestion-academica,
//   Docencia -> (dashboard)/perfil/docencia/* (categorización, nombramientos, promoción, docencia y asesoramiento),
//   Investigacion -> (dashboard)/perfil/investigacion/* (afiliaciones, actividad I+D y resultados / impacto I+D),
//   PlanesDeTrabajo -> (dashboard)/planes-de-trabajo (lista, solo docente),
//   PlanTrabajoDetalle -> el modal del plan (ModalPlanDeTrabajoDocente) abierto desde la lista.
// No hay registro ni recuperar contraseña: las cuentas con usuario y contraseña se crean desde Firebase (decisión 36).
export type RootStackParams = {
  Cargando: undefined;
  Login: undefined;
  SeleccionarPuesto: undefined;
  Inicio: undefined;
  Notificaciones: undefined;
  DatosPersonales: undefined;
  Documentacion: undefined;
  Licencias: { seccion?: 'licencias' | 'vacaciones' | 'calendario' | 'equipo' } | undefined;
  Formacion: undefined;
  Trayectoria: undefined;
  Extension: undefined;
  GestionAcademica: undefined;
  Docencia: undefined;
  Investigacion: undefined;
  PlanesDeTrabajo: undefined;
  /** `historico`: el plan se abrió desde VIGENTE o HISTÓRICO (estadoHistorico del portal): solo lectura. */
  PlanTrabajoDetalle: { planId: string; historico: boolean };
};
