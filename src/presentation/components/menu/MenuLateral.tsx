// Menú lateral. Equivale al menú vertical del portal (navigation/vertical/index.tsx): el mismo árbol (Inicio, Legajo,
// Perfil con Docencia e Investigación, Licencias y vacaciones, Plan de Trabajo, Gestión del Desempeño, Indicadores,
// Funciones SA / VRAA, Referente MATHU) con grupos que se abren y se cierran. El árbol y sus reglas de visibilidad están
// en navigation/modulosMenu.ts. Las entradas que no se migran abren "En construcción" (decisión 100).
// En el celular se abre desde el botón de hamburguesa y se desliza desde la izquierda. Sin librerías nuevas:
// Modal + Animated de React Native.
// "Cambiar puesto" (decisiones 99 y 100): solo con más de un puesto; vuelve a la pantalla de selección de puesto.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cerrarSesion } from '../../../application/auth/authService';
import { nombreParaBienvenida } from '../../../domain/inicio/tablero';
import {
  caminoANodo,
  filtrarNodos,
  irANodo,
  nodoCoincide,
  SECCIONES_DE_MENU,
  type NodoDeMenu,
} from '../../navigation/modulosMenu';
import { irAModulo } from '../../navigation/navigationRef';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { puedeVerLegajo, useRolStore } from '../../stores/rolStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';
import { PildoraPuesto } from './PildoraPuesto';

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
  const userRoles = useRolStore((s) => s.userRoles);
  const seleccionPendiente = useRolStore((s) => s.seleccionPendiente);
  const marcarSeleccionPendiente = useRolStore((s) => s.marcarSeleccionPendiente);
  const abierto = useMenuStore((s) => s.abierto);
  const rutaActual = useMenuStore((s) => s.rutaActual);
  const paramsActual = useMenuStore((s) => s.paramsActual);
  const cerrar = useMenuStore((s) => s.cerrar);

  const [montado, setMontado] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const desplazamiento = useRef(new Animated.Value(-ANCHO_PANEL)).current;
  const opacidadFondo = useRef(new Animated.Value(0)).current;

  const autenticado = Boolean(user?.empleadoid) && !seleccionPendiente;
  const puedeCambiarPuesto = userRoles.length > 1;

  // Lo que ve este usuario con este puesto (mismas reglas que el menú del portal).
  const secciones = useMemo(
    () =>
      SECCIONES_DE_MENU.map((seccion) => ({
        ...seccion,
        nodos: filtrarNodos(seccion.nodos, { puesto: role, user }),
      })).filter((seccion) => seccion.nodos.length > 0),
    [role, user],
  );

  // Camino hasta la entrada de la pantalla abierta: sus grupos se abren y se resaltan.
  const caminoActivo = useMemo(
    () =>
      caminoANodo(
        secciones.flatMap((seccion) => seccion.nodos),
        (nodo) => nodoCoincide(nodo, rutaActual, paramsActual),
      ) ?? [],
    [secciones, rutaActual, paramsActual],
  );
  const idsDelCaminoActivo = useMemo(() => new Set(caminoActivo.map((nodo) => nodo.id)), [caminoActivo]);

  // Si se pierde la sesión con el menú abierto, se cierra.
  useEffect(() => {
    if (!autenticado) cerrar();
  }, [autenticado, cerrar]);

  // Al abrir el menú se despliegan los grupos que contienen la pantalla actual.
  useEffect(() => {
    if (!abierto) return;
    setExpandidos((previo) => {
      const siguiente = { ...previo };
      caminoActivo.slice(0, -1).forEach((nodo) => {
        siguiente[nodo.id] = true;
      });
      return siguiente;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a `abierto`
  }, [abierto]);

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

  if (!montado) return null;

  const alternar = (id: string) => setExpandidos((previo) => ({ ...previo, [id]: !previo[id] }));

  const ir = (nodo: NodoDeMenu, camino: NodoDeMenu[]) => {
    cerrar();
    irANodo(nodo, camino.map((padre) => padre.titulo).join(' › ') || undefined);
  };

  const cambiarPuesto = () => {
    cerrar();
    marcarSeleccionPendiente();
  };

  // El menú del usuario del portal (UserDropdown) lleva a "Mi perfil" = /legajo/datos-personales.
  const irAMiPerfil = () => {
    cerrar();
    irAModulo(puedeVerLegajo(role) ? 'DatosPersonales' : 'MiPerfil');
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
  const fotoUrl = user?.photoURL || undefined;

  const renderNodo = (nodo: NodoDeMenu, nivel: number, camino: NodoDeMenu[]): React.ReactNode => {
    const sangria = { paddingLeft: spacing.md + nivel * spacing.lg };
    const tamanioIcono = nivel === 0 ? iconSizes.lg : iconSizes.md;

    if (nodo.hijos) {
      const expandido = Boolean(expandidos[nodo.id]);
      const contieneActivo = idsDelCaminoActivo.has(nodo.id);
      return (
        <View key={nodo.id}>
          <Pressable
            onPress={() => alternar(nodo.id)}
            accessibilityRole="button"
            accessibilityLabel={nodo.titulo}
            accessibilityState={{ expanded: expandido }}
            android_ripple={{ color: globalColors.hairline }}
            style={[styles.item, sangria]}
          >
            <AppIcon
              name={nodo.icono}
              size={tamanioIcono}
              color={contieneActivo ? globalColors.accentPrimary : globalColors.textSecondary}
            />
            <AppText variant="body2" style={contieneActivo ? styles.textoItemActivo : styles.textoItem}>
              {nodo.titulo}
            </AppText>
            <AppIcon
              name={expandido ? 'chevron-down' : 'chevron-forward'}
              size={iconSizes.md}
              color={globalColors.textTertiary}
            />
          </Pressable>
          {expandido ? nodo.hijos.map((hijo) => renderNodo(hijo, nivel + 1, [...camino, nodo])) : null}
        </View>
      );
    }

    const activo = nodoCoincide(nodo, rutaActual, paramsActual);
    return (
      <Pressable
        key={nodo.id}
        onPress={() => ir(nodo, camino)}
        accessibilityRole="button"
        accessibilityLabel={nodo.titulo}
        accessibilityState={{ selected: activo }}
        android_ripple={{ color: globalColors.hairline }}
        style={[styles.item, sangria, activo && styles.itemActivo]}
      >
        <AppIcon
          name={nodo.icono}
          size={tamanioIcono}
          color={activo ? globalColors.accentPrimary : globalColors.textSecondary}
        />
        <AppText variant="body2" tone={activo ? 'primary' : 'default'} style={activo ? styles.textoItemActivo : styles.textoItem}>
          {nodo.titulo}
        </AppText>
      </Pressable>
    );
  };

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
          <Pressable
            onPress={irAMiPerfil}
            accessibilityRole="button"
            accessibilityLabel="Mi perfil"
            android_ripple={{ color: globalColors.hairline }}
            style={styles.cabecera}
          >
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
              <PildoraPuesto />
            </View>
          </Pressable>

          <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
            {secciones.map((seccion, indice) => (
              <View key={seccion.titulo ?? `seccion-${indice}`} style={styles.seccion}>
                {seccion.titulo ? (
                  <AppText variant="overline" tone="tertiary" style={styles.seccionTitulo}>
                    {seccion.titulo}
                  </AppText>
                ) : null}
                {seccion.nodos.map((nodo) => renderNodo(nodo, 0, []))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.pie}>
            {puedeCambiarPuesto ? (
              <Pressable
                onPress={cambiarPuesto}
                accessibilityRole="button"
                accessibilityLabel="Cambiar puesto"
                android_ripple={{ color: globalColors.hairline }}
                style={styles.item}
              >
                <AppIcon name="swap-horizontal-outline" size={iconSizes.lg} color={globalColors.textSecondary} />
                <AppText variant="body2">Cambiar puesto</AppText>
              </Pressable>
            ) : null}
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
    cabeceraTextos: { flex: 1, gap: spacing.xs },
    lista: { paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
    seccion: { marginBottom: spacing.sm },
    seccionTitulo: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    item: {
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
    },
    itemActivo: { backgroundColor: c.accentPrimaryMuted },
    textoItem: { flex: 1 },
    textoItemActivo: { flex: 1, fontWeight: '700' },
    pie: {
      padding: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.hairline,
    },
  });
