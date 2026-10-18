// Almacenamiento local simple (no sensible). Hoy solo guarda el rol elegido (`selectedRole`, como el portal).
// A VERIFICAR: la API de AsyncStorage 3.x (import por defecto con getItem/setItem/removeItem) no se pudo
// confirmar en la documentación web (ver docs/PENDIENTES.md). Todo el acceso pasa por este archivo para
// que, si cambia, se corrija en un solo lugar.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_ROL_SELECCIONADO = 'selectedRole';

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
