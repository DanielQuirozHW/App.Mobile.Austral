import React from 'react';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useThemeColors } from '../theme/theme';
import { iconSizes } from '../utils/responsive';

export type AppIconName = React.ComponentProps<typeof Ionicons>['name'];

interface AppIconProps {
  name: AppIconName;
  size?: number;
  /** Si no se pasa, usa el color de texto del tema. */
  color?: string;
}

/**
 * Único punto de acceso a los íconos. Si se cambia de familia de íconos, se cambia solo acá.
 */
export const AppIcon: React.FC<AppIconProps> = ({ name, size = iconSizes.lg, color }) => {
  const { globalColors } = useThemeColors();
  return <Ionicons name={name} size={size} color={color ?? globalColors.text} />;
};
