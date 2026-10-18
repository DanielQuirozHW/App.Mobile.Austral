// Alta, edición y vista del cónyuge. Port de Portal-Austral-Dev -> legajo/_components/component/ModalConyuge.tsx.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { actualizarConyuge, crearConyuge } from '../../../application/legajo/legajoService';
import type { FormularioDatosPersonales } from '../../../domain/legajo/formulario';
import { opcionONull } from '../../../domain/legajo/formulario';
import { parsearFecha } from '../../../domain/legajo/fechas';
import { PARENTESCO_CONYUGE, TIPOS_DOCUMENTO } from '../../../domain/legajo/opciones';
import type { DatosFamiliar } from '../../../domain/legajo/payload';
import type { Familiar } from '../../../domain/legajo/tipos';
import { esquemaConyuge } from '../../../domain/legajo/validacion';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { propsNumeroDocumento } from './documentoProps';

interface ModalConyugeProps {
  modo: 'nuevo' | 'editar' | 'ver';
  onClose: () => void;
  /** Cónyuge existente (editar / ver). */
  datos?: Familiar;
  /**
   * Solo en el alta desde el formulario: devuelve los datos actuales del formulario para guardar primero el legajo
   * con el estado civil nuevo (el portal hace lo mismo antes de crear al cónyuge).
   */
  obtenerDatosEmpleado?: () => FormularioDatosPersonales;
  /** Se llama después de guardar bien, antes de cerrar. */
  onGuardado?: (alta: boolean) => void;
}

interface ValoresConyuge {
  apellido: string;
  nombre: string;
  tipoDoc: ReturnType<typeof opcionONull>;
  docFamiliar: string;
  fechaNacimiento: Date | null;
}

const valoresIniciales = (datos?: Familiar): ValoresConyuge => ({
  apellido: datos?.apellidoFamiliar ?? '',
  nombre: datos?.nombreFamiliar ?? '',
  tipoDoc: opcionONull(datos?.tipoDocFamiliar as any),
  docFamiliar: datos?.docFamiliar ?? '',
  fechaNacimiento: parsearFecha(datos?.fechaNacimiento),
});

export const ModalConyuge: React.FC<ModalConyugeProps> = ({
  modo,
  onClose,
  datos,
  obtenerDatosEmpleado,
  onGuardado,
}) => {
  const nuevo = modo === 'nuevo';
  const soloLectura = modo === 'ver';
  const [guardando, setGuardando] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales(datos),
    resolver: yupResolver(esquemaConyuge as any),
  });

  const tipoDoc = watch('tipoDoc');
  const propsDoc = propsNumeroDocumento(tipoDoc?.label);

  const guardar = handleSubmit(async (valores: ValoresConyuge) => {
    setGuardando(true);
    const idToast = toast.loading(nuevo ? 'Guardando datos del cónyuge...' : 'Actualizando datos del cónyuge...');
    try {
      const conyuge: DatosFamiliar = {
        id: datos?.id,
        nombreFamiliar: valores.nombre.trim().toUpperCase(),
        apellidoFamiliar: valores.apellido.trim().toUpperCase(),
        tipoDocFamiliar: valores.tipoDoc,
        docFamiliar: valores.docFamiliar,
        tipoParentesco: PARENTESCO_CONYUGE,
        fechaNacimiento: valores.fechaNacimiento,
      };
      const ok = nuevo
        ? await crearConyuge(conyuge, obtenerDatosEmpleado?.())
        : await actualizarConyuge(conyuge);
      toast.dismiss(idToast);
      if (!ok) {
        toast.error(nuevo ? 'Error al guardar los datos del cónyuge.' : 'Error al actualizar los datos del cónyuge.');
        return;
      }
      toast.success(
        nuevo ? 'Datos del cónyuge guardados correctamente.' : 'Datos del cónyuge actualizados correctamente.',
      );
      onGuardado?.(nuevo);
      onClose();
    } catch {
      toast.dismiss(idToast);
      toast.error(nuevo ? 'Error al guardar los datos del cónyuge.' : 'Error al actualizar los datos del cónyuge.');
    } finally {
      setGuardando(false);
    }
  });

  const titulo =
    modo === 'nuevo'
      ? 'Cargar datos del cónyuge'
      : modo === 'editar'
        ? 'Editar datos del cónyuge'
        : `${datos?.nombreFamiliar ?? ''} ${datos?.apellidoFamiliar ?? ''}`.trim();

  return (
    <AppModal
      visible
      onClose={onClose}
      titulo={titulo}
      cerrable={!guardando}
      pie={
        soloLectura ? (
          <AppButton title="Cerrar" variant="secondary" onPress={onClose} />
        ) : (
          <>
            <AppButton title="Cancelar" variant="secondary" onPress={onClose} disabled={guardando} />
            <AppButton
              title={guardando ? (nuevo ? 'Guardando...' : 'Actualizando...') : nuevo ? 'Guardar' : 'Actualizar'}
              onPress={guardar}
              loading={guardando}
            />
          </>
        )
      }
    >
      <View style={styles.campos}>
        <FormTextField
          control={control}
          name="apellido"
          label="Apellido"
          required
          mayusculas
          editable={!soloLectura}
          autoCapitalize="characters"
        />
        <FormTextField
          control={control}
          name="nombre"
          label="Nombre"
          required
          mayusculas
          editable={!soloLectura}
          autoCapitalize="characters"
        />
        <FormSelectField
          control={control}
          name="tipoDoc"
          label="Tipo de documento"
          required
          options={TIPOS_DOCUMENTO}
          disabled={soloLectura}
          // En el alta, cambiar el tipo vacía el número (el portal lo hace solo con `nuevo`).
          onCambio={() => {
            if (nuevo) setValue('docFamiliar', '', { shouldValidate: false });
          }}
        />
        <FormTextField
          control={control}
          name="docFamiliar"
          label="Nro. documento"
          required
          editable={!soloLectura}
          {...propsDoc}
        />
        <FormDateField
          control={control}
          name="fechaNacimiento"
          label="Fecha de nacimiento"
          required
          maximumDate={new Date()}
          disabled={soloLectura}
        />
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  campos: { gap: spacing.md },
});
