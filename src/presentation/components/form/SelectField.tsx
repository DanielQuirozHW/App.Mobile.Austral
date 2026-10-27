import React, { forwardRef, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { CampoContenedor } from './CampoContenedor';

export interface OpcionDeSelect {
  value: string | number | null | undefined;
  label: string | null | undefined;
}

interface SelectFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  options: OpcionDeSelect[];
  value: OpcionDeSelect | null | undefined;
  onChange: (opcion: OpcionDeSelect | null) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Muestra la "x" para vaciar la selección (el select del portal permite vaciarlo). */
  clearable?: boolean;
  /** true: la lista tiene buscador. Por defecto solo si hay más de 8 opciones. */
  buscable?: boolean;
  onBlur?: () => void;
}

// Búsqueda sin tildes ni mayúsculas.
const normalizar = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const mismaOpcion = (a?: OpcionDeSelect | null, b?: OpcionDeSelect | null): boolean =>
  a?.value !== undefined && a?.value !== null && String(a.value) === String(b?.value);

/**
 * Select de la app (equivale a CustomSearchSelect del portal): un campo que abre una lista con búsqueda.
 * El valor es la opción completa { value, label }, igual que en el portal.
 */
export const SelectField = forwardRef<View, SelectFieldProps>(function SelectField(
  {
    label,
    required,
    error,
    options,
    value,
    onChange,
    placeholder = 'Seleccionar',
    disabled = false,
    clearable = true,
    buscable,
    onBlur,
  },
  ref,
) {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors, Boolean(error), disabled), [globalColors, error, disabled]);
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const conBuscador = buscable ?? options.length > 8;
  const seleccionada = value && value.value !== null && value.value !== undefined && value.value !== '' ? value : null;
  const etiqueta = seleccionada
    ? seleccionada.label || options.find((o) => mismaOpcion(o, seleccionada))?.label || ''
    : '';

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    if (!termino) return options;
    return options.filter((o) => normalizar(String(o.label ?? '')).includes(termino));
  }, [options, busqueda]);

  const cerrar = () => {
    setAbierto(false);
    setBusqueda('');
    onBlur?.();
  };

  const elegir = (opcion: OpcionDeSelect) => {
    onChange({ value: opcion.value, label: opcion.label });
    cerrar();
  };

  return (
    <CampoContenedor label={label} required={required} error={error}>
      <View ref={ref} collapsable={false} style={styles.caja}>
        <Pressable
          onPress={() => setAbierto(true)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityValue={{ text: etiqueta || placeholder }}
          accessibilityState={{ disabled }}
          android_ripple={{ color: globalColors.hairline }}
          style={styles.principal}
        >
          <AppText variant="body1" tone={etiqueta ? 'default' : 'tertiary'} numberOfLines={1} style={styles.texto}>
            {etiqueta || placeholder}
          </AppText>
          {!(clearable && seleccionada && !disabled) ? (
            <AppIcon name="chevron-down" size={iconSizes.md} color={globalColors.textSecondary} />
          ) : null}
        </Pressable>
        {clearable && seleccionada && !disabled ? (
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={spacing.sm}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${label ?? 'selección'}`}
            style={styles.limpiar}
          >
            <AppIcon name="close-circle" size={iconSizes.md} color={globalColors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      <AppModal visible={abierto} onClose={cerrar} titulo={label ?? 'Seleccionar'} scroll={false} altaCompleta>
        {conBuscador ? (
          <View style={styles.buscador}>
            <AppIcon name="search-outline" size={iconSizes.md} color={globalColors.textSecondary} />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar"
              placeholderTextColor={globalColors.textTertiary}
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Buscar"
              style={styles.inputBusqueda}
            />
          </View>
        ) : null}
        <FlatList
          data={filtradas}
          keyExtractor={(item, indice) => `${String(item.value)}-${indice}`}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <AppText variant="body2" tone="secondary">
                Sin resultados
              </AppText>
            </View>
          }
          renderItem={({ item }) => {
            const activa = mismaOpcion(item, seleccionada);
            return (
              <Pressable
                onPress={() => elegir(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: activa }}
                android_ripple={{ color: globalColors.hairline }}
                style={[styles.fila, activa && styles.filaActiva]}
              >
                <AppText variant="body1" style={styles.texto}>
                  {item.label}
                </AppText>
                {activa ? <AppIcon name="checkmark" size={iconSizes.md} color={globalColors.accentPrimary} /> : null}
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
    limpiar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    buscador: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1.5,
      borderColor: c.inputBorder,
      borderRadius: borderRadius.input,
      backgroundColor: c.inputBackground,
    },
    inputBusqueda: {
      flex: 1,
      minHeight: platformSpecific.minTouchTarget,
      color: c.text,
      includeFontPadding: false,
    },
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
    vacio: { padding: spacing.xl, alignItems: 'center' },
  });
