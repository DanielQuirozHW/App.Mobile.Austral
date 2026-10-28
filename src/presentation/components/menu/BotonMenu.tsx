// Avatar del usuario: abre el menú del usuario (components/menu/MenuLateral.tsx, ahora una hoja que sube desde abajo).
// Va en el encabezado de cada pantalla y en la cabecera de Inicio. Muestra la foto o, si no hay, las iniciales.
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { useThemeColors } from '../../theme/theme';
import { platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

/** Hasta dos iniciales: las de las dos primeras palabras del nombre. */
export const inicialesDe = (nombreCompleto: string): string =>
  nombreCompleto
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join('');

export const BotonMenu: React.FC = () => {
  const { globalColors } = useThemeColors();
  const abrir = useMenuStore((s) => s.abrir);
  const user = useAuthStore((s) => s.user);
  const foto = user?.photoURL || undefined;

  return (
    <Pressable
      onPress={abrir}
      hitSlop={spacing.sm}
      accessibilityRole="button"
      accessibilityLabel="Abrir menú del usuario"
      style={styles.boton}
    >
      {foto ? (
        <Image source={{ uri: foto }} style={styles.avatar} accessibilityLabel={user?.fullname ?? 'Usuario'} />
      ) : (
        <View style={[styles.avatar, { backgroundColor: globalColors.accentPrimary }]}>
          <AppText variant="subtitle2" locked style={{ color: globalColors.accentPrimaryOn }}>
            {inicialesDe(user?.fullname ?? '')}
          </AppText>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  boton: {
    minWidth: platformSpecific.minTouchTarget,
    minHeight: platformSpecific.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
