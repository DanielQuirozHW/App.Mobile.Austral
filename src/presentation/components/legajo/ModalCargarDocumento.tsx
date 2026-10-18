// Carga de archivos a un documento de familiar. Port de Portal-Austral-Dev -> ModalCargarDocumentos.tsx
// (textos, tipos aceptados y límite de peso); la selección usa los selectores del sistema en lugar del dropzone web.
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { subirAdjuntosDeFamiliar } from '../../../application/legajo/legajoService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
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
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { Etiqueta } from '../Etiqueta';
import { InfoAlert } from '../InfoAlert';

interface ModalCargarDocumentoProps {
  documento: { id: string; nombre: string };
  onClose: () => void;
}

export const ModalCargarDocumento: React.FC<ModalCargarDocumentoProps> = ({ documento, onClose }) => {
  const { globalColors } = useThemeColors();
  const [archivos, setArchivos] = useState<ArchivoElegido[]>([]);
  const [cargando, setCargando] = useState(false);

  const agregar = async (elegir: () => Promise<ResultadoSeleccion>) => {
    try {
      const { archivos: nuevos, errores } = await elegir();
      if (errores.length > 0) toast.error(errores.join('\n'), 5000);
      if (nuevos.length > 0) {
        setArchivos((actuales) => [...actuales, ...nuevos.filter((n) => !actuales.some((a) => a.uri === n.uri))]);
      }
    } catch {
      toast.error('No se pudo abrir el selector de archivos.');
    }
  };

  const quitar = (uri: string) => setArchivos((actuales) => actuales.filter((a) => a.uri !== uri));

  const cargar = async () => {
    if (archivos.length === 0) return;
    setCargando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await subirAdjuntosDeFamiliar(
        documento.id,
        archivos.map(({ uri, name, type }) => ({ uri, name, type })),
      );
      toast.dismiss(idToast);
      toast.success('Archivo cargado con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al cargar archivo'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <AppModal
      visible
      onClose={onClose}
      titulo="Cargar archivo"
      subtitulo="Legajo > Documentación > Cargar archivo"
      cerrable={!cargando}
      altaCompleta
      pie={
        <>
          <AppButton title="Cancelar" variant="secondary" onPress={onClose} disabled={cargando} />
          <AppButton
            title={cargando ? 'Cargando…' : 'Cargar archivos'}
            onPress={cargar}
            loading={cargando}
            disabled={archivos.length === 0}
          />
        </>
      }
    >
      <View style={styles.encabezado}>
        <Etiqueta texto="Documento requerido" tipo="info" />
        <AppText variant="h6">{documento.nombre}</AppText>
      </View>

      <View style={[styles.zona, { borderColor: globalColors.border, backgroundColor: globalColors.inputBackground }]}>
        <AppIcon name="cloud-upload-outline" size={iconSizes.xl} color={globalColors.accentPrimary} />
        <AppText variant="body2" style={styles.centrado}>
          Seleccioná los archivos desde tu dispositivo
        </AppText>
        <AppText variant="caption" tone="secondary" style={styles.centrado}>
          Tipos de archivos aceptados: JPG, JPEG, PNG, PDF, DOC, DOCX
        </AppText>
        <View style={styles.botones}>
          <AppButton title="Archivos" variant="secondary" icon="folder-open-outline" onPress={() => agregar(elegirDocumentos)} disabled={cargando} />
          <AppButton title="Galería" variant="secondary" icon="images-outline" onPress={() => agregar(elegirDeGaleria)} disabled={cargando} />
          <AppButton title="Cámara" variant="secondary" icon="camera-outline" onPress={() => agregar(elegirDeCamara)} disabled={cargando} />
        </View>
      </View>

      <InfoAlert tipo="advertencia">El tamaño máximo permitido por archivo es de 15 MB.</InfoAlert>

      {archivos.length > 0 ? (
        <View style={styles.lista}>
          <View style={styles.listaEncabezado}>
            <AppText variant="subtitle2">{`Archivos seleccionados (${archivos.length})`}</AppText>
            <Pressable onPress={() => setArchivos([])} disabled={cargando} accessibilityRole="button" hitSlop={spacing.sm}>
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
              <AccionIcono icono="close" etiqueta={`Quitar ${archivo.name}`} onPress={() => quitar(archivo.uri)} peligro disabled={cargando} />
            </View>
          ))}
        </View>
      ) : null}
    </AppModal>
  );
};

const styles = StyleSheet.create({
  encabezado: { gap: spacing.xs },
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
