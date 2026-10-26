# App Mobile Austral

App mobile (React Native) para el cliente Austral. Es la versión mobile del Portal Austral: hace lo mismo, se ve como el portal y consume la misma API. Es un proyecto de prueba/test.

## Estado

El código de los módulos pedidos está escrito, **sin probar**: ingreso (Microsoft y email), selección de puesto, Datos personales, Licencias y vacaciones, Perfil completo y Plan de Trabajo (solo docente). Los demás módulos del portal quedan pendientes hasta que se pidan.

Todavía no existen las carpetas nativas (`android/` e `ios/`): se generan con el comando oficial de React Native, ver [`docs/SETUP-NATIVO.md`](docs/SETUP-NATIVO.md). Ahí también está el checklist, en orden, de lo que se hace con la PC.

Para retomar el trabajo: [`CLAUDE.md`](CLAUDE.md) y [`docs/ESTADO.md`](docs/ESTADO.md).

## Cómo se trabaja acá

- El proyecto se construye sin probar nada y sin usar credenciales. Las pruebas las hace Daniel cuando esté avanzado.
- La lógica y el aspecto salen del código del Portal Austral. La estructura y la forma de programar React Native salen de un prototipo de referencia.
- La API no se modifica.
- Las reglas completas están en [`CLAUDE.md`](CLAUDE.md).

## Stack

React Native 0.88 sin Expo, TypeScript, react-navigation (native-stack), zustand, TanStack Query, react-hook-form + yup, axios, date-fns, React Native Firebase, Reanimated. Detalle y versiones en [`docs/STACK.md`](docs/STACK.md).

## Estructura del código

`src/config` (entorno y cliente HTTP) · `src/domain` (reglas sin UI) · `src/infrastructure` (llamadas a la API, Firebase, archivos) · `src/application` (flujos) · `src/presentation` (pantallas, componentes, stores, tema, navegación). El mapa completo está en [`CLAUDE.md`](CLAUDE.md).

## Documentación

- [`docs/ESTADO.md`](docs/ESTADO.md): estado actual y qué hacer al retomar.
- [`docs/DECISIONES.md`](docs/DECISIONES.md): decisiones tomadas.
- [`docs/PENDIENTES.md`](docs/PENDIENTES.md): lo que falta y lo que hay que verificar.
- [`docs/VERIFICACIONES.md`](docs/VERIFICACIONES.md): lo contrastado con documentación oficial, con su fuente.
- [`docs/SETUP-NATIVO.md`](docs/SETUP-NATIVO.md): proyecto nativo, configuración y checklist de pruebas.
- [`docs/ERRORES.md`](docs/ERRORES.md): errores a no repetir.
- [`docs/contexto/`](docs/contexto): lo que se entendió del código del portal, la API y el prototipo.

## Variables de entorno

`.env.template` lista solo los nombres de las variables, sin valores. Los valores reales se cargan en un archivo `.env` local que no se commitea. La configuración de Firebase no va en variables: sale de `google-services.json` y `GoogleService-Info.plist`, que tampoco se commitean.
