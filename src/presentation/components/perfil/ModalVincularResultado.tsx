// Alta, edición y vista de la vinculación de un resultado a un proyecto. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/actividad-i+d/proyectos-investigacion/modales/ModalResultadosProyecto.tsx.
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { cargarOpcionesDeResultado, guardarResultado } from '../../../application/perfil/proyectosService';
import { opcionRequerida, type Modo } from '../../../domain/perfil/comun';
import type { Participante, Proyecto } from '../../../domain/perfil/proyectos';
import {
  mensajeDeErrorDeResultado,
  nombreDelVinculador,
  type ConfigResultado,
  type OpcionDeResultado,
  type ResultadoVinculado,
} from '../../../domain/perfil/resultadosProyecto';
import { useAuthStore } from '../../stores/authStore';
import { useLegajoStore } from '../../stores/legajoStore';
import { toast } from '../../utils/toast';
import { FormSelectField } from '../form/FormSelectField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface Props {
  config: ConfigResultado;
  modo: Modo;
  item?: ResultadoVinculado;
  proyecto: Proyecto;
  participantes: Participante[];
  onClose: () => void;
  /** Se llama después de guardar, para que la sección vuelva a leer sus vinculaciones. */
  onGuardado: () => void;
}

const esquema = yup.object().shape({
  titulo: opcionRequerida('Este campo es requerido'),
});

export const ModalVincularResultado: React.FC<Props> = ({
  config,
  modo,
  item,
  proyecto,
  participantes,
  onClose,
  onGuardado,
}) => {
  const legajo = useLegajoStore((s) => s.legajo);
  const nombreCompleto = useAuthStore((s) => s.user?.fullname) ?? '';
  const nuevo = modo === 'nuevo';
  const [guardando, setGuardando] = useState(false);
  const [opciones, setOpciones] = useState<OpcionDeResultado[]>([]);
  const [cargandoOpciones, setCargandoOpciones] = useState(modo !== 'ver');

  const titulo =
    modo === 'nuevo'
      ? `Vincular ${config.nombre}`
      : modo === 'editar'
        ? `Editar vinculación ${config.nombre}`
        : `Ver ${config.nombre}`;
  const SUB = 'Información de la vinculación';

  // "Vinculado Por": en el alta, el usuario; en la edición y la vista, quien hizo la vinculación.
  const vinculadoPor = useMemo(() => {
    if (item) return item.vinculadoPor;
    if (legajo?.new_apellidos || legajo?.new_nombredepila) {
      return nombreDelVinculador(legajo?.new_apellidos, legajo?.new_nombredepila);
    }
    return nombreCompleto;
  }, [item, legajo, nombreCompleto]);

  const valoresIniciales = useMemo(
    () => ({ titulo: item ? { value: item.titulo.value, label: item.titulo.label } : null }),
    [item],
  );

  const { control, handleSubmit, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquema as any),
  });

  // Registros que se pueden vincular: los del usuario y los de los participantes del proyecto.
  useEffect(() => {
    if (modo === 'ver') return undefined;
    let vigente = true;
    cargarOpcionesDeResultado(config.tipo, participantes)
      .then((lista) => {
        if (vigente) setOpciones(lista);
      })
      .catch(() => {
        if (vigente) toast.error('No pudimos cargar las opciones. Por favor, volvé a intentar.');
      })
      .finally(() => {
        if (vigente) setCargandoOpciones(false);
      });
    return () => {
      vigente = false;
    };
  }, [config.tipo, modo, participantes]);

  const guardar = handleSubmit(async (valores: any) => {
    const tituloId = valores?.titulo?.value;
    if (!tituloId) return;
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarResultado(config.tipo, String(tituloId), proyecto.id, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(
        nuevo ? `Resultado de ${config.nombre} cargado con éxito` : `Resultado de ${config.nombre} editado con éxito`,
      );
      onGuardado();
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(
        mensajeDeErrorDeResultado(
          error,
          config,
          nuevo ? `Error al cargar Resultado de ${config.nombre}` : `Error al editar Resultado de ${config.nombre}`,
        ),
      );
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    return (
      <ModalPerfil modo="ver" titulo={titulo} subtituloNuevo={SUB} subtituloEditar={SUB} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label={config.etiquetaTitulo} valor={item.titulo.label} />
          <FilaDato label="Vinculado Por" valor={item.vinculadoPor} />
          <FilaDato label="Fecha de vinculación" valor={item.fechaVinculacion} />
        </View>
      </ModalPerfil>
    );
  }

  return (
    <ModalPerfil
      modo={modo}
      titulo={titulo}
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
          name="titulo"
          label={config.etiquetaTitulo}
          required
          options={opciones as any}
          placeholder={cargandoOpciones ? 'Cargando...' : 'Seleccionar'}
          disabled={cargandoOpciones}
          buscable
        />
        <FilaDato label="Vinculado Por" valor={vinculadoPor} />
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
