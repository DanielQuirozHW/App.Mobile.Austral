import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { Control, useController } from 'react-hook-form';
import { SelectField, type OpcionDeSelect } from './SelectField';
import { useScrollAlCampo } from './ScrollFormulario';

interface FormSelectFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
  options: OpcionDeSelect[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  buscable?: boolean;
  onCambio?: (opcion: OpcionDeSelect | null) => void;
}

/** SelectField conectado a react-hook-form. El valor del formulario es la opción { value, label } o null. */
export const FormSelectField: React.FC<FormSelectFieldProps> = ({
  control,
  name,
  label,
  required,
  options,
  placeholder,
  disabled,
  clearable,
  buscable,
  onCambio,
}) => {
  const { field, fieldState } = useController({ control, name });
  const vista = useRef<View>(null);
  const scrollAlCampo = useScrollAlCampo();

  // Para que setFocus(name) de react-hook-form lleve el campo a la vista (no tiene un input que enfocar).
  const registrar = useCallback(
    (instancia: unknown) => {
      field.ref(instancia ? { focus: () => scrollAlCampo?.(vista.current) } : null);
    },
    [field, scrollAlCampo],
  );
  React.useEffect(() => {
    registrar(vista.current ?? {});
  }, [registrar]);

  // Con objetos, yup informa el error en el propio campo o en `.value`.
  const mensaje = fieldState.error?.message ?? (fieldState.error as any)?.value?.message;

  return (
    <SelectField
      ref={vista}
      label={label}
      required={required}
      options={options}
      value={field.value}
      placeholder={placeholder}
      disabled={disabled}
      clearable={clearable}
      buscable={buscable}
      error={mensaje}
      onBlur={field.onBlur}
      onChange={(opcion) => {
        field.onChange(opcion);
        onCambio?.(opcion);
      }}
    />
  );
};
