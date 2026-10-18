import { useEffect, useState } from 'react';
import { listarAdjuntosDeLicencia } from '../../../application/licencias/adjuntosService';
import type { Adjunto } from '../../../domain/legajo/tipos';

interface AdjuntosDeLicencia {
  adjuntos: Adjunto[];
  cargando: boolean;
  fallo: boolean;
}

/** Lee los adjuntos de una licencia al montarse y cada vez que cambia el id. */
export const useAdjuntosDeLicencia = (licenciaId: string): AdjuntosDeLicencia => {
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setFallo(false);
    listarAdjuntosDeLicencia(licenciaId)
      .then((lista) => {
        if (activo) setAdjuntos(lista);
      })
      .catch(() => {
        if (activo) setFallo(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [licenciaId]);

  return { adjuntos, cargando, fallo };
};
