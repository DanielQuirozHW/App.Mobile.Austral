# ESTADO — dónde estamos y qué hacer al retomar

Este archivo es el punto de entrada para una sesión nueva. Se actualiza al final de cada etapa. Última actualización: 2026-10-27 (menú como el del portal, secciones en construcción, encabezado con campana y Cambiar puesto en todas las pantallas, script de frases; decisión 100; ver `AUDITORIA-PARIDAD.md`, sección 2e).

## 0. ALCANCE REAL (leer primero)

**La app es un MVP de DEMOSTRACIÓN para que Austral decida si le gusta. NO es la idea migrar todos los módulos.** Lo que tiene que estar muy bien es lo general (estructura, configuración, menús, modo de color, notificaciones, aspecto del portal) y alcanzan unos pocos módulos de prueba: **módulo 1 = Mi perfil completo** (Datos personales, Documentación, Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación), **módulo 2 = Licencias y vacaciones** y **Plan de trabajo** (solo docente; habilitado en la decisión 98). El menú es el del portal completo: lo que no se migra (Promoción, Gestión del Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU) figura y dice "En construcción" (decisión 100). Detalle, reporte de lo terminado y lo que queda en [`ALCANCE-MVP.md`](ALCANCE-MVP.md).

**No se construyen módulos nuevos ni mejoras de módulos salvo pedido expreso de Daniel. Si pregunta "con qué seguimos", se le da un listado con una recomendación y se espera su respuesta: no se programa.**

## 1. Qué hacer apenas se abre una sesión nueva

1. Leer `CLAUDE.md` (reglas y mapa del repo), `docs/ALCANCE-MVP.md` y este archivo. Después `docs/DECISIONES.md`, `docs/DECISIONES_89_en_adelante.md` y `docs/DECISIONES_99_en_adelante.md`, `docs/AUDITORIA-PARIDAD.md`, `docs/PENDIENTES.md` y, según el tema, el archivo de `docs/contexto/`.
2. Los repos se leen y escriben **solo por el conector MCP de GitHub** (herramientas `get_file_contents` y `push_files`; si aparecen diferidas, cargarlas con ToolSearch). No se clona nada, no se usa `git`, no se usa `add_repo`.
3. **Escritura solo en `DanielQuirozHW/App.Mobile.Austral`, rama `main`.** Verificar owner/repo en cada `push_files`. Los otros tres repos son solo lectura.
4. **No se construye nada nuevo sin que Daniel lo elija** (sección 0). Lo que sí vale: pulir lo general y los módulos de la demo.
5. Si Daniel pide algo concreto: leer primero el código del portal, construir por capas (`domain` → `infrastructure` → `application` → `presentation`), documentar decisiones numeradas en `docs/DECISIONES_99_en_adelante.md` (la próxima es la **101**) y actualizar este archivo, `PENDIENTES.md` y el mapa de `CLAUDE.md`.

## 2. Qué está hecho (todo escrito, nada probado)

