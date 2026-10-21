# Plan de Trabajo (PTA)

Contrato y reglas del módulo **Plan de Trabajo Anual** (`/planes-de-trabajo` del portal), solo para el puesto `docente`. Se escribió leyendo el código de `HW-Austral/Portal-Austral-Dev`. Lo que no se pudo confirmar está marcado como **inferido**. No contiene datos de personas.

Código de la app: `src/domain/pta/`, `src/infrastructure/pta/ptaApi.ts`, `src/application/pta/ptaService.ts`, `src/presentation/stores/ptaStore.ts`, `src/presentation/components/pta/`, `src/presentation/screens/pta/`. Decisiones 75 a 86 en [`../DECISIONES.md`](../DECISIONES.md).

## 1. Lista de planes

Fuente: `Portal-Austral-Dev`, página `/planes-de-trabajo` (`page.tsx`).

- **Verificado**: acceso `docente`. Pestañas VIGENTE (1), EN DESARROLLO (2, inicial) e HISTÓRICO (3).
- **Filtros**: VIGENTE = estado 100000002. EN DESARROLLO = estado en {100000000, 100000003, 100000001, 1}. HISTÓRICO = fecha de cierre (día en UTC) menor o igual a hoy. Los filtros no son excluyentes.
- `estadoHistorico` es verdadero al estar en VIGENTE o HISTÓRICO y falso en EN DESARROLLO.
- Textos informativos por pestaña y el aviso "Click en el icono (ojo) para acceder a la carga/visualización de contenido." (constante `TEXTO_AYUDA_LISTA`).
- **Lectura del plan**: FetchXML de `new_plandetrabajodocentes`, filtro `statecode = 0` y `new_docente` igual al empleado, orden por docente, con reintentos. Los campos mapeados (año, fechas, estado, categoría, totales, observaciones, etc.) están en `domain/pta/mapeo.ts`.

## 2. Detalle

Fuente: `ModalPlanDeTrabajoDocente.tsx` y hooks `useGetPta`, `useEditarPta`, `useCambiarEstadoPta`.

- **Regla de edición (verificado)**: `isDisabled = !(estado en {1, 100000000}) || estado === 100000002 || estadoHistorico`. Las observaciones del resumen se deshabilitan además si el estado no está en {1, 100000000}.
- **Pestañas**: Datos personales (Identidad docente, Dedicación horaria, Investigación e IAE; pie Cerrar / "Continuar a Actividad"), Observaciones del Sec. Académico (solo con estado 100000000; campo de solo lectura) y Actividad académica.
- **Lectura de observaciones**: al abrir la pestaña se registra la fecha de lectura con PUT del plan (`new_registrodelecturadeobservacindeldocente`, hora con offset -03:00) y se avisa "Observaciones leídas".
- **Subpestañas de Actividad**: Docencia, Investigación, Formación RRHH, Gestión, Extensión, Transferencia, Formación, Horas / Bloques variables y Resumen. Los indicadores se leen al entrar a Resumen.
- **Totales por subpestaña** ("Total horas ..." y "Total días ..."): docencia, formación RRHH, extensión, transferencia y horas variables, desde los campos `new_horastotal*` / `new_totaldias*` del plan.

## 3. Plan: escrituras

- **PUT** `api/hrfactors/plandetrabajodocente` con `new_plandetrabajodocenteid` y: `new_nroalumnos`, `new_nroentrevistas`, `new_cantidadhorasasesoramientoacademico`, `new_observacionescomentario`, `new_formacinvinculacinactividadesdeinvestigac`, `new_totalhoras`, `new_registrodelecturadeobservacindeldocente`, `new_comentarioshorasclases`. Variante solo de observaciones: `{id, new_observacionescomentario}`.
- **Total de investigación** (mismo endpoint): `new_totalhoras_llena`, `new_totaldias_llena`, `new_tipodecarga` (100000000 Horas, 100000001 Días), `new_totalhoras_calculado`, `new_totaldiascalculado`. Días: horas calculadas = días × 8; Horas: días calculados = horas / 8.
- **Avisos**: "Procesando...", "Cambios guardados correctamente", "Error al editar el plan de trabajo", "Observaciones leídas"; del total de investigación "Total horas/días proyectos de investigación y resultados esperados" / "Error al cargar".
- **Estado**: PUT `api/hrfactors/cambiarRazonParaElEstadoPTA` con `{new_plandetrabajodocenteid, statuscode}`. **Inferido**: `statuscode` es el actual y el backend resuelve la transición.

## 4. Envío

- Botón "Enviar a Sec. Académico" (deshabilitado si el estado no está en {1, 100000000} o `isDisabled`).
- Sin adjunto: aviso "No se puede enviar el PTA. Por favor, cargue el Informe PTA del año Anterior."
- Con adjunto: diálogo "Confirmación", "¿Está seguro de enviar el Plan de Trabajo Anual? Luego de esta acción no se podrá modificar."; éxito "Enviado con éxito"; error "No se pudo cambiar el estado del plan de trabajo".

## 5. Adjuntos del informe anterior

