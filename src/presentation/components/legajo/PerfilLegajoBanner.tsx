// Cabecera del legajo. Port de Portal-Austral-Dev -> src/app/(dashboard)/legajo/_components/UserProfileBanner.tsx
// (y PerfilHeader). Portada con botón para cambiarla, avatar con botón de cámara, nombre completo de la sesión,
// puesto (DOCENTE / STAFF) y sede.
// `compacto` = la variante `compact` del portal (Documentación): avatar de 56 en vez de 72, menos relleno y nombre
// en subtitle1. El portal no dibuja portada en ninguna variante; acá la portada se agrega a pedido de Daniel
// (decisión 88) solo en la variante completa.
// Iniciales: `getInitials` del portal (@core/utils/get-initials) = primera letra de CADA palabra, sin recortar ni
// pasar a mayúsculas (verificado).
// Borde del avatar: 3 px `azulLight` (primaryLight) en la variante completa, como la cabecera de Datos personales del
// portal (decisión 92). La variante compacta conserva 2 px del color de la tarjeta (sin fuente para ajustarla).
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { actualizarFotoPerfil, actualizarFotoPortada } from '../../../application/auth/fotoPerfilService';
import {
  elegirFotoConCamara,
  elegirFotoDeGaleria,
  type FotoElegida,
} from '../../../infrastructure/archivos/seleccionFoto';
import { useAuthStore } from '../../stores/authStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, scale, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';

interface PerfilLegajoBannerProps {
  /** Sede / localidad del legajo (el portal la pasa como `localidadLabel`). */
  localidadLabel?: string;
  /** Variante `compact` del portal: sin portada, avatar de 56 y nombre en subtitle1. */
  compacto?: boolean;
}

const TAMANIO_CAMARA = scale(28);
const ALTO_PORTADA = scale(110);

// getInitials del portal.
const iniciales = (nombreCompleto: string): string =>
  nombreCompleto.split(/\s/).reduce((respuesta, palabra) => respuesta + palabra.slice(0, 1), '');

// formatRol del portal.
const formatearPuesto = (puesto: string): string => {
  const normalizado = puesto.toLowerCase().replace(/\s/g, '');
  if (normalizado === 'docentecodocente' || normalizado === 'codocentedocente') return 'DOCENTE · STAFF';
  if (normalizado === 'docente') return 'DOCENTE';
  if (normalizado === 'codocente') return 'STAFF';
  return puesto.toUpperCase();
};

type Destino = 'perfil' | 'portada';

export const PerfilLegajoBanner: React.FC<PerfilLegajoBannerProps> = ({ localidadLabel, compacto = false }) => {
  const { globalColors } = useThemeColors();
  const tamanioAvatar = scale(compacto ? 56 : 72);
  const styles = useMemo(() => createStyles(globalColors, tamanioAvatar, compacto), [globalColors, tamanioAvatar, compacto]);
  const user = useAuthStore((s) => s.user);
  const [subiendo, setSubiendo] = useState<Destino | null>(null);

  if (!user) return null;

  const puesto = Array.isArray(user.puesto) ? user.puesto.join('') : (user.puesto ?? '');
  const fotoUrl = user.photoURL || undefined;
  const portadaUrl = user.photoPORTADA || undefined;

  const subir = async (destino: Destino, elegir: () => Promise<FotoElegida | null>) => {
    try {
      const foto = await elegir();
      if (!foto) return;
      setSubiendo(destino);
      if (destino === 'perfil') await actualizarFotoPerfil(foto.uri);
      else await actualizarFotoPortada(foto.uri);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : destino === 'perfil'
            ? 'Error al actualizar la foto de perfil'
            : 'Error al actualizar la foto de portada',
      );
    } finally {
      setSubiendo(null);
    }
  };

  const cambiarFoto = (destino: Destino) => {
    if (subiendo) return;
    Alert.alert(destino === 'perfil' ? 'Cambiar foto de perfil' : 'Cambiar foto de portada', undefined, [
      { text: 'Galería', onPress: () => void subir(destino, elegirFotoDeGaleria) },
      { text: 'Cámara', onPress: () => void subir(destino, elegirFotoConCamara) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.card}>
      {compacto ? null : (
        <View style={styles.portada}>
          {portadaUrl ? (
            <Image source={{ uri: portadaUrl }} style={styles.portadaImagen} resizeMode="cover" />
          ) : null}
          <Pressable
            onPress={() => cambiarFoto('portada')}
            disabled={subiendo !== null}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de portada"
            style={styles.camaraPortada}
          >
            {subiendo === 'portada' ? (
              <ActivityIndicator size="small" color={globalColors.accentPrimaryOn} />
            ) : (
              <AppIcon name="camera-outline" size={scale(14)} color={globalColors.accentPrimaryOn} />
            )}
          </Pressable>
        </View>
      )}

      <View style={styles.cuerpo}>
        <View style={styles.avatarContenedor}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.avatar} accessibilityLabel={user.fullname} />
          ) : (
            <View style={[styles.avatar, styles.avatarIniciales]}>
              <AppText variant={compacto ? 'h6' : 'h5'} style={{ color: globalColors.accentPrimaryOn }}>
                {iniciales(user.fullname ?? '')}
              </AppText>
            </View>
          )}
          <Pressable
            onPress={() => cambiarFoto('perfil')}
            disabled={subiendo !== null}
            accessibilityRole="button"
            accessibilityLabel="Cambiar foto de perfil"
            style={styles.camara}
          >
            {subiendo === 'perfil' ? (
              <ActivityIndicator size="small" color={globalColors.accentPrimaryOn} />
            ) : (
              <AppIcon name="camera-outline" size={scale(14)} color={globalColors.accentPrimaryOn} />
            )}
          </Pressable>
        </View>

        <View style={styles.textos}>
          <AppText variant={compacto ? 'subtitle1' : 'h6'} numberOfLines={2}>
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
    </View>
  );
};

const createStyles = (c: ColorTokens, tamanioAvatar: number, compacto: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
    },
    portada: { height: ALTO_PORTADA, backgroundColor: c.accentPrimary },
    portadaImagen: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    camaraPortada: {
      position: 'absolute',
      right: spacing.md,
      top: spacing.md,
      width: TAMANIO_CAMARA,
      height: TAMANIO_CAMARA,
      borderRadius: TAMANIO_CAMARA / 2,
      backgroundColor: c.accentPrimary,
      borderWidth: 2,
      borderColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cuerpo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: compacto ? spacing.md : spacing.lg,
    },
    avatarContenedor: { width: tamanioAvatar, height: tamanioAvatar },
    avatar: {
      width: tamanioAvatar,
      height: tamanioAvatar,
      borderRadius: tamanioAvatar / 2,
      borderWidth: compacto ? 2 : 3,
      borderColor: compacto ? c.card : c.primaryLight,
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
