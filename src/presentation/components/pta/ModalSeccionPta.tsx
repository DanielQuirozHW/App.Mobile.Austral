// Alta, edición y vista de un registro de cualquier sección del Plan de Trabajo. El formulario sale de la definición
// de la sección (domain/pta/secciones.ts): campos, validaciones, mensajes y cuerpo del envío.
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { guardarRegistro } from '../../../application/pta/ptaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import type { Modo } from '../../../domain/perfil/comun';
import { campoVisible, esquemaDeCampos, valoresIniciales } from '../../../domain/pta/formulario';
import { opcionesDeCampo } from '../../../domain/pta/opciones';
import type { DefinicionSeccion } from '../../../domain/pta/secciones';
import type { CampoPta, RegistroPta } from '../../../domain/pta/tipos';
import { usePtaStore } from '../../stores/ptaStore';
import { toast } from '../../utils/toast';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, InfoAlert, PieObligatorios } from '../perfil/CamposComunes';
import { ModalPerfil } from '../perfil/ModalPerfil';

interface Props {
  def: DefinicionSeccion;
  planId: string;
  modo: Modo;
  item?: RegistroPta;
  onClose: () => void;
}

const SUB_NUEVO = 'Agrega un nuevo registro';
const SUB_EDITAR = 'Modifica la información del registro';
const MSG_ERROR_GUARDAR = 'Ocurrió un error al ingresar los datos. Intenta nuevamente.';

const textoDeValor = (campo: CampoPta, valor: any): string => {
  if (campo.tipo === 'select') return valor?.label ?? '';
  if (campo.tipo === 'fecha') return valor instanceof Date ? format(valor, 'dd/MM/yyyy') : '';
  return valor === null || valor === undefined ? '' : String(valor);
};

export const ModalSeccionPta: React.FC<Props> = ({ def, planId, modo, item, onClose }) => {
  const catalogos = usePtaStore((s) => s.catalogos);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const iniciales = useMemo(() => valoresIniciales(def.campos, item, catalogos), [def.campos, item, catalogos]);
  const esquema = useMemo(() => esquemaDeCampos(def.campos), [def.campos]);

  const { control, handleSubmit, watch, setValue, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: iniciales,
    resolver: yupResolver(esquema as any),
  });
  const valores = watch();

  const alCambiarSelect = (campo: CampoPta) => () => {
    (campo.limpia ?? []).forEach((destino) => {
      const definicion = def.campos.find((c) => c.nombre === destino);
      setValue(destino, definicion?.tipo === 'select' ? null : '', { shouldDirty: true, shouldValidate: true });
    });
  };

  const guardar = handleSubmit(async (datos: any) => {
    setGuardando(true);
    const idToast = toast.loading(
      nuevo ? def.mensajes.procesando : (def.mensajes.procesandoEdicion ?? def.mensajes.procesando),
    );
    try {
      await guardarRegistro(def, datos, planId, nuevo ? undefined : item);
      toast.dismiss(idToast);
      toast.success(nuevo ? def.mensajes.alta : def.mensajes.edicion);
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, MSG_ERROR_GUARDAR));
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver') {
    return (
      <ModalPerfil modo="ver" titulo={def.titulo} subtituloNuevo={SUB_NUEVO} subtituloEditar={SUB_EDITAR} onClose={onClose}>
        <View style={{ gap: 12 }}>
          {def.campos
            .filter((campo) => campoVisible(campo, iniciales))
            .map((campo) => (
              <FilaDato key={campo.nombre} label={campo.label} valor={textoDeValor(campo, iniciales[campo.nombre])} />
            ))}
        </View>
      </ModalPerfil>
    );
  }

  return (
    <ModalPerfil
      modo={modo}
      titulo={def.titulo}
      subtituloNuevo={SUB_NUEVO}
      subtituloEditar={SUB_EDITAR}
      onClose={onClose}
      hayCambios={formState.isDirty}
      guardando={guardando}
      onGuardar={guardar}
    >
      <Campos>
        {def.ayuda ? <InfoAlert tipo="info">{def.ayuda}</InfoAlert> : null}
        {def.campos
          .filter((campo) => campoVisible(campo, valores))
          .map((campo) => {
            const deshabilitado = Boolean(campo.soloLectura);
            if (campo.tipo === 'select') {
              return (
                <FormSelectField
                  key={campo.nombre}
                  control={control}
                  name={campo.nombre}
                  label={campo.label}
                  required={campo.requerido}
                  options={opcionesDeCampo(campo, catalogos, valores) as any}
                  buscable={campo.buscable ?? true}
                  disabled={deshabilitado}
                  onCambio={alCambiarSelect(campo)}
                />
              );
            }
            if (campo.tipo === 'fecha') {
              return (
                <FormDateField
                  key={campo.nombre}
                  control={control}
                  name={campo.nombre}
                  label={campo.label}
                  required={campo.requerido}
                  clearable={!campo.requerido}
                  disabled={deshabilitado}
                />
              );
            }
            const largo = String(valores?.[campo.nombre] ?? '').length;
            return (
              <FormTextField
                key={campo.nombre}
                control={control}
                name={campo.nombre}
                label={campo.label}
                required={campo.requerido}
                editable={!deshabilitado}
                maximo={campo.maximo}
                helperText={
                  campo.contador && campo.maximo ? `${Math.max(campo.maximo - largo, 0)} caracteres restantes` : campo.ayuda
                }
                soloDigitos={campo.tipo === 'entero'}
                keyboardType={campo.tipo === 'entero' ? 'number-pad' : 'default'}
                multiline={campo.tipo === 'multilinea'}
                numberOfLines={campo.tipo === 'multilinea' ? 4 : undefined}
              />
            );
          })}
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
