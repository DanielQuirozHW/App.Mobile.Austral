// Alta, edición y vista de un financiamiento propio de la UA. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/actividad-i+d/financiamientos/modales/ModalFinanciamientoUA.tsx.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarFinanciamientoPropio } from '../../../application/perfil/actividadService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { caracteresRestantes } from '../../../domain/perfil/comun';
import {
  esquemaPropio,
  estadoPideFechaFin,
  estadoPideOtorgamiento,
  ESTADO_FINANCIAMIENTO_PROPIO,
  MODALIDAD_FINANCIAMIENTO,
  MONEDA_FINANCIAMIENTO,
  montoVisible,
  pideModalidad,
  propioAFormulario,
  ROL_FINANCIAMIENTO,
  tipoEsOtro,
  TIPO_FINANCIAMIENTO,
  type FinanciamientoPropio,
  type FormularioFinanciamientoPropio,
} from '../../../domain/perfil/financiamientos';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  item?: FinanciamientoPropio;
  onClose: () => void;
}

const TITULO = 'Financiamiento propio de la UA';
const SUB = 'Información del financiamiento propio de la UA';

export const ModalFinanciamientoPropio: React.FC<Props> = ({ modo, item, onClose }) => {
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const valoresIniciales = useMemo(() => propioAFormulario(item), [item]);

  const { control, handleSubmit, formState, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaPropio as any),
  });
  const estado = watch('estado');
  const tipo = watch('tipo');
  const nombre = watch('nombre');

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarFinanciamientoPropio(valores as FormularioFinanciamientoPropio, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Financiamiento cargado con éxito' : 'Financiamiento editado con éxito');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, nuevo ? 'Error al cargar' : 'Error al editar'));
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB} subtituloEditar={SUB} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Nombre del subsidio" valor={item.nombre} />
          <FilaDato label="Rol" valor={item.rol?.label ?? ''} />
          <FilaDato label="Estado" valor={item.estado?.label ?? ''} />
          <FilaDato label="Fecha de inicio" valor={aFechaVisible(item.fechaInicio)} />
          <FilaDato label="Fecha de fin" valor={aFechaVisible(item.fechaFin)} />
          <FilaDato label="Tipo de financiamiento" valor={item.tipo?.label ?? ''} />
          {tipoEsOtro(item.tipo) ? <FilaDato label="Otro tipo de financiamiento" valor={item.otroTipo} /> : null}
          {pideModalidad(item.tipo) ? <FilaDato label="Modalidad" valor={item.modalidad?.label ?? ''} /> : null}
          <FilaDato label="Moneda" valor={item.moneda?.label ?? ''} />
          <FilaDato label="Monto" valor={montoVisible(item.moneda, item.montoFormato, item.monto)} />
          <FilaDato label="Fecha de otorgamiento" valor={aFechaVisible(item.fechaOtorgamiento)} />
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
        <FormTextField
          control={control}
          name="nombre"
          label="Nombre del subsidio"
          required
          maximo={500}
          multiline
          numberOfLines={3}
          helperText={caracteresRestantes(nombre, 500)}
        />
        <FormSelectField control={control} name="rol" label="Rol" required options={ROL_FINANCIAMIENTO as any} />
        <FormSelectField
          control={control}
          name="estado"
          label="Estado"
          required
          options={ESTADO_FINANCIAMIENTO_PROPIO as any}
        />
        <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required />
        <FormDateField
          control={control}
          name="fechaFin"
          label="Fecha de fin"
          required={estadoPideFechaFin(estado)}
          clearable
        />
        <FormSelectField
          control={control}
          name="tipo"
          label="Tipo de financiamiento"
          required
          options={TIPO_FINANCIAMIENTO as any}
        />
        {tipoEsOtro(tipo) ? (
          <FormTextField control={control} name="otroTipo" label="Otro tipo de financiamiento" required maximo={100} />
        ) : null}
        {pideModalidad(tipo) ? (
          <FormSelectField
            control={control}
            name="modalidad"
            label="Modalidad"
            required
            options={MODALIDAD_FINANCIAMIENTO as any}
          />
        ) : null}
        <FormSelectField control={control} name="moneda" label="Moneda" required options={MONEDA_FINANCIAMIENTO as any} />
        <FormTextField control={control} name="monto" label="Monto" required keyboardType="decimal-pad" />
        <FormDateField
          control={control}
          name="fechaOtorgamiento"
          label="Fecha de otorgamiento"
          required={estadoPideOtorgamiento(estado)}
          clearable
        />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
