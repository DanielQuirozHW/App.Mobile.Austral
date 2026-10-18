// Logos de la Universidad Austral. Los archivos son binarios y no se pueden subir por el conector:
// Daniel los copia desde `public/images` del portal a esta carpeta (lista en docs/SETUP-NATIVO.md).
//
// Mientras sean `null`, la app muestra el nombre en texto. Cuando estén copiados, se reemplaza cada `null` por
// su require, por ejemplo:
//   export const logoHorizontalColor: ImageSourcePropType | null = require('./logo-horizontal-color.png');
// (No se escribe el require ahora porque si el archivo no existe, Metro no compila.)
import type { ImageSourcePropType } from 'react-native';

/** Portal: /images/logo-horizontal-color.png (modo claro) */
export const logoHorizontalColor: ImageSourcePropType | null = null;

/** Portal: /images/logo-horizontal-blanco.png (modo oscuro) */
export const logoHorizontalBlanco: ImageSourcePropType | null = null;
