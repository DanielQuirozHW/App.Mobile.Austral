---
name: ui-componentes-propios
description: Usar al crear o modificar componentes y pantallas de la app. Reglas de UI con StyleSheet, el tema y los componentes base que ya existen.
---

# UI con StyleSheet y componentes propios

No hay librería de UI. Los componentes se escriben en `src/presentation/components` con `StyleSheet`. La referencia de estilo es el prototipo (`docs/contexto/prototipo-estructura.md`).

## Componentes que ya existen (etapa 1)

`AppText`, `AppButton`, `AppTextField`, `AppIcon`, `Screen`, `LoadingScreen`. Se reutilizan antes de crear otro. Los que faltan (selector, campo de fecha, modal, tarjeta, avatar) se crean cuando un módulo confirmado los necesita.

## Reglas

- Colores solo desde `useThemeColors().globalColors`. Ningún color escrito a mano en componentes.
- Texto solo con `AppText` y los tokens de `typography` (Poppins para títulos y valores; opensans-regular para el resto).
- Medidas desde `responsive.ts`: `spacing`, `borderRadius`, `iconSizes`, `scale()`, `platformFontSizes`. Sombras con `platformSpecific.shadow(n)`.
- Estilos en una función `createStyles(...)` con `StyleSheet.create`, llamada dentro de `useMemo`. Los sub-componentes pesados van en `React.memo` y reciben `globalColors` por props.
- Botones y tarjetas tocables con `Pressable` y `android_ripple`. No `TouchableOpacity`.
- Alto táctil mínimo: `platformSpecific.minTouchTarget` (44 iOS / 48 Android).
- Android: no combinar `overflow: 'hidden'` y `elevation` en el mismo View.
- Cabeceras y pantallas con `useSafeAreaInsets` (`Screen` ya lo hace). No `SafeAreaView` combinado con `paddingTop`.
- Modales tipo hoja inferior: `Modal` → capa oscura → `KeyboardAwareScrollView` → contenido con `height: '100%'` y `paddingTop` (no `marginTop`).
- Íconos solo con `AppIcon`.
- Animaciones de entrada con Reanimated. Accesibilidad: `accessibilityRole`, `accessibilityLabel` y `accessibilityState` en lo interactivo.
- Formularios: `react-hook-form` con `Controller` sobre `AppTextField`. Los mensajes de error son los del portal.

## Paleta

Los valores de `colors.ts` son provisorios (vienen del prototipo). Cambiar la paleta es tocar solo ese archivo.
