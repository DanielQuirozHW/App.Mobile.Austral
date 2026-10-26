// Bloque de bienvenida. Port de Portal-Austral-Dev -> src/@core/components/austral/WelcomeBlock.tsx:
// "Bienvenido, {nombre}" (h1) y un subtítulo secundario.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface SaludoInicioProps {
  nombre: string;
  subtitulo?: string;
}

export const SaludoInicio: React.FC<SaludoInicioProps> = ({ nombre, subtitulo }) => (
  <View style={styles.contenedor}>
    <AppText variant="h1">Bienvenido, {nombre}</AppText>
    {subtitulo ? (
      <AppText variant="body2" tone="secondary" style={styles.subtitulo}>
        {subtitulo}
      </AppText>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  contenedor: { marginBottom: spacing.sm },
  subtitulo: { marginTop: spacing.xs },
});
