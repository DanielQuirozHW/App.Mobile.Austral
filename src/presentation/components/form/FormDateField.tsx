import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { Control, useController } from 'react-hook-form';
import { DateField } from './DateField';
import { useScrollAlCampo } from './ScrollFormulario';

interface FormDateFieldProps {
  control: Control<any>;
  name: string;
  label?: string;
  required?: boolean;
  fechaInicial?: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  clearable?: boolean;
  disabled?: boolean;
}

/** DateField conectado a react-hook-form. El valor del formulario es un Date o null. */
export const FormDateField: React.FC<FormDateFieldProps> = ({
  control,
  name,
  label,
  required,
  fechaInicial,
  maximumDate,
  minimumDate,
  clearable,
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
    <DateField
      ref={vista}
      label={label}
      required={required}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
      fechaInicial={fechaInicial}
      maximumDate={maximumDate}
      minimumDate={minimumDate}
      clearable={clearable}
      disabled={disabled}
    />
  );
};
