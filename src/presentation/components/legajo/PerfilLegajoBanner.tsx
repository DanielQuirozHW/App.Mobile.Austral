import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface PerfilLegajoBannerProps {
  nombre: string;
  apellido: string;
  numeroLegajo?: string;
  cargo?: string;
  facultad?: string;
  sede?: string;
  fotoUrl?: string | null;
}

const iniciales = (nombre: string, apellido: string): string =>
  [nombre.trim()[0], apellido.trim()[0]].filter(Boolean).join('').toUpperCase();

/** Cabecera de la pantalla con los datos del legajo (los valores que calcula page.tsx para el encabezado). */
export const PerfilLegajoBanner: React.FC<PerfilLegajoBannerProps> = ({
  nombre,
  apellido,
  numeroLegajo,
  cargo,
  facultad,
  sede,
  fotoUrl,
}) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const detalle = [cargo, facultad, sede].filter(Boolean).join(' · ');

  return (
    <View style={styles.card}>
      {fotoUrl ? (
        <Image source={{ uri: fotoUrl }} style={styles.avatar} accessibilityLabel="Foto de perfil" />
      ) : (
        <View style={[styles.avatar, styles.avatarIniciales]}>
          <AppText variant="h5" tone="inverse">
            {iniciales(nombre, apellido)}
          </AppText>
        </View>
      )}
      <View style={styles.textos}>
        <AppText variant="h6" numberOfLines={2}>
          {`${nombre} ${apellido}`.trim()}
        </AppText>
        {numeroLegajo ? (
          <AppText variant="caption" tone="secondary">
            {`Legajo ${numeroLegajo}`}
          </AppText>
        ) : null}
        {detalle ? (
          <AppText variant="caption" tone="secondary" numberOfLines={3}>
            {detalle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      ...platformSpecific.shadow(2),
    },
    avatar: { width: scale(64), height: scale(64), borderRadius: borderRadius.round },
    avatarIniciales: { backgroundColor: c.accentPrimary, alignItems: 'center', justifyContent: 'center' },
    textos: { flex: 1, gap: spacing.xxs },
  });
