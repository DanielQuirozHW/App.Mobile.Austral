// Adjuntos de una licencia: listado y apertura. Port de Portal-Austral-Dev -> useGetNotasLicencia y COLUMNS_ADJUNTOS.
// DIFERENCIA CONSCIENTE con el portal: el listado no trae el contenido de los archivos; el contenido de cada uno
// se pide recién cuando el usuario lo abre (en el celular, traer todo de una vez es pesado).
import type { Adjunto } from '../../domain/legajo/tipos';
import { abrirAdjunto } from '../../infrastructure/archivos/visorArchivos';
import { leerAdjuntoConContenido, leerAdjuntosDeLicencia } from '../../infrastructure/licencias/licenciasApi';

export const MSG_NO_SE_PUDO_ABRIR = 'No se pudo abrir el documento.';

/** Notas (adjuntos) de una licencia, sin contenido. */
export const listarAdjuntosDeLicencia = (licenciaId: string): Promise<Adjunto[]> => leerAdjuntosDeLicencia(licenciaId);

/** Pide el contenido del adjunto y lo abre con el visor del sistema. Lanza un Error con texto para el usuario si falla. */
export const abrirAdjuntoDeLicencia = async (licenciaId: string, adjunto: Adjunto): Promise<void> => {
  const completo = await leerAdjuntoConContenido(licenciaId, adjunto.id);
  if (!completo) throw new Error(MSG_NO_SE_PUDO_ABRIR);
  await abrirAdjunto(completo);
};
