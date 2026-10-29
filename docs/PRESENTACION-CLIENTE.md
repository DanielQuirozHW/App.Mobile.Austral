# Presentación al cliente: lo que hay que saber

Escrito el 2026-10-28. Es una guía para Daniel, no un documento para el cliente. Va al punto: cada tema trae lo esencial y, si el cliente pregunta más, se pide el detalle.

Marcas: **[verificado]** = lo confirmé en una fuente oficial o en el código. **[de memoria]** = lo sé de forma general pero no lo verifiqué: confirmarlo antes de decírselo al cliente. **[decidir]** = lo define Austral o el equipo.

El detalle técnico de cada paso está en `docs/MVP-PENDIENTES.md` (secciones 4 a 7) y `docs/SETUP-NATIVO.md`.

---

## 1. Qué es hoy la app (para no prometer de más)

- App React Native (Android hoy; iOS todavía no) que usa **la misma API que el Portal Austral**. Es un proyecto de prueba.
- Módulos con contenido: Inicio, Notificaciones, Legajo (Datos personales, Documentación), Perfil (Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación), Licencias y vacaciones, Plan de trabajo (solo docente). [verificado: `modulosMenu.ts`]
- "Próximamente": Promoción, Nombramientos, Gestión del Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU.
- **Lo que está escrito y todavía no se probó de punta a punta**: guardar Datos personales y familia, subir archivos y fotos, solicitar licencias, Plan de trabajo, los módulos de Perfil, login con Microsoft, cambio de puesto. Antes de mostrarlo, recorrer todo con un usuario real (`MVP-PENDIENTES.md`, sección 2A).

## 2. ¿Se publica rápido como el portal?

**No.** Es la diferencia más importante entre web y app.

| | Portal (web) | App en tienda |
|---|---|---|
| Cómo sale un cambio | Se despliega y lo ven todos al instante | Se compila, se sube a la tienda, pasa revisión y cada usuario actualiza |
| Revisión | No hay | Apple: dice que revisa el 90 % en menos de 24 h. Google: no publica plazo y avisa que puede tardar hasta 7 días o más [verificado, fuentes abajo] |
| Control | Total | Parcial: no controlás cuándo actualiza cada persona |

**Cómo acercarse a la velocidad del portal:** actualizaciones por internet (OTA), que envían solo el código JavaScript sin pasar por la tienda. Sirven para textos, pantallas y correcciones; **no** para cambios de librerías nativas o permisos. Hoy **no hay ningún sistema OTA instalado**, y agregarlo después exige una versión de tienda. Opciones y advertencias en `MVP-PENDIENTES.md`, sección 6. Se complementa con un chequeo de **versión mínima** para obligar a actualizar cuando haga falta. [decidir antes de publicar]

**"¿Se actualiza sola cuando vos actualizás?"** Respuesta honesta: depende.
- Con OTA: sí, la app descarga el cambio al abrirse (para cambios de JavaScript).
- Sin OTA: no. Cada usuario recibe la versión nueva cuando la tienda se la actualiza (automático si tiene activadas las actualizaciones automáticas, pero no inmediato).
- Un cambio que toca código nativo siempre pasa por la tienda.

## 3. Cuánto cuesta estar en las tiendas

| Tienda | Costo | Notas |
|---|---|---|
| Google Play | **US$ 25, pago único** [verificado: ayuda oficial de Play Console] | Una cuenta **personal nueva** (creada después del 13/11/2023) debe hacer una prueba cerrada con **12 testers durante 14 días seguidos** antes de publicar [verificado en una fuente de terceros, no en la ayuda oficial]. Una cuenta de organización suele evitarlo [de memoria] |
| Apple App Store / TestFlight | **US$ 99 por año** [de memoria: confirmar en developer.apple.com/programs] | Necesita una Mac para compilar (sección 6) |
| Apple Enterprise | US$ 299 por año [verificado] | **No sirve para este caso**: exige 100 o más empleados, entidad legal, D-U-N-S, y es solo para distribución **interna a empleados**, no para tiendas |

