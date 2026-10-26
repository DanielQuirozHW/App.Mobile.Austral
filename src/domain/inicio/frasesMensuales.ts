// Frases del mes del Tablero de Inicio. Estructura de Portal-Austral-Dev -> src/@core/data/frases-mensuales.ts.
//
// PENDIENTE DE DANIEL: el campo `texto` de cada entrada va VACÍO a propósito. Son pasajes de libros publicados y no se
// copian a este repo; hay que pegarlos desde el archivo del portal, en el mismo orden (el orden define qué frase toca
// cada mes: junio de 2026 es la primera y el ciclo se repite cada 18 meses). Los datos de referencia (número, libro y
// autor) sí están. Mientras `texto` esté vacío, el tablero no muestra la tarjeta de la frase.
export interface FraseMensual {
  numero: string;
  libro: string;
  autor: string;
  texto: string;
}

const AUTOR = 'San Josemaría Escrivá de Balaguer';

export const FRASES_MENSUALES: FraseMensual[] = [
  { numero: '489', libro: 'SURCO', autor: AUTOR, texto: '' },
  { numero: '495', libro: 'SURCO', autor: AUTOR, texto: '' },
  { numero: '496', libro: 'SURCO', autor: AUTOR, texto: '' },
  { numero: '497', libro: 'SURCO', autor: AUTOR, texto: '' },
  { numero: '527', libro: 'SURCO', autor: AUTOR, texto: '' },
  { numero: '680', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '685', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '705', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '709', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '714', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '725', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '727', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '730', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '733', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '736', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '743', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '325', libro: 'FORJA', autor: AUTOR, texto: '' },
  { numero: '983', libro: 'CAMINO', autor: AUTOR, texto: '' },
];
