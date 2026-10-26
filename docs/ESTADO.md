# ESTADO — dónde estamos y qué hacer al retomar

Este archivo es el punto de entrada para una sesión nueva. Se actualiza al final de cada etapa. Última actualización: 2026-10-26 (auditoría de paridad con el portal de todos los módulos del MVP; decisión 94; ver `AUDITORIA-PARIDAD.md`).

## 0. ALCANCE REAL (leer primero)

**La app es un MVP de DEMOSTRACIÓN para que Austral decida si le gusta. NO es la idea migrar todos los módulos.** Lo que tiene que estar muy bien es lo general (estructura, configuración, menús, modo de color, notificaciones, aspecto del portal) y alcanzan dos módulos de prueba: **módulo 1 = Mi perfil completo** (Datos personales, Documentación, Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación) y **módulo 2 = Licencias y vacaciones**. Plan de trabajo está en el menú pero **vacío**. Detalle, reporte de lo terminado y lo que queda en [`ALCANCE-MVP.md`](ALCANCE-MVP.md).

**No se construyen módulos nuevos ni mejoras de módulos salvo pedido expreso de Daniel. Si pregunta "con qué seguimos", se le da un listado con una recomendación y se espera su respuesta: no se programa.**

## 1. Qué hacer apenas se abre una sesión nueva

1. Leer `CLAUDE.md` (reglas y mapa del repo), `docs/ALCANCE-MVP.md` y este archivo. Después `docs/DECISIONES.md` y `docs/DECISIONES_89_en_adelante.md`, `docs/AUDITORIA-PARIDAD.md`, `docs/PENDIENTES.md` y, según el tema, el archivo de `docs/contexto/`.
2. Los repos se leen y escriben **solo por el conector MCP de GitHub** (herramientas `get_file_contents` y `push_files`; si aparecen diferidas, cargarlas con ToolSearch). No se clona nada, no se usa `git`, no se usa `add_repo`.
3. **Escritura solo en `DanielQuirozHW/App.Mobile.Austral`, rama `main`.** Verificar owner/repo en cada `push_files`. Los otros tres repos son solo lectura.
4. **No se construye nada nuevo sin que Daniel lo elija** (sección 0). Lo que sí vale: pulir lo general y los módulos de la demo.
5. Si Daniel pide algo concreto: leer primero el código del portal, construir por capas (`domain` → `infrastructure` → `application` → `presentation`), documentar decisiones numeradas en `docs/DECISIONES_89_en_adelante.md` (la próxima es la **95**) y actualizar este archivo, `PENDIENTES.md` y el mapa de `CLAUDE.md`.

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
| 9 a 12 | Perfil completo: Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación (Afiliaciones, Actividad I+D, Resultados / Impacto I+D). Sin Promoción > Postulación | 57 a 74, 87, 93 | `contexto/perfil.md` |
| 13 | Plan de Trabajo (solo docente): lista, detalle, 18 secciones de registros, resumen con adjuntos y envío | 75 a 87 | `contexto/plan-de-trabajo.md` |
| 14 | Tablero de Inicio real: bienvenida, mensaje del mes (textos por cargar), cumpleaños del día, próximos feriados y accesos | 89, 92, 93 | `contexto/inicio.md` |
| 15 | Notificaciones: pendientes / completadas / todas, filtros por módulo y fecha, "Ir", marcar como leída y marcar todas | 90 | `contexto/notificaciones.md` |
| 16 | Documentación del legajo: documentos requeridos del empleado, "Ver adjuntos" y "Cargar archivo" | 91 | `contexto/documentacion.md` |
| 17 | MVP de demostración: menú lateral, selector de modo de color (Sistema / Claro / Oscuro), pantalla Ajustes, módulos fuera de la demo vacíos, corrección de la zona segura bajo el encabezado | 92 | `docs/DECISIONES_89_en_adelante.md` (propio de la app; el portal no tiene estas pantallas) |
| 18 | Módulo 1 = Mi perfil completo: pantalla `MiPerfil`, menú reagrupado, campana con pendientes, pantalla de error general, márgenes y títulos de Perfil corregidos | 93 | `docs/DECISIONES_89_en_adelante.md` (propio de la app) |
| 19 | **Auditoría de paridad con el portal de todos los módulos del MVP (leyendo el código): divergencias corregidas en Perfil, Datos personales y Documentación; Licencias, Inicio y Notificaciones sin divergencias encontradas** | 94 | `docs/AUDITORIA-PARIDAD.md` |

**Navegación actual:** menú lateral (botón de hamburguesa en el encabezado de cada pantalla y en la barra de Inicio) con los módulos en cuatro grupos: Principal (Inicio, Notificaciones), Mi perfil (Mi perfil, Datos personales para docente / codocente, Documentación, Formación, Trayectoria profesional, Extensión, Gestión académica, Docencia, Investigación), Gestión (Licencias y vacaciones; Plan de trabajo solo docente, **vacío**) y Cuenta (Ajustes). Inicio tiene accesos a Mi perfil y a Licencias y vacaciones. El catálogo está en `src/presentation/navigation/modulosMenu.ts` (`enDemo`, `accesoInicio`).

