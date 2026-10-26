# Tablero de Inicio

Fuente: `HW-Austral/Portal-Austral-Dev`, leído el 2026-10-26. Construido en la app el mismo día (decisión 89 de `DECISIONES_89_en_adelante.md`). Todo escrito sin probar.

## Qué muestra el portal (verificado)

`src/app/(dashboard)/page.tsx`, en este orden:

1. **Bienvenida** (`WelcomeBlock`): "Bienvenido, {nombre}" y el subtítulo "Portal SIP – Universidad Austral". El nombre sale de `user.nombre` o, si no existe, del primer nombre de `user.fullname` (formato del CRM "Apellido, Nombre": se toma la primera palabra después de la coma; sin coma, la primera palabra), con la primera letra en mayúscula y el resto en minúscula. Sin nombre: "Usuario".
2. **Mensaje del mes** (`FraseDelMes`): una frase de la lista `FRASES_MENSUALES` (18 entradas en `src/@core/data/frases-mensuales.ts`). Índice = `((((año − 2026) × 12 + (mes0 − 5)) % 18) + 18) % 18`, o sea junio de 2026 es la primera y el ciclo se repite cada 18 meses. Rotulado "Mensaje · {mes} de {año}" con la fuente "{LIBRO}, {número}".
3. **Cumpleaños del día** (`CumpleaniosCard`): empleados activos cuyo día y mes de `new_fechanacimiento` (leídos en UTC) coinciden con hoy en Argentina. Sin nadie: "No hay cumpleaños hoy". El portal también tiene "Aniversarios del mes", pero la página pasa siempre una lista vacía: no se construye.
4. **Próximos feriados** (`ProximosFeriadosCard`): los tres primeros feriados activos desde hoy (inclusive); el primero se destaca. Sin feriados: "No hay feriados próximos".

El portal también registra un evento de analytics ("Inicio"): no se replica. `QuickAccessCard`, `QuickAccessGrid` y `SectionLabel` existen en `src/@core/components/austral/` pero la página no los usa.

## Lecturas (verificado)

Ambas son POST `api/consultafetchs` con Bearer del usuario de servicio.

| Qué | entidad (colección) | FetchXML |
|---|---|---|
| Feriados | `new_diasferiadoses` | `<entity name="new_diasferiados">` con `new_name`, `new_fecha`, `new_diasferiadosid`, orden `new_fecha` descendente, `statecode = 0` (`src/hooks/useGetFeriados.ts`; con `reintentarVacio` y 3 reintentos) |
| Empleados | `new_empleados` | `<entity name='new_empleado'>` con `new_name`, `new_fechanacimiento`, `new_unidadorganizativa`, orden `new_fechanacimiento`, `statecode = 0` (`src/hooks/useGetCumpleanios.ts`; sin reintentos; caché de módulo que vence al cambiar el día en Argentina) |

La unidad se lee de `_new_unidadorganizativa_value@OData.Community.Display.V1.FormattedValue`.

## Cómo quedó en la app

- `domain/inicio/tablero.ts`: reglas puras (feriados, cumpleaños, frase, saludo).
- `domain/inicio/frasesMensuales.ts`: número, libro y autor de las 18 frases. **El texto de cada una está vacío a propósito**: son pasajes de libros publicados y no se copian al repo. **Tarea de Daniel**: pegar cada `texto` desde `src/@core/data/frases-mensuales.ts` del portal, en el mismo orden. Hasta entonces la tarjeta no se muestra.
- `infrastructure/inicio/tableroApi.ts`: las dos lecturas (reusan `leerCatalogoFetchXml`) y la caché diaria.
- `presentation/hooks/useTablero.ts` (TanStack Query), `presentation/components/inicio/*` y `presentation/screens/InicioScreen.tsx` (debajo del tablero quedan los accesos a los módulos, con "Notificaciones (N)" en primer lugar, y el cierre de sesión).

## Diferencias con el portal (conscientes)

- **Fecha de hoy en Argentina**: el portal usa `Intl.DateTimeFormat` con `America/Argentina/Buenos_Aires`; la app resta 3 horas fijas (Argentina no tiene horario de verano desde 2009), para no depender de `Intl` en el celular. El rótulo de la fecha usa meses cortos propios ("SEPT" para septiembre, como `es-AR`; inferido).
- **Spinner de feriados**: en el portal `loadingFeriados` nunca llega a ser `true` (se inicializa en `false`), así que no se ve; la app muestra el indicador de carga mientras se leen.
- **Cumpleaños sin indicador de carga ni error visible**, como el portal.
- **Mes del feriado**: abreviatura de `date-fns` en español ("dic", "sep"); el portal usa la de `dayjs` (misma salida esperada, inferido).
- **Dark mode de la frase**: color liso (`surfaceElevated`) en lugar del degradado del portal.
- **Tipografía editorial** (`fontFamilyEditorial`) de la comilla decorativa: no se leyó; se usa la tipografía del tema.
- Íconos de las tarjetas: `gift-outline` y `sparkles-outline` en lugar de `mdi:cake-variant-outline` y `mdi:party-popper`; `calendar-outline` por `mdi:calendar-outline`.

## Sigue inferido

- Que `AppText` tenga las variantes `h1`, `h4` y `overline` con el aspecto esperado (existen en la escala; no se miró cada una).
- Que los nombres `gift-outline` y `sparkles-outline` existan en Ionicons (el tipo `AppIconName` lo valida al compilar).
- Que la respuesta de `consultafetchs` conserve la clave `..._value@OData.Community.Display.V1.FormattedValue` (es la que lee el portal).
