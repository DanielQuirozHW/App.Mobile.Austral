// Rutas de la app. Equivalen a las páginas del portal:
//   Login -> (blank)/login, SeleccionarPuesto -> (blank)/seleccionar-puesto, Inicio -> "/",
//   Notificaciones -> (dashboard)/notificaciones,
//   Submenu -> propia de la app: pantalla de subopciones de un módulo con varias entradas (Legajo, Perfil, Funciones SA...).
//     Reemplaza a los grupos desplegables del menú lateral del portal (docs/DECISION-UI-MOBILE.md),
//   MiPerfil -> propia de la app: pantalla de entrada al módulo Mi perfil (legajo + perfil académico); el portal las
//     agrupa en su menú lateral,
//   DatosPersonales -> (dashboard)/legajo/datos-personales,
//   Documentacion -> (dashboard)/legajo/documentacion,
//   Licencias -> (dashboard)/licencias (licencias, vacaciones, calendario y gestión del equipo),
//   Formacion -> (dashboard)/perfil/formacion, Trayectoria -> (dashboard)/perfil/trayectoria,
//   Extension -> (dashboard)/perfil/extension, GestionAcademica -> (dashboard)/perfil/gestion-academica,
//   Docencia -> (dashboard)/perfil/docencia/* (categorización, nombramientos, docencia y asesoramiento; la pestaña
//     Promoción figura pero está en construcción),
//   Investigacion -> (dashboard)/perfil/investigacion/* (afiliaciones, actividad I+D y resultados / impacto I+D),
//   PlanesDeTrabajo -> (dashboard)/planes-de-trabajo (lista, solo docente),
//   PlanTrabajoDetalle -> el modal del plan (ModalPlanDeTrabajoDocente) abierto desde la lista,
//   Ajustes -> propia de la app (modo de color, cuenta); el portal la resuelve con el selector de tema,
//   EnConstruccion -> propia de la app: la abre toda entrada del menú del portal que no se migra (Promoción, Gestión del
//     Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU). Recibe el título y el camino dentro del menú.
// No hay registro ni recuperar contraseña: las cuentas con usuario y contraseña se crean desde Firebase (decisión 36).
// MVP de demostración: solo algunos módulos tienen contenido (ver navigation/modulosMenu.ts).

/** Pestañas de Perfil > Docencia (subpáginas del portal). */
export type PestaniaDocencia = 'categorizacion' | 'nombramientos' | 'promocion' | 'docencia' | 'asesoramiento';

/** Secciones de Perfil > Investigación (subpáginas del portal). */
export type SeccionInvestigacion = 'afiliaciones' | 'actividad' | 'resultados';

/** Secciones del módulo Licencias y vacaciones (?seccion= del portal; "equipo" es la Gestión de los líderes). */
export type SeccionLicencias = 'licencias' | 'vacaciones' | 'calendario' | 'equipo';

/** Filtro de tipo con el que abre la Gestión (?tipo= del portal: licencias -> "Licencia", vacaciones -> "Vacaciones"). */
export type TipoGestion = 'Licencia' | 'Vacaciones';

export type RootStackParams = {
  Cargando: undefined;
  Login: undefined;
  SeleccionarPuesto: undefined;
  Inicio: undefined;
  /** `id`: entrada del árbol de menú cuyas subopciones se listan; `color`: color del módulo raíz; `ubicacion`: camino de grupos. */
  Submenu: { id: string; color?: string; ubicacion?: string };
  Notificaciones: undefined;
  MiPerfil: undefined;
  DatosPersonales: undefined;
  Documentacion: undefined;
  /** `seccion`: pestaña con la que abre; `tipo`: filtro inicial de la Gestión (solo con seccion "equipo"). */
  Licencias: { seccion?: SeccionLicencias; tipo?: TipoGestion } | undefined;
  Formacion: undefined;
  Trayectoria: undefined;
  Extension: undefined;
  GestionAcademica: undefined;
  /** `pestania`: pestaña con la que abre (cada entrada de Perfil > Docencia entra directo a su subpágina del portal). */
  Docencia: { pestania?: PestaniaDocencia } | undefined;
  /** `seccion`: sección con la que abre. */
  Investigacion: { seccion?: SeccionInvestigacion } | undefined;
  PlanesDeTrabajo: undefined;
  /** `historico`: el plan se abrió desde VIGENTE o HISTÓRICO (estadoHistorico del portal): solo lectura. */
  PlanTrabajoDetalle: { planId: string; historico: boolean };
  Ajustes: undefined;
  /** `id`: identifica la entrada del menú (para resaltarla); `ubicacion`: camino de grupos, p. ej. "Funciones SA › Promoción docente". */
  EnConstruccion: { id: string; titulo: string; ubicacion?: string };
};
