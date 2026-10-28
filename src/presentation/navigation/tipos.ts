// Rutas de la app. Equivalen a las páginas del portal:
//   Login -> (blank)/login, SeleccionarPuesto -> (blank)/seleccionar-puesto, Inicio -> "/",
//   Notificaciones -> (dashboard)/notificaciones,
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

export type RootStackParams = {
  Cargando: undefined;
  Login: undefined;
  SeleccionarPuesto: undefined;
  Inicio: undefined;
  Notificaciones: undefined;
  MiPerfil: undefined;
  DatosPersonales: undefined;
  Documentacion: undefined;
  Licencias: { seccion?: 'licencias' | 'vacaciones' | 'calendario' | 'equipo' } | undefined;
  Formacion: undefined;
  Trayectoria: undefined;
  Extension: undefined;
  GestionAcademica: undefined;
  /** `pestania`: pestaña con la que abre (el menú lateral entra directo a cada subpágina del portal). */
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
