// Alta, edición y vista de un participante de un proyecto de investigación. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/actividad-i+d/proyectos-investigacion/modales/ModalParticipantes.tsx.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarParticipante } from '../../../application/perfil/proyectosService';
import { caracteresRestantes, type Modo } from '../../../domain/perfil/comun';
import {
  ESTADO_PARTICIPANTE,
  ESTADO_PROYECTO,
  esquemaParticipante,
  LUGAR,
  LUGARES_TRABAJO,
  MAXIMOS,
  mensajeDeErrorDeParticipante,
  MSG_REQUIERE_DOCTORADO,
  NIVEL_DOCTORADO,
  NOMBRE_OTRA,
  opcionesDeEstadoParticipante,
  participanteAFormulario,
  requiereDoctorado,
  rolesDeLugar,
  ROL,
  TIPO_UNIDAD_ACADEMICA,
  valorNumerico,
  type FormularioParticipante,
  type Participante,
} from '../../../domain/perfil/proyectos';
import { useProyectosStore } from '../../stores/proyectosStore';
import { toast } from '../../utils/toast';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Campos, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

/** Datos del proyecto que el modal necesita (el portal los recibe como props). */
export interface ProyectoDelParticipante {
  id: string;
  nombre: string;
  /** Estado actual del proyecto (statuscode). */
  estado: number | null;
  /** Empleado que creó el proyecto. */
  creadorId: string;
}

interface Props {
  modo: Modo;
  item?: Participante;
  proyecto: ProyectoDelParticipante;
  onClose: () => void;
  /** Se llama después de guardar, para que el proyecto vuelva a leer sus participantes. */
  onGuardado: () => void;
}

const TITULO = 'Participantes';
const SUB = 'Información del participante';

const mismoTexto = (a: unknown, b: unknown): boolean =>
  a !== null && a !== undefined && b !== null && b !== undefined && String(a).toLowerCase() === String(b).toLowerCase();

