# Auditoría de paridad con el portal (2026-10-26)

Pedido de Daniel: revisar **todos** los módulos del MVP contra el código del portal, dejarlos con la misma lógica y corregir lo que difiera. Se hizo **leyendo**: nada se ejecutó, nada se probó y no se llamó a la API. Fuente: `HW-Austral/Portal-Austral-Dev`, rama `master`, sha `40f665d`. App contrastada en `main` (último commit de código antes de esta documentación: `8cbc5b4`).

Decisión asociada: **94** (`DECISIONES_89_en_adelante.md`).

## 1. Resultado por módulo

| Módulo | Contrastado contra | Resultado | Commit |
|---|---|---|---|
| Datos personales | `legajo/datos-personales/page.tsx`, `useLegajoStore.ts`, `ModalHijos`, cónyuge, validaciones, payload, catálogos | Dos divergencias corregidas (ver 2) | `8cbc5b4` |
| Documentación | `legajo/documentacion/page.tsx`, hooks, modales de carga y de adjuntos | Una divergencia corregida (ver 2) | `8cbc5b4` |
| Formación | stores y modales de Formación | Divergencias corregidas | `146bb53` |
| Trayectoria profesional | stores y modales | Divergencias corregidas | `2b1794f` |
| Extensión | stores y modales | Divergencias corregidas | `bc813e7` |
| Gestión académica | stores y modales | Divergencias corregidas | `2253c79` |
| Docencia | stores y modales | Divergencias corregidas | `3b02cf2` |
| Investigación (financiamientos y formación de RR. HH.) | stores y modales | Divergencias corregidas | `c9994925` |
| Investigación (jurados, pertenencia, categorización externa, Prinuar) | stores y modales | Divergencias corregidas | `8b957b1`, `2b2b06a` |
| Aspecto general de las pantallas | tema del portal | Pasada de UI | `1cfe34e` |
| Licencias (propias y del equipo) | ver 3 | **Sin divergencias encontradas** | (sin cambios) |
| Inicio | `(dashboard)/page.tsx`, `useGetFeriados.ts`, `useGetCumpleanios.ts` | **Sin divergencias encontradas** | (sin cambios) |
| Notificaciones | `notificaciones/page.tsx`, `useGetNotificaciones.ts`, `rutaNotificacion.ts`, `getNotificacionesEmpleado` | **Sin divergencias encontradas** | (sin cambios) |

## 2. Divergencias corregidas en esta pasada (Datos personales y Documentación)

- **Guardar datos personales** (`src/application/legajo/legajoService.ts`): el `PUT` de `useLegajoStore.actualizacionLegajo` del portal traga el error y devuelve `undefined`. La app ahora hace lo mismo: `actualizarLegajo(...).catch(() => null)` y devuelve `false` si no hay resultado. La baja del cónyuge (`eliminarFamiliar`) sigue lanzando error.
- **Modal de carga de documento** (`ModalCargarDocumento.tsx`, `DocumentacionScreen.tsx`): el encabezado muestra el nombre del documento y, debajo, su descripción (`titulo`), como el modal del portal.

## 3. Licencias: qué se contrastó y qué no

**Contrastado (portal vs app):**

- `src/stores/useLicenciasStore.ts` vs `licenciasApi.ts` / `licenciasService.ts`: FetchXML de tipos de licencia, de licencias propias y de licencias del equipo; `solicitudlicencia`, `aprobarrechazarlicencia`, `marcaradjuntocargado`, cancelación y carga de adjuntos (multipart `body{i}`).
- `ModalLicencias.tsx` (vista propia) vs `ModalVerLicencia.tsx` + `enviarCertificado`: estados que permiten adjuntar (`1`, `100000006`, `100000007`, `100000008`), límite de 15 000 000 bytes, `marcaradjuntocargado` solo en `100000007`, motivo de rechazo visible solo en `100000001`.
- `ModalLicenciasEquipo.tsx` vs `ModalLicenciaEquipo.tsx`: aprobar / rechazar solo si el usuario es `idAprobador1`, el estado es `1` o `100000007` y, cuando `certificadoobligatorio = 2` y `requierevalidacion != 100000000`, hay adjuntos; motivo de hasta 300 caracteres, obligatorio al rechazar; título "Aprobación".
- `ModalSolicitud.tsx`: esquema de domicilio y mensajes de validación (`validaciones.ts`); el armado del payload se contrastó antes con el store.
- `logConsultaTipoLicencias` **sí está** en la app (`registrarConsultaDeTipos`).

**Sin contrastar en esta pasada (queda para revisar):**

