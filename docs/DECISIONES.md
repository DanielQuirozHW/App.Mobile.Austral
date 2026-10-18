# Decisiones

Decisiones tomadas por Daniel. Se actualiza. Todo lo decidido queda acá para que no dependa de ningún chat.

## 2026-10-18 (base del proyecto)

1. **Objetivo**: app mobile React Native que hace lo mismo que el Portal Austral y consume la misma API, sin modificarla. Proyecto de prueba.
2. **Repo**: `DanielQuirozHW/App.Mobile.Austral`, en su cuenta, solo para test.
3. **Fuente de verdad**: el código del portal manda en lógica. El prototipo `Protoype-RN` es solo referencia de estructura y forma de programar. La documentación de los repos no es fuente.
4. **Repos de referencia**: solo lectura, solo por el conector MCP de GitHub. Nunca se modifican.
5. **Construcción desde cero**: sin clonar ni hacer fork del prototipo, sin copiar su historial.
6. **REGLA FUNDAMENTAL**: se construye sin probar absolutamente nada y sin usar ninguna credencial. Donde haya credenciales se deja el lugar vacío. Las pruebas las hace Daniel cuando esté avanzado.
7. **Primer módulo**: Datos personales, migrado completo (incluida Familia con documentación).
8. **Login**: se migra todo lo del portal, sin probar. Ver decisión 18 sobre SAML y Microsoft.
9. **Usuario de servicio de la API**: llega por variables de entorno vacías. El tenant lo fija el claim `cliente` de ese usuario.
10. **Entrega**: todo se entrega completo, nunca fragmentos.
11. **Seguridad del usuario de servicio**: es asunto del portal y de su equipo. La app replica el esquema del portal y no se vuelve a plantear.
12. **Foto de perfil y de portada**: entran en el alcance en la medida en que el portal las tiene.
13. **Funciones de Nombramientos y Promoción**: se migra su resolución para que la sesión funcione como la del portal. Es de lo último que se construye.
14. **Publicación de las apps y registro en Firebase**: no se discute todavía. Se deja todo preparado y Daniel lo prueba cuando decida.
15. **Patrones**: se siguen los del prototipo; donde el prototipo no tiene un patrón, se usa uno propio y se documenta.

## 2026-10-18 (stack y forma de trabajo)

16. **Stack**: definido en [`STACK.md`](STACK.md). Se elige por mérito técnico, no por lo que use el portal ni el prototipo. Daniel lo aprobó ("el stack está ok").
17. **React Native**: última versión estable, proyecto nativo, **sin Expo ni otro framework**. UI con `StyleSheet` y componentes propios (sin UI Kitten ni Paper). Fechas con date-fns. Variables de entorno como el prototipo (`process.env`). Keychain, AsyncStorage, image-picker y Reanimated se mantienen.
18. **Login principal con cuenta Microsoft @austral**: se usa el proveedor Microsoft de Firebase (`OAuthProvider('microsoft.com')`) con React Native Firebase, en lugar de SAML. Es una desviación del portal (que usa el proveedor SAML `saml.oauth` con `signInWithPopup`), aceptada por Daniel. Email y contraseña quedan para "algunos seleccionados".
19. **Firebase**: React Native Firebase. Daniel: "si el del prototipo no funciona usemos el que recomendás".
20. **Reemplazos por verificación en la web** (decididos por mí, revisables): `react-native-fs` → `react-native-blob-util`, `react-native-file-viewer` → `@react-native-documents/viewer` (y `@react-native-documents/picker` para elegir PDF), `react-native-vector-icons` → paquete por familia, `stack` → `native-stack`, scroll con teclado → `react-native-keyboard-controller`. Daniel había pedido mantener fs y file-viewer; se cambian porque están sin publicar desde 2021–2022 (inferido del registro de npm). Si prefiere volver, se revierte.
21. **Carpetas `android/` e `ios/`**: no son un limitante. Las genera Daniel con el comando oficial cuando tenga la PC (ver [`SETUP-NATIVO.md`](SETUP-NATIVO.md)). Mientras tanto se escribe todo el código TypeScript y la configuración, y las tareas nativas quedan listadas.
22. **Avance autónomo**: Daniel autorizó avanzar con la documentación y el desarrollo sin pedir aprobación por etapa ("avanza todo, sin preguntar aprobación"; "continuá con lo que sigue, mucho, no poco, no frenes"). Solo se frena ante una decisión que no se pueda deshacer o una duda real.
23. **Confirmación al salir con cambios sin guardar**: obligatoria. El portal usa `beforeunload`; en mobile se implementa con `beforeRemove` de react-navigation y el botón atrás de Android. No la tiene el prototipo pero sí el portal, por lo tanto debe estar.
24. **Razones técnicas**: nunca se justifica una recomendación con "no se puede probar". Las pruebas las hace Daniel al final.
25. **Documentación en el repo**: todas las decisiones y el stack quedan acá, porque Daniel puede dejar el chat.