| Etapa | Qué | Decisiones | Contrato verificado |
|---|---|---|---|
| 1 | Base del proyecto: configuración, entorno, tema del portal, responsive, componentes base, providers | 16 a 27 | `docs/STACK.md` |
| 2 | Cliente HTTP con reintentos, token de servicio, endpoints (falta leer el uso de `UnidadDeNegocio`) | 28, 29 | `contexto/cliente-http-y-endpoints.md` |
| 3 | Autenticación: login Microsoft (proveedor de Firebase) y email, validación del empleado, `usuarios` en Firestore, cierre de sesión. Sin registro ni recuperar contraseña | 8, 18, 30 a 36 | `contexto/portal-auth-y-tenant.md` |
| 4 | Navegación por estado, selección de puesto, overlay de cierre de sesión | 35, 41 | `contexto/roles-puesto-y-fotos.md` |
| 5 | Foto de perfil, foto de portada y cabecera del legajo; iniciales con la fórmula del portal; borde del avatar de 3 px | 45, 47, 88, 92 | `contexto/roles-puesto-y-fotos.md` |
| 6 | Datos personales completo (Identidad, Contacto, Domicilio real, Familia con documentación, Contacto de emergencia) con aviso de cambios sin guardar | 37 a 44 | `contexto/datos-personales.md` |
| 8 | Licencias y vacaciones (licencias, vacaciones, calendario, equipo) | 48 a 56 | `contexto/licencias-y-vacaciones.md` |
| 9 a 12 | Perfil completo: Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación (Afiliaciones, Actividad I+D, Resultados / Impacto I+D). Promoción figura como "En construcción" (decisión 100) | 57 a 74, 87, 93, 100 | `contexto/perfil.md` |
| 13 | Plan de Trabajo (solo docente): lista, detalle, 18 secciones de registros, resumen con adjuntos y envío. **Habilitado en el menú** | 75 a 87, 98 | `contexto/plan-de-trabajo.md` |
| 14 | Tablero de Inicio real: bienvenida, mensaje del mes (textos por cargar con el script), cumpleaños del día, próximos feriados y accesos | 89, 92, 93, 100 | `contexto/inicio.md` |
| 15 | Notificaciones: pendientes / completadas / todas, filtros por módulo y fecha, "Ir", marcar como leída y marcar todas | 90, 96 | `contexto/notificaciones.md` |
| 16 | Documentación del legajo: documentos requeridos del empleado, "Ver adjuntos" y "Cargar archivo" | 91 | `contexto/documentacion.md` |
| 17 | MVP de demostración: menú lateral, selector de modo de color (Sistema / Claro / Oscuro), pantalla Ajustes, corrección de la zona segura bajo el encabezado | 92 | `docs/DECISIONES_89_en_adelante.md` (propio de la app; el portal no tiene estas pantallas) |
| 18 | Módulo 1 = Mi perfil completo: pantalla `MiPerfil`, menú reagrupado, campana con pendientes, pantalla de error general, márgenes y títulos de Perfil corregidos | 93 | `docs/DECISIONES_89_en_adelante.md` (propio de la app) |
| 19 | Auditoría de paridad con el portal de todos los módulos del MVP (leyendo el código): divergencias corregidas en Perfil, Datos personales, Documentación, panel de Vacaciones, calendario y pestañas; Licencias, Inicio y Notificaciones sin divergencias encontradas | 94, 95 | `docs/AUDITORIA-PARIDAD.md` |
| 20 | Aspecto contra los overrides del tema del portal: bordes en dos tokens (`border` divisor, `inputBorder` campos), pestañas subrayadas, `Etiqueta` neutra visible, diálogo con radio 16 y borde, márgenes duplicados quitados en Notificaciones y Plan de Trabajo | 96, 97 | `docs/AUDITORIA-PARIDAD.md`, sección 2c |
| 21 | Revisión estática (colores escritos a mano → tokens), pull-to-refresh en `Screen` y siete pantallas, botón "Reintentar" en listas y Notificaciones, Plan de trabajo habilitado | 98 | `docs/AUDITORIA-PARIDAD.md`, sección 2d |
| 22 | **Cambiar puesto; menú lateral en árbol como el del portal; secciones que no se migran "En construcción"; encabezado de todas las pantallas con Cambiar puesto, campana con contador y menú; cartel del puesto; script de importación de las frases** | 99, 100 | `docs/AUDITORIA-PARIDAD.md`, sección 2e |

**Navegación actual:** menú lateral (botón de hamburguesa en el encabezado de cada pantalla y en la barra de Inicio) con el árbol del portal: Inicio, Legajo (Datos personales para docente / codocente, Documentación), Perfil (Formación, Trayectoria, Extensión, Gestión académica, Docencia con sus cinco subpáginas, Investigación con sus tres), Licencias y vacaciones, Plan de Trabajo (solo docente), Gestión del Desempeño e Indicadores (Staff, en construcción), Funciones SA / VRAA y Referente MATHU (solo docente con la posición; en construcción) y, aparte, Notificaciones y Ajustes. El encabezado de cada pantalla lleva Cambiar puesto (con más de un puesto), la campana con la cantidad de pendientes y el menú. Inicio tiene accesos a Mi perfil y a Licencias y vacaciones. El árbol está en `src/presentation/navigation/modulosMenu.ts` (`SECCIONES_DE_MENU`); la lista plana de módulos con pantalla propia (`ITEMS_DE_MENU`, `enDemo`, `accesoInicio`) sigue en el mismo archivo.

