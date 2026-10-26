// Alta, edición y vista de una docencia en la Universidad Austral. Port de Portal-Austral-Dev ->
// perfil/_components/docencia/docencia/modales.js/ModalDocenciaAustral.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarDocenciaUA } from '../../../application/perfil/docenciaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import {
  docenciaUAAFormulario,
  esquemaDocenciaUA,
  filtrarPorEtiquetas,
  MODALIDADES_DOCENCIA_UA,
  NIVELES_DOCENCIA_UA,
  REGIMEN_DE_DICTADO,
  UNIDAD_DE_MEDIDA,
  type DocenciaUA,
  type FormularioDocenciaUA,
} from '../../../domain/perfil/docencia';
import { useDocenciaStore } from '../../stores/docenciaStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: DocenciaUA;
  onClose: () => void;
}

const TITULO = 'Docencia Universidad Austral';
const SUB_NUEVO = 'Información de la docencia';
const SUB_EDITAR = 'Información de la docencia';

export const ModalDocenciaUA: React.FC<Props> = ({ modo, item, onClose }) => {
  const unidades = useDocenciaStore((s) => s.unidades);
  const grados = useDocenciaStore((s) => s.gradosAcademicos);
  const modalidadesTodas = useDocenciaStore((s) => s.modalidades);
  const niveles = useMemo(() => filtrarPorEtiquetas(grados, NIVELES_DOCENCIA_UA), [grados]);
  const modalidades = useMemo(() => filtrarPorEtiquetas(modalidadesTodas, MODALIDADES_DOCENCIA_UA), [modalidadesTodas]);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(
    () => docenciaUAAFormulario(item, { unidades, niveles, modalidades }),
    [item, unidades, niveles, modalidades],
  );

  const { control, handleSubmit, watch, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaDocenciaUA as any),
  });

  const nivel = watch('nivel');
  const fechaInicio = watch('fechaInicio') as Date | null;

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarDocenciaUA(valores as FormularioDocenciaUA, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Docencia cargada con éxito' : 'Docencia modificada con éxito');
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
          <FilaDato label="Entidad Académica" valor={item.unidadAcademica.label ?? ''} />
          <FilaDato label="Nivel" valor={item.nivel.label ?? ''} />
          {item.otroNivel ? <FilaDato label="Otro nivel" valor={item.otroNivel} /> : null}
          <FilaDato label="Carrera / Propuesta formativa" valor={item.carrera} />
          <FilaDato label="Materia / Área" valor={item.materia} />
          <FilaDato label="Régimen de dictado" valor={item.regimen.label ?? ''} />
          <FilaDato label="Unidad de medida" valor={item.unidadMedida.label ?? ''} />
          <FilaDato label="Dedicación total" valor={item.dedicacion} />
          <FilaDato label="Modalidad de dictado" valor={item.modalidad.label ?? ''} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
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
        <FormSelectField
          control={control}
          name="unidadAcademica"
          label="Entidad Académica"
          required
          options={unidades as any}
          buscable
        />
        <FormSelectField control={control} name="nivel" label="Nivel" required options={niveles as any} />
        {nivel?.label === 'Otro' ? (
          <FormTextField control={control} name="otroNivel" label="Otro nivel" required maximo={100} mostrarContador />
        ) : null}
        <FormTextField
          control={control}
          name="carrera"
          label="Carrera / Propuesta formativa"
          required
          maximo={100}
          mostrarContador
        />
        <FormTextField control={control} name="materia" label="Materia / Área" required maximo={100} mostrarContador />
        <FormSelectField
          control={control}
          name="regimen"
          label="Régimen de dictado"
          required
          options={REGIMEN_DE_DICTADO as any}
        />
        <FormSelectField
          control={control}
          name="unidadMedida"
          label="Unidad de medida"
          required
          options={UNIDAD_DE_MEDIDA as any}
        />
        <FormTextField
          control={control}
          name="dedicacion"
          label="Dedicación total"
          required
          soloDigitos
          keyboardType="number-pad"
        />
        <FormSelectField
          control={control}
          name="modalidad"
          label="Modalidad de dictado"
          required
          options={modalidades as any}
        />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField
          control={control}
          name="fechaFin"
          label="Fecha de fin"
          clearable
          minimumDate={fechaInicio ?? undefined}
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
