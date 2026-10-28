// Cartel del puesto elegido: "Portal Docente" / "Portal Staff", con "Cargando perfil..." mientras se resuelve el puesto
// y "Perfil no identificado" si no hay. Va en Inicio y en el menú del usuario.
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { metaDeRol, useRolStore } from '../../stores/rolStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { scale, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

export const PildoraPuesto: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const role = useRolStore((s) => s.role);
  const cargando = useRolStore((s) => s.loading);

  const texto = cargando
    ? 'Cargando perfil...'
    : role
      ? `Portal ${metaDeRol(role).label}`
      : 'Perfil no identificado';

  return (
    <View style={styles.pildora} accessibilityRole="text">
      <AppText variant="caption" tone="primary" numberOfLines={1}>
        {texto}
      </AppText>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    pildora: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: scale(14),
      backgroundColor: c.accentPrimaryMuted,
    },
  });
