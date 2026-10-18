// Adjuntos ya cargados de un documento de familiar. Port de Portal-Austral-Dev -> ModalVerDocumentosFamiliar.tsx.
// El portal previsualiza PDF e imágenes dentro del modal; acá el archivo se abre con el visor del sistema.
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { obtenerAdjuntosDeDocumento } from '../../../application/legajo/legajoService';
import { etiquetaTipo } from '../../../domain/legajo/archivos';
import type { Adjunto } from '../../../domain/legajo/tipos';
import { abrirAdjunto } from '../../../infrastructure/archivos/visorArchivos';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { InfoAlert } from '../InfoAlert';

interface ModalVerAdjuntosProps {
  documento: { id: string; nombre?: string };
  onClose: () => void;
}

export const ModalVerAdjuntos: React.FC<ModalVerAdjuntosProps> = ({ documento, onClose }) => {
  const { globalColors } = useThemeColors();
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let activo = true;
    obtenerAdjuntosDeDocumento(documento.id)
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
  }, [documento.id]);

  const abrir = async (adjunto: Adjunto) => {
    try {
      await abrirAdjunto(adjunto);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo abrir el documento.');
    }
  };

  return (
    <AppModal
      visible
      onClose={onClose}
      titulo={documento.nombre || 'Documentos del familiar'}
      pie={<AppButton title="Cerrar" variant="secondary" onPress={onClose} />}
    >
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={globalColors.accentPrimary} />
        </View>
      ) : fallo ? (
        <InfoAlert tipo="error">No pudimos cargar los documentos. Por favor, volvé a intentar.</InfoAlert>
      ) : adjuntos.length === 0 ? (
        <View style={styles.centro}>
          <AppText variant="body2" tone="secondary">
            Sin registros
          </AppText>
        </View>
      ) : (
        adjuntos.map((adjunto) => (
          <View key={adjunto.id} style={[styles.fila, { borderColor: globalColors.border }]}>
            <View style={styles.textos}>
              <AppText variant="body2" numberOfLines={2}>
                {adjunto.filename}
              </AppText>
              <AppText variant="caption" tone="secondary">
                {`${etiquetaTipo(adjunto.mimetype, adjunto.filename)} · ${adjunto.createdon ?? '—'}`}
              </AppText>
            </View>
            <AccionIcono icono="eye-outline" etiqueta={`Previsualizar ${adjunto.filename}`} onPress={() => abrir(adjunto)} />
          </View>
        ))
      )}
    </AppModal>
  );
};

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  textos: { flex: 1, gap: spacing.xxs },
});