## 3. Qué NO está hecho

**Módulos: no se hacen** (aclarado el 2026-10-26; ver sección 0). Ni las mejoras de Plan de Trabajo, Licencias y Vacaciones, ni Nombramientos y Promoción (etapa 7), ni GDD, Indicadores, Funciones SA / VRAA, Referente MATHU, Promoción > Postulación. Esas entradas **figuran en el menú y dicen "En construcción"** (decisión 100). Las notificaciones de esos módulos se muestran, pero "Ir" avisa que la sección no está disponible.

**Notificaciones en tiempo real: no se hacen** (Daniel, 2026-10-27; decisión 96). No volver a proponerlo. **Tamaño de letra A- / A / A+: no** (Daniel, 2026-10-27).

**Botón de ayuda del encabezado del portal: no migrado.** Es "Preguntas frecuentes" y solo abre dos PDF de Licencias y vacaciones; los PDF son archivos del portal que habría que sumar a la app (decisión 100).

**Lo general que se puede pulir (a elección de Daniel; detalle en `ALCANCE-MVP.md`):** la revisión estática quedó hecha para casi todo `src/` (decisiones 97 y 98). Falta leer los modales de formulario (`Modal*`, `FormInv*`), los componentes de `pta/` que no se leyeron (`ModalSeccionPta`, `DatosDocenciaPta`, `DatosInvestigacionPta`, `ejecutarPta`), `PlanTrabajoDetalleScreen`, `components/inicio` y `components/notificaciones` (ver `AUDITORIA-PARIDAD.md`, sección 5). Y conectar el pull-to-refresh en las pantallas que faltan (MiPerfil, GestionAcademica, Docencia, Investigación, Ajustes). La **lógica** de los componentes internos de Investigación y de `components/perfil/*` ya se auditó contra el portal (decisión 94) y su margen y colores se revisaron en las decisiones 97 y 98; las líneas de `CLAUDE.md` que dicen "sin revisar", "Plan de trabajo vacío" o describen el menú agrupado en cuatro grupos quedaron superadas.

**Pendiente de la auditoría (ver `AUDITORIA-PARIDAD.md`, secciones 3 y 5):** el diálogo de confirmación de `RespuestaLider`, `ModalCalendario`, la grilla de gestión (`GestionSolicitudes`, `?tipo=`) y `columnsVacaciones`; confirmar si el portal tiene un flujo de "requiere más información" para licencias; íconos sin verificar; `new_lugardetrabajouniv`.

**Otros pendientes:**

- **Daniel debe correr `node scripts/importar-frases.js <ruta al frases-mensuales.ts del portal>`** para cargar los 18 textos del mensaje del mes en `src/domain/inicio/frasesMensuales.ts` (decisiones 89 y 100). Hasta entonces la tarjeta no se dibuja. El script no se probó.
- Lectura de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) del portal, por si hace falta otra variable de entorno.
- Leer el guard del layout del dashboard del portal (`src/app/(dashboard)/layout.tsx` o equivalente) para confirmar qué rutas ve cada rol (afecta a Documentación y Notificaciones, hoy abiertas a todos los roles por inferencia).
- Lo que figura como inferido o sin verificar está en `docs/PENDIENTES.md` (tabla "Falta verificar"). Cada punto dice en qué archivo del código está.
- Revisión estática archivo por archivo del resto de `src/`: ver arriba y `docs/VERIFICACIONES.md`.

## 4. Orden de trabajo acordado con Daniel (2026-10-26)

Daniel no tiene la PC, así que se avanza solo con lo que se puede hacer leyendo y escribiendo, sin credenciales. Orden original:

