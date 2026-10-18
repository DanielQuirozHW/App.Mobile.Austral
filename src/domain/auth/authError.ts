// Textos de error en español. Port de Portal-Austral-Dev -> src/configs/authError.ts
// Los mensajes de popup del portal se conservan; los códigos nativos de cancelación en móvil están sin verificar (ver PENDIENTES).

export const AUTH_ERROR_ES: Record<string, string> = {
  'auth/invalid-email': 'El correo electrónico no tiene un formato válido.',
  'auth/missing-email': 'Falta ingresar el correo electrónico.',
  'auth/missing-password': 'Falta ingresar la contraseña.',
  'auth/weak-password': 'La contraseña es demasiado débil. Usá una más larga y segura.',
  'auth/email-already-in-use': 'Ese correo ya está registrado. Probá iniciar sesión o recuperar la contraseña.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada. Contactá al administrador.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'Correo y/o contraseña incorrecta.',
  'auth/invalid-login-credentials': 'Correo y/o contraseña incorrecta.',
  'auth/invalid-credential': 'Las credenciales son inválidas o expiraron. Volvé a intentar.',
  'auth/requires-recent-login': 'Por seguridad, necesitás volver a iniciar sesión para continuar.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos y volvé a intentar.',
  'auth/network-request-failed': 'Problema de conexión. Verificá tu internet e intentá de nuevo.',
  'auth/internal-error': 'Ocurrió un error interno. Intentá nuevamente.',
  'auth/operation-not-allowed': 'Este método de autenticación no está habilitado en Firebase.',
  'auth/app-not-authorized': 'La app no está autorizada para usar Firebase Auth (revisá configuración).',
  'auth/invalid-api-key': 'API Key inválida (revisá configuración de Firebase).',
  'auth/invalid-user-token': 'La sesión no es válida o expiró. Iniciá sesión nuevamente.',
  'auth/user-token-expired': 'La sesión expiró. Iniciá sesión nuevamente.',
  'auth/invalid-continue-uri': 'La URL de continuación no es válida (configuración).',
  'auth/unauthorized-continue-uri': 'La URL de continuación no está autorizada (configuración).',
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con el mismo correo pero con un método de ingreso diferente. Usá el método correcto.',
  'auth/provider-already-linked': 'Ese proveedor ya está vinculado a esta cuenta.',
  'auth/credential-already-in-use': 'Estas credenciales ya están asociadas a otra cuenta.',
  'auth/missing-continue-uri': 'Falta la URL de redirección para continuar (configuración).',
  'auth/expired-action-code': 'El enlace expiró. Solicitá uno nuevo.',
  'auth/invalid-action-code': 'El enlace no es válido o ya fue usado.',
  'email is not defined': 'Falta ingresar el correo electrónico.',
};

export const POPUP_AUTH_ERROR_ES: Record<string, string> = {
  'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permití popups o intentá desde otra pestaña/navegador.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de autenticación antes de finalizar.',
  'auth/cancelled-popup-request': 'Se canceló la solicitud de popup. Intentá nuevamente.',
  'auth/operation-not-supported-in-this-environment':
    'Este método no está soportado en este entorno (por ejemplo, navegador embebido).',
  'auth/unauthorized-domain': "Este dominio no está autorizado en Firebase. Revisá 'Authorized domains' en Auth.",
  'auth/timeout': 'La autenticación tardó demasiado. Volvé a intentar.',
};

export const FIRESTORE_ERROR_ES: Record<string, string> = {
  'permission-denied': 'No tenés permisos para realizar esta acción.',
  unauthenticated: 'Necesitás iniciar sesión para continuar.',
  'not-found': 'No se encontró el recurso solicitado.',
  'already-exists': 'El recurso ya existe.',
  'failed-precondition': 'La operación no se puede ejecutar en el estado actual.',
  aborted: 'La operación fue cancelada. Intentá nuevamente.',
  'invalid-argument': 'Se enviaron datos inválidos. Revisá los campos e intentá otra vez.',
  'resource-exhausted': 'Se alcanzó el límite de uso/cuota. Intentá más tarde.',
  unavailable: 'El servicio no está disponible temporalmente. Reintentá en unos minutos.',
  'deadline-exceeded': 'La operación tardó demasiado. Verificá tu conexión e intentá de nuevo.',
  internal: 'Error interno del servidor. Intentá más tarde.',
  unknown: 'Ocurrió un error inesperado al acceder a la base de datos.',
};

