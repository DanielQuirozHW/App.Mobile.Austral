// Alta, edición y vista de un idioma. Port de Portal-Austral-Dev -> perfil/_components/formacion/modales (idioma).
import React, { useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarIdioma } from '../../../application/perfil/formacionService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { idiomaAFormulario, type FormularioIdioma, type Idioma } from '../../../domain/perfil/formacion';
import { IDIOMAS, IDIOMA_OTRO, NIVELES_IDIOMA } from '../../../domain/perfil/formacionOpciones';
import { esquemaIdioma } from '../../../domain/perfil/formacionValidacion';
import { toast } from '../../utils/toast';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Idioma;
  onClose: () => void;
}

const TITULO = 'Idioma';
const SUB_NUEVO = 'Agrega un nuevo idioma';
const SUB_EDITAR = 'Modifica la información del idioma';

export const ModalIdioma: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: idiomaAFormulario(item),
    resolver: yupResolver(esquemaIdioma as any),
  });

  const idioma = watch('idioma');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading(nuevo ? 'Guardando…' : 'Guardando los cambios…');
    try {
      await guardarIdioma(valores as FormularioIdioma, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Idioma cargado con éxito' : 'Idioma modificado con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al cargar'));
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB_NUEVO} subtituloEditar={SUB_EDITAR} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Idioma" valor={item.idioma} />
          {item.otroIdioma ? <FilaDato label="Otro idioma" valor={item.otroIdioma} /> : null}
          <FilaDato label="Nivel" valor={item.nivel.label} />
        </View>
      </ModalPerfil>
    );
  }

  return (
    <ModalPerfil
      modo={modo}
      titulo={TITULO}
      subtituloNuevo={SUB_NUEVO}
      subtituloEditar={SUB_EDITAR}
      onClose={onClose}
      hayCambios={formState.isDirty}
      guardando={guardando}
      onGuardar={guardar}
    >
      <Campos>
        <FormSelectField control={control} name="idioma" label="Idioma" required options={IDIOMAS as any} />
        {Number(idioma?.value) === IDIOMA_OTRO ? (
          <FormTextField
            control={control}
            name="otroIdioma"
            label="Especificar idioma"
            required
            maximo={100}
            mostrarContador
          />
        ) : null}
        <FormSelectField control={control} name="nivel" label="Nivel" required options={NIVELES_IDIOMA as any} />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
