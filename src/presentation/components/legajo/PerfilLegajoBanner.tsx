// Cabecera del legajo. Port de Portal-Austral-Dev -> src/app/(dashboard)/legajo/_components/UserProfileBanner.tsx.
// Avatar con botón de cámara para cambiar la foto, nombre completo de la sesión, puesto (DOCENTE / STAFF) y sede.
// El portal arma las iniciales con `getInitials` (@core/utils/get-initials, no leído): acá son las primeras letras
// de las dos primeras palabras del nombre.
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { actualizarFotoPerfil } from '../../../application/auth/fotoPerfilService';
import {
  elegirFotoConCamara,
  elegirFotoDeGaleria,
  type FotoElegida,
} from '../../../infrastructure/archivos/seleccionFoto';
import { useAuthStore } from '../../stores/authStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, scale, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';

interface PerfilLegajoBannerProps {
  /** Sede / localidad del legajo (el portal la pasa como `localidadLabel`). */
  localidadLabel?: string;
}

const TAMANIO_AVATAR = scale(72);
const TAMANIO_CAMARA = scale(28);

const iniciales = (nombreCompleto: string): string =>
  nombreCompleto
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0])
    .join('')
    .toUpperCase();

// formatRol del portal.
const formatearPuesto = (puesto: string): string => {
  const normalizado = puesto.toLowerCase().replace(/\s/g, '');
  if (normalizado === 'docentecodocente' || normalizado === 'codocentedocente') return 'DOCENTE · STAFF';
  if (normalizado === 'docente') return 'DOCENTE';
  if (normalizado === 'codocente') return 'STAFF';
  return puesto.toUpperCase();
};

export const PerfilLegajoBanner: React.FC<PerfilLegajoBannerProps> = ({ localidadLabel }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const user = useAuthStore((s) => s.user);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  if (!user) return null;

  const puesto = Array.isArray(user.puesto) ? user.puesto.join('') : (user.puesto ?? '');
  const fotoUrl = user.photoURL || undefined;

  const subir = async (elegir: () => Promise<FotoElegida | null>) => {
    try {
      const foto = await elegir();
      if (!foto) return;
      setSubiendoFoto(true);
      await actualizarFotoPerfil(foto.uri);
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'Error al actualizar la foto de perfil');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const cambiarFoto = () => {
    if (subiendoFoto) return;
    Alert.alert('Cambiar foto de perfil', undefined, [
      { text: 'Galería', onPress: () => void subir(elegirFotoDeGaleria) },
      { text: 'Cámara', onPress: () => void subir(elegirFotoConCamara) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.avatarContenedor}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={styles.avatar} accessibilityLabel={user.fullname} />
        ) : (
          <View style={[styles.avatar, styles.avatarIniciales]}>
            <AppText variant="h5" style={{ color: globalColors.accentPrimaryOn }}>
              {iniciales(user.fullname ?? '')}
            </AppText>
          </View>
        )}
        <Pressable
          onPress={cambiarFoto}
          disabled={subiendoFoto}
          accessibilityRole="button"
          accessibilityLabel="Cambiar foto de perfil"
          style={styles.camara}
        >
          {subiendoFoto ? (
            <ActivityIndicator size="small" color={globalColors.accentPrimaryOn} />
          ) : (
            <AppIcon name="camera-outline" size={scale(14)} color={globalColors.accentPrimaryOn} />
          )}
        </Pressable>
      </View>

      <View style={styles.textos}>
        <AppText variant="h6" numberOfLines={2}>
          {user.fullname}
        </AppText>
        <View style={styles.fila}>
          {puesto ? (
            <View style={styles.dato}>
              <AppIcon name="briefcase-outline" size={scale(14)} color={globalColors.textSecondary} />
              <AppText variant="caption" tone="secondary" style={styles.datoTexto}>
                {formatearPuesto(puesto)}
              </AppText>
            </View>
          ) : null}
          {localidadLabel ? (
            <View style={styles.dato}>
              <AppIcon name="location-outline" size={scale(14)} color={globalColors.textSecondary} />
              <AppText variant="caption" tone="secondary" style={styles.datoTexto} numberOfLines={2}>
                {localidadLabel.toUpperCase()}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.lg,
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
    },
    avatarContenedor: { width: TAMANIO_AVATAR, height: TAMANIO_AVATAR },
    avatar: {
      width: TAMANIO_AVATAR,
      height: TAMANIO_AVATAR,
      borderRadius: TAMANIO_AVATAR / 2,
      borderWidth: 2,
      borderColor: c.card,
    },
    avatarIniciales: { backgroundColor: c.accentPrimary, alignItems: 'center', justifyContent: 'center' },
    camara: {
      position: 'absolute',
      right: -spacing.xxs,
      bottom: -spacing.xxs,
      width: TAMANIO_CAMARA,
      height: TAMANIO_CAMARA,
      borderRadius: TAMANIO_CAMARA / 2,
      backgroundColor: c.accentPrimary,
      borderWidth: 2,
      borderColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1, gap: spacing.xs },
    fila: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xxs },
    dato: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
    datoTexto: { letterSpacing: 0.5, fontWeight: '600', flexShrink: 1 },
  });