## 3. Qué NO está hecho

**Módulos: no se hacen** (aclarado el 2026-10-26; ver sección 0). Ni las mejoras de Plan de Trabajo, Licencias y Vacaciones, ni Nombramientos y Promoción (etapa 7), ni GDD, Indicadores, Funciones SA / VRAA, Referente MATHU, Promoción > Postulación. Las notificaciones de esos módulos se muestran, pero "Ir" avisa que la sección no está disponible.

**Lo general que se puede pulir (a elección de Daniel; detalle en `ALCANCE-MVP.md`):** contrastar el aspecto con los overrides del tema del portal (campos, diálogos, pestañas), tiempo real de notificaciones (dependencia nueva). La **lógica** de los componentes internos de Investigación y de `components/perfil/*` ya se auditó contra el portal (decisión 94); las líneas de `ALCANCE-MVP.md`, `CLAUDE.md` y de la decisión 93 que dicen "sin revisar" quedaron superadas por esa auditoría.

**Pendiente de la auditoría (ver `AUDITORIA-PARIDAD.md`, secciones 3 y 5):** contrastar Vacaciones (panel, modales, aprobación, calendario) con el portal; confirmar si el portal tiene un flujo de "requiere más información" para licencias; íconos sin verificar; `new_lugardetrabajouniv`.

**Otros pendientes:**

- **Daniel debe pegar los 18 textos del mensaje del mes** en `src/domain/inicio/frasesMensuales.ts` (ver decisión 89). Hasta entonces la tarjeta no se dibuja.
- Lectura de `UnidadDeNegocio` (`NEXT_PUBLIC_UNIDAD_NEGOCIO`) del portal, por si hace falta otra variable de entorno.
- Leer el guard del layout del dashboard del portal (`src/app/(dashboard)/layout.tsx` o equivalente) para confirmar qué rutas ve cada rol (afecta a Documentación y Notificaciones, hoy abiertas a todos los roles por inferencia).
- Lo que figura como inferido o sin verificar está en `docs/PENDIENTES.md` (tabla "Falta verificar"). Cada punto dice en qué archivo del código está.
- Revisión estática archivo por archivo del resto de `src/` (solo se revisaron la configuración, el Plan de Trabajo y lo escrito para el menú, Ajustes y Mi perfil; ver `docs/VERIFICACIONES.md`).

## 4. Orden de trabajo acordado con Daniel (2026-10-26)

Daniel no tiene la PC, así que se avanza solo con lo que se puede hacer leyendo y escribiendo, sin credenciales. Orden original:

1. **Configuración y estructura** — hecho: archivos de configuración revisados, librerías contrastadas con documentación oficial (`docs/VERIFICACIONES.md`), README actualizado. Queda la revisión estática del resto de `src/`.
2. **Cerrar los puntos inferidos leyendo el portal** — hecho (decisión 87). Lo que sigue inferido está en `PENDIENTES.md`.
3. **UI**: iniciales del avatar y foto de portada — hechas (decisión 88); borde del avatar de la cabecera (3 px azulLight) — hecho (decisión 92); márgenes y títulos de Perfil — hechos (decisión 93). **Falta**: contrastar el aspecto con los overrides del tema del portal (`src/@core/theme/overrides`) y el encabezado del Plan de Trabajo (`PlanTrabajoPageHeader`, hoy módulo vacío en la demo).
4. **Módulos nuevos**: Tablero de Inicio (hecho, decisión 89), notificaciones (hecho, decisión 90) y Documentación (hecho, decisión 91). **Aclaración posterior de Daniel (2026-10-26): no se siguen sumando módulos ni mejoras. El objetivo es un MVP de demostración (sección 0).**
5. **Base general de la demo** (menú, modo de color, Ajustes, módulos vacíos) — hecha por pedido de Daniel (decisión 92).
6. **Módulo 1 = todo el perfil, campana con pendientes, pantalla de error** — hecho por pedido de Daniel (decisión 93).
7. **Auditoría de paridad de todos los módulos del MVP** — hecha por pedido de Daniel (decisión 94); queda Vacaciones.
8. Nombramientos y Promoción: **ya no se hace** salvo pedido expreso.

Si Daniel tiene la PC: pasa primero el checklist de `docs/SETUP-NATIVO.md`, sección 6, y las correcciones que salgan de las pruebas van antes que lo anterior.

## 5. Lo que hace Daniel (configuración fuera del código)

Lista completa, ordenada y con checklist en [`SETUP-NATIVO.md`](SETUP-NATIVO.md). Lo central:

