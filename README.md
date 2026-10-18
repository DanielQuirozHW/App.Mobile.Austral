# App Mobile Austral

App mobile (React Native) para el cliente Austral. Hace lo mismo que el Portal Austral y consume la misma API. Es un proyecto de prueba/test.

## Estado

En construcción. Por ahora el repo tiene solo la base de contexto (reglas, documentos y skills). Todavía no hay código de la app.

## Cómo se trabaja acá

- El proyecto se construye sin probar nada y sin usar credenciales. Las pruebas las hace Daniel cuando esté avanzado.
- La lógica sale del código del Portal Austral. La estructura y la forma de programar React Native salen de un prototipo de referencia.
- La API no se modifica.
- Las reglas completas están en [`CLAUDE.md`](CLAUDE.md).

## Contexto

Lo que se entendió del código está en [`docs/contexto/`](docs/contexto). Las decisiones tomadas están en [`docs/DECISIONES.md`](docs/DECISIONES.md) y lo que falta, en [`docs/PENDIENTES.md`](docs/PENDIENTES.md).

## Variables de entorno

`.env.template` lista solo los nombres de las variables, sin valores. Los valores reales se cargan en un archivo `.env` local que no se commitea.