export const STORAGE_ERROR_ES: Record<string, string> = {
  'storage/unauthorized': 'No tenés permisos para acceder/subir este archivo.',
  'storage/canceled': 'La operación fue cancelada.',
  'storage/unknown': 'Ocurrió un error inesperado en el almacenamiento.',
  'storage/object-not-found': 'El archivo no existe.',
  'storage/bucket-not-found': 'No se encontró el bucket de Storage (configuración).',
  'storage/project-not-found': 'No se encontró el proyecto de Firebase (configuración).',
  'storage/quota-exceeded': 'Se excedió la cuota de almacenamiento del proyecto.',
  'storage/unauthenticated': 'Tenés que iniciar sesión para subir/leer archivos.',
  'storage/retry-limit-exceeded': 'Se superó el límite de reintentos. Intentá nuevamente.',
  'storage/invalid-checksum': 'El archivo se dañó durante la subida. Reintentá.',
  'storage/cannot-slice-blob': 'No se pudo procesar el archivo. Probá con otro archivo.',
};

export const API_ERROR_ES: Record<string, string> = {
  NETWORK: 'No se pudo conectar con el servidor. Verificá tu conexión.',
  TIMEOUT: 'El servidor tardó demasiado en responder. Intentá de nuevo.',
  UNAUTHORIZED: 'Tu sesión no es válida o no tenés permisos. Volvé a iniciar sesión.',
  FORBIDDEN: 'No tenés permisos para realizar esta acción.',
  NOT_FOUND: 'No se encontró el recurso solicitado.',
  SERVER: 'El servidor tuvo un error. Intentá más tarde.',
  BAD_REQUEST: 'Los datos enviados no son válidos. Revisá e intentá nuevamente.',
};

// Mensajes propios del flujo de validación del empleado (los compara por texto getFriendlyErrorMessage).
export const MSG_CUENTA_INEXISTENTE = 'No existe una cuenta con ese correo en nuestro sistema';
export const MSG_CUENTA_INEXISTENTE_O_DESHABILITADA =
  'No existe una cuenta con ese correo en nuestro sistema o no se encuentra habilitada';
// Fallo transitorio del backend (200 con cuerpo vacío tras reintentar): NO es cuenta inexistente.
export const MSG_ERROR_TRANSITORIO =
  'No pudimos validar tu sesión en este momento. Por favor, intentá nuevamente en unos segundos.';

const esErrorDeAxios = (err: unknown): boolean => {
  const e = err as Record<string, unknown> | null;
  return !!(e?.isAxiosError || e?.response || e?.request);
};

export function getFriendlyErrorMessage(err: unknown): string {
  const e = err as { message?: string; code?: string; response?: { status?: number } } | null;

  // 1) Errores propios del flujo
  if (e?.message === MSG_CUENTA_INEXISTENTE) return `${MSG_CUENTA_INEXISTENTE}.`;
  if (e?.message === MSG_CUENTA_INEXISTENTE_O_DESHABILITADA) return `${MSG_CUENTA_INEXISTENTE_O_DESHABILITADA}.`;
  if (e?.message === MSG_ERROR_TRANSITORIO) return MSG_ERROR_TRANSITORIO;

  // 2) Firebase (Auth / Storage / Firestore traen .code)
  const code = e?.code;
  if (code) {
    if (AUTH_ERROR_ES[code]) return AUTH_ERROR_ES[code];
    if (POPUP_AUTH_ERROR_ES[code]) return POPUP_AUTH_ERROR_ES[code];
    if (STORAGE_ERROR_ES[code]) return STORAGE_ERROR_ES[code];
    if (FIRESTORE_ERROR_ES[code]) return FIRESTORE_ERROR_ES[code];
    const normalizado = String(code).replace(/^firestore\//, '');
    if (FIRESTORE_ERROR_ES[normalizado]) return FIRESTORE_ERROR_ES[normalizado];
    return 'Ocurrió un error al procesar la solicitud. Intentá nuevamente.';
  }

  // 3) Axios / API
  if (esErrorDeAxios(err)) {
    const status = e?.response?.status;
    if (!status) return API_ERROR_ES.NETWORK;
    if (status === 400) return API_ERROR_ES.BAD_REQUEST;
    if (status === 401) return API_ERROR_ES.UNAUTHORIZED;
    if (status === 403) return API_ERROR_ES.FORBIDDEN;
    if (status === 404) return API_ERROR_ES.NOT_FOUND;
    if (status >= 500) return API_ERROR_ES.SERVER;
    return 'Ocurrió un error al comunicarte con el servidor.';
  }

  // 4) Fallback general
  return 'Ocurrió un error inesperado. Intentá nuevamente.';
}
