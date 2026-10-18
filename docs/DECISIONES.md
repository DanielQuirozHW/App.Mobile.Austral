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
8. **Login**: se migra todo lo del portal, sin probar. Ver decisión 18 sobre SAML y Microsoft, y la 36 sobre lo que no se migra (registro y recuperar contraseña).
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
23. **Confirmación al salir con cambios sin guardar**: obligatoria. El portal usa `beforeunload`; en mobile se implementa con `beforeRemove` de react-navigation (cubre también el botón atrás de Android y el gesto de iOS). No la tiene el prototipo pero sí el portal, por lo tanto debe estar.
24. **Razones técnicas**: nunca se justifica una recomendación con "no se puede probar". Las pruebas las hace Daniel al final.
25. **Documentación en el repo**: todas las decisiones y el stack quedan acá, porque Daniel puede dejar el chat.

## 2026-10-18 (aspecto visual)

26. **La app es la versión mobile del portal de Austral, no de Humanware.** El aspecto sale del portal: paleta (azul `#2E3092`, cian `#4FC3D7`, beige `#F5EDD8`, modo oscuro), tipografía (Montserrat), radios (6 px botones y campos, 10 px tarjetas), botones en mayúsculas y negrita, etiqueta del campo arriba, pantalla de ingreso sobre fondo beige. Daniel: "TIENE QUE SER LA APLICACIÓN MOBILE DEL PORTAL. USA SUS COLORES Y TODO LO DE LA WEB". Del prototipo solo se toma estructura y forma de programar.
27. **Modo claro/oscuro**: el portal arranca en claro (`themeConfig.mode = 'light'`) y tiene ambos modos. La app sigue el modo del sistema (adaptación propia, no verificada contra el selector del portal). Se puede cambiar a "siempre claro" tocando `ThemeProvider`.

## 2026-10-18 (autenticación y cliente HTTP; decididas por Claude, revisables)

28. **Capas del código**: `config` (entorno, HTTP), `domain` (reglas puras: roles, errores, tipos), `infrastructure` (Firestore, BO, almacenamiento), `application` (flujos como `authService`), `presentation` (UI, stores, tema). Adaptación propia de la estructura del prototipo, que ya separa `domain`, `infrastructure` y `presentation`.
29. **Token de servicio**: `apiClient` agrega `Authorization: Bearer` desde `tokenStore` salvo que la llamada traiga su propio header. El portal pasa el header explícito en cada llamada; el interceptor es una comodidad que no cambia lo que se envía. Las consultas de login usan el header explícito, como el portal.
30. **"Recuérdame"**: el portal solo guarda `userData` cifrado en `localStorage` y la persistencia de sesión es de Firebase. En la app Firebase persiste la sesión por sí mismo y no hay nada equivalente que guardar: la casilla se muestra como en el portal y el valor se acepta pero no cambia el comportamiento.
31. **Recuperar contraseña**: no existe en la app (ver decisión 36).
32. **Mejoras mínimas sobre el portal en auth** (no cambian el resultado): el correo se escapa dentro del XML de las consultas; no se envían `undefined` a Firestore.

## 2026-10-18 (pantallas de ingreso y navegación; decididas por Claude, revisables)

33. **Pantalla de entrada**: es `/login` del portal (`src/app/(blank)/login/page.tsx`): fondo beige, "Bienvenido al portal SIP", botón SSO arriba y formulario de email abajo. `login-portal` no es la entrada y no se migra.
34. **Registro**: no existe en la app (ver decisión 36).
35. **Navegación por estado** (reemplaza a la guarda de rutas del portal): un solo `native-stack` con pantallas condicionales según `authStore` y `rolStore`: cargando → `Cargando`; sin `user.empleadoid` → `Login`; varios puestos sin elegir → `SeleccionarPuesto`; resto → `Inicio` y, para docente / codocente, `DatosPersonales`. Al cambiar el estado la transición es automática, sin `navigate` manual. Mientras corre un login la sesión no se publica hasta validar al empleado (ver `authService`), lo que evita la carrera del portal.

## 2026-10-18 (alcance de la autenticación; decidida por Daniel)

