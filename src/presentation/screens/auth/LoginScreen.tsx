// Pantalla de ingreso. Fuente: Portal-Austral-Dev -> src/app/(blank)/login/page.tsx (versión mobile: el panel
// con la imagen institucional se oculta en mobile, igual que en el portal).
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
import { borderRadius, iconSizes, scale, scaleFont, spacing } from '../../utils/responsive';

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

      {/* Kicker */}
      <View style={styles.kicker}>
        <AppIcon name="lock-closed-outline" size={iconSizes.sm} color={globalColors.textSecondary} />
        <AppText variant="overline" tone="secondary">
          Portal SIP – Universidad Austral
        </AppText>
      </View>

      <AppText variant="body1" style={styles.titulo}>
        Bienvenido al portal SIP
      </AppText>
      <AppText variant="body2" tone="secondary" style={styles.subtitulo}>
        Un espacio para toda la comunidad Austral. Todo lo que necesitás, en un solo lugar.
      </AppText>

      {/* Botón SSO */}
      <Pressable
        onPress={ingresarConMicrosoft}
        disabled={cargandoSso}
        accessibilityRole="button"
        accessibilityLabel="Ingresar con usuario Austral"
        accessibilityState={{ disabled: cargandoSso, busy: cargandoSso }}
        style={({ pressed }) => [
          styles.sso,
          pressed && styles.ssoPresionado,
          cargandoSso && styles.ssoCargando,
        ]}
      >
        <View style={styles.ssoIcono}>
          {cargandoSso ? (
            <ActivityIndicator color={globalColors.textInverse} />
          ) : (
            <AppIcon name="shield-checkmark-outline" size={iconSizes.xl} color={globalColors.textInverse} />
          )}
        </View>
        <View style={styles.ssoTextos}>
          <AppText variant="button" locked style={styles.ssoTitulo}>
            Ingresar con usuario Austral
          </AppText>
          <AppText variant="body2" style={styles.ssoSubtitulo}>
            SSO institucional
          </AppText>
        </View>
        <AppIcon name="arrow-forward" size={iconSizes.md} color={globalColors.textInverse} />
      </Pressable>
      {errorSso ? (
        <AppText variant="helper" tone="danger" style={styles.errorSso}>
          {errorSso}
        </AppText>
      ) : null}

      {/* Divisor */}
      <View style={styles.divisor}>
        <View style={styles.linea} />
        <AppText variant="caption" tone="tertiary" style={styles.divisorTexto}>
          O CONTINÚA CON EMAIL
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
              labelVariant="overline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              placeholder="user@email.com"
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
              labelVariant="overline"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              placeholder="Ingrese su contraseña"
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
        <AppCheckbox label="Recuérdame" checked={recordar} onChange={setRecordar} />
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
        <AppText variant="caption" tone="secondary">
          ¿Problemas para ingresar?
        </AppText>
        <Pressable
          onPress={() => Linking.openURL(URL_SOPORTE)}
          accessibilityRole="link"
          style={styles.soporte}
          hitSlop={spacing.sm}
        >
          <AppText variant="body2" tone="primary" style={styles.soporteTexto}>
            Contactar a Soporte
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
    kicker: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxxl, marginBottom: spacing.lg },
    // Portal: fontSize 2rem, lineHeight 1.15, mb 1 (4 px)
    titulo: { fontSize: scaleFont(32), lineHeight: scaleFont(32) * 1.15, marginBottom: spacing.xs },
    subtitulo: { marginBottom: spacing.xxxl },
    // Portal: primary.main, radio 10, padding 14/20
    sso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      backgroundColor: c.primary,
      borderRadius: borderRadius.card,
      paddingVertical: scale(14),
      paddingHorizontal: spacing.xl,
    },
    ssoPresionado: { backgroundColor: c.primaryDark },
    ssoCargando: { opacity: 0.75 },
    ssoIcono: {
      width: scale(36),
      height: scale(36),
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ssoTextos: { flex: 1 },
    ssoTitulo: { color: '#FFFFFF' },
    ssoSubtitulo: { color: 'rgba(255,255,255,0.70)', marginTop: scale(2) },
    errorSso: { marginTop: spacing.sm },
    divisor: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginVertical: spacing.xxl },
    linea: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.hairline },
    divisorTexto: { letterSpacing: 0.08 * 11 },
    campos: { gap: spacing.lg, marginBottom: spacing.lg },
    opciones: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxl },
    botonIngresar: { marginBottom: spacing.xxl },
    pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    soporte: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    soporteTexto: { fontFamily: 'Montserrat-SemiBold' },
  });
