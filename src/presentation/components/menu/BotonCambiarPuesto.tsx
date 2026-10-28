// Botón "Cambiar puesto". Equivale a SwitchUser del encabezado del portal (layouts/components/shared-components/
// SwitchUser.tsx): solo se dibuja si el usuario tiene MÁS DE UN puesto (`userRoles.length > 1`) y lleva a la pantalla de
// selección de puesto (en el portal `push('/seleccionar-puesto')`; acá `marcarSeleccionPendiente()` hace que
// RootNavigator muestre SeleccionarPuesto, y al elegir `seleccionar(rol)` vuelve a Inicio con el menú del puesto).
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useRolStore } from '../../stores/rolStore';
import { useThemeColors } from '../../theme/theme';
import { iconSizes, platformSpecific, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';

export const BotonCambiarPuesto: React.FC = () => {
  const { globalColors } = useThemeColors();
  const cantidadDePuestos = useRolStore((s) => s.userRoles.length);
  const marcarSeleccionPendiente = useRolStore((s) => s.marcarSeleccionPendiente);

  if (cantidadDePuestos <= 1) return null;

  return (
    <Pressable
      onPress={marcarSeleccionPendiente}
      hitSlop={spacing.sm}
      accessibilityRole="button"
      accessibilityLabel="Cambiar puesto"
      style={styles.boton}
    >
      <AppIcon name="swap-horizontal-outline" size={iconSizes.lg} color={globalColors.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  boton: {
    minWidth: platformSpecific.minTouchTarget,
    minHeight: platformSpecific.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
