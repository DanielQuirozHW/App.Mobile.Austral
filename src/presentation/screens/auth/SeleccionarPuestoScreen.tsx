// Selección de puesto. La lógica es la del portal (Portal-Austral-Dev -> src/app/(blank)/seleccionar-puesto/page.tsx y
// src/context/roleContext.tsx). El diseño es el de la app mobile: tarjetas grandes y fáciles de tocar.
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppIconName } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { metaDeRol, useRolStore } from '../../stores/rolStore';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';

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
        <AppText variant="h3" style={styles.centrado}>
          ¿Con qué puesto querés ingresar?
        </AppText>
        <AppText variant="body1" tone="secondary" style={styles.centrado}>
          Tu usuario tiene más de un puesto. Podés cambiarlo después desde tu perfil.
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
                size={iconSizes.xl}
                color={globalColors.accentPrimary}
              />
            </View>
            <View style={styles.textos}>
              <AppText variant="subtitle1">{meta.label}</AppText>
              <AppText variant="body2" tone="secondary">
                {meta.descripcion}
              </AppText>
            </View>
            <AppIcon name="chevron-forward" size={iconSizes.lg} color={globalColors.textTertiary} />
          </Pressable>
        );
      })}
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { flexGrow: 1, justifyContent: 'center', gap: spacing.md },
    cabecera: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
    centrado: { textAlign: 'center' },
    circulo: {
      width: scale(72),
      height: scale(72),
      borderRadius: borderRadius.round,
      backgroundColor: c.accentPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.xl,
      minHeight: scale(88),
      borderRadius: borderRadius.xl,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.card,
      ...platformSpecific.shadow(2),
    },
    tarjetaPresionada: { borderColor: c.accentPrimary, transform: [{ scale: 0.99 }] },
    iconoRol: {
      width: scale(52),
      height: scale(52),
      borderRadius: borderRadius.lg,
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1, gap: spacing.xxs },
  });
