// Almacenamiento local simple (no sensible). Guarda el rol elegido (`selectedRole`, como el portal) y la preferencia
// de modo de color de la app.
// A VERIFICAR: la API de AsyncStorage 3.x (import por defecto con getItem/setItem/removeItem) no se pudo
// confirmar en la documentación web (ver docs/PENDIENTES.md). Todo el acceso pasa por este archivo para
// que, si cambia, se corrija en un solo lugar.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_ROL_SELECCIONADO = 'selectedRole';
/** Preferencia de modo de color: 'sistema' | 'claro' | 'oscuro' (ver presentation/stores/modoColorStore.ts). */
export const CLAVE_MODO_COLOR = 'modoColor';

export const leerTexto = async (clave: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(clave);
  } catch {
    return null;
  }
};

export const guardarTexto = async (clave: string, valor: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(clave, valor);
  } catch {
    // Un fallo de almacenamiento local no debe romper el flujo.
  }
};

export const borrarTexto = async (clave: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(clave);
  } catch {
    // idem
  }
};
