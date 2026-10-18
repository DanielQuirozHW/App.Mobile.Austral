---
name: modulo-datos-personales
description: Usar al construir el módulo Datos personales (Identidad, Contacto, Domicilio, Familia, Contacto de emergencia). Resume contrato, validaciones y reglas del portal.
---

# Módulo Datos personales

Detalle verificado: `docs/contexto/datos-personales.md`. Alcance: **todo el módulo, migrado completo**. Sin probar nada y sin credenciales.

## Antes de escribir código

1. Leer `docs/contexto/datos-personales.md`, en especial la sección "Falta leer".
2. Leer en el portal lo que falte para la parte que se construye (hoy: `ModalConyuge`, `FileUploaderMultiple` y los pasos exactos de `getAdjuntosXFamiliarXEmpleado` / `cargarAdjuntosPorFamiliares` en `useLegajoStore`).
3. Resumir en pocas líneas qué se va a construir y esperar conformidad si hay decisiones de diseño abiertas.

## Puntos clave

- Lectura: `POST api/consultafetchs` sobre `new_empleado` por `new_empleadoid`. Escritura: `PUT api/hrfactors/empleado`, sin reintentos. Tras guardar, volver a leer.
- Familia solo para relación de dependencia (`esRelacionDependencia`: código `100000000`, o etiqueta "relacion de dependencia" normalizada si no hay código). Cónyuge obligatorio si el estado civil es Casado/a o Conviviente. Baja del cónyuge solo por cambio de estado civil y con confirmación.
- Hijos: modos nuevo/editar/ver; tras crear, los documentos se releen 5 s después (el backend los genera con demora). Documentos de hijos permitidos: certificado único de discapacidad, DNI dorso, DNI frente (comparación normalizada).
- Adjuntos: archivos en el campo `file` de un `FormData`; vista previa de PDF e imágenes, descarga para el resto.
- Teléfono en tres campos que se unen como `+pais ddn numero`.
- Documento: 8 dígitos para DNI; alfanumérico hasta 20 para D.E. y Pasaporte. CUIL de 11 dígitos.
- Provincia limpia la localidad; las localidades se filtran en el cliente.
- Los valores de listas (tipo de documento, estado civil, sexo, vínculo, a cargo) están en el documento de contexto y se copian del código del portal.

## No incluir

Documentación del legajo, notificaciones y actividades de extensión (están en el mismo store pero son otros módulos) hasta que se confirmen.
