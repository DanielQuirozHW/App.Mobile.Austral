// Pantalla de ingreso. La lógica es la del portal (Portal-Austral-Dev -> src/app/(blank)/login/page.tsx): mismo esquema
// de validación, mensajes de error en el campo de correo e ingreso con usuario Austral (Microsoft). El diseño es propio
// de la app mobile (docs/DECISION-UI-MOBILE.md): logo, un saludo corto, el ingreso con usuario Austral como acción
// principal y el formulario de correo debajo.
// Sin enlace de "¿Olvidaste la contraseña?": las cuentas con usuario y contraseña las administra Austral desde Firebase.
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { loginConEmail, loginConMicrosoft, LoginCanceladoError } from '../../../application/auth/authService';
import { getFriendlyErrorMessage } from '../../../domain/auth/authError';
import { AppButton } from '../../components/AppButton';
import { AppCheckbox } from '../../components/AppCheckbox';
import { AppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { AuthLayout } from '../../components/AuthLayout';
import { LogoAustral } from '../../components/LogoAustral';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';

// Esquema del portal, sin cambios.
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Ingresa una dirección de correo electrónico válida')
    .required('El campo de correo electrónico es requerido'),
  password: yup
    .string()
    .min(5, 'La contraseña debe tener al menos 5 caracteres')
    .required('El campo de contraseña es requerido'),
});

interface LoginForm {
  email: string;
  password: string;
}

const URL_SOPORTE = 'https://portal.austral.edu.ar/';

const LoginContenido: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  const [recordar, setRecordar] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [cargandoSso, setCargandoSso] = useState(false);
  const [errorSso, setErrorSso] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onSubmit = async (datos: LoginForm) => {
    setCargando(true);
    try {
      await loginConEmail({ email: datos.email, password: datos.password, recordar });
    } catch (error) {
      // Igual que el portal: el mensaje se muestra en el campo de correo.
      setError('email', { type: 'manual', message: getFriendlyErrorMessage(error) });
    } finally {
      setCargando(false);
    }
  };

  const ingresarConMicrosoft = async () => {
    setErrorSso(null);
    setCargandoSso(true);
    try {
      await loginConMicrosoft();
    } catch (error) {
      if (!(error instanceof LoginCanceladoError)) {
        setErrorSso(error instanceof Error ? error.message : getFriendlyErrorMessage(error));
      }
    } finally {
      setCargandoSso(false);
    }
  };

  return (
    <View>
      <LogoAustral />

      <AppText variant="h2" style={styles.titulo}>
        Ingresá a tu cuenta
      </AppText>
      <AppText variant="body1" tone="secondary" style={styles.subtitulo}>
        Usá tu usuario Austral o tu correo electrónico.
      </AppText>

      {/* Ingreso con usuario Austral (SSO institucional) */}
      <Pressable
        onPress={ingresarConMicrosoft}
        disabled={cargandoSso}
        accessibilityRole="button"
        accessibilityLabel="Ingresar con usuario Austral"
        accessibilityState={{ disabled: cargandoSso, busy: cargandoSso }}
        style={({ pressed }) => [styles.sso, pressed && styles.ssoPresionado, cargandoSso && styles.ssoCargando]}
      >
        {cargandoSso ? (
          <ActivityIndicator color={globalColors.accentPrimaryOn} />
        ) : (
          <AppIcon name="shield-checkmark-outline" size={iconSizes.xl} color={globalColors.accentPrimaryOn} />
        )}
        <AppText variant="button" locked style={styles.ssoTitulo}>
          Ingresar con usuario Austral
        </AppText>
      </Pressable>
      {errorSso ? (
        <AppText variant="helper" tone="danger" style={styles.errorSso}>
          {errorSso}
        </AppText>
      ) : null}

      {/* Divisor */}
      <View style={styles.divisor}>
        <View style={styles.linea} />
        <AppText variant="caption" tone="tertiary">
          o con tu correo
        </AppText>
        <View style={styles.linea} />
      </View>

      {/* Formulario */}
      <View style={styles.campos}>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange, onBlur } }) => (
            <AppTextField
              label="Correo electrónico"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              placeholder="nombre@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <AppTextField
              label="Contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              placeholder="Tu contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
            />
          )}
        />
      </View>

      <View style={styles.opciones}>
        <AppCheckbox label="Recordarme" checked={recordar} onChange={setRecordar} />
      </View>

      <AppButton
        title={cargando ? 'Ingresando...' : 'Ingresar'}
        onPress={handleSubmit(onSubmit)}
        loading={cargando}
        icon="arrow-forward"
        iconAlFinal
        grande
        style={styles.botonIngresar}
      />

      {/* Pie de soporte */}
      <View style={styles.pie}>
        <AppText variant="body2" tone="secondary">
          ¿Problemas para ingresar?
        </AppText>
        <Pressable
          onPress={() => Linking.openURL(URL_SOPORTE)}
          accessibilityRole="link"
          style={styles.soporte}
          hitSlop={spacing.sm}
        >
          <AppText variant="subtitle2" tone="primary">
            Contactá a Soporte
          </AppText>
          <AppIcon name="open-outline" size={iconSizes.sm} color={globalColors.accentPrimary} />
        </Pressable>
      </View>
    </View>
  );
};

export const LoginScreen: React.FC = () => (
  <AuthLayout>
    <LoginContenido />
  </AuthLayout>
);

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    titulo: { marginTop: spacing.xxxl, marginBottom: spacing.xs },
    subtitulo: { marginBottom: spacing.xxl },
    sso: {
      minHeight: scale(60),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      backgroundColor: c.primary,
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing.xl,
      ...platformSpecific.shadow(3),
    },
    ssoPresionado: { backgroundColor: c.primaryDark, transform: [{ scale: 0.98 }] },
    ssoCargando: { opacity: 0.75 },
    ssoTitulo: { color: c.accentPrimaryOn },
    errorSso: { marginTop: spacing.sm },
    divisor: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginVertical: spacing.xxl },
    linea: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.hairline },
    campos: { gap: spacing.lg, marginBottom: spacing.lg },
    opciones: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxl },
    botonIngresar: { marginBottom: spacing.xxl },
    pie: { alignItems: 'center', gap: spacing.xs },
    soporte: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: scale(44) },
  });
