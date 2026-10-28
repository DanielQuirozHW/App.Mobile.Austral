#!/usr/bin/env node
/* eslint-disable */
// Copia los textos de las frases del mes del portal a la app.
//
// Uso (desde la raíz de este repo, con el portal clonado en tu máquina):
//   node scripts/importar-frases.js <ruta>/Portal-Austral-Dev/src/@core/data/frases-mensuales.ts
//
// Qué hace:
//   1. Lee el archivo del portal y saca, de cada entrada, `numero`, `libro` y `texto`.
//   2. En src/domain/inicio/frasesMensuales.ts reemplaza el `texto` de la entrada que tiene el mismo libro y número.
//   3. Si falta alguna, o el texto viene vacío, no escribe nada y avisa cuál.
//   Se puede correr más de una vez: pisa los textos con los del portal.
//
// Los textos son pasajes de libros publicados: este script los copia de archivo a archivo en tu máquina; no los
// imprime en pantalla (solo número, libro y cantidad de caracteres).
// No usa dependencias: solo Node.

const fs = require('fs');
const path = require('path');

const RUTA_APP = path.join(__dirname, '..', 'src', 'domain', 'inicio', 'frasesMensuales.ts');

const origen = process.argv[2];
if (!origen) {
  console.error('Falta la ruta del archivo del portal.');
  console.error('Uso: node scripts/importar-frases.js <ruta al frases-mensuales.ts del portal>');
  process.exit(1);
}

const rutaPortal = path.resolve(origen);
if (!fs.existsSync(rutaPortal)) {
  console.error(`No existe el archivo: ${rutaPortal}`);
  process.exit(1);
}

const fuentePortal = fs.readFileSync(rutaPortal, 'utf8');
const fuenteApp = fs.readFileSync(RUTA_APP, 'utf8');

// Entrada del portal: numero, libro, autor y texto, en ese orden. El texto va entre comillas simples, dobles o
// invertidas, y puede empezar en la línea de abajo de `texto:`.
const ENTRADA_PORTAL =
  /numero:\s*(['"])([^'"]+)\1\s*,\s*libro:\s*(['"])([^'"]+)\3\s*,\s*autor:\s*[^,]+,\s*texto:\s*(['"`])((?:\\[\s\S]|(?!\5)[^\\])*)\5/g;

// Entrada de la app, vacía o ya completada.
const ENTRADA_APP =
  /\{\s*numero:\s*'([^']+)',\s*libro:\s*'([^']+)',\s*autor:\s*AUTOR,\s*texto:\s*(?:''|'(?:\\[\s\S]|[^'\\])*')\s*,?\s*\}/g;

// Convierte las secuencias de escape de un literal de texto en los caracteres que representan.
const desescapar = (literal) =>
  literal.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|\r?\n|[\s\S])/g, (_, codigo) => {
    if (codigo[0] === 'u' && codigo.length === 5) return String.fromCharCode(parseInt(codigo.slice(1), 16));
    if (codigo[0] === 'x' && codigo.length === 3) return String.fromCharCode(parseInt(codigo.slice(1), 16));
    if (codigo === '\n' || codigo === '\r\n') return '';
    const simples = { n: '\n', t: '\t', r: '\r' };
    return Object.prototype.hasOwnProperty.call(simples, codigo) ? simples[codigo] : codigo;
  });

// Arma un literal de comillas simples para TypeScript.
const aLiteral = (texto) =>
  "'" +
  texto
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n') +
  "'";

const delPortal = new Map();
let coincidencia;
while ((coincidencia = ENTRADA_PORTAL.exec(fuentePortal)) !== null) {
  const numero = coincidencia[2];
  const libro = coincidencia[4];
  const texto = desescapar(coincidencia[6]).trim();
  delPortal.set(`${libro}:${numero}`, texto);
}

if (delPortal.size === 0) {
  console.error('No se encontró ninguna frase en el archivo del portal. ¿Es el frases-mensuales.ts correcto?');
  process.exit(1);
}

const faltantes = [];
const vacias = [];
let cantidadEnApp = 0;

const resultado = fuenteApp.replace(ENTRADA_APP, (entrada, numero, libro) => {
  cantidadEnApp += 1;
  const clave = `${libro}:${numero}`;
  if (!delPortal.has(clave)) {
    faltantes.push(`${libro} ${numero}`);
    return entrada;
  }
  const texto = delPortal.get(clave);
  if (!texto) {
    vacias.push(`${libro} ${numero}`);
    return entrada;
  }
  console.log(`  ${libro} ${numero}: ${texto.length} caracteres`);
  return `{\n    numero: '${numero}',\n    libro: '${libro}',\n    autor: AUTOR,\n    texto:\n      ${aLiteral(texto)},\n  }`;
});

if (cantidadEnApp === 0) {
  console.error('No se reconoció ninguna entrada en src/domain/inicio/frasesMensuales.ts (¿cambió el formato?).');
  process.exit(1);
}

if (faltantes.length > 0 || vacias.length > 0) {
  if (faltantes.length > 0) console.error(`Frases que no están en el archivo del portal: ${faltantes.join(', ')}`);
  if (vacias.length > 0) console.error(`Frases con el texto vacío en el portal: ${vacias.join(', ')}`);
  console.error('No se escribió nada.');
  process.exit(1);
}

fs.writeFileSync(RUTA_APP, resultado, 'utf8');
console.log(`Listo: ${cantidadEnApp} frases copiadas en ${path.relative(process.cwd(), RUTA_APP)}.`);