- Lectura: `annotations` con vínculo a `new_plandetrabajodocente`, orden por asunto. Baja: DELETE `api/hrfactors/nota` con `{annotationid}`; avisos "Eliminando adjunto..." / "Adjunto eliminado correctamente"; confirmación "¿Desea eliminar este registro? Esta acción no se puede deshacer."
- Subida: POST `api/hrfactors/adjuntosolicitud?pta_id=ID`, multipart con el campo `file` por archivo; avisos "Procesando archivo...", "Archivo cargado con éxito", "Error al cargar archivo". Tipos JPG, JPEG, PNG, PDF, DOC, DOCX; 15 MB.
- Tabla: Título, Documento cargado, Fecha de última carga. **Inferido**: el portal resta 3 horas al texto de la fecha.

## 6. Indicadores (Resumen)

- Lectura de `new_indicadoresdeplanificacins` (`statecode = 0`, plan), con segmento, horas, días y porcentajes. Orden por la parte inicial de la etiqueta: Docencia, Investigación, Formación de RRHH, Gestión, Extensión, Transferencia, Formación, Horas / Bloques variables; el resto al final.
- Totales registrados: TOTAL HORAS DEDICACIÓN ANUAL, TOTAL HORAS PTA, DIFERENCIA HORAS PTA CON HORAS DEDICACIÓN ANUAL. Campo "Observaciones / Comentarios" (3 filas) con Guardar.
- El portal agrega un gráfico de torta que no se leyó; la app usa barras.

## 7. Registros de cada sección

Todas las lecturas son FetchXML de la entidad indicada con `statecode = 0` y el plan, vía `api/hrfactors/...`. Las altas mandan `new_plandetrabajo`; las ediciones mandan el id del registro. Los campos de selección se envían con `.value`; los de texto con `|| ''`; los numéricos con `Number(...) || 0`.

| Sección | Endpoint de escritura | Entidad de lectura |
|---|---|---|
| Clases | `clasePlanDeTrabajo` | `new_tpa_clases` |
| Áreas de interés | `areaInteresPlanDeTrabajo` | `new_pta_areasinteres` |
| Proyectos de investigación | `proyectosInvestigacionPlanDeTrabajo` | `new_pta_proyectosinvestigacion` |
| Publicaciones previstas | `publicacionesRevistaPlanDeTrabajo` | `new_pta_publicacionesprevistas` |
| Congresos | `congresosPlanDeTrabajo` | `new_pta_congresos` |
| Divulgación | `divulgacionesPlanDeTrabajo` | `new_pta_divulgaciones` |
| Dirección de tesis | `direccionDeTesisPlanDeTrabajo` | `new_pta_direcciontesis` |
| Jurado de trabajos finales | `juradoTFPlanDeTrabajo` | `new_pta_juradotrabajosfinales` |
| Cargo / Encargo | `cargosYEncargosPlanDeTrabajo` | `new_pta_cargos_encargos` |
| Extensión | `extensionPlanDeTrabajo` | `new_pta_extension` |
| Transferencia | `transferenciaPlanDeTrabajo` | `new_pta_transferencia` |
| Formaciones (5 tipos) | `formacionesPlanDeTrabajo` | `new_pta_formaciones` |
| Horas / bloques variables | `bloquesPlanDeTrabajo` | `new_pta_bloques` |

Bajas: DELETE al mismo endpoint con el id del registro en el cuerpo.

- **Cargo**: no tiene alta (los cargos los asigna el sistema); se edita con otro cuerpo (`new_UnidadAcademicaDelCargo`). **Encargo**: alta y edición; si la unidad es "Otra" pide la otra unidad académica.
- **Formaciones**: el tipo se envía en `new_tema`: 100000000 específica, 100000001 humanística, 100000002 pedagógica, 100000003 seminarios / metodología de la investigación, 100000004 doctoral. La doctoral usa "Etapa de formación" y las demás "Grado de avance" (los seminarios, ninguno).
- **Dirección de tesis**: el portal envía como `new_tituloaobtener` el id del lookup (el valor del select).
- **Congresos**: la fecha no es obligatoria. **Extensión**: la unidad académica no es obligatoria en la validación.
- **Opciones fijas** (verificadas): unidad de medida 100000001 Horas anuales / 100000000 Bloques anuales / 100000002 Días anuales; formación vinculada a investigación 100000000 Doctor, 100000001 Doctorando, 100000002 Profesor (sin formación doctoral) vinculado a proyecto de investigación; publicaciones (estado, tipo), congresos, divulgación, avance de tesis y nivel del jurado según `domain/pta/opciones.ts`.
- **Catálogos**: universidades (`/api/v1/catalogos/universidades`, `[{id, nombre}]`), modalidades de dictado, grado académico, grandes áreas / disciplinas / especialidades (con filtros en cascada). Las listas de unidades académicas se ordenan y excluyen "Instituto de Investigación en Medicina Traslacional" según cada modal.
- **Bajas, diálogo**: "Confirmar eliminación" con el mensaje de cada sección y "Esta acción no se puede deshacer."

## 8. Inferido o no leído

- Hooks de alta y edición de áreas, proyectos, publicaciones, congresos, divulgaciones, dirección de tesis y jurado: no se leyeron; los cuerpos salen del store del portal.
- Texto "Cargo" / "Encargo" de los avisos; mensajes de solo letras; avisos de baja "Proceso exitoso" donde no se leyó el texto.
- Gráfico de torta del resumen y encabezado de la página (`PlanTrabajoPageHeader`): no leídos.
- Lo que la app hace distinto a propósito está en las decisiones 77 a 86.
