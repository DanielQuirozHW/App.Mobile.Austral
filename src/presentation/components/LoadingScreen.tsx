import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { spacing } from '../utils/responsive';
import { AppText } from './AppText';

interface LoadingScreenProps {
  message?: string;
}

/** Pantalla de carga a pantalla completa (por ejemplo, mientras se rehidrata la sesión). */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const { globalColors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: globalColors.background }]}>
      <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      {message ? (
        <AppText variant="body2" tone="secondary" style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  message: { marginTop: spacing.lg, textAlign: 'center' },
});
