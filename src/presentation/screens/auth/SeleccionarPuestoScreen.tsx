// Selección de puesto. Fuente: Portal-Austral-Dev -> src/app/(blank)/seleccionar-puesto/page.tsx
// y src/context/roleContext.tsx.
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppIconName } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { metaDeRol, useRolStore } from '../../stores/rolStore';
import { borderRadius, iconSizes, scale, spacing } from '../../utils/responsive';

const ICONO_POR_ROL: Record<string, AppIconName> = {
  docente: 'school-outline',
  codocente: 'briefcase-outline',
};

export const SeleccionarPuestoScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const userRoles = useRolStore((s) => s.userRoles);
  const cargando = useRolStore((s) => s.loading);
  const seleccionar = useRolStore((s) => s.seleccionar);

  // Con un solo puesto se elige solo (como el portal).
  useEffect(() => {
    if (!cargando && userRoles.length === 1) void seleccionar(userRoles[0]);
  }, [cargando, userRoles, seleccionar]);

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <View style={styles.cabecera}>
        <View style={styles.circulo}>
          <AppIcon name="swap-horizontal-outline" size={iconSizes.xxl} color={globalColors.accentPrimaryOn} />
        </View>
        <AppText variant="h4" style={styles.centrado}>
          Seleccioná tu puesto
        </AppText>
        <AppText variant="body2" tone="secondary" style={styles.centrado}>
          Este usuario tiene múltiples puestos asignados. Seleccioná con cuál querés ingresar.
        </AppText>
      </View>

      {userRoles.map((puesto) => {
        const meta = metaDeRol(puesto);
        return (
          <Pressable
            key={puesto}
            onPress={() => void seleccionar(puesto)}
            accessibilityRole="button"
            accessibilityLabel={meta.label}
            android_ripple={{ color: globalColors.hairline }}
            style={({ pressed }) => [styles.tarjeta, pressed && styles.tarjetaPresionada]}
          >
            <View style={styles.iconoRol}>
              <AppIcon
                name={ICONO_POR_ROL[puesto] ?? 'id-card-outline'}
                size={iconSizes.lg}
                color={globalColors.accentPrimary}
              />
            </View>
            <View style={styles.textos}>
              <AppText variant="subtitle1">{meta.label}</AppText>
              <AppText variant="body2" tone="secondary">
                {meta.descripcion}
              </AppText>
            </View>
            <AppIcon name="chevron-forward" size={iconSizes.lg} color={globalColors.textSecondary} />
          </Pressable>
        );
      })}
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg },
    cabecera: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    centrado: { textAlign: 'center' },
    // Portal: círculo de 64 con degradado primary -> primary.light. Sin degradado: color primario liso.
    circulo: {
      width: scale(64),
      height: scale(64),
      borderRadius: borderRadius.round,
      backgroundColor: c.accentPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    // Portal: Paper con radio 16, borde de 2 px del color primario con transparencia
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.xxl,
      borderRadius: borderRadius.xl,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    tarjetaPresionada: { borderColor: c.accentPrimary },
    iconoRol: {
      width: scale(48),
      height: scale(48),
      borderRadius: borderRadius.round,
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1 },
  });
