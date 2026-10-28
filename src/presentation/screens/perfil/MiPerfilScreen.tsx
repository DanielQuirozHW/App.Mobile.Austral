// Mi perfil. Pantalla de entrada al módulo 1 de la demo (decisión 93): cabecera con la foto de perfil y de portada, y las
// secciones del legajo y del perfil académico (Datos personales, Documentación, Formación, Trayectoria, Extensión,
// Gestión académica, Docencia e Investigación). Es propia de la app: en el portal esas páginas cuelgan del menú lateral.
// Cada fila abre la pantalla real (se apila sobre esta, "atrás" vuelve acá). Qué secciones ve cada puesto sale de
// navigation/modulosMenu.ts (Datos personales solo docente / codocente, como el portal).
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { PerfilLegajoBanner } from '../../components/legajo/PerfilLegajoBanner';
import { Screen } from '../../components/Screen';
import { SECCIONES_DE_MI_PERFIL } from '../../navigation/modulosMenu';
import type { RootStackParams } from '../../navigation/tipos';
import { useRolStore } from '../../stores/rolStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';

export const MiPerfilScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const role = useRolStore((s) => s.role);

  const secciones = useMemo(() => SECCIONES_DE_MI_PERFIL.filter((item) => item.visiblePara(role)), [role]);

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <PerfilLegajoBanner />

      <View style={styles.lista}>
        {secciones.map((item) => (
          <Pressable
            key={item.ruta}
            // Todas estas rutas se abren sin parámetros (Docencia e Investigación abren en su pestaña inicial); el cast
            // evita depender del tipo de parámetros de cada ruta.
            onPress={() => navigation.navigate(item.ruta as never)}
            accessibilityRole="button"
            accessibilityLabel={item.titulo}
            android_ripple={{ color: globalColors.hairline }}
            style={({ pressed }) => [styles.fila, pressed && styles.filaPresionada]}
          >
            <View style={styles.icono}>
              <AppIcon name={item.icono} size={iconSizes.lg} color={globalColors.accentPrimary} />
            </View>
            <View style={styles.textos}>
              <AppText variant="subtitle1">{item.titulo}</AppText>
              {item.descripcion ? (
                <AppText variant="caption" tone="secondary">
                  {item.descripcion}
                </AppText>
              ) : null}
            </View>
            <AppIcon name="chevron-forward" size={iconSizes.md} color={globalColors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
    lista: { gap: spacing.sm },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: platformSpecific.minTouchTarget,
      padding: spacing.md,
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
    },
    filaPresionada: { backgroundColor: c.accentPrimaryMuted },
    icono: {
      width: scale(44),
      height: scale(44),
      borderRadius: borderRadius.md,
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1, gap: spacing.xxs },
  });
