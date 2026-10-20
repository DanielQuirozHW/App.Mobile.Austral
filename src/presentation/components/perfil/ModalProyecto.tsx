// Alta, edición, vista y respuesta a la vinculación de un proyecto de investigación. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/actividad-i+d/proyectos-investigacion/modales/ModalProyectosInvestigacion.tsx
// (+ BotonesAprobacionProyectosInvestigacion.tsx).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  cargarParticipantes,
  guardarProyecto,
  responderParticipacion,
} from '../../../application/perfil/proyectosService';
import { caracteresRestantes } from '../../../domain/perfil/comun';
import {
  esOtraEtiqueta,
  esquemaProyecto,
  DURACIONES,
  ESTADO_PROYECTO,
  LINEAS_INVESTIGACION,
  MAXIMOS,
  mensajeDeErrorDeProyecto,
  OPCIONES_RELACION,
  opcionesDeEstadoProyecto,
  PARTICIPACION,
  proyectoAFormulario,
  proyectoDeshabilitado,
  TIPO_UNIDAD_ACADEMICA,
  validarCambioDeEstado,
  valorNumerico,
  type FormularioProyecto,
  type ModoProyecto,
  type Participante,
  type Proyecto,
} from '../../../domain/perfil/proyectos';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { useAuthStore } from '../../stores/authStore';
import { useProyectosStore } from '../../stores/proyectosStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { ItemPestania, Pestanias } from '../licencias/Pestanias';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';
import { ParticipantesDelProyecto } from './ParticipantesDelProyecto';
import { ResultadosDelProyecto } from './ResultadosDelProyecto';

interface Props {
  modo: ModoProyecto;
  item?: Proyecto;
  onClose: () => void;
}

type Pestania = 'general' | 'participantes';

const TITULOS: Record<ModoProyecto, string> = {
  nuevo: 'Nuevo proyecto de investigación',
  editar: 'Editar proyecto de investigación',
  responder: 'Responder vinculación al proyecto',
  ver: 'Proyecto de investigación',
};

const SUBTITULO = 'Información del proyecto de investigación';
const SUBTITULO_VER = 'Solo lectura · podés editar para modificar';

const PESTANIAS_NUEVO: ItemPestania<Pestania>[] = [{ clave: 'general', etiqueta: 'Información General' }];

