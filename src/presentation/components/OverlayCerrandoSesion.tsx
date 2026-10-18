import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { spacing } from '../utils/responsive';
import { useAuthStore } from '../stores/authStore';
import { AppText } from './AppText';

/**
 * Overlay "Cerrando sesión…" (AuthContext.tsx del portal: loggingOut). Cubre toda la pantalla y bloquea los toques
 * mientras dura el cierre de sesión.
 */
export const OverlayCerrandoSesion: React.FC = () => {
  const { globalColors } = useThemeColors();
  const visible = useAuthStore((s) => s.cerrandoSesion);

  if (!visible) return null;

  return (
    <View
      style={[styles.capa, { backgroundColor: globalColors.overlay }]}
      accessibilityViewIsModal
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator size="large" color={globalColors.textInverse} />
      <AppText variant="subtitle1" style={{ color: globalColors.textInverse }}>
        Cerrando sesión…
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  capa: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    zIndex: 1000,
    elevation: 1000,
  },
});
