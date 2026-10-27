import React, { forwardRef, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppIcon } from '../AppIcon';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { CampoContenedor } from './CampoContenedor';
import type { OpcionDeSelect } from './SelectField';

interface MultiSelectFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  options: OpcionDeSelect[];
  value: OpcionDeSelect[] | null | undefined;
  onChange: (opciones: OpcionDeSelect[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

const misma = (a: OpcionDeSelect, b: OpcionDeSelect): boolean => String(a.value) === String(b.value);

/**
 * Selección múltiple (equivale a CustomSelectMultiple del portal): abre una lista donde se tildan varias opciones.
 * El valor es la lista de opciones { value, label }.
 */
export const MultiSelectField = forwardRef<View, MultiSelectFieldProps>(function MultiSelectField(
  { label, required, error, options, value, onChange, placeholder = 'Seleccionar', disabled = false, onBlur },
  ref,
) {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors, Boolean(error), disabled), [globalColors, error, disabled]);
  const [abierto, setAbierto] = useState(false);

  const elegidas = value ?? [];
  const resumen = elegidas.map((o) => o.label).join(', ');

  const cerrar = () => {
    setAbierto(false);
    onBlur?.();
  };

  const alternar = (opcion: OpcionDeSelect) => {
    const yaEsta = elegidas.some((o) => misma(o, opcion));
    onChange(
      yaEsta ? elegidas.filter((o) => !misma(o, opcion)) : [...elegidas, { value: opcion.value, label: opcion.label }],
    );
  };

  return (
    <CampoContenedor label={label} required={required} error={error}>
      <View ref={ref} collapsable={false} style={styles.caja}>
        <Pressable
          onPress={() => setAbierto(true)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityValue={{ text: resumen || placeholder }}
          accessibilityState={{ disabled }}
          android_ripple={{ color: globalColors.hairline }}
          style={styles.principal}
        >
          <AppText variant="body1" tone={resumen ? 'default' : 'tertiary'} numberOfLines={2} style={styles.texto}>
            {resumen || placeholder}
          </AppText>
          <AppIcon name="chevron-down" size={iconSizes.md} color={globalColors.textSecondary} />
        </Pressable>
      </View>

      <AppModal
        visible={abierto}
        onClose={cerrar}
        titulo={label ?? 'Seleccionar'}
        scroll={false}
        altaCompleta
        pie={<AppButton title="Listo" onPress={cerrar} />}
      >
        <FlatList
          data={options}
          keyExtractor={(item, indice) => `${String(item.value)}-${indice}`}
          renderItem={({ item }) => {
            const activa = elegidas.some((o) => misma(o, item));
            return (
              <Pressable
                onPress={() => alternar(item)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: activa }}
                android_ripple={{ color: globalColors.hairline }}
                style={[styles.fila, activa && styles.filaActiva]}
              >
                <AppText variant="body1" style={styles.texto}>
                  {item.label}
                </AppText>
                <AppIcon
                  name={activa ? 'checkbox' : 'square-outline'}
                  size={iconSizes.md}
                  color={activa ? globalColors.accentPrimary : globalColors.textTertiary}
                />
              </Pressable>
            );
          }}
        />
      </AppModal>
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
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: platformSpecific.minTouchTarget,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    filaActiva: { backgroundColor: c.primaryLight },
  });
