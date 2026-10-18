// Las variables se inyectan en la compilación con react-native-dotenv (ver babel.config.js).
// Acá no hay ningún valor: viven solo en el .env local, que no se commitea.
// Importante: se lee siempre como process.env.NOMBRE (acceso literal) para que el plugin pueda reemplazarlo.
declare const process: { env: Record<string, string | undefined> };

const limpiar = (valor: string | undefined): string => (valor ?? '').trim();

export const env = {
  apiUrl: limpiar(process.env.API_URL),
  apiServiceEmail: limpiar(process.env.API_SERVICE_EMAIL),
  apiServicePassword: limpiar(process.env.API_SERVICE_PASSWORD),
  microsoftTenant: limpiar(process.env.MICROSOFT_TENANT),
} as const;

/**
 * Nombres de las variables obligatorias que están vacías.
 * MICROSOFT_TENANT es opcional y no se incluye.
 */
export const variablesDeEntornoFaltantes = (): string[] => {
  const faltantes: string[] = [];
  if (!env.apiUrl) faltantes.push('API_URL');
  if (!env.apiServiceEmail) faltantes.push('API_SERVICE_EMAIL');
  if (!env.apiServicePassword) faltantes.push('API_SERVICE_PASSWORD');
  return faltantes;
};
