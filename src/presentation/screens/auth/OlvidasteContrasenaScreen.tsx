// Recuperar contraseña. Fuente: Portal-Austral-Dev -> src/app/(blank)/olvidaste-contrasena/page.tsx
// Textos, validación y mensaje de éxito del portal. El portal la dibuja sobre fondo #040404 con texto blanco;
// la app la muestra con el mismo aspecto que el ingreso (decisión 33).
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { recuperarContrasena } from '../../../application/auth/authService';
import { getFriendlyErrorMessage } from '../../../domain/auth/authError';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { AuthLayout } from '../../components/AuthLayout';
import { LogoAustral } from '../../components/LogoAustral';
import type { RootStackParams } from '../../navigation/tipos';
import { spacing } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParams, 'OlvidasteContrasena'>;

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Ingresa una dirección de correo electrónico válida')
    .required('El campo de correo electrónico es requerido'),
});

const MSG_EXITO =
  'Si el correo corresponde a una cuenta con contraseña, te enviamos el enlace de recuperación. Revisá también la carpeta de correo no deseado. Si iniciás sesión con tu usuario Austral (SSO), no tenés contraseña para recuperar.';

interface Formulario {
  email: string;
}

const Contenido: React.FC<Props> = ({ navigation }) => {
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);
  const styles = useMemo(() => estilos(), []);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Formulario>({ defaultValues: { email: '' }, mode: 'onBlur', resolver: yupResolver(schema) });

  const onSubmit = async ({ email }: Formulario) => {
    setCargando(true);
    try {
      await recuperarContrasena(email);
      setExito(MSG_EXITO);
    } catch (error) {
      setError('email', { type: 'manual', message: getFriendlyErrorMessage(error) });
    } finally {
      setCargando(false);
    }
  };

  return (
    <View>
      <LogoAustral />
      <AppText variant="h5" style={styles.titulo}>
        Olvidaste la contraseña? 🔒
      </AppText>
      <AppText variant="body2" tone="secondary" style={styles.subtitulo}>
        Ingresa tu correo y te enviaremos las instrucciones para recuperar la contraseña
      </AppText>

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
      {exito ? (
        <AppText variant="subtitle2" tone="success" style={styles.exito}>
          {exito}
        </AppText>
      ) : null}

      <AppButton
        title="Enviar enlace de recuperación"
        onPress={handleSubmit(onSubmit)}
        loading={cargando}
        style={styles.boton}
      />

      <Pressable onPress={() => navigation.navigate('Login')} accessibilityRole="link" style={styles.volver} hitSlop={spacing.sm}>
        <AppText variant="body1" tone="primary">
          Volver al login
        </AppText>
      </Pressable>
    </View>
  );
};

export const OlvidasteContrasenaScreen: React.FC<Props> = (props) => (
  <AuthLayout>
    <Contenido {...props} />
  </AuthLayout>
);

const estilos = () =>
  StyleSheet.create({
    titulo: { marginTop: spacing.xxxl, marginBottom: spacing.sm },
    subtitulo: { marginBottom: spacing.xxl },
    exito: { marginTop: spacing.sm },
    boton: { marginTop: spacing.xl },
    volver: { alignSelf: 'center', marginTop: spacing.xxl },
  });
