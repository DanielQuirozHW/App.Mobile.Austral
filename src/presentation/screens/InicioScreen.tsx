// Inicio PROVISORIO. El portal tiene un tablero en "/" que todavía no se leyó ni se migra (los módulos del MVP
// están por definir). Esta pantalla muestra quién está en sesión, da acceso a Datos personales y a
// Licencias y vacaciones, y permite cerrar la sesión.
import React, { useMemo } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cerrarSesion } from '../../application/auth/authService';
import { AppButton } from '../components/AppButton';
import { AppText } from '../components/AppText';
import { Screen } from '../components/Screen';
import type { RootStackParams } from '../navigation/tipos';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { useAuthStore } from '../stores/authStore';
import { metaDeRol, puedeVerLegajo, useRolStore } from '../stores/rolStore';
import { borderRadius, scale, spacing } from '../utils/responsive';

const iniciales = (nombre?: string): string =>
  (nombre ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

export const InicioScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
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
      <View style={styles.perfil}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} accessibilityLabel="Foto de perfil" />
        ) : (
          <View style={[styles.avatar, styles.avatarIniciales]}>
            <AppText variant="h4" style={{ color: globalColors.accentPrimaryOn }}>
              {iniciales(user?.fullname)}
            </AppText>
          </View>
        )}
        <AppText variant="h5" style={styles.centrado}>
          {user?.fullname}
        </AppText>
        {role ? (
          <AppText variant="body2" tone="secondary">
            {metaDeRol(role).label}
          </AppText>
        ) : null}
      </View>

      <View style={styles.acciones}>
        {puedeVerLegajo(role) ? (
          <AppButton title="Datos personales" icon="person-outline" onPress={() => navigation.navigate('DatosPersonales')} />
        ) : null}
        <AppButton
          title="Licencias y vacaciones"
          icon="calendar-outline"
          onPress={() => navigation.navigate('Licencias')}
        />
        <AppButton title="Cerrar sesión" variant="secondary" onPress={salir} />
      </View>
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    contenido: { flexGrow: 1, justifyContent: 'center', gap: spacing.xxxl },
    perfil: { alignItems: 'center', gap: spacing.sm },
    acciones: { gap: spacing.md },
    centrado: { textAlign: 'center' },
    avatar: { width: scale(96), height: scale(96), borderRadius: borderRadius.round, marginBottom: spacing.sm },
    avatarIniciales: { backgroundColor: c.accentPrimary, alignItems: 'center', justifyContent: 'center' },
  });
