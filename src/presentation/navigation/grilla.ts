// Ayudas de navegación de la grilla de Inicio y de las pantallas de subopciones.
//
// Todo sale del árbol de navigation/modulosMenu.ts (SECCIONES_DE_MENU), así que las reglas de quién ve qué (puesto y
// funciones de gestión) son las mismas que tenía el menú lateral. A diferencia de `irANodo` (que rearma la pila para el
// menú lateral), acá se navega hacia adelante: Inicio -> subopciones -> pantalla, y "atrás" vuelve un paso.
import { navigationRef } from './navigationRef';
import { moduloEnDemo, SECCIONES_DE_MENU, type NodoDeMenu } from './modulosMenu';

/** Busca una entrada del árbol por su id. */
export const buscarNodoPorId = (
  id: string,
  nodos: NodoDeMenu[] = SECCIONES_DE_MENU.flatMap((seccion) => seccion.nodos),
): NodoDeMenu | null => {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo;
    if (nodo.hijos) {
      const encontrado = buscarNodoPorId(id, nodo.hijos);
      if (encontrado) return encontrado;
    }
  }
  return null;
};

/**
 * true si la entrada todavía no tiene contenido: está marcada "en construcción", su módulo no está en la demostración, o
 * todas sus subopciones están en ese caso. Se muestra con la etiqueta "Próximamente".
 */
export const esProximamente = (nodo: NodoDeMenu): boolean => {
  if (nodo.enConstruccion) return true;
  if (nodo.hijos) return nodo.hijos.length > 0 && nodo.hijos.every(esProximamente);
  if (nodo.ruta) return !moduloEnDemo(nodo.ruta);
  return false;
};

export interface OpcionesDeApertura {
  /** Color del módulo raíz: las subpantallas lo heredan. */
  color?: string;
  /** Camino de grupos hasta esta entrada, p. ej. "Funciones SA › Promoción docente" (solo se usa en "En construcción"). */
  ubicacion?: string;
}

/** Abre una entrada del árbol: un grupo abre su pantalla de subopciones; una hoja abre su pantalla. */
export const abrirNodo = (nodo: NodoDeMenu, opciones: OpcionesDeApertura = {}): void => {
  if (!navigationRef.isReady()) return;
  const navegador = navigationRef as unknown as { navigate: (ruta: string, params?: object) => void };

  if (nodo.hijos) {
    navegador.navigate('Submenu', { id: nodo.id, color: opciones.color, ubicacion: opciones.ubicacion });
    return;
  }
  if (nodo.ruta) {
    navegador.navigate(nodo.ruta, nodo.params);
    return;
  }
  if (nodo.enConstruccion) {
    navegador.navigate('EnConstruccion', { id: nodo.id, titulo: nodo.titulo, ubicacion: opciones.ubicacion });
  }
};
