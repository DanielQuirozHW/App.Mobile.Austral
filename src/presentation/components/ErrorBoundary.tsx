// Red de seguridad de la app: si una pantalla lanza un error al dibujarse, en vez de cerrarse la app se muestra un
// aviso con "Reintentar" (que vuelve a montar todo lo de adentro). Propia de la app; el portal usa el manejo de errores
// de Next.js.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../utils/responsive';
import { AppButton } from './AppButton';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { Screen } from './Screen';
import { useThemeColors } from '../theme/theme';

const PantallaDeError: React.FC<{ onReintentar: () => void }> = ({ onReintentar }) => {
  const { globalColors } = useThemeColors();
  return (
    <Screen>
      <View style={styles.centro}>
        <AppIcon name="alert-circle-outline" size={48} color={globalColors.danger} />
        <AppText variant="h5" style={styles.texto}>
          Algo salió mal
        </AppText>
        <AppText variant="body2" tone="secondary" style={styles.texto}>
          Ocurrió un error inesperado. Probá de nuevo.
        </AppText>
        <AppButton title="Reintentar" onPress={onReintentar} />
      </View>
    </Screen>
  );
};

interface ErrorBoundaryState {
  hayError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hayError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hayError: true };
  }

  private reintentar = (): void => {
    this.setState({ hayError: false });
  };

  render(): React.ReactNode {
    if (this.state.hayError) return <PantallaDeError onReintentar={this.reintentar} />;
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
  texto: { textAlign: 'center' },
});
