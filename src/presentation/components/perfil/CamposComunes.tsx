// Piezas de formulario que repiten los modales de Perfil.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../utils/responsive';
import { AppText } from '../AppText';
import { InfoAlert } from '../InfoAlert';

/** Contenedor vertical de campos. */
export const Campos: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.campos}>{children}</View>
);

/** Pie "* Campos obligatorios". */
export const PieObligatorios: React.FC = () => (
  <AppText variant="caption" tone="secondary">
    * Campos obligatorios
  </AppText>
);

export { InfoAlert };

const styles = StyleSheet.create({
  campos: { gap: spacing.md },
});
