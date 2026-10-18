import React from 'react';
import { TextInputProps } from 'react-native';
import { Control, useController } from 'react-hook-form';
import { AppTextField } from '../AppTextField';

interface FormTextFieldProps extends Omit<TextInputProps, 'style' | 'value' | 'onChangeText' | 'maxLength'> {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  /** Largo máximo. */
  maximo?: number;
  /** Muestra "n/m" como ayuda (el portal lo hace en los contactos de emergencia). */
  mostrarContador?: boolean;
  /** Deja solo dígitos. */
  soloDigitos?: boolean;
  mayusculas?: boolean;
  /** Transformación propia del texto. Se aplica después de las anteriores. */
  transformar?: (texto: string) => string;
  onCambio?: (texto: string) => void;
}

/** AppTextField conectado a react-hook-form. */
export const FormTextField: React.FC<FormTextFieldProps> = ({
  control,
  name,
  label,
  required,
  helperText,
  maximo,
  mostrarContador,
  soloDigitos,
  mayusculas,
  transformar,
  onCambio,
  editable,
  ...resto
}) => {
  const { field, fieldState } = useController({ control, name });
  const valor = field.value === null || field.value === undefined ? '' : String(field.value);

  const alCambiar = (texto: string) => {
    let nuevo = texto;
    if (soloDigitos) nuevo = nuevo.replace(/\D/g, '');
    if (mayusculas) nuevo = nuevo.toUpperCase();
    if (transformar) nuevo = transformar(nuevo);
    field.onChange(nuevo);
    onCambio?.(nuevo);
  };

  return (
    <AppTextField
      {...resto}
      ref={field.ref}
      label={label}
      required={required}
      editable={editable}
      value={valor}
      onChangeText={alCambiar}
      onBlur={field.onBlur}
      maxLength={maximo}
      error={fieldState.error?.message}
      helperText={mostrarContador && maximo ? `${valor.length}/${maximo}` : helperText}
    />
  );
};