export const ModalProyecto: React.FC<Props> = ({ modo, item, onClose }) => {
  const empleadoId = useAuthStore((s) => s.user?.empleadoid) ?? '';
  const unidades = useProyectosStore((s) => s.unidades);
  const agrupadores = useProyectosStore((s) => s.agrupadores);
  const areas = useProyectosStore((s) => s.areas);
  const actuaciones = useProyectosStore((s) => s.actuaciones);

  const nuevo = modo === 'nuevo';
  const estadoActual = valorNumerico(item?.statuscode);
  const esCreador = item?.esCreador ?? false;
  const deshabilitado = proyectoDeshabilitado(modo, estadoActual, esCreador);

  const [pestania, setPestania] = useState<Pestania>('general');
  const [guardando, setGuardando] = useState(false);
  const [confirmandoCierre, setConfirmandoCierre] = useState(false);
  const [respuesta, setRespuesta] = useState<number | null>(null);
  const [respondiendo, setRespondiendo] = useState(false);

  // Participantes del proyecto (los usan la pestaña, la vinculación de resultados y la validación del estado).
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [cargandoParticipantes, setCargandoParticipantes] = useState(!nuevo);
  const [errorParticipantes, setErrorParticipantes] = useState(false);

  const recargarParticipantes = useCallback(async () => {
    if (!item) return;
    setCargandoParticipantes(true);
    setErrorParticipantes(false);
    try {
      setParticipantes(await cargarParticipantes(item.id));
    } catch {
      setErrorParticipantes(true);
    } finally {
      setCargandoParticipantes(false);
    }
  }, [item]);

  useEffect(() => {
    if (!nuevo) void recargarParticipantes();
  }, [nuevo, recargarParticipantes]);

  const valoresIniciales = useMemo(() => proyectoAFormulario(item), [item]);
  const { control, handleSubmit, formState, watch, setValue } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaProyecto as any),
  });

  const titulo = watch('tituloProyecto');
  const palabrasClave = watch('palabrasClave');
  const resumen = watch('resumen');
  const resumenIngles = watch('abstract');
  const otrasSedes = watch('otrasSedes');
  const areaDisciplinar = watch('areaDisciplinar');
  const area = watch('area');
  const actuacion = watch('actuacion');
  const relacionLineas = watch('relacionLineas');
  const lineaInvestigacion = watch('lineaInvestigacion');

  const opcionesDeAreas = useMemo(
    () => (areaDisciplinar?.value ? areas.filter((a) => a.agrupador === areaDisciplinar.value) : []),
    [areas, areaDisciplinar],
  );
  const opcionesDeActuacion = useMemo(
    () => (area?.value ? actuaciones.filter((a) => a.area === area.value) : []),
    [actuaciones, area],
  );
  const sedes = useMemo(() => unidades.filter((u) => u.tipo === TIPO_UNIDAD_ACADEMICA), [unidades]);
  const opcionesDeEstado = useMemo(() => opcionesDeEstadoProyecto(estadoActual), [estadoActual]);

  const requiereLinea = valorNumerico(relacionLineas) === 1;

  // Sin relación con las líneas prioritarias no hay línea de investigación.
  useEffect(() => {
    if (deshabilitado || requiereLinea || !lineaInvestigacion) return;
    setValue('lineaInvestigacion', null, { shouldValidate: true, shouldDirty: true });
  }, [deshabilitado, requiereLinea, lineaInvestigacion, setValue]);

  const limpiarDesdeAgrupador = () => {
    setValue('area', null, { shouldValidate: true, shouldDirty: true });
    setValue('otraAreaInteres', '', { shouldValidate: true, shouldDirty: true });
    setValue('actuacion', null, { shouldValidate: true, shouldDirty: true });
    setValue('otraActuacion', '', { shouldValidate: true, shouldDirty: true });
  };

  const limpiarDesdeArea = () => {
    setValue('actuacion', null, { shouldValidate: true, shouldDirty: true });
    setValue('otraActuacion', '', { shouldValidate: true, shouldDirty: true });
  };

  const pedirCierre = () => {
    if (guardando || respondiendo) return;
    if (!deshabilitado && formState.isDirty) setConfirmandoCierre(true);
    else onClose();
  };

  const guardar = handleSubmit(async (valores: any) => {
    const datos = valores as FormularioProyecto;
    if (!nuevo) {
      if (errorParticipantes) {
        toast.error('No pudimos cargar los participantes. Volvé a intentar antes de guardar.');
        return;
      }
      const mensaje = validarCambioDeEstado({
        nuevo,
        estadoActual,
        estadoNuevo: valorNumerico(datos.statuscode),
        participantes,
        esCreador,
        empleadoId,
      });
      if (mensaje) {
        toast.error(mensaje);
        return;
      }
    }
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarProyecto(datos, nuevo ? undefined : item);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Proyecto cargado con éxito.' : 'Proyecto editado con éxito.');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(
        mensajeDeErrorDeProyecto(error, nuevo ? 'Error al cargar el proyecto.' : 'Error al editar el proyecto.'),
      );
    } finally {
      setGuardando(false);
    }
  });

  const confirmarRespuesta = async () => {
    if (!item || respuesta === null) return;
    const aprobada = respuesta === PARTICIPACION.APROBADO;
    setRespondiendo(true);
    const idToast = toast.loading('Procesando...');
    try {
      await responderParticipacion(item, respuesta);
      toast.dismiss(idToast);
      toast.success(aprobada ? 'Participación aceptada con éxito.' : 'Participación rechazada.');
      setRespuesta(null);
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al responder la participación.'));
    } finally {
      setRespondiendo(false);
    }
  };

  const pestanias = useMemo<ItemPestania<Pestania>[]>(
    () =>
      nuevo
        ? PESTANIAS_NUEVO
        : [...PESTANIAS_NUEVO, { clave: 'participantes', etiqueta: 'Participantes', cantidad: participantes.length }],
    [nuevo, participantes.length],
  );

  const aprobando = respuesta === PARTICIPACION.APROBADO;

  const pie =
    modo === 'ver' ? (
      <AppButton title="Cerrar" variant="secondary" onPress={onClose} />
    ) : modo === 'responder' ? (
      <>
        <AppButton title="Aprobar" onPress={() => setRespuesta(PARTICIPACION.APROBADO)} disabled={respondiendo} />
        <AppButton
          title="Rechazar"
          variant="danger"
          onPress={() => setRespuesta(PARTICIPACION.RECHAZADO)}
          disabled={respondiendo}
        />
      </>
    ) : (
      <>
        <AppButton title="Cancelar" variant="secondary" onPress={pedirCierre} disabled={guardando} />
        {pestania === 'general' && !deshabilitado ? (
          <AppButton
            title="GUARDAR"
            onPress={() => void guardar()}
            loading={guardando}
            disabled={!nuevo && cargandoParticipantes}
          />
        ) : null}
      </>
    );

  return (
    <>
      <AppModal
        visible
        onClose={modo === 'ver' || modo === 'responder' ? onClose : pedirCierre}
        titulo={TITULOS[modo]}
        subtitulo={modo !== 'ver' ? SUBTITULO : SUBTITULO_VER}
        cerrable={!guardando && !respondiendo}
        altaCompleta
        pie={pie}
      >
        {!nuevo ? <Pestanias items={pestanias} activa={pestania} onCambiar={setPestania} /> : null}

        {pestania === 'general' ? (
          <Campos>
            <FormTextField
              control={control}
              name="tituloProyecto"
              label="Título del proyecto"
              required
              multiline
              numberOfLines={3}
              editable={!deshabilitado}
              maximo={MAXIMOS.titulo}
              helperText={caracteresRestantes(titulo, MAXIMOS.titulo)}
            />
            <FormTextField
              control={control}
              name="palabrasClave"
              label="Palabras clave"
              required
              editable={!deshabilitado}
              maximo={MAXIMOS.palabrasClave}
              helperText={caracteresRestantes(palabrasClave, MAXIMOS.palabrasClave)}
            />
            <FormTextField
              control={control}
              name="resumen"
              label="Resumen"
              required
              multiline
              numberOfLines={4}
              editable={!deshabilitado}
              maximo={MAXIMOS.resumen}
              helperText={caracteresRestantes(resumen, MAXIMOS.resumen)}
            />
            <FormTextField
              control={control}
              name="abstract"
              label="Abstract"
              required
              multiline
              numberOfLines={4}
              editable={!deshabilitado}
              maximo={MAXIMOS.abstract}
              helperText={caracteresRestantes(resumenIngles, MAXIMOS.abstract)}
            />

            <FormSelectField
              control={control}
              name="areaDisciplinar"
              label="Área disciplinar"
              required
              options={agrupadores as any}
              disabled={deshabilitado}
              buscable
              onCambio={limpiarDesdeAgrupador}
            />
            <FormSelectField
              control={control}
              name="area"
              label="Área de Interés"
              required
              options={opcionesDeAreas as any}
              disabled={deshabilitado || !areaDisciplinar}
              buscable
              onCambio={limpiarDesdeArea}
            />
            {esOtraEtiqueta(area) ? (
              <FormTextField
                control={control}
                name="otraAreaInteres"
                label="Otra área de interés"
                required
                editable={!deshabilitado}
              />
            ) : null}
            <FormSelectField
              control={control}
              name="actuacion"
              label="Actuación"
              required
              options={opcionesDeActuacion as any}
              disabled={deshabilitado || !area}
              buscable
            />
            {esOtraEtiqueta(actuacion) ? (
              <FormTextField
                control={control}
                name="otraActuacion"
                label="Otra actuación"
                required
                editable={!deshabilitado}
              />
            ) : null}

            <FormSelectField
              control={control}
              name="relacionLineas"
              label="¿Está directamente relacionado con alguna de las líneas prioritarias de investigación de la UA?"
              required
              options={OPCIONES_RELACION as any}
              disabled={deshabilitado}
            />
            {requiereLinea ? (
              <FormSelectField
                control={control}
                name="lineaInvestigacion"
                label="Línea de Investigación"
                required
                options={LINEAS_INVESTIGACION as any}
                disabled={deshabilitado}
              />
            ) : null}

            <FormSelectField
              control={control}
              name="sedeEjecucionPrincipal"
              label="Sede de ejecución principal"
              required
              options={sedes as any}
              disabled={deshabilitado}
              buscable
            />
            <FormTextField
              control={control}
              name="otrasSedes"
              label="Otras sedes de ejecución"
              editable={!deshabilitado}
              maximo={MAXIMOS.otrasSedes}
              helperText={caracteresRestantes(otrasSedes, MAXIMOS.otrasSedes)}
            />
            <FormSelectField
              control={control}
              name="duracion"
              label="Duración"
              required
              options={DURACIONES as any}
              disabled={deshabilitado}
            />
            <FormDateField control={control} name="fechaInicio" label="Fecha de inicio" required disabled={deshabilitado} />
            <FormDateField
              control={control}
              name="fechaFinalizacion"
              label="Fecha fin"
              clearable
              disabled={deshabilitado}
            />

            {estadoActual === ESTADO_PROYECTO.PUBLICADO ? (
              <FormTextField control={control} name="codigo" label="Código" editable={false} />
            ) : null}
            {!nuevo ? (
              <FormSelectField
                control={control}
                name="statuscode"
                label="Estado del proyecto"
                options={opcionesDeEstado as any}
                disabled={deshabilitado}
              />
            ) : null}
            {!nuevo && estadoActual === ESTADO_PROYECTO.RECHAZADO ? (
              <FormTextField
                control={control}
                name="new_motivoderechazosi"
                label="Motivo de Rechazo SI"
                multiline
                numberOfLines={3}
                editable={false}
              />
            ) : null}

            {modo !== 'ver' && modo !== 'responder' && !deshabilitado ? <PieObligatorios /> : null}

            {!nuevo && item ? <ResultadosDelProyecto proyecto={item} participantes={participantes} /> : null}
          </Campos>
        ) : null}

        {pestania === 'participantes' && item ? (
          <View style={styles.participantes}>
            {modo === 'responder' ? (
              <AppText variant="body2" tone="secondary">
                Revisá los participantes del proyecto antes de responder.
              </AppText>
            ) : null}
            <ParticipantesDelProyecto
              proyecto={{
                id: item.id,
                nombre: item.tituloProyecto,
                estado: estadoActual,
                creadorId: item.creadorId,
              }}
              participantes={participantes}
              cargando={cargandoParticipantes}
              error={errorParticipantes}
              deshabilitado={deshabilitado}
              esCreadorDelProyecto={esCreador}
              onRecargar={() => void recargarParticipantes()}
            />
          </View>
        ) : null}

        {modo === 'responder' ? (
          <InfoAlert tipo="info">Usá Aprobar o Rechazar para responder a tu vinculación a este proyecto.</InfoAlert>
        ) : null}
      </AppModal>

      <ConfirmDialog
        visible={confirmandoCierre}
        titulo="¿Descartar los cambios?"
        textoCancelar="Seguir editando"
        textoConfirmar="Descartar"
        peligroso
        onCancelar={() => setConfirmandoCierre(false)}
        onConfirmar={() => {
          setConfirmandoCierre(false);
          onClose();
        }}
      >
        Tenés cambios sin guardar. Si cerrás ahora, se van a perder.
      </ConfirmDialog>

      <ConfirmDialog
        visible={respuesta !== null}
        titulo={aprobando ? 'Aprobar vinculación al proyecto' : 'Rechazar vinculación al proyecto'}
        textoConfirmar="Confirmar"
        textoConfirmando="Procesando..."
        confirmando={respondiendo}
        peligroso={!aprobando}
        onCancelar={() => setRespuesta(null)}
        onConfirmar={() => void confirmarRespuesta()}
      >
        {aprobando
          ? '¿Confirmás que deseás aprobar esta vinculación al proyecto?'
          : '¿Confirmás que deseás rechazar esta vinculación al proyecto?'}
      </ConfirmDialog>
    </>
  );
};

const styles = StyleSheet.create({
  participantes: { gap: spacing.md },
});
