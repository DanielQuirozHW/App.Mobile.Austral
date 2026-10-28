# Decisión: la app tiene diseño de app mobile, no de portal

Fecha: 2026-10-28. Pedido de Daniel tras ver la primera versión en el emulador.

## Qué cambia respecto del criterio anterior

Hasta ahora la app copiaba el aspecto del portal (tipografía Montserrat, textos de 11 a 14, rótulos en mayúsculas,
menú lateral con grupos desplegables, formularios en una página larga). Se ve como el portal en versión responsive.

Desde esta decisión:

- **La lógica sigue siendo la del portal** (flujos, validaciones, endpoints, reglas por puesto y por función). No cambia.
- **El diseño y la navegación son propios de una app mobile.** Los colores institucionales (azul y cian de Austral) se
  mantienen.

## Qué se hizo

| Tema | Antes | Ahora |
|---|---|---|
| Acceso a módulos | Menú lateral con grupos desplegables | Grilla de íconos en Inicio (3 por fila) |
| Módulos con varias entradas | Grupo que se despliega | Pantalla de subopciones con tarjetas grandes (`screens/SubmenuScreen.tsx`) |
| Cambiar puesto, Ajustes, Cerrar sesión | Menú lateral y encabezado | Hoja que sube desde abajo, desde el avatar (`components/menu/MenuLateral.tsx`) |
| Encabezado | Cambiar puesto + campana + hamburguesa | Campana + avatar |
| Tipografía | Montserrat, 11 a 14 | Del sistema, lectura de 16, títulos de 20 a 28, sin mayúsculas forzadas |
| Botones y campos | Alto 44 y radio 6 | Botones 52/56 y campos 52, radios 12 a 20 |
| Login | Fondo beige, rotulos en mayúsculas, "Portal SIP" | Fondo limpio, saludo corto, SSO como acción principal |
| Datos personales | Página larga con secciones 01 a 05 | Secciones colapsables con resumen y botón "Guardar cambios" fijo |

## Reglas que se mantienen

- Quién ve qué: sale del árbol de `navigation/modulosMenu.ts` (`SECCIONES_DE_MENU` + `filtrarNodos`), el mismo que usaba
  el menú lateral. La grilla y las subpantallas se arman desde ahí.
- Los módulos sin contenido (los que no están `enDemo` o están "en construcción") figuran con la etiqueta
  "Próximamente" y abren la pantalla "En construcción".

## Pendientes de esta decisión

- Solo se rediseñó a mano: Inicio, subpantallas, menú del usuario, login, selección de puesto y Datos personales.
  El resto de las pantallas (Documentación, Perfil, Licencias, Plan de trabajo, Notificaciones, Ajustes) heredan la
  nueva tipografía, colores, botones y campos, pero no se revisaron una por una. Se ajustan según lo que se vea al probar.
- Los archivos `components/menu/BotonCambiarPuesto.tsx` y `components/inicio/SaludoInicio.tsx` ya no se usan.
  Quedan en el repo hasta confirmar que no hacen falta.
- Las fuentes Montserrat ya no se necesitan: el paso de fuentes de `docs/SETUP-NATIVO.md` se puede omitir.
