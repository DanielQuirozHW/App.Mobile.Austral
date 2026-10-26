// Las variables se inyectan en la compilación con react-native-dotenv.
// Acá no hay ningún valor: viven solo en el .env local, que no se commitea.
// Importante: se lee siempre como process.env.NOMBRE (acceso literal) para que el plugin pueda reemplazarlo.
declare const process: { env: Record<string, string | undefined> };

const limpiar = (valor: string | undefined): string => (valor ?? '').trim();

export const env = {
  apiUrl: limpiar(process.env.API_URL),
  apiServiceEmail: limpiar(process.env.API_SERVICE_EMAIL),
  apiServicePassword: limpiar(process.env.API_SERVICE_PASSWORD),
  microsoftTenant: limpiar(process.env.MICROSOFT_TENANT),
  /** Portal Evaluación CAE (NEXT_PUBLIC_PORTAL_CAE_URL del portal). Opcional: vacío = la notificación no sale de la app. */
  portalCaeUrl: limpiar(process.env.PORTAL_CAE_URL),
} as const;

/**
 * Nombres de las variables obligatorias que están vacías.
 * MICROSOFT_TENANT y PORTAL_CAE_URL son opcionales y no se incluyen.
 */
export const variablesDeEntornoFaltantes = (): string[] => {
  const faltantes: string[] = [];
  if (!env.apiUrl) faltantes.push('API_URL');
  if (!env.apiServiceEmail) faltantes.push('API_SERVICE_EMAIL');
  if (!env.apiServicePassword) faltantes.push('API_SERVICE_PASSWORD');
  return faltantes;
};
