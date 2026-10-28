// Menú del usuario. Mantiene el nombre de archivo y de componente del antiguo menú lateral (AppNavigation lo monta
// igual), pero ahora es una hoja que sube desde abajo (docs/DECISION-UI-MOBILE.md): el acceso a los módulos es la grilla
// de Inicio, así que acá solo van las acciones de la cuenta: Mi perfil, Cambiar puesto (solo con más de un puesto),
// Ajustes y Cerrar sesión (con confirmación). Se abre con el avatar del encabezado (BotonMenu).
// Sin librerías nuevas: Modal + Animated de React Native.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cerrarSesion } from '../../../application/auth/authService';
import { nombreParaBienvenida } from '../../../domain/inicio/tablero';
import { irAModulo } from '../../navigation/navigationRef';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { puedeVerLegajo, useRolStore } from '../../stores/rolStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppIcon, type AppIconName } from '../AppIcon';
import { AppText } from '../AppText';
import { inicialesDe } from './BotonMenu';
import { PildoraPuesto } from './PildoraPuesto';

const ALTO_PANTALLA = Dimensions.get('window').height;
const DURACION = 240;

interface FilaAccionProps {
  icono: AppIconName;
  titulo: string;
  onPress: () => void;
  peligro?: boolean;
}

const FilaAccion: React.FC<FilaAccionProps> = ({ icono, titulo, onPress, peligro = false }) => {
  const { globalColors } = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      android_ripple={{ color: globalColors.hairline }}
      style={({ pressed }) => [filaEstilos.fila, pressed && { backgroundColor: globalColors.accentPrimaryMuted }]}
    >
      <AppIcon name={icono} size={iconSizes.lg} color={peligro ? globalColors.danger : globalColors.textSecondary} />
      <AppText variant="body1" tone={peligro ? 'danger' : 'default'} style={filaEstilos.texto}>
        {titulo}
      </AppText>
      {peligro ? null : <AppIcon name="chevron-forward" size={iconSizes.md} color={globalColors.textTertiary} />}
    </Pressable>
  );
};

const filaEstilos = StyleSheet.create({
  fila: {
    minHeight: scale(56),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  texto: { flex: 1 },
});

export const MenuLateral: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);
  const userRoles = useRolStore((s) => s.userRoles);
  const seleccionPendiente = useRolStore((s) => s.seleccionPendiente);
  const marcarSeleccionPendiente = useRolStore((s) => s.marcarSeleccionPendiente);
  const abierto = useMenuStore((s) => s.abierto);
  const cerrar = useMenuStore((s) => s.cerrar);

  const [montado, setMontado] = useState(false);
  const traslado = useRef(new Animated.Value(ALTO_PANTALLA)).current;
  const opacidadFondo = useRef(new Animated.Value(0)).current;

  const autenticado = Boolean(user?.empleadoid) && !seleccionPendiente;
  const puedeCambiarPuesto = userRoles.length > 1;

  // Si se pierde la sesión con el menú abierto, se cierra.
  useEffect(() => {
    if (!autenticado) cerrar();
  }, [autenticado, cerrar]);

  // Animación de entrada y salida. Se desmonta el Modal recién cuando termina la animación de salida.
  useEffect(() => {
    if (abierto) {
      setMontado(true);
      Animated.parallel([
        Animated.timing(traslado, { toValue: 0, duration: DURACION, useNativeDriver: true }),
        Animated.timing(opacidadFondo, { toValue: 1, duration: DURACION, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(traslado, { toValue: ALTO_PANTALLA, duration: DURACION, useNativeDriver: true }),
        Animated.timing(opacidadFondo, { toValue: 0, duration: DURACION, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMontado(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a `abierto`
  }, [abierto]);

  if (!montado) return null;

  const irAMiPerfil = () => {
    cerrar();
    irAModulo(puedeVerLegajo(role) ? 'DatosPersonales' : 'MiPerfil');
  };

  const cambiarPuesto = () => {
    cerrar();
    marcarSeleccionPendiente();
  };

  const irAAjustes = () => {
    cerrar();
    irAModulo('Ajustes');
  };

  const salir = async () => {
    cerrar();
    try {
      await cerrarSesion();
    } catch {
      Alert.alert('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  };

  const confirmarSalida = () => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void salir() },
    ]);
  };

  const nombre = user?.fullname || nombreParaBienvenida(user);
  const fotoUrl = user?.photoURL || undefined;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={cerrar}>
      <View style={styles.raiz}>
        <Animated.View style={[styles.fondo, { opacity: opacidadFondo }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={cerrar}
            accessibilityRole="button"
            accessibilityLabel="Cerrar menú"
          />
        </Animated.View>

        <Animated.View
          style={[styles.hoja, { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY: traslado }] }]}
        >
          <View style={styles.agarre} />

          <View style={styles.cabecera}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatar} accessibilityLabel={nombre} />
            ) : (
              <View style={[styles.avatar, styles.avatarIniciales]}>
                <AppText variant="h5" style={{ color: globalColors.accentPrimaryOn }}>
                  {inicialesDe(user?.fullname ?? '')}
                </AppText>
              </View>
            )}
            <View style={styles.cabeceraTextos}>
              <AppText variant="subtitle1" numberOfLines={2}>
                {nombre}
              </AppText>
              <PildoraPuesto />
            </View>
          </View>

          <View style={styles.lista}>
            <FilaAccion icono="person-circle-outline" titulo="Mi perfil" onPress={irAMiPerfil} />
            {puedeCambiarPuesto ? (
              <FilaAccion icono="swap-horizontal-outline" titulo="Cambiar puesto" onPress={cambiarPuesto} />
            ) : null}
            <FilaAccion icono="settings-outline" titulo="Ajustes" onPress={irAAjustes} />
            <View style={styles.separador} />
            <FilaAccion icono="log-out-outline" titulo="Cerrar sesión" onPress={confirmarSalida} peligro />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    raiz: { flex: 1, justifyContent: 'flex-end' },
    fondo: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay },
    hoja: {
      backgroundColor: c.card,
      borderTopLeftRadius: borderRadius.xxl,
      borderTopRightRadius: borderRadius.xxl,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.sm,
      ...platformSpecific.shadow(8),
    },
    agarre: {
      alignSelf: 'center',
      width: scale(40),
      height: scale(4),
      borderRadius: borderRadius.round,
      backgroundColor: c.border,
      marginBottom: spacing.sm,
    },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.lg,
    },
    avatar: { width: scale(56), height: scale(56), borderRadius: scale(28) },
    avatarIniciales: { backgroundColor: c.accentPrimary, alignItems: 'center', justifyContent: 'center' },
    cabeceraTextos: { flex: 1, gap: spacing.xs },
    lista: { gap: spacing.xxs },
    separador: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.hairline,
      marginVertical: spacing.xs,
      marginHorizontal: spacing.lg,
    },
  });
