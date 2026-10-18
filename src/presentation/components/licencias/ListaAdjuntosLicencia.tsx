// Pestaña "Adjuntos" de los detalles de licencia. Port de COLUMNS_ADJUNTOS del portal (nombre, tipo, fecha, previsualizar).
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { abrirAdjuntoDeLicencia } from '../../../application/licencias/adjuntosService';
import { etiquetaTipo } from '../../../domain/legajo/archivos';
import type { Adjunto } from '../../../domain/legajo/tipos';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppText } from '../AppText';
import { InfoAlert } from '../InfoAlert';

interface ListaAdjuntosLicenciaProps {
  licenciaId: string;
  adjuntos: Adjunto[];
  cargando: boolean;
  fallo: boolean;
}

export const ListaAdjuntosLicencia: React.FC<ListaAdjuntosLicenciaProps> = ({ licenciaId, adjuntos, cargando, fallo }) => {
  const { globalColors } = useThemeColors();
  const [abriendo, setAbriendo] = useState<string | null>(null);

  const abrir = async (adjunto: Adjunto) => {
    setAbriendo(adjunto.id);
    try {
      await abrirAdjuntoDeLicencia(licenciaId, adjunto);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo abrir el documento.');
    } finally {
      setAbriendo(null);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }
  if (fallo) return <InfoAlert tipo="error">No pudimos cargar los documentos. Por favor, volvé a intentar.</InfoAlert>;
  if (adjuntos.length === 0) {
    return (
      <View style={styles.centro}>
        <AppText variant="body2" tone="secondary">
          Sin registros
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.lista}>
      {adjuntos.map((adjunto) => (
        <View key={adjunto.id} style={[styles.fila, { borderColor: globalColors.border }]}>
          <View style={styles.textos}>
            <AppText variant="body2" numberOfLines={2}>
              {adjunto.filename}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {`${etiquetaTipo(adjunto.mimetype, adjunto.filename)} · ${adjunto.createdon ?? '—'}`}
            </AppText>
          </View>
          {abriendo === adjunto.id ? (
            <ActivityIndicator color={globalColors.accentPrimary} style={styles.espera} />
          ) : (
            <AccionIcono
              icono="eye-outline"
              etiqueta={`Previsualizar ${adjunto.filename}`}
              onPress={() => abrir(adjunto)}
              disabled={abriendo !== null}
            />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  lista: { gap: spacing.sm },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  textos: { flex: 1, gap: spacing.xxs },
  espera: { marginHorizontal: spacing.md },
});
