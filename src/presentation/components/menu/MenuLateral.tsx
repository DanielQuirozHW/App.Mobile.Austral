// Menú lateral. Equivale al menú vertical del portal (navigation/vertical/index.tsx): lista todos los módulos agrupados.
// En el celular se abre desde el botón de hamburguesa y se desliza desde la izquierda. Sin librerías nuevas:
// Modal + Animated de React Native.
// MVP de demostración: los módulos sin contenido figuran igual y abren una pantalla vacía (navigation/modulosMenu.ts).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cerrarSesion } from '../../../application/auth/authService';
import { nombreParaBienvenida } from '../../../domain/inicio/tablero';
import { GRUPOS_DE_MENU, ITEMS_DE_MENU, type RutaDeMenu } from '../../navigation/modulosMenu';
import { irAModulo } from '../../navigation/navigationRef';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { metaDeRol, useRolStore } from '../../stores/rolStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';

const ANCHO_PANEL = Math.min(scale(300), Dimensions.get('window').width * 0.85);
const DURACION = 220;

// getInitials del portal (primera letra de cada palabra).
const iniciales = (nombreCompleto: string): string =>
  nombreCompleto.split(/\s/).reduce((respuesta, palabra) => respuesta + palabra.slice(0, 1), '');

export const MenuLateral: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);
  const seleccionPendiente = useRolStore((s) => s.seleccionPendiente);
  const abierto = useMenuStore((s) => s.abierto);
  const rutaActual = useMenuStore((s) => s.rutaActual);
  const cerrar = useMenuStore((s) => s.cerrar);

  const [montado, setMontado] = useState(false);
  const desplazamiento = useRef(new Animated.Value(-ANCHO_PANEL)).current;
  const opacidadFondo = useRef(new Animated.Value(0)).current;

  const autenticado = Boolean(user?.empleadoid) && !seleccionPendiente;

  // Si se pierde la sesión con el menú abierto, se cierra.
  useEffect(() => {
    if (!autenticado) cerrar();
  }, [autenticado, cerrar]);

  // Animación de entrada y salida. Se desmonta el Modal recién cuando termina la animación de salida.
  useEffect(() => {
    if (abierto) {
      setMontado(true);
      Animated.parallel([
        Animated.timing(desplazamiento, { toValue: 0, duration: DURACION, useNativeDriver: true }),
        Animated.timing(opacidadFondo, { toValue: 1, duration: DURACION, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(desplazamiento, { toValue: -ANCHO_PANEL, duration: DURACION, useNativeDriver: true }),
        Animated.timing(opacidadFondo, { toValue: 0, duration: DURACION, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMontado(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a `abierto`
  }, [abierto]);

  const grupos = useMemo(
    () =>
      GRUPOS_DE_MENU.map((grupo) => ({
        titulo: grupo,
        items: ITEMS_DE_MENU.filter((item) => item.grupo === grupo && item.visiblePara(role)),
      })).filter((grupo) => grupo.items.length > 0),
    [role],
  );

  if (!montado) return null;

  const ir = (ruta: RutaDeMenu) => {
    cerrar();
    irAModulo(ruta);
  };

  const salir = async () => {
    cerrar();
    try {
      await cerrarSesion();
    } catch {
      Alert.alert('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  };

  const nombre = nombreParaBienvenida(user);
  const puesto = role ? metaDeRol(role).label : '';
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
          style={[
            styles.panel,
            { paddingTop: insets.top, paddingBottom: insets.bottom, transform: [{ translateX: desplazamiento }] },
          ]}
        >
          <View style={styles.cabecera}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatar} accessibilityLabel={nombre} />
            ) : (
              <View style={[styles.avatar, styles.avatarIniciales]}>
                <AppText variant="h6" style={{ color: globalColors.accentPrimaryOn }}>
                  {iniciales(user?.fullname ?? '')}
                </AppText>
              </View>
            )}
            <View style={styles.cabeceraTextos}>
              <AppText variant="subtitle1" numberOfLines={2}>
                {user?.fullname || nombre}
              </AppText>
              {puesto ? (
                <AppText variant="caption" tone="secondary">
                  {puesto}
                </AppText>
              ) : null}
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
            {grupos.map((grupo) => (
              <View key={grupo.titulo} style={styles.grupo}>
                <AppText variant="overline" tone="tertiary" style={styles.grupoTitulo}>
                  {grupo.titulo}
                </AppText>
                {grupo.items.map((item) => {
                  const activo = item.ruta === rutaActual;
                  return (
                    <Pressable
                      key={item.ruta}
                      onPress={() => ir(item.ruta)}
                      accessibilityRole="button"
                      accessibilityLabel={item.titulo}
                      accessibilityState={{ selected: activo }}
                      android_ripple={{ color: globalColors.hairline }}
                      style={[styles.item, activo && styles.itemActivo]}
                    >
                      <AppIcon
                        name={item.icono}
                        size={iconSizes.lg}
                        color={activo ? globalColors.accentPrimary : globalColors.textSecondary}
                      />
                      <AppText variant="body2" tone={activo ? 'primary' : 'default'} style={activo ? styles.itemTextoActivo : undefined}>
                        {item.titulo}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <View style={styles.pie}>
            <Pressable
              onPress={salir}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              android_ripple={{ color: globalColors.hairline }}
              style={styles.item}
            >
              <AppIcon name="log-out-outline" size={iconSizes.lg} color={globalColors.danger} />
              <AppText variant="body2" tone="danger">
                Cerrar sesión
              </AppText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    raiz: { flex: 1 },
    fondo: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay },
    panel: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: ANCHO_PANEL,
      backgroundColor: c.card,
      borderRightWidth: 1,
      borderRightColor: c.hairline,
      ...platformSpecific.shadow(8),
    },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.hairline,
    },
    avatar: { width: scale(48), height: scale(48), borderRadius: scale(24) },
    avatarIniciales: { backgroundColor: c.accentPrimary, alignItems: 'center', justifyContent: 'center' },
    cabeceraTextos: { flex: 1, gap: spacing.xxs },
    lista: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
    grupo: { marginBottom: spacing.sm },
    grupoTitulo: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    item: {
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
    },
    itemActivo: { backgroundColor: c.accentPrimaryMuted },
    itemTextoActivo: { fontWeight: '700' },
    pie: {
      padding: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.hairline,
    },
  });
