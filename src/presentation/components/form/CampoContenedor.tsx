import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { spacing } from '../../utils/responsive';
import { AppText } from '../AppText';

interface CampoContenedorProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Etiqueta, mensaje de error y ayuda con el mismo aspecto que AppTextField, para los campos que no son de texto. */
export const CampoContenedor: React.FC<CampoContenedorProps> = ({
  label,
  required,
  error,
  helperText,
  style,
  children,
}) => (
  <View style={[styles.wrapper, style]}>
    {label ? (
      <AppText variant="label" tone="secondary">
        {label}
        {required ? (
          <AppText variant="label" tone="danger">
            {' *'}
          </AppText>
        ) : null}
      </AppText>
    ) : null}
    {children}
    {error ? (
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

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
});