36. **Sin registro ni recuperar contraseña.** Daniel: "No hace falta lo de recuperación de contraseña, a los que necesitan usar con usuario y contraseña se las creamos directo desde firebase. Tampoco por eso no se necesita lo de registro. Lo de la selección del puesto ok." Se quitaron las pantallas, rutas, funciones de `authService`, la función de alta en `usuariosFirestore` y la búsqueda de empleado para el registro. **La selección de puesto se mantiene.** Consecuencia: la cuenta con usuario y contraseña tiene que existir en Firebase Auth **y** tener su documento en la colección `usuarios` (el login por email no lo crea; con Microsoft sí se crea o actualiza).

## 2026-10-18 (Datos personales; decididas por Claude, revisables)

37. **Componentes propios, sin dependencias nuevas**: avisos (`toast`, equivalente a `react-hot-toast` del portal, con host también dentro de los modales), `AppModal`, `ConfirmDialog`, `SelectField` con búsqueda (equivale a `CustomSearchSelect`), `DateField` con `@react-native-community/datetimepicker`, y envoltorios de `react-hook-form` (`FormTextField`, `FormSelectField`, `FormDateField`, `FormTileSelector`) con scroll al primer campo con error.
38. **Una sola columna** en los formularios (la grilla de 12 columnas del portal no entra en un celular); se agrupan en fila solo los campos cortos (teléfono, calle y número, piso / depto / código postal).
39. **El formulario se arma una vez por visita**, con datos recién traídos: al entrar se vuelve a leer el legajo, la familia y los catálogos y recién entonces se hidrata el formulario (el portal puede hidratar con datos de una visita anterior).
40. **Aviso al salir con cambios sin guardar**: diálogo del sistema con los textos "Cambios sin guardar" / "Si salís ahora vas a perder los cambios que no guardaste." / "Seguir editando" / "Salir sin guardar" (textos propios: el portal solo usa `beforeunload`, sin texto).
41. **Acceso**: `DatosPersonales` solo se registra para los puestos `docente` y `codocente` (equivale a `ProtectedRoute allowedRoles` del portal).
42. **Adjuntos**: el portal trae el contenido (`documentbody`) de todos los adjuntos de todos los familiares al abrir la pantalla; la app lo pide por documento al tocar "Ver adjuntos". Los archivos se abren con el visor del sistema (el portal previsualiza PDF e imágenes en un modal). Para cargar se usan los selectores del sistema: archivos, galería y cámara (en lugar del dropzone web).
43. **Desvíos menores respecto del portal**: catálogos (países, provincias, localidades) en memoria hasta cerrar sesión; "No pudimos cargar tus datos. Por favor, volvé a intentar." en lugar de "recargá la página"; un número de calle vacío da "El número de calle es obligatorio"; una respuesta que no es un array nunca pisa los datos que ya estaban; la fila de cada hijo/a no muestra las insignias Frente / Dorso / CUD que en el portal son fijas (están marcadas como pendientes de conectar); el contador de los contactos de emergencia muestra "n/100" en lugar de los restantes.
44. **Cierre de sesión**: vacía los datos del legajo, la familia y los catálogos que quedan en memoria, para que no se vean en la sesión de otra persona.

## 2026-10-18 (fotos; decididas por Claude, revisables)

45. **Foto de perfil**: igual que el portal (`actualizarFotoPerfil`): Storage `{uid}/foto perfil`, documento de `usuarios` buscado por `uid`, campo `photoURL`, mismos avisos. El archivo se elige de la galería o la cámara (diálogo "Cambiar foto de perfil") y solo se aceptan png / jpg / jpeg, con el aviso del portal. Se sube el archivo local con `putFile`; el portal sube un blob. La cabecera del legajo reproduce `UserProfileBanner` (avatar con botón de cámara, nombre, puesto, sede).
46. **Foto de portada**: no se construye. `actualizarFotoPortada` existe en el contexto del portal, pero la cabecera que usa Datos personales no la muestra y no se confirmó que alguna pantalla la use. Si se confirma, se agrega.
47. **Cabecera sin breadcrumb**: `LegajoPageHeader` del portal es solo "Legajo > Datos personales"; en la app el título de la pantalla ya lo dice.
