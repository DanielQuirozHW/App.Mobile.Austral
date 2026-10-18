# App Mobile Austral

App mobile (React Native) para el cliente Austral. Hace lo mismo que el Portal Austral y consume la misma API. Es un proyecto de prueba/test.

## Estado

En construcción. Está escrita la base del proyecto (configuración, entorno, tema, componentes base y providers). Todavía no hay pantallas ni carpetas nativas (`android/` e `ios/`): se generan con el comando oficial de React Native, ver [`docs/SETUP-NATIVO.md`](docs/SETUP-NATIVO.md).

## Cómo se trabaja acá

- El proyecto se construye sin probar nada y sin usar credenciales. Las pruebas las hace Daniel cuando esté avanzado.
- La lógica sale del código del Portal Austral. La estructura y la forma de programar React Native salen de un prototipo de referencia.
- La API no se modifica.
- Las reglas completas están en [`CLAUDE.md`](CLAUDE.md).

## Stack

React Native 0.88 sin Expo, TypeScript, react-navigation, zustand, TanStack Query, react-hook-form + yup, axios, date-fns, React Native Firebase, Reanimated. Detalle y versiones en [`docs/STACK.md`](docs/STACK.md).

## Documentación

- [`docs/DECISIONES.md`](docs/DECISIONES.md): decisiones tomadas.
- [`docs/PENDIENTES.md`](docs/PENDIENTES.md): lo que falta.
- [`docs/ERRORES.md`](docs/ERRORES.md): errores a no repetir.
- [`docs/contexto/`](docs/contexto): lo que se entendió del código del portal, la API y el prototipo.

## Variables de entorno

`.env.template` lista solo los nombres de las variables, sin valores. Los valores reales se cargan en un archivo `.env` local que no se commitea. La configuración de Firebase no va en variables: sale de `google-services.json` y `GoogleService-Info.plist`, que tampoco se commitean.
