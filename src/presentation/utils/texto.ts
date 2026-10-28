// Ayudas de formato de texto para mostrar en pantalla.

/**
 * "DEL CARRIL, IGNACIO ENRIQUE" -> "Del Carril, Ignacio Enrique". El CRM guarda los nombres en mayúsculas; mostrados así,
 * en negrita, cansan la vista. Es solo para MOSTRAR: lo que se edita o se guarda no se toca.
 */
export const nombrePropio = (texto?: string | null): string => {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .replace(/(^|[\s\-'’(])(\S)/g, (_coincidencia, previo: string, letra: string) => previo + letra.toUpperCase());
};
