// Cabecera del legajo. Port de Portal-Austral-Dev -> src/app/(dashboard)/legajo/_components/UserProfileBanner.tsx
// (y PerfilHeader). Portada con botón para cambiarla, avatar con botón de cámara, nombre completo de la sesión,
// puesto (Docente / Staff) y sede.
// `compacto` = la variante `compact` del portal (Documentación): avatar de 56 en vez de 72, menos relleno y nombre
// en subtitle1, sin portada. El portal no dibuja portada en ninguna variante; acá la portada se agrega a pedido de
// Daniel (decisión 88) solo en la variante completa.
// Diferencias de la app mobile (docs/DECISION-UI-MOBILE.md):
//  - en la variante completa el avatar se superpone al borde de la portada (como los perfiles de las apps);
//  - la portada sin foto usa el mismo color y el mismo motivo decorativo (círculos y anillo) que la tarjeta de saludo de
//    Inicio (tokens `hero*` y components/FondoDecorativo.tsx);
//  - las iniciales son dos, como en el avatar del encabezado y del menú del usuario (el portal usa una por palabra);
//  - el nombre, el puesto y la sede se muestran con mayúsculas solo al principio de cada palabra (el CRM los guarda en
//    MAYÚSCULAS), y la línea de puesto y sede va en el color de texto principal para que se lea bien.
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
import { nombrePropio } from '../../utils/texto';
import { toast } from '../../utils/toast';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { FondoDecorativo } from '../FondoDecorativo';
import { inicialesDe } from '../menu/BotonMenu';

interface PerfilLegajoBannerProps {
  /** Sede / localidad del legajo (el portal la pasa como `localidadLabel`). */
  localidadLabel?: string;
  /** Variante `compact` del portal: sin portada, avatar de 56 y nombre en subtitle1. */
  compacto?: boolean;
}

const TAMANIO_CAMARA = scale(28);
const ALTO_PORTADA = scale(88);

// formatRol del portal, pero con mayúsculas solo al principio.
const formatearPuesto = (puesto: string): string => {
  const normalizado = puesto.toLowerCase().replace(/\s/g, '');
  if (normalizado === 'docentecodocente' || normalizado === 'codocentedocente') return 'Docente · Staff';
  if (normalizado === 'docente') return 'Docente';
  if (normalizado === 'codocente') return 'Staff';
  return puesto.charAt(0).toUpperCase() + puesto.slice(1).toLowerCase();
};

type Destino = 'perfil' | 'portada';

export const PerfilLegajoBanner: React.FC<PerfilLegajoBannerProps> = ({ localidadLabel, compacto = false }) => {
  const { globalColors } = useThemeColors();
  const tamanioAvatar = scale(compacto ? 56 : 80);
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

  const avatar = (
    <View style={styles.avatarContenedor}>
      {fotoUrl ? (
        <Image source={{ uri: fotoUrl }} style={styles.avatar} accessibilityLabel={user.fullname} />
      ) : (
        <View style={[styles.avatar, styles.avatarIniciales]}>
          <AppText variant={compacto ? 'h6' : 'h4'} style={{ color: globalColors.accentPrimaryOn }}>
            {inicialesDe(user.fullname ?? '')}
          </AppText>
        </View>
      )}
      <Pressable
        onPress={() => cambiarFoto('perfil')}
        disabled={subiendo !== null}
        hitSlop={spacing.sm}
        accessibilityRole="button"
        accessibilityLabel="Cambiar foto de perfil"
        style={styles.camara}
      >
        {subiendo === 'perfil' ? (
          <ActivityIndicator size="small" color={globalColors.accentPrimaryOn} />
        ) : (
          <AppIcon name="camera-outline" size={scale(16)} color={globalColors.accentPrimaryOn} />
        )}
      </Pressable>
    </View>
  );

  const datos = (
    <View style={styles.textos}>
      <AppText variant={compacto ? 'subtitle1' : 'h5'} numberOfLines={2}>
        {nombrePropio(user.fullname)}
      </AppText>
      <View style={styles.fila}>
        {puesto ? (
          <View style={styles.dato}>
            <AppIcon name="briefcase-outline" size={scale(16)} color={globalColors.accentPrimary} />
            <AppText variant="body2" style={styles.datoTexto}>
              {formatearPuesto(puesto)}
            </AppText>
          </View>
        ) : null}
        {localidadLabel ? (
          <View style={styles.dato}>
            <AppIcon name="location-outline" size={scale(16)} color={globalColors.accentPrimary} />
            <AppText variant="body2" style={styles.datoTexto} numberOfLines={2}>
              {nombrePropio(localidadLabel)}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );

  // Variante compacta: avatar y datos en una fila, sin portada.
  if (compacto) {
    return (
      <View style={styles.card}>
        <View style={styles.cuerpoCompacto}>
          {avatar}
          {datos}
        </View>
      </View>
    );
  }

  // Variante completa: portada arriba y el avatar superpuesto a su borde inferior.
  return (
    <View style={styles.card}>
      <View style={styles.portada}>
        {portadaUrl ? (
          <Image source={{ uri: portadaUrl }} style={styles.portadaImagen} resizeMode="cover" />
        ) : (
          <FondoDecorativo />
        )}
        <Pressable
          onPress={() => cambiarFoto('portada')}
          disabled={subiendo !== null}
          hitSlop={spacing.sm}
          accessibilityRole="button"
          accessibilityLabel="Cambiar foto de portada"
          style={styles.camaraPortada}
        >
          {subiendo === 'portada' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <AppIcon name="camera-outline" size={scale(16)} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
      <View style={styles.cuerpoCompleto}>
        <View style={styles.avatarSuperpuesto}>{avatar}</View>
        {datos}
      </View>
    </View>
  );
};

const createStyles = (c: ColorTokens, tamanioAvatar: number, compacto: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
    },
    // `overflow: hidden`: el motivo decorativo no puede dibujarse fuera de la portada.
    portada: { height: ALTO_PORTADA, backgroundColor: c.heroBackground, overflow: 'hidden' },
    portadaImagen: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
    camaraPortada: {
      position: 'absolute',
      right: spacing.md,
      top: spacing.md,
      width: TAMANIO_CAMARA,
      height: TAMANIO_CAMARA,
      borderRadius: TAMANIO_CAMARA / 2,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cuerpoCompacto: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.md,
    },
    cuerpoCompleto: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
    avatarSuperpuesto: { marginTop: -(tamanioAvatar / 2), alignSelf: 'flex-start' },
    avatarContenedor: { width: tamanioAvatar, height: tamanioAvatar },
    avatar: {
      width: tamanioAvatar,
      height: tamanioAvatar,
      borderRadius: tamanioAvatar / 2,
      borderWidth: compacto ? 2 : 4,
      borderColor: c.card,
    },
    avatarIniciales: { backgroundColor: c.primaryDark, alignItems: 'center', justifyContent: 'center' },
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
    textos: { flex: compacto ? 1 : undefined, gap: spacing.xs },
    fila: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.xxs },
    dato: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
    datoTexto: { flexShrink: 1, fontWeight: '500' },
  });
