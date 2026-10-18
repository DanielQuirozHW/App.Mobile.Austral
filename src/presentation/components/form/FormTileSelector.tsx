import React, { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Control, useController } from 'react-hook-form';
import type { Opcion } from '../../../domain/legajo/tipos';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, platformSpecific, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';
import { CampoContenedor } from './CampoContenedor';
import { useScrollAlCampo } from './ScrollFormulario';

export interface OpcionTile {
  opcion: Opcion;
  titulo: string;
  descripcion?: string;
}

interface FormTileSelectorProps {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
  ayuda?: string;
  opciones: OpcionTile[];
  /** 'fila': mosaicos en una fila (sexo). 'columna': tarjetas apiladas (¿está a cargo?). */
  disposicion?: 'fila' | 'columna';
  disabled?: boolean;
}

/** Selección de una opción con mosaicos o tarjetas (Sexo y ¿Está a cargo? del modal de hijos). El valor es { value, label }. */
export const FormTileSelector: React.FC<FormTileSelectorProps> = ({
  control,
  name,
  label,
  required,
  ayuda,
  opciones,
  disposicion = 'fila',
  disabled = false,
}) => {
  const { globalColors } = useThemeColors();
  const { field, fieldState } = useController({ control, name });
  const vista = useRef<View>(null);
  const scrollAlCampo = useScrollAlCampo();

  const registrar = useCallback(
    (instancia: unknown) => {
      field.ref(instancia ? { focus: () => scrollAlCampo?.(vista.current) } : null);
    },
    [field, scrollAlCampo],
  );
  React.useEffect(() => {
    registrar(vista.current ?? {});
  }, [registrar]);

  const mensaje = fieldState.error?.message ?? (fieldState.error as any)?.value?.message;
  const seleccionado = field.value?.value;

  return (
    <CampoContenedor label={label} required={required} error={mensaje} helperText={ayuda}>
      <View
        ref={vista}
        collapsable={false}
        style={[disposicion === 'fila' ? styles.fila : styles.columna]}
      >
        {opciones.map(({ opcion, titulo, descripcion }) => {
          const activa = seleccionado !== undefined && seleccionado !== null && String(seleccionado) === String(opcion.value);
          const s = estiloTile(globalColors, activa, Boolean(mensaje), disabled);
          return (
            <Pressable
              key={String(opcion.value)}
              disabled={disabled}
              onPress={() => {
                field.onChange({ value: opcion.value, label: opcion.label });
                field.onBlur();
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: activa, disabled }}
              accessibilityLabel={descripcion ? `${titulo}. ${descripcion}` : titulo}
              style={[s, disposicion === 'fila' ? styles.tileFila : styles.tileColumna]}
            >
              <AppText variant={descripcion ? 'subtitle2' : 'button'} tone={activa ? 'primary' : 'default'}>
                {titulo}
              </AppText>
              {descripcion ? (
                <AppText variant="caption" tone="secondary">
                  {descripcion}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </CampoContenedor>
  );
};

const estiloTile = (c: ColorTokens, activa: boolean, hayError: boolean, deshabilitado: boolean) => ({
  borderWidth: 1.5,
  borderRadius: borderRadius.input,
  borderColor: activa ? c.accentPrimary : hayError ? c.danger : c.border,
  backgroundColor: activa ? c.primaryLight : deshabilitado ? c.inputDisabled : c.inputBackground,
  padding: spacing.md,
  minHeight: platformSpecific.minTouchTarget,
});

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', gap: spacing.sm },
  columna: { gap: spacing.sm },
  tileFila: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tileColumna: { gap: spacing.xxs },
});
