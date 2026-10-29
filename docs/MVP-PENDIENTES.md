# MVP: qué falta (resumen)

Escrito el 2026-10-28 leyendo `PENDIENTES.md`, `ALCANCE-MVP.md`, `SETUP-NATIVO.md`, `android/app/build.gradle` y lo visto en el emulador. **Reemplaza en lo que haya conflicto** a esos tres documentos, que quedaron viejos en tres cosas:

- La tipografía ya no es Montserrat: la app usa la del sistema (`DECISION-UI-MOBILE.md`). **El paso de fuentes ya no hace falta.**
- No hay menú lateral: Inicio tiene una grilla de módulos y el avatar abre el menú del usuario.
- Inicio ya no tiene "accesos": tiene tarjetas de módulos.

Marcas: **[visto]** = Daniel lo vio funcionando en el emulador. **[sin probar]** = está escrito y no se probó. **[falta]** = no está hecho. **[decidir]** = lo define el equipo.

## 1. Dónde estamos

| Área | Estado |
|---|---|
| Proyecto nativo Android, Firebase Android, `.env`, login con correo y contraseña, token del usuario de servicio | [visto] |
| Inicio (saludo, módulos, frase del mes, cumpleaños, feriados), modo claro y oscuro, menú del usuario | [visto] |
| Legajo y Perfil (pantallas de subopciones) | [visto] |
| Datos personales: carga de datos y secciones | [visto] |
| Documentación: lista | [visto] |
| Licencias: lista y detalle de una solicitud | [visto] |
| Notificaciones: lista | [visto] |
| Guardar Datos personales, familia (cónyuge e hijos), subir archivos y fotos, solicitar licencia, vacaciones, calendario, Plan de trabajo, Formación, Trayectoria, Extensión, Gestión académica, Docencia, Investigación | [sin probar] |
| Login con Microsoft, cambio de puesto, cerrar sesión y volver a entrar | [sin probar] |
| iOS | [falta] (necesita una Mac, ver sección 5) |

## 2. Para llegar al MVP, en orden

### A. Que funcione (sin esto no se puede mostrar)

- [ ] **Cerrar sesión y volver a entrar.** Daniel lo vio fallar una vez. No se encontró la causa en el código. Es posible que fuera el mismo problema del login de servicio (ya resuelto), pero **no está confirmado**: repetirlo y anotar qué mensaje sale.
- [ ] **Recorrer cada módulo con un usuario real** y anotar lo que falle (lista de la sección 1 en [sin probar]). Pasar los errores con el texto del botón **Copy** o con las líneas de Logcat (`tag:ReactNativeJS`).
- [ ] **Login con Microsoft**: habilitar el proveedor en Firebase Auth, registrar la app en Microsoft Entra, cargar las huellas SHA-1 y SHA-256 en la app Android de Firebase. Después confirmar que el `uid` coincide con el del login SAML del portal (`SETUP-NATIVO.md`, secciones 3 y 5).
- [ ] **Cámara, galería y adjuntos en Android**: probar foto de perfil, portada y adjuntos de Documentación, familia y licencias. Verificar que el `AndroidManifest.xml` tenga el permiso de cámara (no se comprobó).
- [ ] **Cuentas de prueba**: usuarios en Firebase Auth **con su documento en la colección `usuarios`** (decisión 36). Un usuario docente (para Plan de trabajo) y uno con dos puestos (para Cambiar puesto).
- [ ] **Correr `npx tsc --noEmit` y `npm run lint`**: nunca se corrieron. Pueden aparecer errores de tipos (por ejemplo por la ruta `Submenu`). No impiden que la app ande, pero conviene limpiarlos.

### B. Para presentarlo prolijo

- [ ] **Logo**: copiar `logo-horizontal-color.png` y `logo-horizontal-blanco.png` del portal a `src/assets/images` y completar `logos.ts` (`SETUP-NATIVO.md`, sección 4). Hasta entonces el login muestra "Universidad Austral" en texto.
- [ ] **Ícono de la app, pantalla de carga (splash) y nombre visible.** Hoy `displayName` de `app.json` es "Austral" (provisorio) y el ícono es el de React Native por defecto.
- [ ] **Bloquear orientación vertical** (`android:screenOrientation` en el manifest). La escala de la app se calcula una sola vez al iniciar (`responsive.ts`).
- [ ] **Revisión visual** de las pantallas que todavía no se miraron una por una: Trayectoria, Extensión, Gestión académica, Docencia, Investigación, detalle del Plan de trabajo y los modales de Legajo y Licencias.
- [ ] **Limpieza**: borrar `components/menu/BotonCambiarPuesto.tsx` y `components/inicio/SaludoInicio.tsx` (sin uso); sacar los logs de diagnóstico `[API]` y `[ENV]` (solo salen en desarrollo, no molestan en un build de producción); actualizar los documentos viejos de arriba.
- [ ] **Pull-to-refresh** en las pantallas que faltan (`ALCANCE-MVP.md`). Bajo impacto.

