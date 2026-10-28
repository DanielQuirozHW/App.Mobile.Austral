// Pantalla de subopciones de un módulo con varias entradas (Legajo, Perfil, Funciones SA, etc.). Reemplaza a los grupos
// que se desplegaban en el menú lateral: cada subopción es una tarjeta grande con ícono. Una subopción que a su vez tiene
// subopciones (Perfil > Docencia) abre otra pantalla igual. Las reglas de visibilidad son las del árbol de
// navigation/modulosMenu.ts.
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppIcon } from '../components/AppIcon';
import { AppText } from '../components/AppText';
import { Screen } from '../components/Screen';
import { abrirNodo, buscarNodoPorId, esProximamente } from '../navigation/grilla';
import { filtrarNodos, type NodoDeMenu } from '../navigation/modulosMenu';
import type { RootStackParams } from '../navigation/tipos';
import { useAuthStore } from '../stores/authStore';
import { useRolStore } from '../stores/rolStore';
import { ColorTokens } from '../theme/colors';
import { colorDeModulo } from '../theme/coloresModulos';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParams, 'Submenu'>;

export const SubmenuScreen: React.FC<Props> = ({ route }) => {
  const { id, color, ubicacion } = route.params;
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);

  const nodo = useMemo(() => buscarNodoPorId(id), [id]);
  const hijos = useMemo(
    () => (nodo?.hijos ? filtrarNodos(nodo.hijos, { puesto: role, user }) : []),
    [nodo, role, user],
  );

  const colorBase = color ?? colorDeModulo(id);
  const caminoActual = [ubicacion, nodo?.titulo].filter(Boolean).join(' › ');

  const abrir = (hijo: NodoDeMenu) => abrirNodo(hijo, { color: colorBase, ubicacion: caminoActual || undefined });

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      {hijos.length === 0 ? (
        <AppText variant="body1" tone="secondary" style={styles.vacio}>
          No hay opciones disponibles en esta sección.
        </AppText>
      ) : null}

      {hijos.map((hijo) => {
        const proximamente = esProximamente(hijo);
        const cantidad = hijo.hijos?.length ?? 0;
        return (
          <Pressable
            key={hijo.id}
            onPress={() => abrir(hijo)}
            accessibilityRole="button"
            accessibilityLabel={proximamente ? `${hijo.titulo}, próximamente` : hijo.titulo}
            android_ripple={{ color: globalColors.hairline }}
            style={({ pressed }) => [styles.fila, pressed && styles.presionada]}
          >
            <View style={[styles.cuadro, { backgroundColor: colorBase }, proximamente && styles.apagado]}>
              <AppIcon name={hijo.icono} size={iconSizes.xl} color="#FFFFFF" />
            </View>
            <View style={styles.textos}>
              <AppText variant="subtitle1">{hijo.titulo}</AppText>
              {proximamente ? (
                <AppText variant="caption" tone="tertiary">
                  Próximamente
                </AppText>
              ) : cantidad > 0 ? (
                <AppText variant="caption" tone="secondary">
                  {cantidad === 1 ? '1 opción' : `${cantidad} opciones`}
                </AppText>
              ) : null}
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
    contenido: { gap: spacing.md, paddingBottom: spacing.xxxl },
    vacio: { textAlign: 'center', marginTop: spacing.xxxl },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.lg,
      minHeight: scale(80),
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
      ...platformSpecific.shadow(2),
    },
    presionada: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    cuadro: {
      width: scale(52),
      height: scale(52),
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    apagado: { opacity: 0.45 },
    textos: { flex: 1, gap: spacing.xxs },
  });