## 2026-10-18 (aspecto visual)

26. **La app es la versión mobile del portal de Austral, no de Humanware.** El aspecto sale del portal: paleta (azul `#2E3092`, cian `#4FC3D7`, beige `#F5EDD8`, modo oscuro), tipografía (Montserrat), radios (6 px botones y campos, 10 px tarjetas), botones en mayúsculas y negrita, etiqueta del campo arriba, pantalla de ingreso sobre fondo beige. Daniel: "TIENE QUE SER LA APLICACIÓN MOBILE DEL PORTAL. USA SUS COLORES Y TODO LO DE LA WEB". Del prototipo solo se toma estructura y forma de programar.
27. **Modo claro/oscuro**: el portal arranca en claro (`themeConfig.mode = 'light'`) y tiene ambos modos. La app sigue el modo del sistema (adaptación propia, no verificada contra el selector del portal). Se puede cambiar a "siempre claro" tocando `ThemeProvider`.

## 2026-10-18 (autenticación y cliente HTTP; decididas por Claude, revisables)

28. **Capas del código**: `config` (entorno, HTTP), `domain` (reglas puras: roles, errores, tipos), `infrastructure` (Firestore, BO, almacenamiento), `application` (flujos como `authService`), `presentation` (UI, stores, tema). Adaptación propia de la estructura del prototipo, que ya separa `domain`, `infrastructure` y `presentation`.
29. **Token de servicio**: `apiClient` agrega `Authorization: Bearer` desde `tokenStore` salvo que la llamada traiga su propio header. El portal pasa el header explícito en cada llamada; el interceptor es una comodidad que no cambia lo que se envía. Las consultas de login usan el header explícito, como el portal.
30. **"Recuérdame"**: el portal solo guarda `userData` cifrado en `localStorage` y la persistencia de sesión es de Firebase. En la app Firebase persiste la sesión por sí mismo y no hay nada equivalente que guardar: la casilla se muestra como en el portal y el valor se acepta pero no cambia el comportamiento.
31. **Recuperar contraseña**: sin `actionCodeSettings` (en el portal la URL de continuación es el origin web + `/login`). Queda pendiente definir una URL (ver PENDIENTES).
32. **Mejoras mínimas sobre el portal en auth** (no cambian el resultado): el correo se escapa dentro del XML de las consultas; no se envían `undefined` a Firestore; en el registro se asegura el token de servicio antes de consultar y se recarga el usuario después de crear el documento (en el portal la escucha de sesión se dispara antes de que exista).

## 2026-10-18 (pantallas de ingreso y navegación; decididas por Claude, revisables)

33. **Pantalla de entrada**: es `/login` del portal (`src/app/(blank)/login/page.tsx`): fondo beige, "Bienvenido al portal SIP", botón SSO arriba y formulario de email abajo. `login-portal` no es la entrada y no se migra. **Registro** y **recuperar contraseña** existen en el portal con un aspecto más viejo (fondo oscuro `#040404` / papel); en la app se muestran con el mismo aspecto que el ingreso (fondo beige, tema claro) para que la app sea coherente. Textos, campos y reglas de contraseña son los del portal. En el registro, si el código de error de Firebase no está en la lista del portal (que en ese caso deja el mensaje vacío), se muestra el texto amigable general.
34. **El registro no tiene enlace desde el ingreso**: en el portal la página `registro` existe pero el ingreso no enlaza a ella (se llega por URL). La app replica eso: la ruta `Registro` está registrada pero ningún botón lleva a ella. Si Daniel quiere un enlace, se agrega en `LoginScreen`.
35. **Navegación por estado** (reemplaza a la guarda de rutas del portal): un solo `native-stack` con pantallas condicionales según `authStore` y `rolStore`: cargando → `Cargando`; sin `user.empleadoid` → `Login`/`Registro`/`OlvidasteContrasena`; varios puestos sin elegir → `SeleccionarPuesto`; resto → `Inicio`. Al cambiar el estado la transición es automática, sin `navigate` manual. Mientras corre un login la sesión no se publica hasta validar al empleado (ver `authService`), lo que evita la carrera del portal.