### C. Para que otros lo instalen

- [ ] **Llave de firma propia** (ver sección 4). Hoy el build de producción usa la llave de debug.
- [ ] **Versionado**: `versionCode` y `versionName` en `android/app/build.gradle` (hoy 1 y "1.0"). `versionCode` tiene que subir en cada versión que se publique.
- [ ] **Canal de distribución** (sección 5) y **estrategia de actualización** (sección 6).
- [ ] **iOS** (sección 5): Mac, cuenta de Apple, `GoogleService-Info.plist`, configuración nativa iOS.

### D. Lo define el equipo

- [decidir] **Credenciales del usuario de servicio dentro de la app.** El portal las incluye en su código web (variables `NEXT_PUBLIC_*`) y la app hace lo mismo: el correo y la clave del `.env` se incrustan al compilar. **Cualquiera que tenga el APK puede extraerlas.** Para una demo con gente de confianza puede ser aceptable; para publicar en una tienda, no. La alternativa es que un servidor intermedio guarde esas credenciales. Es una decisión de Daniel y del equipo de la API, no se resuelve en el código de la app.
- [decidir] Si se agregan después: Gestión del Desempeño, Indicadores, Funciones SA / VRAA, Referente MATHU, Promoción. Figuran como "Próximamente".
- [decidir] Notificaciones en tiempo real (SignalR). Hoy recargan cada 5 minutos (decisión 96: no).

## 3. Sobre `.env` y `.env.template`

**No borrar `.env.template`.** El `.env` está en `.gitignore`: vive solo en tu PC y no llega al repo. El `.env.template` es el único registro, dentro del repo, de qué variables necesita la app (`API_URL`, `API_SERVICE_EMAIL`, `API_SERVICE_PASSWORD`, `MICROSOFT_TENANT`, `PORTAL_CAE_URL`). Lo necesita cualquier otra persona o máquina (incluido un servidor de compilación) para armar su propio `.env`. No tiene valores, así que no hay riesgo en tenerlo.

## 4. Probar en un teléfono Android

Hay dos caminos. Se puede usar el mismo `google-services.json` y el mismo `.env`.

**Camino 1: modo desarrollo, con cable (el más rápido).**

1. En el teléfono: Ajustes > Acerca del teléfono > tocar 7 veces "Número de compilación"; después Opciones de desarrollador > activar **Depuración por USB**.
2. Conectar por cable y aceptar el aviso del teléfono.
3. En una terminal: `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices` (tiene que aparecer el teléfono como `device`).
4. Mismo comando con `reverse tcp:8081 tcp:8081`.
5. En Android Studio elegir el teléfono en el selector de dispositivos y apretar Run. Metro tiene que estar corriendo en la PC.

Sirve para desarrollar. El teléfono depende de la PC y del cable.

**Camino 2: un APK que funcione solo (para llevárselo a alguien).**

Importante: el APK que sale de `Build > Build APK` en modo **debug** **no sirve solo**: carga el código desde Metro. Hay que compilar la variante **release**, que incluye el código adentro (comentario sobre `debuggableVariants` en `android/app/build.gradle`).

1. En Android Studio: `Build > Select Build Variant` y elegir `release` en el módulo `app`; después `Build > Build Bundle(s) / APK(s) > Build APK(s)`. O desde la terminal, en la carpeta `android`: `.\gradlew.bat assembleRelease`.
2. El archivo queda en `android/app/build/outputs/apk/release/`.
3. Pasarlo al teléfono y abrirlo. Android pide permitir "instalar apps de orígenes desconocidos".

Qué necesita para funcionar:

- El `.env` y el `google-services.json` tienen que estar en la PC que compila (no están en el repo).
- **Login con correo y contraseña: no necesita nada más.**
- **Login con Microsoft:** necesita que la huella SHA de la llave con la que está firmado el APK esté cargada en Firebase. Hoy el build de producción se firma con la llave de debug del proyecto, que ya es la misma que usa el emulador. Si se cambia de llave (ver abajo), hay que cargar la huella nueva.
- **La API tiene que ser alcanzable desde el teléfono.** Si solo se llega desde la red interna o una VPN de Austral, fuera de ella no va a cargar datos. Esto no se verificó: hay que probarlo con datos móviles.
- No usa Metro ni `adb reverse`.

