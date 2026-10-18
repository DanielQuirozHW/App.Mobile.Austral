# Decisiones

Decisiones tomadas por Daniel. Se actualiza.

## 2026-10-18

1. **Objetivo**: app mobile React Native que hace lo mismo que el Portal Austral y consume la misma API, sin modificarla. Proyecto de prueba.
2. **Repo**: `DanielQuirozHW/App.Mobile.Austral`, en su cuenta, solo para test.
3. **Fuente de verdad**: el código del portal manda en lógica. El prototipo `Protoype-RN` es solo referencia de estructura y forma de programar. La documentación de los repos no es fuente.
4. **Repos de referencia**: solo lectura, solo por el conector MCP de GitHub. Nunca se modifican.
5. **Construcción desde cero**: sin clonar ni hacer fork del prototipo, sin copiar su historial.
6. **REGLA FUNDAMENTAL**: se construye sin probar absolutamente nada y sin usar ninguna credencial. Donde haya credenciales se deja el lugar vacío. Las pruebas las hace Daniel cuando esté avanzado.
7. **Primer módulo**: Datos personales, migrado completo (incluida Familia con documentación).
8. **Login**: se migra todo lo del portal, incluido SAML, sin probar.
9. **Usuario de servicio de la API**: llega por variables de entorno vacías. El tenant lo fija el claim `cliente` de ese usuario.
10. **Entrega**: todo se entrega completo, nunca fragmentos.
