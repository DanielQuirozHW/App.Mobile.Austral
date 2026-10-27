import React, { forwardRef, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { CampoContenedor } from './CampoContenedor';

interface DateFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  value: Date | null | undefined;
  onChange: (fecha: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Fecha con la que abre el selector si todavía no hay valor. */
  fechaInicial?: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  clearable?: boolean;
  onBlur?: () => void;
}

/**
 * Campo de fecha con el selector nativo (@react-native-community/datetimepicker).
 * Android: diálogo nativo por API imperativa. iOS: selector de rueda dentro de un modal.
 * El valor es un Date; se muestra como dd/MM/aaaa.
 */
export const DateField = forwardRef<View, DateFieldProps>(function DateField(
  {
    label,
    required,
    error,
    value,
    onChange,
    placeholder = 'dd/mm/aaaa',
    disabled = false,
    fechaInicial,
    maximumDate,
    minimumDate,
    clearable = true,
    onBlur,
  },
  ref,
) {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors, Boolean(error), disabled), [globalColors, error, disabled]);
  const [visibleIOS, setVisibleIOS] = useState(false);
  const [temporal, setTemporal] = useState<Date>(value ?? fechaInicial ?? new Date());

  const texto = aFechaVisible(value);

  const abrir = () => {
    const inicio = value ?? fechaInicial ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: inicio,
        mode: 'date',
        maximumDate,
        minimumDate,
        onValueChange: (_evento, fecha) => {
          onChange(fecha);
          onBlur?.();
        },
        onDismiss: () => onBlur?.(),
      });
      return;
    }
    setTemporal(inicio);
    setVisibleIOS(true);
  };

  const aceptarIOS = () => {
    onChange(temporal);
    setVisibleIOS(false);
    onBlur?.();
  };

  const cancelarIOS = () => {
    setVisibleIOS(false);
    onBlur?.();
  };

  return (
    <CampoContenedor label={label} required={required} error={error}>
      <View ref={ref} collapsable={false} style={styles.caja}>
        <Pressable
          onPress={abrir}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityValue={{ text: texto || placeholder }}
          accessibilityState={{ disabled }}
          android_ripple={{ color: globalColors.hairline }}
          style={styles.principal}
        >
          <AppText variant="body1" tone={texto ? 'default' : 'tertiary'} style={styles.texto}>
            {texto || placeholder}
          </AppText>
          <AppIcon name="calendar-outline" size={iconSizes.md} color={globalColors.textSecondary} />
        </Pressable>
        {clearable && value && !disabled ? (
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${label ?? 'fecha'}`}
            style={styles.limpiar}
          >
            <AppIcon name="close-circle" size={iconSizes.md} color={globalColors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      {Platform.OS === 'ios' ? (
        <AppModal
          visible={visibleIOS}
          onClose={cancelarIOS}
          titulo={label ?? 'Fecha'}
          variante="centrado"
          pie={
            <>
              <AppButton title="Cancelar" variant="secondary" onPress={cancelarIOS} />
              <AppButton title="Aceptar" onPress={aceptarIOS} />
            </>
          }
        >
          <DateTimePicker
            value={temporal}
            mode="date"
            display="spinner"
            locale="es-AR"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onValueChange={(_evento, fecha) => setTemporal(fecha)}
          />
        </AppModal>
      ) : null}
    </CampoContenedor>
  );
});

const createStyles = (c: ColorTokens, hayError: boolean, deshabilitado: boolean) =>
  StyleSheet.create({
    caja: {
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: hayError ? c.danger : c.inputBorder,
      borderRadius: borderRadius.input,
      backgroundColor: deshabilitado ? c.inputDisabled : c.inputBackground,
    },
    principal: {
      flex: 1,
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    texto: { flex: 1 },
    limpiar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  });
