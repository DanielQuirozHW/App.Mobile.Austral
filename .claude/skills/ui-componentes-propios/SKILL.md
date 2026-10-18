---
name: ui-componentes-propios
description: Usar al crear o modificar componentes y pantallas de la app. La apariencia es la del portal de Austral; reglas de UI con StyleSheet, el tema y los componentes base que ya existen.
---

# UI con StyleSheet y componentes propios

**La app es la versión mobile del portal de Austral. Su aspecto sale del portal** (colores, tipografía, radios, sombras, logos, textos), no del prototipo. Ver `docs/ERRORES.md` (error 11) y `docs/DECISIONES.md` (26).

No hay librería de UI. Los componentes se escriben en `src/presentation/components` con `StyleSheet`. Del prototipo solo se toma la forma de programar (`docs/contexto/prototipo-estructura.md`).

## De dónde sale cada cosa del portal (`HW-Austral/Portal-Austral-Dev`)

| Qué | Archivo del portal |
|---|---|
| Paleta clara y oscura | `src/@core/theme/palette/index.ts` |
| Tipografía | `src/@core/theme/typography/index.ts`, `src/styles/fonts.ts` |
| Botones | `src/@core/theme/overrides/button.ts` |
| Campos de formulario | `src/@core/theme/overrides/input.ts` |
| Tarjetas | `src/@core/theme/overrides/card.ts` |
| Otros componentes (select, diálogo, chip, tabla, tabs, alertas, menú) | `src/@core/theme/overrides/*.ts` — leer el que corresponda antes de construir el componente |
| Configuración general (nombre, modo por defecto) | `src/configs/themeConfig.ts` |
| Pantalla de ingreso | `src/app/(blank)/login-portal/page.tsx` |

## Componentes que ya existen

`AppText`, `AppButton`, `AppTextField`, `AppIcon`, `Screen`, `LoadingScreen`. Se reutilizan antes de crear otro. Los que faltan (selector, campo de fecha, modal, tarjeta, avatar) se crean cuando un módulo confirmado los necesita, leyendo antes el estilo del portal.

## Reglas

- Colores solo desde `useThemeColors().globalColors`. Ningún color escrito a mano en componentes.
- Texto solo con `AppText` y los tokens de `typography` (`h1`…`h6`, `body1`, `body2`, `subtitle1`, `subtitle2`, `button`, `label`, `caption`, `overline`, `helper`), que son la escala del portal. El peso se elige con la familia (`Montserrat-*`), no con `fontWeight`.
- Medidas desde `responsive.ts`: `spacing`, `borderRadius` (campo y botón 6, tarjeta 10), `iconSizes`, `scale()`. Sombras con `platformSpecific.shadow(n)`.
- Estilos en una función `createStyles(...)` con `StyleSheet.create`, llamada dentro de `useMemo`. Los sub-componentes pesados van en `React.memo` y reciben `globalColors` por props.
- Botones y tarjetas tocables con `Pressable` y `android_ripple`. No `TouchableOpacity`.
- Alto táctil mínimo: `platformSpecific.minTouchTarget` (44 iOS / 48 Android). Es la única diferencia deliberada con el portal (en web los campos miden 36 px).
- Etiqueta del campo arriba (no flotante), asterisco rojo en obligatorios, texto de error en rojo debajo, como en el portal.
- Android: no combinar `overflow: 'hidden'` y `elevation` en el mismo View.
- Cabeceras y pantallas con `useSafeAreaInsets` (`Screen` ya lo hace). No `SafeAreaView` combinado con `paddingTop`.
- Modales tipo hoja inferior: `Modal` → capa oscura → `KeyboardAwareScrollView` → contenido con `height: '100%'` y `paddingTop` (no `marginTop`).
- Íconos solo con `AppIcon`. El portal usa íconos de Material Design Icons (`mdi:*`); `AppIcon` usa Ionicons: mapear al ícono equivalente.
- Animaciones con Reanimated. Accesibilidad: `accessibilityRole`, `accessibilityLabel` y `accessibilityState` en lo interactivo.
- Formularios: `react-hook-form` con `Controller` sobre `AppTextField`. Los mensajes de error son los del portal.