1. **Configuración y estructura** — hecho: archivos de configuración revisados, librerías contrastadas con documentación oficial (`docs/VERIFICACIONES.md`), README actualizado. Queda la revisión estática del resto de `src/`.
2. **Cerrar los puntos inferidos leyendo el portal** — hecho (decisión 87). Lo que sigue inferido está en `PENDIENTES.md`.
3. **UI**: iniciales del avatar y foto de portada — hechas (decisión 88); borde del avatar de la cabecera (3 px azulLight) — hecho (decisión 92); márgenes y títulos de Perfil — hechos (decisión 93); aspecto contra los overrides del tema del portal — hecho (decisión 97); colores a tokens, pull-to-refresh y reintentos — hechos (decisión 98). **Falta**: el encabezado del Plan de Trabajo (`PlanTrabajoPageHeader`).
4. **Módulos nuevos**: Tablero de Inicio (hecho, decisión 89), notificaciones (hecho, decisión 90) y Documentación (hecho, decisión 91). **Aclaración posterior de Daniel (2026-10-26): no se siguen sumando módulos ni mejoras. El objetivo es un MVP de demostración (sección 0).**
5. **Base general de la demo** (menú, modo de color, Ajustes) — hecha por pedido de Daniel (decisión 92).
6. **Módulo 1 = todo el perfil, campana con pendientes, pantalla de error** — hecho por pedido de Daniel (decisión 93).
7. **Auditoría de paridad de todos los módulos del MVP** — hecha por pedido de Daniel (decisiones 94 y 95); quedan los puntos listados en la sección 3.
8. **Aspecto contra el tema del portal y márgenes** — hecho por pedido de Daniel (decisión 97).
9. **Revisión estática, pull-to-refresh, reintentos y Plan de trabajo habilitado** — hecho por pedido de Daniel (decisión 98).
10. **Cambiar puesto, menú como el del portal, secciones en construcción, encabezado con campana y script de frases** — hecho por pedido de Daniel (decisiones 99 y 100).
11. Nombramientos y Promoción: **ya no se hace** salvo pedido expreso.

Si Daniel tiene la PC: pasa primero el checklist de `docs/SETUP-NATIVO.md`, sección 6, y las correcciones que salgan de las pruebas van antes que lo anterior.

## 5. Lo que hace Daniel (configuración fuera del código)

Lista completa, ordenada y con checklist en [`SETUP-NATIVO.md`](SETUP-NATIVO.md). Lo central:

- Generar `android/` e `ios/` con el comando oficial de React Native (son carpetas que se crean automáticamente) y combinar con este repo.
- Registrar las apps iOS / Android en Firebase y habilitar el proveedor Microsoft (más el registro en Microsoft Entra).
- Crear el `.env` local con los valores reales (nombres en `.env.template`; nunca se commitea). `PORTAL_CAE_URL` es opcional.
- Agregar las fuentes Montserrat y copiar los logos del portal a `src/assets/images` (completar `logos.ts`).
- Permisos nativos (cámara, galería), orientación vertical, configuración de los paquetes nativos.
- Cargar los 18 textos del mensaje del mes con `node scripts/importar-frases.js <ruta al frases-mensuales.ts del portal>` (`frasesMensuales.ts`).
- Todas las pruebas.

No preguntar ni insistir con estos temas: están listados y los hace Daniel cuando decida.

## 6. Cómo trabaja Daniel (preferencias que ya dijo)

- Español rioplatense, directo y breve. Responder solo lo que preguntó.
- **Si pide un listado para elegir, se le da el listado y se espera. No se programa.**
- **La idea es un MVP chico para que el cliente decida; no se migran todos los módulos** (sección 0).
- Entregar todo **completo**, nunca fragmentos (`push_files` reemplaza el archivo entero: para cambiar un archivo se reenvía completo).
- Separar siempre lo verificado en el código de lo supuesto. Citar repo + ruta.
- La app es la versión mobile del **portal de Austral**: colores, textos y lógica salen del portal, no del prototipo. **Entre verse bien y seguir la UI del portal, importa más verse bien; los colores sí deben seguir al portal en claro y oscuro** (2026-10-27).
- **No dejar revisiones a medias**: si se anuncia una revisión, terminarla (o decir explícitamente qué quedó sin leer). Daniel lo reclamó el 2026-10-27.
- **Lo que Daniel pide varias veces se verifica contra el código del portal antes de darlo por hecho** (Cambiar puesto, 2026-10-27).
- No probar nada y no usar credenciales, nunca.
- No justificar una recomendación técnica con "no se puede probar".
- No volver a plantear la seguridad del usuario de servicio del portal, ni preguntar por la publicación de las apps o el registro en Firebase.
- No proponer notificaciones en tiempo real (decisión 96) ni tamaño de letra.
- Avanzar sin pedir aprobación por etapa **dentro de lo que pide**; frenar solo ante una decisión irreversible o una duda real.
- No copiar datos de personas ni de ejemplo del código del portal (decisión 67). Tampoco pasajes de libros (decisiones 89 y 100): las frases del mes se copian con el script, no con el chat.