Otros costos para tener en cuenta: servicio de OTA si se elige uno administrado, una Mac o un servicio de compilación para iOS, y el hosting de Firebase si se supera el plan gratuito (no evaluado).

**Importante: la cuenta tiene que ser de la Universidad Austral, no tuya.** Si publicás con tu cuenta personal, la app queda a tu nombre y Austral depende de vos. Las cuentas de organización piden datos legales de la institución y, en Apple, un número D-U-N-S (gratuito en la mayoría de los países) [de memoria]. Conviene arrancar este trámite cuanto antes: puede demorar días o semanas.

## 4. Cómo conseguir el APK

Resumen (pasos completos en `MVP-PENDIENTES.md`, sección 4):

1. El `.env` y el `google-services.json` tienen que estar en la PC que compila (no están en el repo).
2. **Variante `release`** (no `debug`: el APK debug carga el código desde Metro y no funciona solo). En Android Studio: `Build > Select Build Variant` > `release`, y después `Build > Build APK(s)`. O en la carpeta `android`: `.\gradlew.bat assembleRelease`.
3. Queda en `android/app/build/outputs/apk/release/`.
4. Pasarlo al teléfono y permitir "instalar apps de orígenes desconocidos".

Para **Google Play** hace falta un **AAB** firmado (no un APK) con una llave propia: `.\gradlew.bat bundleRelease` [de memoria; confirmar en la guía de React Native]. Hoy el build usa la llave de debug: hay que crear la llave de producción y **guardarla en un lugar seguro y con copia**; si se pierde, no se pueden publicar actualizaciones con la misma app [de memoria; el riesgo depende de si se usa "Play App Signing"].

Para que el APK funcione fuera de tu PC: la **API tiene que ser alcanzable desde internet**. Si solo se llega desde la red de Austral o por VPN, la app no va a cargar datos con datos móviles. [verificar con el equipo de la API; no se probó]

## 5. Cómo se lo damos a probar al cliente (antes de las tiendas)

| Opción | Para qué |
|---|---|
| APK a mano | Pocas personas, una sola vez. Sin actualizaciones automáticas |
| **Firebase App Distribution** | **Recomendada para la demo**: invitás por correo y reciben cada versión nueva. Ya usan Firebase. Sirve para Android y iOS [de memoria sobre iOS: pide cuenta de Apple] |
| Google Play, prueba interna o cerrada | Cuando ya haya cuenta de Austral |
| TestFlight | iPhone; exige cuenta de Apple y Mac |

## 6. iOS: cómo emularlo y qué implica

- **Desde Windows no se puede ni compilar ni emular iOS.** El simulador viene con Xcode, que solo corre en Mac.
- Opciones: (a) una Mac propia o prestada, (b) una Mac alquilada en la nube por hora, (c) un servicio de compilación en la nube con máquinas Mac. [de memoria: los nombres y precios de estos servicios no se evaluaron]
- Para probar en un **iPhone real** además hace falta cuenta de Apple Developer y registrar la app iOS en Firebase (`GoogleService-Info.plist`).
- **Hoy la app no tiene configuración nativa de iOS lista.** Hay que prever tiempo para eso, para el login con Microsoft en iOS y para la revisión de Apple.
- Si el cliente quiere iOS desde el día uno, es el mayor riesgo de plazos del proyecto: decirlo en la presentación.

## 7. Requisitos de las tiendas (suelen sorprender)

Todo [de memoria]: confirmar en las guías oficiales de Google y Apple.

- **Política de privacidad** con una URL pública. La app maneja datos personales (documento, domicilio, familia, hijos): es el punto más sensible. Consultar con el área legal de Austral por la ley argentina de datos personales (esto no es asesoramiento legal).
- **Formularios de datos** de cada tienda (qué datos se recolectan y para qué).
- **Cuenta de prueba para los revisores**: las apps con login piden credenciales de demostración. Con login por Microsoft, hay que armar un usuario que el revisor pueda usar.
- Ficha de la tienda: nombre, descripción, capturas de pantalla, ícono, clasificación de edad.
- **El `applicationId` (hoy `com.australmobile`) no se puede cambiar una vez publicada la app.** Confirmar con Austral el identificador definitivo **antes** de publicar.
- Las tiendas exigen cada año subir el nivel mínimo de API de Android y compilar con herramientas más nuevas de Apple: la app necesita mantenimiento aunque no se le agreguen funciones.

