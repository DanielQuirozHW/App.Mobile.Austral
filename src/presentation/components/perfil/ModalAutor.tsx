// Alta, edición y vista de un autor de una producción científica. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/resultados-impacto-i+d/produccion-cientifica/modales/ModalParticipantes.tsx
// (+ hooks/investigacion-perfil/useCargarEditarAutoresProduccionCientifica.ts).
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarAutor } from '../../../application/perfil/resultadosService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { caracteresRestantes } from '../../../domain/perfil/comun';
import {
  autorAFormulario,
  ESTADO_AUTOR,
  esquemaAutor,
  LUGAR_OTRO,
  LUGAR_TRABAJO_AUTOR,
  LUGAR_UA,
  mensajeDeErrorDeAutor,
  opcionesDeEstadoAutor,
  PARTICIPANTE_BAJA,
  PARTICIPANTE_RECHAZADO,
  type Autor,
  type FormularioAutor,
  type Produccion,
} from '../../../domain/perfil/produccionCientifica';
import { useAuthStore } from '../../stores/authStore';
import { useResultadosStore } from '../../stores/resultadosStore';
import { toast } from '../../utils/toast';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  modo: 'nuevo' | 'editar' | 'ver';
  produccion: Produccion;
  autor?: Autor;
  /** El empleado en sesión es el creador de la producción (puede cambiar el estado de los autores). */
  esCreador: boolean;
  onClose: () => void;
  /** Se guardó: la lista de autores tiene que recargarse. */
  onGuardado: () => void;
}

const TITULO = 'Autor/es';
const SUB = 'Información del autor';

export const ModalAutor: React.FC<Props> = ({ modo, produccion, autor, esCreador, onClose, onGuardado }) => {
  const empleadoId = useAuthStore((s) => s.user?.empleadoid) ?? '';
  const colaboradores = useResultadosStore((s) => s.colaboradores);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const ver = modo === 'ver';
  const valoresIniciales = useMemo(() => autorAFormulario(autor), [autor]);

  const { control, handleSubmit, formState, watch, setValue } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaAutor as any),
  });
  const lugar = Number(watch('lugarTrabajo')?.value);
  const estado = watch('estado');
  const motivo = watch('motivoDeBaja');

  const estadoActual = autor?.statuscode ?? null;
  // El propio creador figurando como autor siempre queda aprobado.
  const esElPropioCreador = Boolean(autor?.colaboradorId) && autor?.colaboradorId === empleadoId && esCreador;
  const estadoBloqueado = ver || !esCreador || esElPropioCreador;
  const opcionesDeEstado = estadoBloqueado ? ESTADO_AUTOR : opcionesDeEstadoAutor(estadoActual, esElPropioCreador);

  const limpiarPorLugar = () => {
    setValue('colaborador', null, { shouldValidate: true, shouldDirty: true });
    setValue('otro', '', { shouldValidate: true, shouldDirty: true });
    setValue('otraInstitucion', '', { shouldValidate: true, shouldDirty: true });
  };

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarAutor(produccion.id, valores as FormularioAutor, nuevo ? undefined : autor?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Autor cargado con éxito.' : 'Participante editado con éxito.');
      onGuardado();
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorDeAutor(error, nuevo ? 'Error al cargar el Autor.' : 'Error al editar'));
    } finally {
      setGuardando(false);
    }
  });

  const dadoDeBaja = autor?.statuscode === PARTICIPANTE_BAJA;
  const rechazado = autor?.statuscode === PARTICIPANTE_RECHAZADO;

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
        {dadoDeBaja ? (
          <InfoAlert tipo="advertencia">Este autor ha sido dado de baja de esta producción.</InfoAlert>
        ) : null}
        {modo === 'editar' && rechazado ? (
          <InfoAlert tipo="advertencia">
            Este autor ha rechazado la invitación. Puede corregirla, de ser necesario, y cambiar su estado a ‘Pendiente’
            para su reinvitación.
          </InfoAlert>
        ) : null}

        <FilaDato label="Producción científica" valor={produccion.valores.tipoMaterial?.label ?? ''} />

        <FormSelectField
          control={control}
          name="lugarTrabajo"
          label="Lugar de trabajo"
          required
          options={LUGAR_TRABAJO_AUTOR as any}
          disabled={ver}
          onCambio={limpiarPorLugar}
        />
        {lugar === LUGAR_UA ? (
          <FormSelectField
            control={control}
            name="colaborador"
            label="Autor/es"
            required
            options={colaboradores as any}
            disabled={ver}
            buscable
          />
        ) : null}
        {lugar === LUGAR_OTRO ? (
          <>
            <FormTextField control={control} name="otro" label="Autor/es" required editable={!ver} maximo={100} />
            <FormTextField
              control={control}
              name="otraInstitucion"
              label="Otras Instituciones"
              editable={!ver}
              maximo={100}
            />
          </>
        ) : null}
        <FormTextField
          control={control}
          name="orden"
          label="Orden de Autor"
          keyboardType="numeric"
          editable={!ver}
          maximo={4}
        />

        {!nuevo ? (
          <FormSelectField
            control={control}
            name="estado"
            label="Estado"
            options={opcionesDeEstado as any}
            disabled={estadoBloqueado}
          />
        ) : null}
        {Number(estado?.value) === PARTICIPANTE_BAJA ? (
          <FormTextField
            control={control}
            name="motivoDeBaja"
            label="Motivo de baja"
            required
            multiline
            numberOfLines={3}
            editable={!ver}
            maximo={2000}
            helperText={caracteresRestantes(motivo, 2000)}
          />
        ) : null}
        {dadoDeBaja ? (
          <>
            <FilaDato label="Fecha de baja" valor={aFechaVisible(autor?.fechaDeBaja ?? null)} />
            <FilaDato label="Creador de la producción" valor={produccion.creadorNombre} />
          </>
        ) : null}

        {!ver ? <PieObligatorios /> : null}
      </Campos>
    </ModalPerfil>
  );
};
