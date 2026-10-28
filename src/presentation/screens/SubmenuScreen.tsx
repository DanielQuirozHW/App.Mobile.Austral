// Pantalla de subopciones de un módulo con varias entradas (Legajo, Perfil, Funciones SA, etc.). Reemplaza a los grupos
// que se desplegaban en el menú lateral. Las subopciones van en UNA lista agrupada (una tarjeta con divisores), cada una con
// su ícono sobre un fondo suave del color del módulo y una línea que dice qué hay adentro. En Legajo y Perfil arriba va la
// cabecera con la foto y el nombre (la misma de Datos personales). Una subopción que a su vez tiene subopciones
// (Perfil > Docencia) abre otra pantalla igual. Las reglas de visibilidad son las del árbol de navigation/modulosMenu.ts.
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Aparece } from '../components/Aparece';
import { AppIcon } from '../components/AppIcon';
import { AppText } from '../components/AppText';
import { PerfilLegajoBanner } from '../components/legajo/PerfilLegajoBanner';
import { Screen } from '../components/Screen';
import { abrirNodo, buscarNodoPorId, descripcionDeNodo, esProximamente } from '../navigation/grilla';
import { filtrarNodos } from '../navigation/modulosMenu';
import type { RootStackParams } from '../navigation/tipos';
import { useAuthStore } from '../stores/authStore';
import { useRolStore } from '../stores/rolStore';
import { ColorTokens } from '../theme/colors';
import { colorDeModulo } from '../theme/coloresModulos';
import { useThemeColors } from '../theme/theme';
import { borderRadius, iconSizes, scale, spacing } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParams, 'Submenu'>;

// Los módulos que abren con la cabecera del perfil (foto, nombre, puesto y sede).
const CON_CABECERA_DE_PERFIL = ['legajo', 'perfil'];

export const SubmenuScreen: React.FC<Props> = ({ route }) => {
  const { id, color, ubicacion } = route.params;
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);

  const nodo = useMemo(() => buscarNodoPorId(id), [id]);
  const colorBase = color ?? colorDeModulo(id);
  const caminoActual = [ubicacion, nodo?.titulo].filter(Boolean).join(' › ');

  const filas = useMemo(() => {
    const contexto = { puesto: role, user };
    const hijos = nodo?.hijos ? filtrarNodos(nodo.hijos, contexto) : [];
    return hijos.map((hijo) => ({
      nodo: hijo,
      proximamente: esProximamente(hijo),
      descripcion: descripcionDeNodo(hijo, hijo.hijos ? filtrarNodos(hijo.hijos, contexto) : []),
    }));
  }, [nodo, role, user]);

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      {CON_CABECERA_DE_PERFIL.includes(id) ? (
        <Aparece>
          <PerfilLegajoBanner />
        </Aparece>
      ) : null}

      {filas.length === 0 ? (
        <AppText variant="body1" tone="secondary" style={styles.vacio}>
          No hay opciones disponibles en esta sección.
        </AppText>
      ) : (
        <Aparece demora={90}>
          <View style={styles.lista}>
            {filas.map(({ nodo: hijo, proximamente, descripcion }, indice) => (
              <View key={hijo.id}>
                {indice > 0 ? <View style={styles.divisor} /> : null}
                <Pressable
                  onPress={() => abrirNodo(hijo, { color: colorBase, ubicacion: caminoActual || undefined })}
                  accessibilityRole="button"
                  accessibilityLabel={proximamente ? `${hijo.titulo}, próximamente` : hijo.titulo}
                  android_ripple={{ color: globalColors.hairline }}
                  style={({ pressed }) => [styles.fila, pressed && styles.presionada]}
                >
                  <View
                    style={[
                      styles.icono,
                      { backgroundColor: proximamente ? globalColors.surfaceSecondary : `${colorBase}1F` },
                    ]}
                  >
                    <AppIcon
                      name={hijo.icono}
                      size={iconSizes.lg}
                      color={proximamente ? globalColors.textTertiary : colorBase}
                    />
                  </View>
                  <View style={styles.textos}>
                    <AppText variant="subtitle1" tone={proximamente ? 'secondary' : 'default'}>
                      {hijo.titulo}
                    </AppText>
                    {proximamente ? (
                      <AppText variant="caption" tone="tertiary">
                        Próximamente
                      </AppText>
                    ) : descripcion ? (
                      <AppText variant="caption" tone="secondary" numberOfLines={2}>
                        {descripcion}
                      </AppText>
                    ) : null}
                  </View>
                  <AppIcon name="chevron-forward" size={iconSizes.md} color={globalColors.textTertiary} />
                </Pressable>
              </View>
            ))}
          </View>
        </Aparece>
      )}
    </Screen>
  );
};

const TAMANIO_ICONO = scale(44);

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
    vacio: { textAlign: 'center', marginTop: spacing.xxxl },
    // Una sola tarjeta con las filas separadas por divisores: menos ruido que una tarjeta por fila.
    lista: {
      overflow: 'hidden',
      backgroundColor: c.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: c.border,
    },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      padding: spacing.lg,
      minHeight: scale(72),
    },
    presionada: { backgroundColor: c.accentPrimaryMuted },
    icono: {
      width: TAMANIO_ICONO,
      height: TAMANIO_ICONO,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1, gap: spacing.xxs },
    // El divisor arranca alineado con el texto, no con el borde de la tarjeta.
    divisor: {
      height: StyleSheet.hairlineWidth,
      marginLeft: spacing.lg + TAMANIO_ICONO + spacing.lg,
      backgroundColor: c.hairline,
    },
  });
