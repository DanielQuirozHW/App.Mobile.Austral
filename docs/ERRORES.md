# Errores cometidos y reglas para no repetirlos

Registro de errores reales de esta sesión de trabajo. Se actualiza cada vez que Daniel corrige algo.

| # | Qué pasó | Regla |
|---|---|---|
| 1 | Se buscó código del portal en el sistema de archivos local en lugar de leerlo por el conector. | El código de los repos de referencia se lee solo por el conector MCP de GitHub. |
| 2 | La búsqueda de código del conector (`search_code`) tiene el índice incompleto. | Para confirmar algo, leer el archivo directamente. |
| 3 | Se dijo que UI Kitten tenía "mantenimiento dudoso" sin evidencia. | No afirmar nada sobre una librería sin una fuente. Si no hay fuente, decir que no se verificó. |
| 4 | Se justificó `dayjs` con "el portal lo usa". | Se migra el portal, no se copia su elección. Las librerías se eligen por mérito, con fuente. |
| 5 | Se usó "no se puede probar" como razón para evitar carpetas nativas y dependencias, y para proponer Expo. | Esa nunca es la razón principal. Las pruebas las hace Daniel. |
| 6 | Se explicó SAML de forma que parecía "SAML no funciona en una app web". | Separar siempre lo que se verificó (SAML funciona en web) de lo que no (soporte nativo en mobile). |
| 7 | Se revisaron versiones mirando los repos en lugar de la web. | Las versiones se verifican en el registro de npm o en el sitio oficial, no en los repos de referencia. |
| 8 | Respuestas largas con todo repetido cuando Daniel pidió responder solo sus dudas. | Contestar únicamente lo que preguntó. Sin tablas ni recapitulaciones que no pidió. |
| 9 | Se dio por buena una versión (`latest` de `firestore`) sin cruzarla con el resto del paquete. | Revisar las `peerDependencies`: los paquetes de React Native Firebase deben tener la misma versión que `app`. |
| 10 | Algunas páginas devolvieron datos truncados o sin la fecha. | Si un dato no aparece, se dice que no se verificó. No se completa de memoria. |

## Reglas que salen de acá

- Verificado vs. supuesto: siempre separados, con la fuente.
- Un cambio de una decisión de Daniel se avisa y se deja registrado en `DECISIONES.md`.
- No arrastrar al código lo que se vio en el portal o el prototipo solo porque está ahí.
