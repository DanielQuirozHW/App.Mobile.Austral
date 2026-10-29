// Menú del usuario. Mantiene el nombre de archivo y de componente del antiguo menú lateral (AppNavigation lo monta
// igual), pero ahora es una hoja que sube desde abajo (docs/DECISION-UI-MOBILE.md): el acceso a los módulos es la grilla
// de Inicio, así que acá solo van las acciones de la cuenta: Mi perfil, Cambiar puesto (solo con más de un puesto),
// Ajustes y Cerrar sesión (con confirmación). Se abre con el avatar del encabezado (BotonMenu).
//
// Se cierra de cuatro formas: tocando el fondo, con la X de la hoja, con el botón atrás de Android o eligiendo una
// acción. El fondo que se toca es SIEMPRE un Pressable visible para el sistema (sin opacidad animada); el oscurecido
// es una capa aparte que no recibe toques. La animación de entrada arranca recién cuando el Modal ya está montado, y
// el desmontaje tiene un seguro por tiempo por si la animación de salida no avisa que terminó.
// La confirmación de "Cerrar sesión" es el ConfirmDialog de la app (con el tema), no el popup nativo de Android.
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
import { nombrePropio } from '../../utils/texto';
import { AppIcon, type AppIconName } from '../AppIcon';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
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
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);
  const traslado = useRef(new Animated.Value(ALTO_PANTALLA)).current;
  const opacidadFondo = useRef(new Animated.Value(0)).current;

  const autenticado = Boolean(user?.empleadoid) && !seleccionPendiente;
  const puedeCambiarPuesto = userRoles.length > 1;

  // Si se pierde la sesión con el menú abierto, se cierra.
  useEffect(() => {
    if (!autenticado) cerrar();
  }, [autenticado, cerrar]);

  // 1) Al pedir abrir, se monta el Modal.
  useEffect(() => {
    if (abierto) setMontado(true);
  }, [abierto]);

  // 2) Con el Modal ya montado, se anima la entrada.
  useEffect(() => {
    if (!abierto || !montado) return;
    Animated.parallel([
      Animated.timing(traslado, { toValue: 0, duration: DURACION, useNativeDriver: true }),
      Animated.timing(opacidadFondo, { toValue: 1, duration: DURACION, useNativeDriver: true }),
    ]).start();
  }, [abierto, montado, traslado, opacidadFondo]);

  // 3) Al pedir cerrar, se anima la salida y se desmonta. El temporizador es un seguro: si la animación no avisa que
  //    terminó, el Modal se desmonta igual y la pantalla no queda tapada.
  useEffect(() => {
    if (abierto || !montado) return;
    Animated.parallel([
      Animated.timing(traslado, { toValue: ALTO_PANTALLA, duration: DURACION, useNativeDriver: true }),
      Animated.timing(opacidadFondo, { toValue: 0, duration: DURACION, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setMontado(false);
    });
    const seguro = setTimeout(() => setMontado(false), DURACION + 150);
    return () => clearTimeout(seguro);
  }, [abierto, montado, traslado, opacidadFondo]);

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
    setConfirmandoSalida(false);
    cerrar();
    try {
      await cerrarSesion();
    } catch {
      // El menú ya se cerró, así que no hay un diálogo propio donde mostrar el error: se usa el aviso nativo.
      Alert.alert('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  };

  const nombre = nombrePropio(user?.fullname) || nombreParaBienvenida(user);
  const fotoUrl = user?.photoURL || undefined;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={cerrar}>
      <View style={styles.raiz}>
        {/* Fondo que se toca para cerrar: sin opacidad animada, siempre recibe el toque. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={cerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        />
        {/* Oscurecido: solo visual, deja pasar los toques al fondo de arriba. */}
        <Animated.View pointerEvents="none" style={[styles.oscurecido, { opacity: opacidadFondo }]} />

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
            <Pressable
              onPress={cerrar}
              hitSlop={spacing.md}
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú"
              style={styles.botonCerrar}
            >
              <AppIcon name="close" size={iconSizes.lg} color={globalColors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.lista}>
            <FilaAccion icono="person-circle-outline" titulo="Mi perfil" onPress={irAMiPerfil} />
            {puedeCambiarPuesto ? (
              <FilaAccion icono="swap-horizontal-outline" titulo="Cambiar puesto" onPress={cambiarPuesto} />
            ) : null}
            <FilaAccion icono="settings-outline" titulo="Ajustes" onPress={irAAjustes} />
            <View style={styles.separador} />
            <FilaAccion
              icono="log-out-outline"
              titulo="Cerrar sesión"
              onPress={() => setConfirmandoSalida(true)}
              peligro
            />
          </View>
        </Animated.View>

        <ConfirmDialog
          visible={confirmandoSalida}
          titulo="Cerrar sesión"
          textoConfirmar="Cerrar sesión"
          peligroso
          onCancelar={() => setConfirmandoSalida(false)}
          onConfirmar={() => void salir()}
        >
          <AppText variant="body1">¿Querés cerrar tu sesión?</AppText>
        </ConfirmDialog>
      </View>
    </Modal>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    raiz: { flex: 1, justifyContent: 'flex-end' },
    oscurecido: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay },
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
    botonCerrar: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      backgroundColor: c.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    lista: { gap: spacing.xxs },
    separador: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: c.hairline,
      marginVertical: spacing.xs,
      marginHorizontal: spacing.lg,
    },
  });
