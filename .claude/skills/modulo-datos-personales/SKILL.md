---
name: modulo-datos-personales
description: Usar al construir el módulo Datos personales (Identidad, Contacto, Domicilio, Familia, Contacto de emergencia). Resume contrato, validaciones y reglas del portal.
---

# Módulo Datos personales

Detalle verificado: `docs/contexto/datos-personales.md`. Alcance: **todo el módulo, migrado completo**. Sin probar nada y sin credenciales.

## Antes de escribir código

1. Leer `docs/contexto/datos-personales.md`, en especial "No leído todavía".
2. Leer en el portal lo que falta (tipo de contratación, modales de cónyuge e hijos, adjuntos, columnas). No construir Familia sin haberlo leído.
3. Resumir en pocas líneas qué se va a construir y esperar conformidad si hay decisiones de diseño abiertas.

## Puntos clave

- Lectura: `POST api/consultafetchs` sobre `new_empleado` por `new_empleadoid`. Escritura: `PUT api/hrfactors/empleado`, sin reintentos. Tras guardar, volver a leer.
- Familia solo para relación de dependencia. Cónyuge obligatorio si el estado civil es Casado/a o Conviviente. Baja del cónyuge solo por cambio de estado civil y con confirmación.
- Teléfono en tres campos que se unen como `+pais ddn numero`.
- Documento: 8 dígitos para DNI; alfanumérico hasta 20 para D.E. y Pasaporte. CUIL de 11 dígitos.
- Provincia limpia la localidad; las localidades se filtran en el cliente.
- Los valores de listas (tipo de documento, estado civil, sexo, vínculo) están en el documento de contexto y se copian del código del portal.

## No incluir

Documentación del legajo, notificaciones y actividades de extensión (están en el mismo store pero son otros módulos) hasta que se confirmen.