- Vacaciones: `VacacionesPanel`, `BotonesAprobacion`, los modales de vacaciones y de aprobación de vacaciones, y el calendario del portal. Los estados y las etiquetas de vacaciones ya se habían verificado al construirlos (`estados.ts`).
- Si el portal tiene un flujo de "requiere más información" para licencias (la consulta trae `new_requieremasinformacion`): en los tres modales leídos no aparece; **no se buscó en el store ni en la página** si hay otro punto de entrada. Sin confirmar.

## 4. Diferencias conscientes con el portal (acumuladas)

Las decisiones de diseño de la app que no copian el portal a la letra. Todas están pensadas para celular o para evitar un defecto del portal.

**Licencias**

- Selector de fecha con mes y año, en lugar del campo mes/año del portal.
- Certificado: si la carga del archivo falla, la app no marca el adjunto como cargado (el portal igual llama a `marcaradjuntocargado`).
- Cancelar una vacación también refresca la lista de solicitudes.
- Cancelar una licencia: si la API no devuelve texto, se muestra "No se pudo cancelar la solicitud".
- La lista de adjuntos no trae `documentbody`; el contenido se pide al abrir cada archivo.

**Datos personales**

- Aviso antes de salir con cambios sin guardar (`beforeRemove`); una sola columna; sin breadcrumb.
- Fecha vacía: mensaje "obligatoria" (el portal da un `typeError` de yup).

**Documentación**

- El check y la fecha temporales se marcan solo si la subida salió bien (el portal los marca antes y los deja aunque falle). Una respuesta vacía no es error.
- No se copia el `uiname` fijo de la consulta de adjuntos.
- Los adjuntos se piden al abrir "Ver adjuntos".

**Perfil**

- Experiencia: se exige `otroSector` cuando el sector es "Otro".
- Comité: el tope "no futura" se aplica siempre a `fechaFin`.
- Cargos externos: `fechaFin` se limpia al pasar a Vigente.
- FetchXML de encargos y externos: no se copia `uiname`.
- `new_otraunidad` queda vacío al editar.
- Docencia UA: `new_otronivel` se envía siempre. Docencia externa: los `otro*` se vacían si la opción no es "Otro/Otra". Link-entities sin uso y `uiname` no se copian.
- Producción: sin `new_tipodecaso`; `fechainicial` y `fechafinal` también se envían al editar.
- Autores: el texto "otro" / colaborador se limpia según el lugar de trabajo.
- Proyecto: los ids vacíos se omiten; `principalesResultados` se conserva.
- Financiamiento propio (PUT): el portal manda tipo y modalidad en 0; la app manda los elegidos. "Otro financiamiento" y modalidad solo con el tipo que los pide.
- Tesistas: el PUT no envía `new_colaborador`; textos de director / codirector sin uso vacíos; año previsto y fecha de defensa solo con el estado que corresponde; un único campo `tesista`.
- Dirección de becarios: siempre envía el nombre; fin nulo con "En curso".
- Perfiles: el modal del portal está roto en los campos de línea; la app implementa lo que intenta hacer (Sí/No + línea).
- Jurados: `otraActividad` / `otroRol` vacíos salvo "Otro".
- Categorización externa: las columnas que no corresponden a la categoría van en null; con "Otra" el lugar no se manda como lookup; no se manda la unidad certificante; la app lee y escribe el lugar no UA en `insotor` (el portal escribe `new_lugardetrabajouniv`, que no se pudo rastrear en el código); con UA = Sí la categoría no es obligatoria. `new_categoria_investigador_conicet` se manda vacío.
- Prinuar: el modal del portal oculta la UA pero igual la exige (defecto del portal); la app la pide en el formulario.

## 5. Sin verificar / abierto

- La escritura de `new_lugardetrabajouniv` del portal (ver Categorización externa): no se encontró dónde se persiste.
- Íconos de Ionicons que no se confirmaron contra el set instalado: `person-circle-outline`, `alert-circle-outline`, `chevron-forward`, `folder-open-outline` (más los que ya figuran en `PENDIENTES.md`).
- `FormacionScreen` conserva `any` en el formulario (el valor del selector es una opción de lista).
- El aspecto de campos y diálogos contra los overrides del tema del portal (`input`, `dialog`, pestañas): no se contrastó campo por campo.
- Vacaciones y el flujo "requiere más información" (ver 3).

## 6. Cómo leer esto

"Sin divergencias encontradas" quiere decir que, leyendo los archivos citados, la lógica coincide. **No** quiere decir que funcione: nada se ejecutó. Las pruebas las hace Daniel con la PC.
