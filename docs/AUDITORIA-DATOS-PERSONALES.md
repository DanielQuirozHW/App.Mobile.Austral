# Auditoría de Datos personales contra el portal

Fecha: 2026-10-18. Método: lectura de código, archivo contra archivo. No se ejecutó nada.
Fuente de verdad: `HW-Austral/Portal-Austral-Dev` (solo lectura).

## Verificado (la app hace lo mismo que el portal)

| Tema | Portal (repo + ruta) | App (ruta) |
|---|---|---|
| Pantalla, secciones, orden, reglas por tipo de contratación | `src/app/(dashboard)/legajo/datos-personales/page.tsx` | `src/presentation/screens/legajo/DatosPersonalesScreen.tsx` |
| Lectura del legajo (FetchXML, atributos, filtro statecode) | `src/stores/useLegajoStore.ts` (`miLegajo`) | `src/infrastructure/legajo/legajoApi.ts` |
| Guardado del legajo (PUT `api/hrfactors/empleado`), recarga posterior, sin reintentos en escrituras | `useLegajoStore.ts` + `useActualizarLegajo` | `legajoApi.ts`, `application/legajo/legajoService.ts` |
| Mapeo, payloads, validaciones, teléfono | `useMiLegajo`, `validacionSchema`, `formatTelefono` | `src/domain/legajo/*` |
| Familiares, documentación y adjuntos (queries, endpoints, campo `file` del multipart) | `useLegajoStore.ts` | `src/infrastructure/legajo/familiaresApi.ts`, `presentation/stores/familiaStore.ts` |
| Alta/edición/vista de cónyuge, orden de llamadas, espera de 5 s por documentación nueva, guardado previo del legajo con el estado civil, textos y toasts | `legajo/_components/component/ModalConyuge.tsx` | `components/legajo/ModalConyuge.tsx` |
| Alta/edición/vista de hijo/a, validaciones, textos y toasts | `legajo/_components/component/ModalHijos.tsx` | `components/legajo/ModalHijo.tsx` |
| Baja de familiar (refetch, espera de 500 ms, documentación) | `columnsConyuge.tsx`, `columnsHijos.tsx` | `legajoService.ts` (`eliminarFamiliarDeLista`), `BloqueFamilia.tsx` |
| Carga de archivos (JPG/JPEG/PNG/PDF/DOC/DOCX, 15 MB, check temporal, "Quitar todo") | `ModalCargarDocumentos.tsx`, `useEnviarArchivos.ts` | `components/legajo/ModalCargarDocumento.tsx` |
| Ver adjuntos | `ModalVerDocumentosFamiliar.tsx` | `components/legajo/ModalVerAdjuntos.tsx` |
| Encabezado de perfil: foto 72, nombre, puesto, localidad, formatos png/jpg/jpeg, mensaje de error | `legajo/_components/component/PerfilHeader.tsx`, `UserProfileBanner.tsx` | `components/legajo/PerfilLegajoBanner.tsx`, `application/auth/fotoPerfilService.ts` |

## Corregido en esta auditoría

1. Vista de hijo/a: "¿Está a cargo?" muestra `Sí` / `No` (y "— Sin cargar" si no hay dato), como el portal.
2. Vista de hijo/a: "Documentación adjunta" muestra `N documento cargado` / `N documentos cargados.`, también con 0.
3. Adjuntos de un documento: título "Documentos cargados" y el nombre del documento como subtítulo.

## Diferencias conscientes (ya decididas, no son faltantes)

- Las notas de familiares se piden sin `documentbody`; el contenido se pide al abrir "Ver adjuntos" (el portal trae todo el base64 y solo usa la cantidad).
- Los adjuntos se abren con el visor del sistema en lugar de previsualizarlos dentro del modal.
- La selección de archivos usa archivos / galería / cámara en lugar del dropzone web.
- Foto de portada: no se construyó. `PerfilHeader.tsx` y `UserProfileBanner.tsx` no la muestran (solo `PerfilHeader` destructura `actualizarFotoPortada` y no la usa).
- Sin breadcrumb en el encabezado (decisión 47).

## No verificable desde el código

- Todo comportamiento en ejecución (la app no se prueba en esta etapa).
- Que `AppModal` acepte `subtitulo` vacío cuando el documento no trae nombre: se asume (ya se usa `subtitulo` en `ModalCargarDocumento`).
- Configuración externa (carpetas nativas, Firebase/Entra, fuentes, logos): ver `docs/PENDIENTES.md`.