## 8. Seguridad: lo que el cliente va a preguntar

- **Credenciales del usuario de servicio dentro de la app.** El portal incluye esas credenciales en su código web y la app hace lo mismo: quedan dentro del APK/IPA y cualquiera que lo tenga puede extraerlas. Para una demo cerrada puede ser aceptable; **para publicar en una tienda, no**. La alternativa es un servidor intermedio que las guarde. Es una decisión de Daniel y del equipo de la API. [verificado: `MVP-PENDIENTES.md`, 2D]
- Los tokens del usuario se guardan en el almacenamiento seguro del teléfono (`react-native-keychain`) [verificado: `STACK.md`].
- No se verificó: cifrado de datos locales, detección de root/jailbreak, ni auditoría de seguridad externa.

## 9. Login con Microsoft (SSO)

Falta configuración externa, que no se resuelve con código: habilitar el proveedor en Firebase Auth, registrar la app en Microsoft Entra, cargar las huellas SHA-1 y SHA-256 del Android en Firebase y registrar la app iOS. Lo hace Daniel con el equipo de IT de Austral. Si se cambia la llave de firma, hay que cargar la huella nueva. (`MVP-PENDIENTES.md`, 2A; `SETUP-NATIVO.md`)

## 10. Mantenimiento y soporte (a definir con el cliente)

- **Quién publica y quién responde** cuando un usuario tiene un problema: la app no tiene hoy un sistema de reporte de errores (no verificado: confirmar si hay uno instalado).
- **Notificaciones**: hoy la app recarga cada 5 minutos; **no hay notificaciones push** (el aviso aparece solo con la app abierta). Las push exigen sumar Firebase Cloud Messaging y Apple Push, y un servidor que las dispare. [decidir si se quiere]
- **Cambios de la API**: si la API cambia, la app puede romperse hasta que se publique la versión nueva. El chequeo de versión mínima (sección 2) ayuda.
- **Versiones de Android e iOS**: salen nuevas cada año y suelen pedir ajustes.
- Distribución interna masiva (todos los empleados): existen herramientas de gestión de dispositivos (MDM); que Austral use Microsoft sugiere preguntar por Intune. [de memoria; consultar a su IT]

## 11. Preguntas que conviene llevar respondidas

1. ¿Android, iOS o ambos, y para qué fecha?
2. ¿Quién es el dueño legal de las cuentas de tienda y quién las administra?
3. ¿Distribución pública en tienda o solo para empleados (privada)?
4. ¿La API se puede alcanzar desde internet? ¿Hace falta VPN?
5. ¿Qué módulos faltan para el lanzamiento (Promoción, GDD, Funciones SA / VRAA, etc.)?
6. ¿Hace falta push? ¿Usuarios offline?
7. ¿Quién mantiene la app después de la entrega y con qué frecuencia esperan cambios?
8. ¿Hay política de privacidad y área legal que revise el manejo de datos personales?

## 12. Pendientes del proyecto antes de presentar

Ver `MVP-PENDIENTES.md`, secciones 2A a 2D. Lo mínimo: recorrer todos los módulos con un usuario real, repetir cerrar sesión y volver a entrar, logo e ícono propios, bloquear orientación vertical y probar el APK `release` en un teléfono real con datos móviles.

---

## Fuentes consultadas el 2026-10-28

- Google Play Console, registro y costo: https://support.google.com/googleplay/android-developer/answer/113468
- Apple Enterprise Program (costo y requisitos): https://developer-mdn.apple.com/programs/enterprise/
- Tiempos de revisión de Apple y Google, y prueba de 12 testers: https://www.choicely.com/tutorials/how-long-does-app-review-take (tercero; no es oficial)
- Cuenta de Apple Developer: https://developer.apple.com/help/account/basics/about-your-developer-account (no trae el precio; el de US$ 99 está de memoria)
