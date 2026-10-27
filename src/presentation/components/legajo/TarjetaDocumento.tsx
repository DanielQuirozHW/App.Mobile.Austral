// Fila de la tabla de Documentación del legajo. Port de Portal-Austral-Dev -> src/columns/columnsDocumentosLegajo.tsx
// (COLUMNS_DOCS_LEGAJO): acciones "Ver Adjuntos" y "Cargar Archivo", Título, "Documento importado" y
// "Fecha de última carga realizada". En el celular cada fila es una tarjeta.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DocumentoEmpleado } from '../../../domain/documentacion/documentos';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, scale, spacing } from '../../utils/responsive';
import { AccionIcono } from '../AccionIcono';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';

interface TarjetaDocumentoProps {
  documento: DocumentoEmpleado;
  /** Carga reciente que el CRM todavía no refleja (check y fecha temporales del portal). */
  marcaTemporal?: { fecha: string };
  onVerAdjuntos: () => void;
  onCargarArchivo: () => void;
}

export const TarjetaDocumento: React.FC<TarjetaDocumentoProps> = ({
  documento,
  marcaTemporal,
  onVerAdjuntos,
  onCargarArchivo,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  // Mismo criterio que DocumentoImportadoIcon: el check temporal o lo que ya registró el CRM.
  const tieneDocumento = Boolean(marcaTemporal) || documento.cargoDoc;
  const soloTemporal = Boolean(marcaTemporal) && !documento.cargoDoc;
  const fecha = marcaTemporal?.fecha ?? documento.fechaDeCarga;

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <AppText variant="subtitle1" style={styles.titulo}>
          {documento.titulo || documento.nombre}
        </AppText>
        <View style={styles.acciones}>
          <AccionIcono icono="eye-outline" etiqueta="Ver adjuntos" onPress={onVerAdjuntos} />
          <AccionIcono icono="cloud-upload-outline" etiqueta="Cargar archivo" onPress={onCargarArchivo} />
        </View>
      </View>

      <View style={styles.fila}>
        <View>
          <AppIcon
            name={tieneDocumento ? 'checkmark-circle' : 'cloud-offline-outline'}
            size={iconSizes.lg}
            color={tieneDocumento ? globalColors.success : globalColors.textSecondary}
          />
          {soloTemporal ? <View style={styles.puntoTemporal} /> : null}
        </View>
        <AppText variant="body2" tone={tieneDocumento ? undefined : 'secondary'}>
          {tieneDocumento ? 'Documento importado' : 'Sin documento'}
        </AppText>
      </View>

      <AppText variant="caption" tone="secondary">
        {`Última carga realizada: ${fecha || 'Sin fecha'}`}
      </AppText>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    tarjeta: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    encabezado: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
    titulo: { flex: 1 },
    acciones: { flexDirection: 'row', alignItems: 'center' },
    fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    // Punto del portal: la carga todavía no figura en el CRM (color de advertencia del tema).
    puntoTemporal: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: scale(8),
      height: scale(8),
      borderRadius: scale(4),
      backgroundColor: c.warning,
      opacity: 0.8,
    },
  });
