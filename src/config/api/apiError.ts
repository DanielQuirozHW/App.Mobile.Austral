// Mensaje de error de la API tal como lo muestra el portal en sus toasts:
//   toast.error(error?.response?.data || "Error al cargar archivo")
// Si el backend devuelve un texto se muestra ese texto; si no, el mensaje por defecto.
export const mensajeDeErrorApi = (error: unknown, porDefecto: string): string => {
  const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
  return typeof data === 'string' && data.trim() !== '' ? data : porDefecto;
};
