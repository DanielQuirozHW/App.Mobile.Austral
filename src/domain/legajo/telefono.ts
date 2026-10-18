// Teléfono móvil: se guarda como "+<pais> <ddn> <numero>". Port de formatTelefono y de la hidratación
// de Portal-Austral-Dev -> src/app/(dashboard)/legajo/datos-personales/page.tsx.

// Códigos de país de 2 dígitos que reconoce el portal; cualquier otro se trata como de 3.
const PAISES_DOS_DIGITOS = [
  '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
  '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84',
  '86', '90', '91', '92', '93', '94', '95', '98',
];

export interface TelefonoPartes {
  pais: string;
  ddn: string;
  numero: string;
}

/** Normaliza un teléfono suelto a "+PP DDDD NNNNNNNN". */
export const formatTelefono = (input = ''): string => {
  let raw = input.replace(/[^\d+]/g, '');
  if (!raw.startsWith('+')) raw = '+' + raw.replace(/[+]/g, '');
  const digits = raw.slice(1);
  if (digits.length === 0) return '+';
  if (digits.length < 2) return '+' + digits;

  let paisLength = 2;
  if (!PAISES_DOS_DIGITOS.includes(digits.slice(0, 2)) && digits.length >= 3) paisLength = 3;

  const pais = digits.slice(0, paisLength);
  const resto = digits.slice(paisLength);
  const ddn = resto.slice(0, 4);
  const numero = resto.slice(4, 12);

  let resultado = '+' + pais;
  if (ddn.length > 0) resultado += ' ' + ddn;
  if (numero.length > 0) resultado += ' ' + numero;
  return resultado;
};

/** Parte el valor guardado en los tres campos del formulario. */
export const partirTelefono = (valor?: string | null): TelefonoPartes => {
  const texto = String(valor ?? '');
  if (!texto) return { pais: '', ddn: '', numero: '' };
  const formateado = texto.startsWith('+') && texto.includes(' ') ? texto : formatTelefono(texto);
  const partes = formateado.replace('+', '').split(' ');
  return { pais: partes[0] || '', ddn: partes[1] || '', numero: partes[2] || '' };
};

/** Une los tres campos como lo manda el portal al guardar. */
export const unirTelefono = (p: Partial<TelefonoPartes>): string =>
  `+${p.pais || ''} ${p.ddn || ''} ${p.numero || ''}`;