- Generar `android/` e `ios/` con el comando oficial de React Native (son carpetas que se crean automáticamente) y combinar con este repo.
- Registrar las apps iOS / Android en Firebase y habilitar el proveedor Microsoft (más el registro en Microsoft Entra).
- Crear el `.env` local con los valores reales (nombres en `.env.template`; nunca se commitea). `PORTAL_CAE_URL` es opcional.
- Agregar las fuentes Montserrat y copiar los logos del portal a `src/assets/images` (completar `logos.ts`).
- Permisos nativos (cámara, galería), orientación vertical, configuración de los paquetes nativos.
- Pegar los 18 textos del mensaje del mes (`frasesMensuales.ts`).
- Todas las pruebas.

No preguntar ni insistir con estos temas: están listados y los hace Daniel cuando decida.

## 6. Cómo trabaja Daniel (preferencias que ya dijo)

- Español rioplatense, directo y breve. Responder solo lo que preguntó.
- **Si pide un listado para elegir, se le da el listado y se espera. No se programa.**
- **La idea es un MVP chico para que el cliente decida; no se migran todos los módulos** (sección 0). Los que no son de la demo quedan en el menú, vacíos.
- Entregar todo **completo**, nunca fragmentos (`push_files` reemplaza el archivo entero: para cambiar un archivo se reenvía completo).
- Separar siempre lo verificado en el código de lo supuesto. Citar repo + ruta.
- La app es la versión mobile del **portal de Austral**: colores, textos y lógica salen del portal, no del prototipo.
- No probar nada y no usar credenciales, nunca.
- No justificar una recomendación técnica con "no se puede probar".
- No volver a plantear la seguridad del usuario de servicio del portal, ni preguntar por la publicación de las apps o el registro en Firebase.
- Avanzar sin pedir aprobación por etapa **dentro de lo que pide**; frenar solo ante una decisión irreversible o una duda real.
- No copiar datos de personas ni de ejemplo del código del portal (decisión 67). Tampoco pasajes de libros (decisión 89).

## 7. Trampas conocidas del conector (aprendidas)

- `search_code` del conector no es confiable: navegar con `get_file_contents` sobre directorios y archivos.
- No usar `download_url` con token ni ninguna descarga por otra vía.
- En `push_files`, pasar `owner`, `repo`, `branch`, `message` y `files` como parámetros separados, bien formados; el contenido va inline. Un `push_files` armado a mano como un único texto JSON crudo falla con "could not be parsed as JSON": usar siempre los parámetros normales de la herramienta.
- Los mensajes de commit no llevan secuencias literales como `\uXXXX`, y terminan con las dos líneas de atribución que indique la sesión (`Co-Authored-By` y `Claude-Session`).
- Los archivos pueden estar en subcarpetas inesperadas (por ejemplo `components/licencias/Pestanias.tsx`): listar el directorio antes de asumir la ruta.
- Los binarios (logos, fuentes) no se pueden subir por el conector: los copia Daniel.
- `WebFetch` solo abre URLs que ya salieron en una búsqueda o que dio Daniel: para leer documentación hay que buscar primero y abrir el resultado.
- Los resultados grandes de `get_file_contents` se guardan en disco como JSON; el texto está en `.[0].text` (con `jq -r`). Extraerlos con `jq` antes de leerlos.
- Las copias de trabajo en la carpeta temporal de la sesión pueden estar viejas: antes de editar un archivo, traer su versión del repo.
- `DECISIONES.md` pesa casi 70 000 caracteres: las decisiones nuevas van en `DECISIONES_89_en_adelante.md` para no reenviarlo entero. `PENDIENTES.md` también es muy largo (más de 58 000 caracteres): lo nuevo de la auditoría se anotó en `AUDITORIA-PARIDAD.md`.

## 8. Mapa de documentos

| Archivo | Para qué |
|---|---|
| `CLAUDE.md` | Reglas, jerarquía de fuentes, alcance y mapa del código |
| `docs/ALCANCE-MVP.md` | **Alcance real (MVP de demostración), reporte de lo terminado y lo que queda** |
| `docs/ESTADO.md` | Este archivo: estado y qué hacer al retomar |
| `docs/AUDITORIA-PARIDAD.md` | **Auditoría contra el portal: qué se contrastó, qué se corrigió, diferencias conscientes y lo abierto** |
| `docs/DECISIONES.md` | Decisiones numeradas (1 a 88) |
| `docs/DECISIONES_89_en_adelante.md` | Decisiones numeradas desde la 89 |
| `docs/PENDIENTES.md` | Decisiones abiertas, tareas externas y puntos por verificar |
| `docs/VERIFICACIONES.md` | Lo contrastado con documentación oficial, con su fuente |
| `docs/SETUP-NATIVO.md` | Checklist de lo que hace Daniel con la PC |
| `docs/STACK.md` | Librerías y versiones aprobadas |
| `docs/ERRORES.md` | Errores cometidos y reglas para no repetirlos |
| `docs/contexto/*.md` | Contrato verificado del portal por módulo |
| `.claude/skills/` | Skills de trabajo del repo |
