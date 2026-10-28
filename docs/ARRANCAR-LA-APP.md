# Arrancar la app en Android (Windows)

Guía corta para volver al mismo estado cada vez que prendés la PC.
Todo se hace desde Android Studio, salvo Metro (una terminal) y un comando de `adb` una vez por emulador.

## Qué tiene que estar abierto

| Qué | Para qué |
|---|---|
| Emulador | Donde corre la app |
| Metro (una terminal) | Le sirve el código de `src/` a la app |
| Android Studio con la carpeta `android/` | Compilar e instalar (botón Run) |

## Pasos, en este orden

1. **Abrir Android Studio** y la carpeta `android/` del repo
   (File → Open → elegir `App.Mobile.Austral\android`, no la raíz).
   Esperar a que termine el Gradle sync (barra de abajo a la derecha).
2. **Abrir el emulador**: Device Manager → botón ▶ al lado de "Medium Phone API 37.0".
   Esperar a ver la pantalla de inicio de Android (con los íconos y el reloj).
3. **Abrir Metro**: una terminal parada en la raíz del repo
   (VS Code, o la pestaña Terminal de Android Studio con `cd ..`) y correr:

   ```
   npm start -- --reset-cache
   ```

   Dejar la terminal abierta y minimizada. No cerrarla mientras se prueba.
4. **Conectar el emulador con Metro** (una vez cada vez que se abre el emulador de cero). En una terminal nueva:

   ```
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
   ```

   Tiene que responder `8081`. Si dice `device offline`, el emulador todavía está arrancando: esperar un poco
   y repetir.
5. **Correr la app**: en Android Studio, con `app` seleccionado arriba, tocar el ▶ verde (Run).

El primer build es lento (varios minutos). Los siguientes son más rápidos.
Se puede seguir el avance en la pestaña Build de Android Studio.

## Mientras se prueba

- Editar el código en `src/`, guardar, y la app debería actualizarse sola (fast refresh).
  Si no se actualiza, en la terminal de Metro apretar `r` para recargar.
- Menú de desarrollo de la app: en la terminal de Metro apretar `d`.

## Cuándo hay que hacer algo más

| Si cambiás... | Hacer |
|---|---|
| El archivo `.env` | Frenar Metro (Ctrl+C) y volver a arrancarlo con `npm start -- --reset-cache` |
| Instalás o quitás una librería (`npm install ...`) | Frenar Metro, arrancarlo de nuevo y volver a darle Run ▶ en Android Studio |
| Algo dentro de `android/` o `google-services.json` | Volver a darle Run ▶ en Android Studio |
| Clonás el repo en otra PC | Seguir `docs/SETUP-NATIVO.md` y correr `npm install` en la raíz |

## Problemas conocidos

- **La app abre pero la pantalla queda negra** (ni siquiera una pantalla de prueba se dibuja, y Logcat no muestra
  errores de JavaScript): el emulador quedó en un estado de dibujado roto. Solución: apagarlo (cuadrado rojo en
  Device Manager) y arrancarlo con **Cold Boot Now** (menú ⋮ del emulador). Después repetir el paso 4.
- **La app abre con una pantalla roja que dice que no encuentra el servidor**: Metro no está corriendo o faltó el
  paso 4. Arrancarlo (paso 3), repetir el paso 4 y apretar `r` en Metro.
- **`npm run android` falla con "adb" o "JAVA_HOME"**: no usar ese comando. Esos programas vienen con Android
  Studio; usar el botón Run ▶ (paso 5).
- **El emulador no aparece o no arranca**: crear uno nuevo desde Device Manager → Create Device.
- **El build falla con "Unable to connect to the child process 'Gradle Worker Daemon'"**: la PC estaba muy
  cargada. Cerrar programas, reiniciar Android Studio y volver a darle Run ▶ (retoma lo que ya compiló).
- **Pantalla roja de la app con un mensaje** ("Render Error"): tocar **Copy** y pasar el texto.

## Notas

- Los valores del `.env` (URL de la API y usuario de servicio) se cargan a mano.
  El `.env` nunca se commitea (está en `.gitignore`), igual que
  `google-services.json` y `GoogleService-Info.plist`.
- iOS no se puede compilar ni probar en Windows: requiere una Mac con Xcode.
- El diseño de la app (grilla de íconos, subpantallas, estilo) está explicado en `docs/DECISION-UI-MOBILE.md`.
- Lo que falta configurar (login con Microsoft, logos, permisos) está en `docs/SETUP-NATIVO.md` y
  `docs/PENDIENTES.md`.
