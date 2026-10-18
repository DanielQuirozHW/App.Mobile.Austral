// Registro. Fuente: Portal-Austral-Dev -> src/app/(blank)/registro/page.tsx
// Textos, validación de contraseña (8 a 15, minúscula, mayúscula, número y carácter especial) y mensajes por código del portal.
// En el portal esta página existe pero el ingreso no tiene un enlace hacia ella (se llega por URL): en la app se registra
// la ruta y se llega desde la pantalla de ingreso solo si Daniel lo decide (ver PENDIENTES).
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registrar } from '../../../application/auth/authService';
import { getFriendlyErrorMessage } from '../../../domain/auth/authError';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { AuthLayout } from '../../components/AuthLayout';
import { LogoAustral } from '../../components/LogoAustral';
import type { RootStackParams } from '../../navigation/tipos';
import { spacing } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParams, 'Registro'>;

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Ingresa una dirección de correo electrónico válida')
    .required('El campo de correo electrónico es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .matches(/\d/, 'La contraseña debe contener al menos un número')
    .matches(/\W/, 'La contraseña debe contener al menos un carácter especial')
    .max(15, 'La contraseña no puede superar los 15 caracteres')
    .required('La contraseña es requerida'),
  repassword: yup
    .string()
    .required('Repetir contraseña es requerida')
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir'),
});

// Mensajes por código de Firebase Auth que define la propia página de registro del portal.
const MENSAJES_REGISTRO: Record<string, string> = {
  'auth/email-already-in-use': 'El correo electrónico ya está en uso por otra cuenta.',
  'auth/invalid-email': 'La dirección de correo electrónico proporcionada no es válida.',
  'auth/operation-not-allowed': 'La operación de registro no está permitida.',
  'auth/weak-password': 'La contraseña proporcionada es demasiado débil.',
  'auth/network-request-failed': 'Hubo un problema de red al registrar la cuenta.',
  'auth/app-deleted': 'La instancia de la aplicación Firebase ha sido eliminada.',
  'auth/app-not-authorized': 'La aplicación no está autorizada para acceder a Firebase.',
  'auth/argument-error': 'Error de argumento al registrar la cuenta.',
  'auth/internal-error': 'Error interno al registrar la cuenta.',
  'auth/missing-iframe-start': 'Falta el iframe de inicio al registrar la cuenta.',
};

interface Formulario {
  email: string;
  password: string;
  repassword: string;
}

const Contenido: React.FC<Props> = ({ navigation }) => {
  const [cargando, setCargando] = useState(false);
  const styles = useMemo(() => estilos(), []);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Formulario>({
    defaultValues: { email: '', password: '', repassword: '' },
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  const onSubmit = async ({ email, password }: Formulario) => {
    setCargando(true);
    try {
      await registrar({ email, password });
    } catch (error: any) {
      // El portal deja el mensaje vacío si el código no está en su lista (y el error propio "No existe una cuenta..."
      // no tiene código): acá se usa el texto amigable en esos casos para que el usuario vea el motivo.
      const mensaje = MENSAJES_REGISTRO[error?.code] ?? getFriendlyErrorMessage(error);
      setError('email', { type: 'manual', message: mensaje });
    } finally {
      setCargando(false);
    }
  };

  return (
    <View>
      <LogoAustral />
      <AppText variant="h5" style={styles.titulo}>
        Regístrate y descubre 🚀
      </AppText>
      <AppText variant="body2" tone="secondary" style={styles.subtitulo}>
        Forma parte de nuestra comunidad en solo unos pasos!
      </AppText>

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
              placeholder="Correo electrónico"
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
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
          )}
        />
        <Controller
          control={control}
          name="repassword"
          render={({ field: { value, onChange, onBlur } }) => (
            <AppTextField
              label="Repetir Contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.repassword?.message}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
          )}
        />
      </View>

      <AppButton title="Registrar" onPress={handleSubmit(onSubmit)} loading={cargando} style={styles.boton} />

      <View style={styles.pie}>
        <AppText variant="body2">Ya tienes una cuenta?</AppText>
        <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="link" hitSlop={spacing.sm}>
          <AppText variant="body2" tone="primary">
            Inicia Sesión
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};

export const RegistroScreen: React.FC<Props> = (props) => (
  <AuthLayout>
    <Contenido {...props} />
  </AuthLayout>
);

const estilos = () =>
  StyleSheet.create({
    titulo: { marginTop: spacing.xxxl, marginBottom: spacing.sm },
    subtitulo: { marginBottom: spacing.xxl },
    campos: { gap: spacing.lg },
    boton: { marginTop: spacing.xxl },
    pie: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xxl },
  });
