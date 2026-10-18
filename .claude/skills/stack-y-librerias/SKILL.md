---
name: stack-y-librerias
description: Usar antes de agregar, cambiar o actualizar cualquier dependencia, o al dudar qué librería corresponde. Fija el stack aprobado y cómo se verifica una versión.
---

# Stack y librerías

El stack aprobado y sus versiones verificadas están en `docs/STACK.md`. Las decisiones que lo explican, en `docs/DECISIONES.md` (16 a 20).

## Reglas

1. Se elige por mérito técnico para esta app. No por "lo usa el portal" ni por "lo usa el prototipo".
2. Una versión se verifica en la web: registro de npm (`https://registry.npmjs.org/<paquete>/latest`) o el sitio oficial. Nunca en los repos de referencia ni de memoria.
3. Además de la versión, se leen las `peerDependencies`. Los paquetes de React Native Firebase deben tener todos la misma versión que `@react-native-firebase/app`.
4. Si una fuente no da el dato (fecha de publicación, API de una versión), se dice que no se verificó y se anota en `docs/PENDIENTES.md`. No se completa de memoria.
5. Toda dependencia nueva o cambiada se registra en `docs/STACK.md` y en `package.json`, y si es una desviación de una decisión de Daniel, en `docs/DECISIONES.md`.
6. No se instala nada ni se ejecuta nada: el `package.json` se edita a mano.
7. "No se puede probar" nunca es la razón de una elección.

## No se usa

Expo, UI Kitten, React Native Paper, moment, dayjs, react-native-fs, react-native-file-viewer, el paquete único `react-native-vector-icons`, el SDK web de Firebase, Redux.

## Firebase

React Native Firebase. La configuración sale de `google-services.json` y `GoogleService-Info.plist`, no de variables de entorno. Login con Microsoft: `OAuthProvider('microsoft.com')` con el flujo nativo del SDK (rnfirebase.io/auth/social-auth).
