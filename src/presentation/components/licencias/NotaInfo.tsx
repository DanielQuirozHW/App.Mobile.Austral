import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { iconSizes, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';

interface NotaInfoProps {
  children: React.ReactNode;
}

/** Nota con barra lateral (los Box role="note" de ModalSolicitarVacaciones del portal). */
export const NotaInfo: React.FC<NotaInfoProps> = ({ children }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  return (
    <View accessibilityRole="text" style={styles.caja}>
      <AppIcon name="information-circle-outline" size={iconSizes.md} color={globalColors.info} />
      <View style={styles.texto}>
        {typeof children === 'string' ? <AppText variant="caption">{children}</AppText> : children}
      </View>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    caja: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: c.info,
      backgroundColor: c.accentPrimaryMuted,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    },
    texto: { flex: 1 },
  });
