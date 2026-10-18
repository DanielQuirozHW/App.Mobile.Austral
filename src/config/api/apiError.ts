// Mensaje de error de la API tal como lo muestra el portal en sus toasts:
//   toast.error(error?.response?.data || "Error al cargar archivo")
// Si el backend devuelve un texto se muestra ese texto; si no, el mensaje por defecto.
export const mensajeDeErrorApi = (error: unknown, porDefecto: string): string => {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  return typeof data === 'string' && data.trim() !== '' ? data : porDefecto;
};

// Las bajas de Perfil (títulos, idiomas, experiencias, etc.) muestran, en este orden:
//   error?.response?.data?.title || error?.message || "Error al eliminar ..."
export const mensajeDeErrorDeBaja = (error: unknown, porDefecto: string): string => {
  const e = error as { response?: { data?: { title?: unknown } }; message?: unknown } | null;
  const titulo = e?.response?.data?.title;
  if (typeof titulo === 'string' && titulo.trim() !== '') return titulo;
  if (typeof e?.message === 'string' && e.message.trim() !== '') return e.message;
  return porDefecto;
};
