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
  /** Mensaje de error. Si hay, el campo se marca en rojo. */
  error?: string;
  helperText?: string;
  /** Agrega un asterisco a la etiqueta. */
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

interface EstadoVisual {
  focused: boolean;
  hasError: boolean;
  editable: boolean;
}

const createStyles = (c: ColorTokens, t: typeof tipografia, estado: EstadoVisual) => {
  const borde = estado.hasError ? c.danger : estado.focused ? c.accentPrimary : c.border;

  return StyleSheet.create({
    wrapper: { gap: spacing.xs },
    inputRow: {
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: borde,
      borderRadius: borderRadius.input,
      backgroundColor: estado.editable ? c.inputBackground : c.inputDisabled,
      paddingHorizontal: spacing.md,
    },
    input: {
      flex: 1,
      ...t.bodyLg,
      color: estado.editable ? c.text : c.textTertiary,
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
        <AppText variant="labelMd" tone="secondary">
          {required ? `${label} *` : label}
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
              name={oculto ? 'eye-outline' : 'eye-off-outline'}
              size={iconSizes.lg}
              color={globalColors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {hayError ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" tone="tertiary">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
});
