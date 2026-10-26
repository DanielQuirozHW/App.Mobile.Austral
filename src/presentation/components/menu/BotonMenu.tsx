// Botón de hamburguesa: abre el menú lateral. Va en el encabezado de cada pantalla y en la barra superior de Inicio.
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useMenuStore } from '../../stores/menuStore';
import { useThemeColors } from '../../theme/theme';
import { iconSizes, platformSpecific, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';

export const BotonMenu: React.FC = () => {
  const { globalColors } = useThemeColors();
  const abrir = useMenuStore((s) => s.abrir);

  return (
    <Pressable
      onPress={abrir}
      hitSlop={spacing.sm}
      accessibilityRole="button"
      accessibilityLabel="Abrir menú"
      style={styles.boton}
    >
      <AppIcon name="menu-outline" size={iconSizes.lg} color={globalColors.text} />
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
