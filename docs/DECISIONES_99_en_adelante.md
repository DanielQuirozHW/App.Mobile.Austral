# Decisiones 99 en adelante

Continuación de [`DECISIONES_89_en_adelante.md`](DECISIONES_89_en_adelante.md) (decisiones 89 a 98). La próxima es la **100**. (`DECISIONES_89_en_adelante.md` y `ESTADO.md` todavía dicen "la próxima es la 99": vale esta lista; se unifican en el próximo reenvío de esos archivos.)

## 2026-10-27 (Cambiar puesto)

99. **"Cambiar puesto"** (pedido de Daniel con capturas del portal: el portal tiene el botón "Cambiar puesto" en el encabezado). Antes la app solo mostraba la pantalla de selección de puesto justo después de iniciar sesión; no había forma de volver a elegir sin cerrar sesión.
    - **Qué hace**: cuando el usuario tiene **más de un puesto** (`useRolStore().userRoles.length > 1`), aparece "Cambiar puesto" (ícono `swap-horizontal-outline`) en la barra de Inicio y arriba de "Cerrar sesión" en el menú lateral. Toca `marcarSeleccionPendiente()`: `RootNavigator` vuelve a mostrar `SeleccionarPuesto` (ya funcionaba así tras el login), y al elegir se llama `seleccionar(rol)`, que guarda el puesto y vuelve a Inicio con el menú del puesto elegido (Plan de trabajo solo docente; Datos personales docente / codocente).
    - Con un solo puesto el botón no se muestra (igual que el portal, inferido: no se leyó el componente del encabezado del portal que lo dibuja).
    - **Sin verificar**: el ícono `swap-horizontal-outline` contra el set de Ionicons instalado; cómo se comporta la pantalla de selección cuando se entra desde adentro (no se releyó `SeleccionarPuestoScreen`: si no tiene "volver", quien se arrepiente elige el mismo puesto).
    - **No incluido** (el portal los tiene en el encabezado, la app no): botón de ayuda, tamaño de letra A- / A / A+ y el cartel "Usted se encuentra en el Portal Staff" (el puesto se ve en el encabezado del menú lateral). Gestión del Desempeño e Indicadores (menú del puesto Staff) tampoco: no se migran (ver `ALCANCE-MVP.md`).
    - Nada probado ni llamado a la API.
