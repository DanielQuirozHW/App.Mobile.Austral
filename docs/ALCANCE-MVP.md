# ALCANCE — esto es un MVP de DEMOSTRACIÓN, NO una migración de todo el portal

**Leer antes que cualquier otra cosa. Aclarado por Daniel el 2026-10-26.**

## La idea

Presentar a Austral una app **chica y prolija** para que decidan si les gusta y si quieren seguir. Por eso:

- **Lo que tiene que estar muy bien: lo general.** Estructura del proyecto, configuración, navegación y menús, modo de color (claro / oscuro), notificaciones, aspecto igual al del portal (colores en ambos modos), login, cabecera, avisos y manejo de errores.
- **De módulos: pocos y bien hechos.** **Módulo 1 = Mi perfil completo** (Datos personales, Documentación, Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación; decisión 93). **Módulo 2 = Licencias y vacaciones.** **Plan de trabajo** (solo docente) se habilitó el 2026-10-27 (decisión 98). No se migran los demás.
- **NO es la idea migrar todos los módulos del portal.** Si Austral decide seguir, ahí se migra el resto.
- Hoy **no queda ningún módulo vacío** en el menú. Si se quiere dejar alguno vacío, alcanza con poner `enDemo: false` en el catálogo.

## Reglas para cualquier sesión nueva

1. **No construir módulos nuevos ni mejoras de módulos ya hechos** salvo que Daniel lo pida de forma expresa en esa conversación.
2. Si Daniel pregunta "con qué seguimos" o pide un listado: **dar el listado con una recomendación y esperar su respuesta. No programar.**
3. El trabajo que sí vale: terminar y pulir lo **general** (ver la sección de abajo) y los módulos de la demo.
4. Todo lo que ya está escrito de módulos queda como está. No se borra, pero no se amplía.
5. **Notificaciones en tiempo real (SignalR): no** (decisión 96).

Error registrado: el 2026-10-26 Daniel pidió un listado para elegir con qué seguir y se construyó Documentación sin que la eligiera. No repetir. (Después Daniel pidió expresamente que Documentación y todo el perfil fueran el módulo 1: decisión 93.)

## Cómo se decide qué módulos se ven en la demo

Un solo archivo: `src/presentation/navigation/modulosMenu.ts`. Cada módulo tiene `enDemo`:

- `true`: abre su pantalla real. Si además tiene `accesoInicio`, aparece como botón en Inicio (hoy Mi perfil y Licencias y vacaciones).
- `false`: sigue en el menú, pero abre `ModuloVacioScreen` ("Este módulo todavía no está disponible en la versión de demostración.").

Para cambiar los módulos de la demo alcanza con cambiar ese valor. El código de los módulos que se dejen vacíos no se borra.

## Reporte: qué está terminado (todo escrito, nada probado)

### Módulos y pantallas

| Qué | Estado | En la demo |
|---|---|---|
| Login (Microsoft y email) y selección de puesto | Escrito | Sí, es base |
| Inicio (barra con campana con pendientes y menú, bienvenida, mensaje del mes, cumpleaños, feriados, accesos) | Escrito; faltan los 18 textos del mensaje del mes (los pega Daniel); pull-to-refresh de las notificaciones | Sí, es base |
| Menú lateral | Escrito | Sí, es base |
| Ajustes (modo de color, cuenta, cerrar sesión) | Escrito | Sí, es base |
| Notificaciones | Escrito (sin tiempo real: recarga cada 5 minutos, al abrir, con "Actualizar" y con pull-to-refresh); "Reintentar" si falla | Sí, es base |
| Mi perfil (pantalla de entrada con cabecera y lista de secciones) | Escrito | **Sí (módulo 1)** |
| Datos personales (Identidad, Contacto, Domicilio, Familia, Emergencia) | Escrito completo | **Sí (módulo 1)** |
| Documentación del legajo | Escrito; pull-to-refresh | **Sí (módulo 1)** |
| Perfil (Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación) | Escrito, 6 pantallas; márgenes y títulos corregidos; pull-to-refresh en Formación, Trayectoria y Extensión | **Sí (módulo 1)** |
| Licencias y vacaciones (licencias, vacaciones, calendario, equipo) | Escrito completo; "Reintentar" en las listas | **Sí (módulo 2)** |
| Plan de Trabajo (solo docente) | Escrito; pull-to-refresh en la lista | **Sí (habilitado el 2026-10-27, decisión 98)** |
| Mejoras de Plan de Trabajo, Licencias y Vacaciones | **No se hacen** | No |
| Nombramientos y Promoción (etapa 7), GDD, Indicadores, Funciones SA / VRAA, Referente MATHU, Promoción > Postulación | **No se hacen** | No figuran |

### Lo general (lo que realmente importa)

| Qué | Estado |
|---|---|
| Estructura por capas, configuración y entorno sin valores | Hecho y revisado (`VERIFICACIONES.md`) |
| Tema con colores, tipografía y radios del portal | Hecho; contrastado con `palette` y los overrides principales (campos, tarjetas, diálogos, pestañas, chips) en la decisión 97; colores escritos a mano reemplazados por tokens en la 98 |
| **Menú lateral** con todos los módulos agrupados, foto y nombre arriba, cerrar sesión abajo | **Hecho** (decisiones 92 y 93) |
| **Modo de color** Sistema / Claro / Oscuro, guardado en el celular | **Hecho** (decisión 92); el login sigue en claro como el portal |
| **Pantalla de Ajustes** | **Hecho** (decisión 92) |
| Notificaciones, con la cantidad de pendientes en la campana de Inicio | Hecho (decisión 93) |
| Cabecera con foto de perfil y portada | Hecho; borde del avatar ajustado a 3 px azulLight como el portal |
| Encabezado de las pantallas: botón de menú y sin hueco de más arriba | Hecho (decisión 92) |
| Márgenes de las pantallas (sin padding duplicado) y sin títulos repetidos | Hecho (decisiones 93 y 97) |
| Pantalla de error general ("Algo salió mal" con Reintentar) | Hecho (decisión 93) |
| Pull-to-refresh (`Screen`, prop `onRefresh`) y "Reintentar" en errores de lista | Hecho en las pantallas principales (decisión 98); faltan MiPerfil, GestionAcademica, Docencia, Investigación y Ajustes |
| Avisos (toasts), confirmación al salir con cambios sin guardar, manejo de errores | Hecho |
| Logos y fuentes Montserrat | Los carga Daniel (`SETUP-NATIVO.md`) |
| Proyecto nativo (`android/`, `ios/`), Firebase, `.env`, pruebas | Los hace Daniel (`SETUP-NATIVO.md`) |

## Lo general que todavía se puede pulir (a elección de Daniel; no se hace nada hasta que lo pida)

1. Conectar el pull-to-refresh en las pantallas que faltan (MiPerfil, GestionAcademica, Docencia, Investigación, Ajustes). En Datos personales no conviene: es un formulario y refrescar podría pisar lo que se edita.
2. Terminar la revisión estática de lo que no se leyó: modales de formulario (`Modal*`, `FormInv*`), componentes de `pta/` restantes y `PlanTrabajoDetalleScreen`, `components/inicio`, `components/notificaciones`, `components/menu` (ver `AUDITORIA-PARIDAD.md`, sección 5).
3. Pegar los 18 textos del mensaje del mes (lo hace Daniel).

Ya resuelto: aspecto contra los overrides del tema (decisión 97) y márgenes y colores de `components/perfil/*` (decisiones 97 y 98). Descartado: tiempo real de las notificaciones (decisión 96).
