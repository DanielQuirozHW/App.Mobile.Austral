import { esDocumentoAlfanumerico } from '../../../domain/legajo/opciones';

/**
 * Propiedades del campo "Nro. documento" según el tipo elegido (page.tsx y los modales del portal):
 * D.E. / Pasaporte / Documento Extranjero -> alfanumérico de hasta 20; el resto -> 8 dígitos. Siempre en mayúsculas.
 */
export const propsNumeroDocumento = (labelTipo?: string | null) => {
  const alfanumerico = esDocumentoAlfanumerico(labelTipo);
  return {
    maximo: alfanumerico ? 20 : 8,
    soloDigitos: !alfanumerico,
    mayusculas: true,
    transformar: alfanumerico ? (texto: string) => texto.replace(/[^a-zA-Z0-9]/g, '') : undefined,
    keyboardType: alfanumerico ? ('default' as const) : ('number-pad' as const),
    autoCapitalize: 'characters' as const,
    autoCorrect: false,
  };
};
