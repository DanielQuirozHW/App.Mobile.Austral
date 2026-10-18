import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { Control, useController } from 'react-hook-form';
import { MultiSelectField } from './MultiSelectField';
import { useScrollAlCampo } from './ScrollFormulario';
import type { OpcionDeSelect } from './SelectField';

interface FormMultiSelectFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
  options: OpcionDeSelect[];
  placeholder?: string;
  disabled?: boolean;
}

/** MultiSelectField conectado a react-hook-form. El valor del formulario es un arreglo de opciones { value, label }. */
export const FormMultiSelectField: React.FC<FormMultiSelectFieldProps> = ({
  control,
  name,
  label,
  required,
  options,
  placeholder,
  disabled,
}) => {
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

  return (
    <MultiSelectField
      ref={vista}
      label={label}
      required={required}
      options={options}
      value={field.value}
      placeholder={placeholder}
      disabled={disabled}
      error={fieldState.error?.message}
      onBlur={field.onBlur}
      onChange={field.onChange}
    />
  );
};
