import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { useToastStore, type ItemToast } from '../stores/toastStore';
import { borderRadius, iconSizes, platformSpecific, spacing } from '../utils/responsive';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

interface ToastHostProps {
  /** true cuando se dibuja dentro de un Modal (ver toastStore.modalesAbiertos). */
  dentroDeModal?: boolean;
}

const Icono: React.FC<{ tipo: ItemToast['tipo']; c: ColorTokens }> = ({ tipo, c }) => {
  if (tipo === 'cargando') return <ActivityIndicator size="small" color={c.accentPrimary} />;
  if (tipo === 'exito') return <AppIcon name="checkmark-circle" size={iconSizes.lg} color={c.success} />;
  return <AppIcon name="alert-circle" size={iconSizes.lg} color={c.danger} />;
};

/** Pila de avisos en la parte superior. Se monta una vez en la raíz y una vez dentro de cada modal. */
export const ToastHost: React.FC<ToastHostProps> = ({ dentroDeModal = false }) => {
  const { globalColors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const items = useToastStore((s) => s.items);
  const modalesAbiertos = useToastStore((s) => s.modalesAbiertos);
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  if (items.length === 0) return null;
  if (!dentroDeModal && modalesAbiertos > 0) return null;

  return (
    <View pointerEvents="none" style={[styles.contenedor, { top: insets.top + spacing.sm }]}>
      {items.map((item) => (
        <View
          key={item.id}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[styles.toast, item.tipo === 'error' && styles.toastError, item.tipo === 'exito' && styles.toastExito]}
        >
          <Icono tipo={item.tipo} c={globalColors} />
          <AppText variant="body2" style={styles.mensaje}>
            {item.mensaje}
          </AppText>
        </View>
      ))}
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenedor: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      gap: spacing.sm,
      zIndex: 1000,
      elevation: 1000,
    },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceElevated,
      ...platformSpecific.shadow(4),
    },
    toastError: { borderColor: c.danger, backgroundColor: c.dangerLight },
    toastExito: { borderColor: c.success, backgroundColor: c.successLight },
    mensaje: { flex: 1 },
  });
