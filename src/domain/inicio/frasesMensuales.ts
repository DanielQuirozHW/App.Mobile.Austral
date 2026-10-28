// Frases del mes del Tablero de Inicio. Estructura de Portal-Austral-Dev -> src/@core/data/frases-mensuales.ts.
//
// El campo `texto` se completa con `node scripts/importar-frases.js <ruta al frases-mensuales.ts del portal>`: el script
// copia los 18 textos del archivo del portal a este, en el mismo orden (el orden define qué frase toca cada mes: junio de
// 2026 es la primera y el ciclo se repite cada 18 meses). Son pasajes de libros publicados, por eso los textos no se
// escribieron a mano ni pasaron por el chat. Los datos de referencia (número, libro y autor) ya están.
// Mientras `texto` esté vacío, el tablero no muestra la tarjeta de la frase.
// IMPORTANTE: cada entrada tiene que seguir en el formato de una línea (`{ numero, libro, autor: AUTOR, texto: '' }`),
// porque el script lo busca así.
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