## 7. Trampas conocidas del conector (aprendidas)

- `search_code` del conector no es confiable: navegar con `get_file_contents` sobre directorios y archivos.
- No usar `download_url` con token ni ninguna descarga por otra vía.
- En `push_files`, pasar `owner`, `repo`, `branch`, `message` y `files` como parámetros separados, bien formados; el contenido va inline. Un `push_files` armado a mano como un único texto JSON crudo falla con "could not be parsed as JSON": usar siempre los parámetros normales de la herramienta.
- Los mensajes de commit no llevan secuencias literales como `\uXXXX`, y terminan con las dos líneas de atribución que indique la sesión (`Co-Authored-By` y `Claude-Session`).
- Los archivos pueden estar en subcarpetas inesperadas (por ejemplo `components/licencias/Pestanias.tsx`): listar el directorio antes de asumir la ruta.
- Los binarios (logos, fuentes, PDF) no se pueden subir por el conector: los copia Daniel.
- `WebFetch` solo abre URLs que ya salieron en una búsqueda o que dio Daniel: para leer documentación hay que buscar primero y abrir el resultado.
- Los resultados grandes de `get_file_contents` se guardan en disco como JSON; el texto está en `.[0].text` (con `jq -r`). Extraerlos con `jq` antes de leerlos. `CLAUDE.md` (más de 63 000 caracteres) cae en este caso.
- Las copias de trabajo en la carpeta temporal de la sesión pueden estar viejas: antes de editar un archivo, traer su versión del repo.
- `DECISIONES.md` pesa casi 70 000 caracteres: las decisiones nuevas van en `DECISIONES_89_en_adelante.md` y `DECISIONES_99_en_adelante.md` para no reenviarlo entero. `PENDIENTES.md` también es muy largo (más de 58 000 caracteres): lo nuevo de la auditoría se anotó en `AUDITORIA-PARIDAD.md`.

## 8. Mapa de documentos

| Archivo | Para qué |
|---|---|
| `CLAUDE.md` | Reglas, jerarquía de fuentes, alcance y mapa del código |
| `docs/ALCANCE-MVP.md` | **Alcance real (MVP de demostración), reporte de lo terminado y lo que queda** |
| `docs/ESTADO.md` | Este archivo: estado y qué hacer al retomar |
| `docs/AUDITORIA-PARIDAD.md` | **Auditoría contra el portal: qué se contrastó, qué se corrigió, diferencias conscientes y lo abierto** |
| `docs/DECISIONES.md` | Decisiones numeradas (1 a 88) |
| `docs/DECISIONES_89_en_adelante.md` | Decisiones numeradas 89 a 98 |
| `docs/DECISIONES_99_en_adelante.md` | Decisiones numeradas desde la 99 |
| `docs/PENDIENTES.md` | Decisiones abiertas, tareas externas y puntos por verificar |
| `docs/VERIFICACIONES.md` | Lo contrastado con documentación oficial, con su fuente |
| `docs/SETUP-NATIVO.md` | Checklist de lo que hace Daniel con la PC |
| `docs/STACK.md` | Librerías y versiones aprobadas |
| `docs/ERRORES.md` | Errores cometidos y reglas para no repetirlos |
| `docs/contexto/*.md` | Contrato verificado del portal por módulo |
| `.claude/skills/` | Skills de trabajo del repo |
