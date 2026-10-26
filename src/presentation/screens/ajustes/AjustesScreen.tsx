// Ajustes. Pantalla propia de la app (el portal resuelve el tema con un selector en su configuración):
// modo de color (sistema / claro / oscuro), datos de la cuenta y cierre de sesión.
import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { cerrarSesion } from '../../../application/auth/authService';
import { AppButton } from '../../components/AppButton';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../stores/authStore';
import { type PreferenciaModoColor, useModoColorStore } from '../../stores/modoColorStore';
import { metaDeRol, useRolStore } from '../../stores/rolStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';

interface OpcionDeModo {
  valor: PreferenciaModoColor;
  titulo: string;
  descripcion: string;
  icono: AppIconName;
}

const OPCIONES: OpcionDeModo[] = [
  { valor: 'sistema', titulo: 'Sistema', descripcion: 'Sigue la configuración del celular', icono: 'phone-portrait-outline' },
  { valor: 'claro', titulo: 'Claro', descripcion: 'Fondo claro siempre', icono: 'sunny-outline' },
  { valor: 'oscuro', titulo: 'Oscuro', descripcion: 'Fondo oscuro siempre', icono: 'moon-outline' },
];

export const AjustesScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const preferencia = useModoColorStore((s) => s.preferencia);
  const elegir = useModoColorStore((s) => s.elegir);
  const user = useAuthStore((s) => s.user);
  const role = useRolStore((s) => s.role);

  const salir = async () => {
    try {
      await cerrarSesion();
    } catch {
      Alert.alert('No se pudo cerrar la sesión. Intentá nuevamente.');
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <View style={styles.seccion}>
        <AppText variant="overline" tone="secondary">
          Apariencia
        </AppText>
        <View style={styles.tarjeta}>
          <AppText variant="subtitle1" style={styles.tarjetaTitulo}>
            Modo de color
          </AppText>
          {OPCIONES.map((opcion) => {
            const activa = opcion.valor === preferencia;
            return (
              <Pressable
                key={opcion.valor}
                onPress={() => void elegir(opcion.valor)}
                accessibilityRole="radio"
                accessibilityLabel={opcion.titulo}
                accessibilityState={{ selected: activa }}
                android_ripple={{ color: globalColors.hairline }}
                style={[styles.opcion, activa && styles.opcionActiva]}
              >
                <AppIcon
                  name={opcion.icono}
                  size={iconSizes.lg}
                  color={activa ? globalColors.accentPrimary : globalColors.textSecondary}
                />
                <View style={styles.opcionTextos}>
                  <AppText variant="body2" style={activa ? styles.opcionTituloActiva : undefined}>
                    {opcion.titulo}
                  </AppText>
                  <AppText variant="caption" tone="secondary">
                    {opcion.descripcion}
                  </AppText>
                </View>
                <AppIcon
                  name={activa ? 'radio-button-on' : 'radio-button-off'}
                  size={iconSizes.lg}
                  color={activa ? globalColors.accentPrimary : globalColors.textTertiary}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.seccion}>
        <AppText variant="overline" tone="secondary">
          Cuenta
        </AppText>
        <View style={styles.tarjeta}>
          <FilaDeCuenta etiqueta="Nombre" valor={user?.fullname} />
          <FilaDeCuenta etiqueta="Correo electrónico" valor={user?.email} />
          <FilaDeCuenta etiqueta="Puesto" valor={role ? metaDeRol(role).label : undefined} />
        </View>
      </View>

      <View style={styles.seccion}>
        <AppText variant="overline" tone="secondary">
          Aplicación
        </AppText>
        <View style={styles.tarjeta}>
          <FilaDeCuenta etiqueta="Portal SIP – Universidad Austral" valor="Versión de demostración" />
        </View>
      </View>

      <AppButton title="Cerrar sesión" variant="secondary" icon="log-out-outline" onPress={salir} />
    </Screen>
  );
};

const FilaDeCuenta: React.FC<{ etiqueta: string; valor?: string }> = ({ etiqueta, valor }) => (
  <View style={filaStyles.fila}>
    <AppText variant="caption" tone="secondary">
      {etiqueta}
    </AppText>
    <AppText variant="body2">{valor || '—'}</AppText>
  </View>
);

const filaStyles = StyleSheet.create({
  fila: { gap: spacing.xxs, paddingVertical: spacing.xs },
});

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { gap: spacing.xl, paddingBottom: spacing.xxxl },
    seccion: { gap: spacing.sm },
    tarjeta: {
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    tarjetaTitulo: { marginBottom: spacing.xs },
    opcion: {
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    opcionActiva: { backgroundColor: c.accentPrimaryMuted, borderColor: c.accentPrimary },
    opcionTextos: { flex: 1, gap: scale(2) },
    opcionTituloActiva: { fontWeight: '700' },
  });