**Llave de firma propia** (necesaria para publicar). Se crea una vez con `keytool` y se configura en `android/app/build.gradle` (`signingConfigs.release`). Guardar el archivo y las claves en un lugar seguro: sin ellas no se pueden publicar actualizaciones. Seguir la guía oficial de React Native "Publishing to Google Play Store" (`reactnative.dev/docs/signed-apk-android`, la misma que cita el comentario de `build.gradle`).

## 5. Distribuir

| Opción | Qué es | Cuándo |
|---|---|---|
| Pasar el APK a mano | Cada persona instala el archivo | Pruebas con pocas personas. Sin actualizaciones automáticas |
| **Firebase App Distribution** | Invitás por correo a los probadores y reciben cada versión nueva | **Recomendado para que Austral pruebe la demo**: ya usás Firebase. Sirve para Android y, con cuenta de Apple, para iOS |
| Google Play, prueba interna o cerrada | Tienda oficial, con grupos de probadores | Pasada la demo. Requiere cuenta de desarrollador de Google (pago único) y subir un `.aab` firmado |
| App Store / TestFlight | Tienda de Apple | Requiere cuenta de Apple Developer (pago anual) y una Mac |

Los costos y requisitos de las cuentas de Google y de Apple **están escritos de memoria**: confirmalos en sus sitios oficiales antes de decidir.

**iOS.** No se puede compilar ni emular iOS desde Windows: el simulador viene con Xcode, que solo corre en Mac. Opciones: una Mac propia, una Mac en la nube (alquilada por hora) o un servicio de compilación en la nube con máquinas Mac. Además hace falta `GoogleService-Info.plist` y registrar la app iOS en Firebase (`SETUP-NATIVO.md`).

## 6. Actualizaciones (el cliente pide cambios seguido)

**Sin hacer nada especial:** cada cambio es una versión nueva que hay que subir a la tienda, y cada usuario la recibe cuando su teléfono actualiza la app desde la tienda. No es instantáneo ni lo controlás vos. En Apple, además, cada versión pasa por revisión.

**Actualizaciones por internet (OTA).** React Native permite enviar solo el código JavaScript y las imágenes sin pasar por la tienda. Sirve para casi todo lo que el cliente suele pedir (textos, pantallas, correcciones). **No sirve** cuando se agrega o cambia una librería nativa, permisos o configuración nativa: eso exige versión nueva de tienda.

Según lo que investigué el 2026-10-28 (artículos de terceros, no documentación oficial):

- Microsoft retiró App Center, y con él su servicio de CodePush, el 31 de marzo de 2025. **No se puede usar ese servicio.**
- Alternativas administradas: **EAS Update** (de Expo; según lo leído funciona también en proyectos de React Native sin Expo, pero exige agregar `expo-updates` al proyecto), Bitrise CodePush, Revopush, Appcircle y Stallion. Hay opciones que se alojan por cuenta propia (por ejemplo `hot-updater`).
- Ofrecen despliegue gradual (a un porcentaje de usuarios) y vuelta atrás si una versión sale mal.
- Sobre las reglas de Apple, lo que leí dice que se permite actualizar JavaScript si no cambia la función principal de la app. **Confirmalo en las normas de Apple antes de depender de eso.**

Qué elegir es una decisión técnica que conviene tomar antes de publicar, porque agregar un sistema OTA después requiere una versión nueva de tienda. Recomendación tentativa, sin haberla probado: sumar un OTA + un chequeo de **versión mínima** (la app consulta, por ejemplo, a Firebase qué versión mínima acepta y, si la instalada es más vieja, pide actualizar desde la tienda).

## 7. Si el emulador va lento

Causas probables (no verificadas en tu PC, pero son las habituales):

- **La imagen es Android 17 (API 37), una versión de vista previa.** Una imagen estable (API 34 o 35) suele andar más fluida. El problema de pantalla negra de hoy se arregló con Cold Boot.
- **Aceleración por hardware desactivada.** En Windows hace falta tener activadas la virtualización en el BIOS y "Windows Hypervisor Platform". Android Studio avisa si falta.
- **Poca memoria**: Android Studio, el emulador, Metro, VS Code y Gradle a la vez consumen mucho. Cerrar lo que no se use.
- **Graphics en software** en lugar de hardware (en el editor del dispositivo virtual, "Graphics").

La solución más efectiva suele ser **usar un teléfono real por cable** (camino 1 de la sección 4): va más rápido que cualquier emulador y se ve como lo va a ver el usuario.
