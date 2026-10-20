// Alta, edición y vista de una formación de tesistas. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/actividad-i+d/formacion-rrhh/modales/ModalTesistas.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarTesista } from '../../../application/perfil/actividadService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { esValor, tieneValor } from '../../../domain/perfil/afiliaciones';
import {
  ANIOS_PREVISTOS,
  esquemaTesista,
  ESTADO_TESIS,
  FORMACION_TESISTA,
  PERTENENCIA_RRHH,
  tesistaAFormulario,
  type FormularioTesista,
  type Tesista,
} from '../../../domain/perfil/formacionRrhh';
import { useActividadStore } from '../../stores/actividadStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: Tesista;
  onClose: () => void;
}

const TITULO = 'Formación tesistas';
const SUB = 'Información de la formación de tesistas';
const UA = 100000000;
const OTRO = 100000001;
const DEFENDIDA = 100000000;
const EN_PREPARACION = 100000002;

export const ModalTesista: React.FC<Props> = ({ modo, item, onClose }) => {
  const colaboradores = useActividadStore((s) => s.colaboradores);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => tesistaAFormulario(item, colaboradores), [item, colaboradores]);

  const { control, handleSubmit, formState, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaTesista as any),
  });
  const pertenenciaDirector = watch('pertenenciaDirector');
  const pertenenciaCodirector = watch('pertenenciaCodirector');
  const pertenenciaTesista = watch('pertenenciaTesista');
  const estado = watch('estado');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarTesista(valores as FormularioTesista, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Formación tesista cargada con éxito' : 'Formación tesista editada con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(
        mensajeDeErrorApi(error, nuevo ? 'Error al cargar la formación tesista' : 'Error al editar la formación tesista'),
      );
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB} subtituloEditar={SUB} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Formación" valor={item.formacion?.label ?? ''} />
          <FilaDato label="Pertenencia Director" valor={item.pertenenciaDirector?.label ?? ''} />
          <FilaDato label="Director" valor={item.directorNombre} />
          <FilaDato label="Pertenencia Codirector" valor={item.pertenenciaCodirector?.label ?? ''} />
          <FilaDato label="Codirector" valor={item.codirectorNombre} />
          <FilaDato label="Título del trabajo" valor={item.titulo} />
          <FilaDato label="Pertenencia del tesista" valor={item.pertenenciaTesista?.label ?? ''} />
          <FilaDato label="Tesista" valor={item.tesista} />
          <FilaDato label="Institución del programa" valor={item.institucionPrograma?.label ?? ''} />
          <FilaDato label="Programa" valor={item.programa} />
          <FilaDato label="Sede de presentación" valor={item.sede} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Estado" valor={item.estado?.label ?? ''} />
          {esValor(item.estado, EN_PREPARACION) ? (
            <FilaDato label="Año previsto de finalización" valor={item.anioPrevisto ? String(item.anioPrevisto) : ''} />
          ) : null}
          {esValor(item.estado, DEFENDIDA) ? (
            <FilaDato label="Fecha de defensa" valor={aFechaVisible(item.fechaDefensa)} />
          ) : null}
        </View>
      </ModalPerfil>
    );
  }

  return (
    <ModalPerfil
      modo={modo}
      titulo={TITULO}
      subtituloNuevo={SUB}
      subtituloEditar={SUB}
      onClose={onClose}
      hayCambios={formState.isDirty}
      guardando={guardando}
      onGuardar={guardar}
    >
      <Campos>
        <FormSelectField
          control={control}
          name="formacion"
          label="Formación"
          required
          options={FORMACION_TESISTA as any}
        />

        <FormSelectField
          control={control}
          name="pertenenciaDirector"
          label="Pertenencia Director"
          options={PERTENENCIA_RRHH as any}
          clearable
        />
        {esValor(pertenenciaDirector, UA) ? (
          <FormSelectField
            control={control}
            name="director"
            label="Director"
            required
            options={colaboradores as any}
            buscable
          />
        ) : null}
        {esValor(pertenenciaDirector, OTRO) ? (
          <>
            <FormTextField control={control} name="directorOtro" label="Director" required maximo={100} />
            <FormTextField control={control} name="otroDirector" label="Otro" required maximo={100} />
          </>
        ) : null}

        <FormSelectField
          control={control}
          name="pertenenciaCodirector"
          label="Pertenencia Codirector"
          options={PERTENENCIA_RRHH as any}
          clearable
        />
        {esValor(pertenenciaCodirector, UA) ? (
          <FormSelectField
            control={control}
            name="codirector"
            label="Codirector"
            required
            options={colaboradores as any}
            buscable
          />
        ) : null}
        {esValor(pertenenciaCodirector, OTRO) ? (
          <>
            <FormTextField control={control} name="codirectorOtro" label="Codirector" required maximo={100} />
            <FormTextField control={control} name="otroCodirector" label="Otro" required maximo={100} />
          </>
        ) : null}

        <FormTextField control={control} name="titulo" label="Título del trabajo" maximo={100} />

        <FormSelectField
          control={control}
          name="pertenenciaTesista"
          label="Pertenencia del tesista"
          required
          options={PERTENENCIA_RRHH as any}
        />
        {tieneValor(pertenenciaTesista) ? (
          <FormTextField control={control} name="tesista" label="Tesista" required maximo={100} mostrarContador />
        ) : null}

        <FormSelectField
          control={control}
          name="institucionPrograma"
          label="Institución del programa"
          required
          options={PERTENENCIA_RRHH as any}
        />
        <FormTextField control={control} name="programa" label="Programa" required maximo={100} />
        <FormTextField control={control} name="sede" label="Sede de presentación" maximo={100} />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormSelectField control={control} name="estado" label="Estado" required options={ESTADO_TESIS as any} />
        {esValor(estado, EN_PREPARACION) ? (
          <FormSelectField
            control={control}
            name="anioPrevisto"
            label="Año previsto de finalización"
            required
            options={ANIOS_PREVISTOS as any}
          />
        ) : null}
        {esValor(estado, DEFENDIDA) ? (
          <FormDateField control={control} name="fechaDefensa" label="Fecha de defensa" required />
        ) : null}
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
