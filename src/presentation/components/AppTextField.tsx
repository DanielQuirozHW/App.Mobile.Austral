import React, { forwardRef, useMemo, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useThemeColors } from '../theme/theme';
import { ColorTokens } from '../theme/colors';
import { typography as tipografia } from '../theme/typography';
import { borderRadius, iconSizes, platformSpecific, spacing } from '../utils/responsive';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

interface AppTextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  /** Variante de la etiqueta: 'label' (11 px, 600) o 'overline' (mayúsculas, como el ingreso del portal). */
  labelVariant?: 'label' | 'overline';
  /** Mensaje de error. Si hay, el campo se marca en rojo. */
  error?: string;
  helperText?: string;
  /** Agrega un asterisco rojo a la etiqueta. */
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

interface EstadoVisual {
  focused: boolean;
  hasError: boolean;
  editable: boolean;
}

// Campo del portal (overrides/input.ts): etiqueta arriba (no flotante), borde de 1.5 px, radio 6,
// borde azul al enfocar, borde rojo con error. Deshabilitado: el texto conserva su color.
const createStyles = (c: ColorTokens, t: typeof tipografia, estado: EstadoVisual) => {
  const borde = estado.hasError ? c.danger : estado.focused ? c.accentPrimary : c.inputBorder;

  return StyleSheet.create({
    wrapper: { gap: spacing.xs },
    inputRow: {
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: borde,
      borderRadius: borderRadius.input,
      backgroundColor: estado.editable ? c.inputBackground : c.inputDisabled,
      paddingHorizontal: spacing.md,
    },
    input: {
      flex: 1,
      ...t.body1,
      color: c.text,
      paddingVertical: spacing.sm,
      includeFontPadding: false,
    },
    toggle: {
      minWidth: platformSpecific.minTouchTarget,
      minHeight: platformSpecific.minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: -spacing.md,
    },
  });
};

/**
 * Campo de texto con etiqueta, error y ayuda. Para contraseñas (secureTextEntry) muestra el ojo
 * para ver u ocultar el texto. Se conecta a react-hook-form con Controller.
 */
export const AppTextField = forwardRef<TextInput, AppTextFieldProps>(function AppTextField(
  {
    label,
    labelVariant = 'label',
    error,
    helperText,
    required,
    containerStyle,
    secureTextEntry,
    editable = true,
    onFocus,
    onBlur,
    ...inputProps
  },
  ref,
) {
  const { globalColors, typography } = useThemeColors();
  const [focused, setFocused] = useState(false);
  const [oculto, setOculto] = useState(true);
  const esContrasena = Boolean(secureTextEntry);
  const hayError = Boolean(error);

  const styles = useMemo(
    () => createStyles(globalColors, typography, { focused, hasError: hayError, editable }),
    [globalColors, typography, focused, hayError, editable],
  );

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <AppText variant={labelVariant} tone="secondary">
          {label}
          {required ? (
            <AppText variant={labelVariant} tone="danger">
              {' *'}
            </AppText>
          ) : null}
        </AppText>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          ref={ref}
          {...inputProps}
          editable={editable}
          secureTextEntry={esContrasena && oculto}
          placeholderTextColor={globalColors.textTertiary}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          style={styles.input}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {esContrasena ? (
          <Pressable
            onPress={() => setOculto(valor => !valor)}
            android_ripple={{ color: globalColors.hairline, borderless: true }}
            accessibilityRole="button"
            accessibilityLabel={oculto ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            style={styles.toggle}
          >
            <AppIcon
              name={oculto ? 'eye-off-outline' : 'eye-outline'}
              size={iconSizes.lg}
              color={globalColors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {hayError ? (
        <AppText variant="helper" tone="danger">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="helper" tone="tertiary">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});
