# ALCANCE — esto es un MVP de DEMOSTRACIÓN, NO una migración de todo el portal

**Leer antes que cualquier otra cosa. Aclarado por Daniel el 2026-10-26.**

## La idea

Presentar a Austral una app **chica y prolija** para que decidan si les gusta y si quieren seguir. Por eso:

- **Lo que tiene que estar muy bien: lo general.** Estructura del proyecto, configuración, navegación y menús, modo de color (claro / oscuro), notificaciones, aspecto igual al del portal (colores en ambos modos), login, cabecera, avisos y manejo de errores.
- **De módulos: pocos y bien hechos.** **Módulo 1 = Mi perfil completo** (Datos personales, Documentación, Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación; decisión 93). **Módulo 2 = Licencias y vacaciones.** **Plan de trabajo** (solo docente) se habilitó el 2026-10-27 (decisión 98). No se migran los demás.
- **NO es la idea migrar todos los módulos del portal.** Si Austral decide seguir, ahí se migra el resto.
- **El menú es el del portal completo** (decisión 100, pedido de Daniel el 2026-10-27): lo que no se migra (**Promoción**, Gestión del Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU) figura en el menú y, al entrar, dice **"En construcción"**. Los módulos migrados no quedan vacíos.

## Reglas para cualquier sesión nueva

1. **No construir módulos nuevos ni mejoras de módulos ya hechos** salvo que Daniel lo pida de forma expresa en esa conversación.
2. Si Daniel pregunta "con qué seguimos" o pide un listado: **dar el listado con una recomendación y esperar su respuesta. No programar.**
3. El trabajo que sí vale: terminar y pulir lo **general** (ver la sección de abajo) y los módulos de la demo.
4. Todo lo que ya está escrito de módulos queda como está. No se borra, pero no se amplía.
5. **Notificaciones en tiempo real (SignalR): no** (decisión 96).
6. **Promoción no se migra** (Daniel, 2026-10-27): ni dentro de Docencia ni en Funciones SA / VRAA / Referente MATHU. Solo figura el menú.

Error registrado: el 2026-10-26 Daniel pidió un listado para elegir con qué seguir y se construyó Documentación sin que la eligiera. No repetir. (Después Daniel pidió expresamente que Documentación y todo el perfil fueran el módulo 1: decisión 93.)

## Cómo se decide qué módulos se ven en la demo

Un solo archivo: `src/presentation/navigation/modulosMenu.ts`. Tiene dos estructuras: `ITEMS_DE_MENU` (módulos con pantalla propia; cada uno con `enDemo`) y `SECCIONES_DE_MENU` (el árbol del menú lateral, igual al del portal).

- `enDemo: true`: abre su pantalla real. Si además tiene `accesoInicio`, aparece como botón en Inicio (hoy Mi perfil y Licencias y vacaciones).
- `enDemo: false`: sigue en el menú, pero abre `ModuloVacioScreen` ("En construcción").
- En el árbol, una entrada con `enConstruccion: true` abre la pantalla "En construcción" con su título.

Para cambiar los módulos de la demo alcanza con cambiar esos valores. El código de los módulos que se dejen vacíos no se borra.

## Reporte: qué está terminado (todo escrito, nada probado)

### Módulos y pantallas

| Qué | Estado | En la demo |
|---|---|---|
| Login (Microsoft y email) y selección de puesto | Escrito | Sí, es base |
| Inicio (barra con Cambiar puesto, campana con pendientes y menú, cartel del puesto, bienvenida, mensaje del mes, cumpleaños, feriados, accesos) | Escrito; faltan los 18 textos del mensaje del mes (los copia el script `scripts/importar-frases.js`, que corre Daniel); pull-to-refresh de las notificaciones | Sí, es base |
| Menú lateral (árbol como el del portal, con grupos que se abren) | Escrito | Sí, es base |
| Ajustes (modo de color, cuenta, cerrar sesión) | Escrito | Sí, es base |
| Notificaciones | Escrito (sin tiempo real: recarga cada 5 minutos, al abrir, con "Actualizar" y con pull-to-refresh); "Reintentar" si falla | Sí, es base |
| Mi perfil (pantalla de entrada con cabecera y lista de secciones) | Escrito | **Sí (módulo 1)** |
| Datos personales (Identidad, Contacto, Domicilio, Familia, Emergencia) | Escrito completo | **Sí (módulo 1)** |
| Documentación del legajo | Escrito; pull-to-refresh | **Sí (módulo 1)** |
| Perfil (Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación) | Escrito, 6 pantallas; márgenes y títulos corregidos; pull-to-refresh en Formación, Trayectoria y Extensión; Docencia e Investigación se abren directo en cada pestaña desde el menú; **Promoción dentro de Docencia: "En construcción"** | **Sí (módulo 1)** |
| Licencias y vacaciones (licencias, vacaciones, calendario, equipo) | Escrito completo; "Reintentar" en las listas | **Sí (módulo 2)** |
| Plan de Trabajo (solo docente) | Escrito; pull-to-refresh en la lista | **Sí (habilitado el 2026-10-27, decisión 98)** |
| Mejoras de Plan de Trabajo, Licencias y Vacaciones | **No se hacen** | No |
| Promoción, Gestión del Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU | **No se migran** | Figuran en el menú y dicen "En construcción" (decisión 100) |
| Nombramientos y Promoción (etapa 7), Promoción > Postulación | **No se hacen** | Figuran solo como entradas en construcción |

### Lo general (lo que realmente importa)

| Qué | Estado |
|---|---|
| Estructura por capas, configuración y entorno sin valores | Hecho y revisado (`VERIFICACIONES.md`) |
| Tema con colores, tipografía y radios del portal | Hecho; contrastado con `palette` y los overrides principales (campos, tarjetas, diálogos, pestañas, chips) en la decisión 97; colores escritos a mano reemplazados por tokens en la 98 |
| **Menú lateral** como el del portal (Legajo, Perfil con Docencia e Investigación, Licencias, Plan de Trabajo, Gestión del Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU), foto y nombre arriba, cartel del puesto, Cambiar puesto y cerrar sesión abajo | **Hecho** (decisiones 92, 93, 99 y 100) |
| **Modo de color** Sistema / Claro / Oscuro, guardado en el celular | **Hecho** (decisión 92); el login sigue en claro como el portal |
| **Pantalla de Ajustes** | **Hecho** (decisión 92) |
| **Encabezado de todas las pantallas**: Cambiar puesto (con más de un puesto), campana con la cantidad de pendientes y menú | **Hecho** (decisión 100) |
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
2. Terminar la revisión estática de lo que no se leyó: modales de formulario (`Modal*`, `FormInv*`), componentes de `pta/` restantes y `PlanTrabajoDetalleScreen`, `components/inicio`, `components/notificaciones` (ver `AUDITORIA-PARIDAD.md`, sección 5).
3. Correr `node scripts/importar-frases.js <ruta al frases-mensuales.ts del portal>` para cargar los 18 textos del mensaje del mes (lo hace Daniel).
4. Botón de ayuda del portal ("Preguntas frecuentes"): solo muestra PDF en Licencias y vacaciones; hay que sumar esos PDF a la app (los copia Daniel).

Ya resuelto: aspecto contra los overrides del tema (decisión 97), márgenes y colores de `components/perfil/*` (decisiones 97 y 98), menú como el del portal y encabezado completo (decisión 100). Descartado: tiempo real de las notificaciones (decisión 96) y tamaño de letra (Daniel, 2026-10-27).
