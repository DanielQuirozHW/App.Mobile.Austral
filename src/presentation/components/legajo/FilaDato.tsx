import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface FilaDatoProps {
  label: string;
  valor?: string | null;
  /** Texto debajo del valor. */
  descripcion?: string;
}

/** Par etiqueta / valor de las vistas de solo lectura. Un valor vacío se muestra como "— Sin cargar". */
export const FilaDato: React.FC<FilaDatoProps> = ({ label, valor, descripcion }) => (
  <View style={styles.fila}>
    <AppText variant="caption" tone="secondary">
      {label}
    </AppText>
    {valor ? (
      <AppText variant="body1">{valor}</AppText>
    ) : (
      <AppText variant="body2" tone="tertiary">
        — Sin cargar
      </AppText>
    )}
    {descripcion ? (
      <AppText variant="caption" tone="secondary">
        {descripcion}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  fila: { gap: spacing.xxs },
});