export const ModalParticipante: React.FC<Props> = ({ modo, item, proyecto, onClose, onGuardado }) => {
  const colaboradores = useProyectosStore((s) => s.colaboradores);
  const unidades = useProyectosStore((s) => s.unidades);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';
  const deshabilitado = modo === 'ver';

  const unidadesAcademicas = useMemo(
    () => unidades.filter((u) => u.tipo === TIPO_UNIDAD_ACADEMICA),
    [unidades],
  );
  const valoresIniciales = useMemo(() => participanteAFormulario(item, unidades), [item, unidades]);

  const { control, handleSubmit, formState, watch, setValue } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaParticipante as any),
  });

  const lugarTrabajo = watch('lugarTrabajo');
  const rol = watch('rol');
  const nombreApellido = watch('nombreApellido');
  const instituciones = watch('instituciones');
  const statusCode = watch('statusCode');
  const motivoDeBaja = watch('new_motivodebaja');

  const lugar = valorNumerico(lugarTrabajo);
  const rolValor = valorNumerico(rol);
  const estadoActual = valorNumerico(statusCode);
  const esUA = lugar === LUGAR.UA;
  const mostrarMotivoBaja = estadoActual === ESTADO_PARTICIPANTE.BAJA;
  const esElMismoCreador = proyecto.creadorId !== '' && mismoTexto(nombreApellido?.value, proyecto.creadorId);

  const [estadoInicial, setEstadoInicial] = useState<number | null>(valorNumerico(item?.statusCode));
  const lugarAnterior = useRef<number | null>(null);

  const opcionesDeEstado = useMemo(() => opcionesDeEstadoParticipante(modo, estadoInicial), [modo, estadoInicial]);
  const opcionesDeRol = useMemo(() => rolesDeLugar(lugar, esElMismoCreador), [lugar, esElMismoCreador]);

  // Director, Codirector e Investigador en UA: solo empleados con Doctorado.
  const empleadosFiltrados = useMemo(() => {
    if (requiereDoctorado(lugar, rolValor)) return colaboradores.filter((c) => c.nivel === NIVEL_DOCTORADO);
    return colaboradores;
  }, [colaboradores, lugar, rolValor]);

  // Si el lugar deja de ser UA o el empleado ya no cumple el filtro, se limpia el nombre.
  useEffect(() => {
    if (!nombreApellido) return;
    if (!esUA) {
      setValue('nombreApellido', null, { shouldValidate: true });
      return;
    }
    if (!empleadosFiltrados.some((e) => e.value === nombreApellido.value)) {
      setValue('nombreApellido', null, { shouldValidate: true });
    }
  }, [empleadosFiltrados, esUA, nombreApellido, setValue]);

  // Colaborador externo: el lugar de trabajo es "Otro".
  useEffect(() => {
    if (rolValor === ROL.COLABORADOR_EXTERNO) setValue('lugarTrabajo', LUGARES_TRABAJO[1], { shouldValidate: true });
  }, [rolValor, setValue]);

  // Si cambia el lugar, se limpia el rol que ya no corresponde.
  useEffect(() => {
    if (!rol) return;
    const validos = rolesDeLugar(lugar, false);
    if (!validos.some((r) => Number(r.value) === rolValor)) setValue('rol', null, { shouldValidate: true });
    // Solo reacciona al cambio de lugar (igual que el portal).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lugar]);

  // Lugar "Otro": la institución es "Otra".
  useEffect(() => {
    if (lugar !== LUGAR.OTRO) return;
    const otra = unidadesAcademicas.find((u) => u.label === NOMBRE_OTRA);
    if (otra) setValue('instituciones', { value: otra.value, label: otra.label }, { shouldValidate: true });
  }, [lugar, unidadesAcademicas, setValue]);

  // Alta: el estado inicial sale del lugar de trabajo (el propio creador y los externos entran aprobados).
  useEffect(() => {
    if (!nuevo || lugar === null) return;
    if (esElMismoCreador || lugar === LUGAR.OTRO) {
      setValue('statusCode', { value: ESTADO_PARTICIPANTE.APROBADO, label: 'Aprobado' });
    } else if (lugar === LUGAR.UA) {
      setValue('statusCode', { value: ESTADO_PARTICIPANTE.PENDIENTE, label: 'Pendiente' });
    }
  }, [nuevo, lugar, esElMismoCreador, setValue]);

  // Edición: si cambia el lugar de trabajo, el estado se recalcula.
  useEffect(() => {
    const previo = lugarAnterior.current;
    lugarAnterior.current = lugar;
    if (nuevo) return;
    if (previo === null || previo === lugar) return;
    if (lugar === LUGAR.OTRO) {
      setValue('statusCode', { value: ESTADO_PARTICIPANTE.APROBADO, label: 'Aprobado' });
      setEstadoInicial(ESTADO_PARTICIPANTE.APROBADO);
    } else if (lugar === LUGAR.UA) {
      setValue('statusCode', { value: ESTADO_PARTICIPANTE.PENDIENTE, label: 'Pendiente' });
      setEstadoInicial(ESTADO_PARTICIPANTE.PENDIENTE);
    }
  }, [lugar, nuevo, setValue]);

  // El motivo de baja solo existe con el estado Baja.
  useEffect(() => {
    if (!mostrarMotivoBaja) setValue('new_motivodebaja', '');
  }, [mostrarMotivoBaja, setValue]);

  const estadoBloqueado =
    deshabilitado ||
    esElMismoCreador ||
    estadoInicial === ESTADO_PARTICIPANTE.BAJA ||
    estadoInicial === ESTADO_PARTICIPANTE.DESVINCULADO ||
    (proyecto.estado === ESTADO_PROYECTO.BORRADOR && estadoActual === ESTADO_PARTICIPANTE.PENDIENTE);

  const guardar = handleSubmit(async (valores: any) => {
    const datos = valores as FormularioParticipante;
    if (requiereDoctorado(valorNumerico(datos.lugarTrabajo), valorNumerico(datos.rol))) {
      const empleado = colaboradores.find((c) => c.value === datos.nombreApellido?.value);
      if (empleado?.nivel !== NIVEL_DOCTORADO) {
        toast.error(MSG_REQUIERE_DOCTORADO);
        return;
      }
    }
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarParticipante(datos, proyecto.id, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Participante cargado con éxito.' : 'Participante editado con éxito');
      onGuardado();
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(
        mensajeDeErrorDeParticipante(
          error,
          nuevo ? 'Error al cargar el participante.' : 'Error al editar el participante.',
        ),
      );
    } finally {
      setGuardando(false);
    }
  });

  if (modo === 'ver' && item) {
    const otraInstitucion = item.institucionPertenencia.label === NOMBRE_OTRA || (!item.institucionPertenencia.value && item.otraInstitucion);
    return (
      <ModalPerfil modo="ver" titulo={TITULO} subtituloNuevo={SUB} subtituloEditar={SUB} onClose={onClose}>
        <View style={{ gap: 8 }}>
          <FilaDato label="Proyecto de investigación" valor={proyecto.nombre} />
          <FilaDato label="Lugar de trabajo" valor={item.lugarTrabajo.label ?? ''} />
          <FilaDato label="Rol" valor={item.rol.label ?? ''} />
          <FilaDato label="Nombre y Apellido" valor={item.nombreApellido.label ?? ''} />
          <FilaDato
            label="Unidad Académica"
            valor={item.institucionPertenencia.label || (otraInstitucion ? NOMBRE_OTRA : '')}
          />
          {otraInstitucion ? <FilaDato label="Otras Instituciones" valor={item.otraInstitucion} /> : null}
          <FilaDato label="Estado" valor={item.estado || (item.statusCode.label ?? '')} />
          {valorNumerico(item.statusCode) === ESTADO_PARTICIPANTE.BAJA ? (
            <FilaDato label="Motivo de baja" valor={item.motivoBaja} />
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
        <FilaDato label="Proyecto de investigación" valor={proyecto.nombre} />

        <FormSelectField
          control={control}
          name="lugarTrabajo"
          label="Lugar de trabajo"
          required
          options={LUGARES_TRABAJO as any}
          disabled={esElMismoCreador && !nuevo}
        />
        <FormSelectField
          control={control}
          name="rol"
          label="Rol"
          required
          options={opcionesDeRol as any}
          disabled={lugar === null}
        />
        {esUA ? (
          <FormSelectField
            control={control}
            name="nombreApellido"
            label="Nombre y Apellido"
            required
            options={empleadosFiltrados as any}
            buscable
          />
        ) : (
          <FormTextField
            control={control}
            name="otroNombre"
            label="Nombre y Apellido"
            required
            editable={lugar !== null}
          />
        )}
        <FormSelectField
          control={control}
          name="instituciones"
          label="Unidad Académica"
          required
          options={unidadesAcademicas as any}
          disabled={lugar === LUGAR.OTRO}
          buscable
        />
        {instituciones?.label === NOMBRE_OTRA ? (
          <FormTextField control={control} name="new_otrainstitucion" label="Otras Instituciones" required />
        ) : null}
        {!nuevo ? (
          <FormSelectField
            control={control}
            name="statusCode"
            label="Estado"
            options={opcionesDeEstado as any}
            disabled={estadoBloqueado}
          />
        ) : null}
        {mostrarMotivoBaja ? (
          <FormTextField
            control={control}
            name="new_motivodebaja"
            label="Motivo de baja"
            required
            multiline
            numberOfLines={3}
            maximo={MAXIMOS.motivoBaja}
            helperText={caracteresRestantes(motivoDeBaja, MAXIMOS.motivoBaja)}
          />
        ) : null}
        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};
