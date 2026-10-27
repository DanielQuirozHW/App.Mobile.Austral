// Selección de archivos para certificados. Port de Portal-Austral-Dev -> CargarAdjuntos (textos y tipos aceptados);
// en el celular se elige desde Archivos, Galería o Cámara en lugar del dropzone web.
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatearPeso } from '../../../domain/legajo/archivos';
import {
  elegirDeCamara,
  elegirDeGaleria,
  elegirDocumentos,
  type ArchivoElegido,
  type ResultadoSeleccion,
} from '../../../infrastructure/archivos/seleccionArchivos';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { InfoAlert } from '../InfoAlert';

interface SelectorArchivosProps {
  archivos: ArchivoElegido[];
  onChange: (archivos: ArchivoElegido[]) => void;
  disabled?: boolean;
}

export const SelectorArchivos: React.FC<SelectorArchivosProps> = ({ archivos, onChange, disabled = false }) => {
  const { globalColors } = useThemeColors();

  const agregar = async (elegir: () => Promise<ResultadoSeleccion>) => {
    try {
      const { archivos: nuevos, errores } = await elegir();
      if (errores.length > 0) toast.error(errores.join('\n'), 5000);
      if (nuevos.length > 0) {
        onChange([...archivos, ...nuevos.filter((n) => !archivos.some((a) => a.uri === n.uri))]);
      }
    } catch {
      toast.error('No se pudo abrir el selector de archivos.');
    }
  };

  return (
    <View style={styles.contenedor}>
      <View style={[styles.zona, { borderColor: globalColors.inputBorder, backgroundColor: globalColors.inputBackground }]}>
        <AppIcon name="cloud-upload-outline" size={iconSizes.xl} color={globalColors.accentPrimary} />
        <AppText variant="body2" style={styles.centrado}>
          Seleccioná los archivos desde tu dispositivo
        </AppText>
        <AppText variant="caption" tone="secondary" style={styles.centrado}>
          Tipos de archivos aceptados: JPG, JPEG, PNG, PDF, DOC, DOCX
        </AppText>
        <View style={styles.botones}>
          <AppButton title="Archivos" variant="secondary" icon="folder-open-outline" onPress={() => agregar(elegirDocumentos)} disabled={disabled} />
          <AppButton title="Galería" variant="secondary" icon="images-outline" onPress={() => agregar(elegirDeGaleria)} disabled={disabled} />
          <AppButton title="Cámara" variant="secondary" icon="camera-outline" onPress={() => agregar(elegirDeCamara)} disabled={disabled} />
        </View>
      </View>

      <InfoAlert tipo="advertencia">El tamaño máximo permitido por archivo es de 15 MB.</InfoAlert>

      {archivos.length > 0 ? (
        <View style={styles.lista}>
          <View style={styles.listaEncabezado}>
            <AppText variant="subtitle2">{`Archivos seleccionados (${archivos.length})`}</AppText>
            <Pressable onPress={() => onChange([])} disabled={disabled} accessibilityRole="button" hitSlop={spacing.sm}>
              <AppText variant="button" tone="danger">
                Quitar todo
              </AppText>
            </Pressable>
          </View>
          {archivos.map((archivo) => (
            <View key={archivo.uri} style={[styles.archivo, { borderColor: globalColors.border }]}>
              <AppIcon name="document-text-outline" size={iconSizes.lg} color={globalColors.accentPrimary} />
              <View style={styles.archivoTextos}>
                <AppText variant="body2" numberOfLines={1}>
                  {archivo.name}
                </AppText>
                {formatearPeso(archivo.tamanio) ? (
                  <AppText variant="caption" tone="secondary">
                    {formatearPeso(archivo.tamanio)}
                  </AppText>
                ) : null}
              </View>
              <AccionIcono
                icono="close"
                etiqueta={`Quitar ${archivo.name}`}
                onPress={() => onChange(archivos.filter((a) => a.uri !== archivo.uri))}
                peligro
                disabled={disabled}
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.md },
  zona: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: borderRadius.card,
  },
  centrado: { textAlign: 'center' },
  botones: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  lista: { gap: spacing.sm },
  listaEncabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  archivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  archivoTextos: { flex: 1 },
});
