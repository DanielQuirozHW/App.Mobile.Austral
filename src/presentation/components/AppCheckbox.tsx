import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/theme';
import { iconSizes, platformSpecific, spacing } from '../utils/responsive';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

interface AppCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
}

/** Casilla con texto (FormControlLabel + Checkbox del portal: texto 0.875rem en color secundario). */
export const AppCheckbox: React.FC<AppCheckboxProps> = ({ label, checked, onChange }) => {
  const { globalColors } = useThemeColors();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={styles.fila}
    >
      <AppIcon
        name={checked ? 'checkbox' : 'square-outline'}
        size={iconSizes.lg}
        color={checked ? globalColors.accentPrimary : globalColors.textSecondary}
      />
      <AppText variant="body1" tone="secondary">
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: platformSpecific.minTouchTarget,
  },
});
