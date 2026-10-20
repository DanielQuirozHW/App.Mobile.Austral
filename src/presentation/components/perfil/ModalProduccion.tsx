// Alta, edición, vista y respuesta de una producción científica. Port de Portal-Austral-Dev ->
// perfil/_components/investigacion/resultados-impacto-i+d/produccion-cientifica/modales/ModalProduccionCientifica.tsx
// (+ hooks/investigacion-perfil/useCargaEditarProduccionCientifica.ts).
// Los campos de cada tipo de material salen de CAMPOS_POR_TIPO (domain/perfil/produccionCientifica.ts).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  cargarAutores,
  guardarProduccion,
  MSG_ERROR_CARGA_AUTORES,
  responderComoAutor,
} from '../../../application/perfil/resultadosService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { caracteresRestantes } from '../../../domain/perfil/comun';
import { esValor } from '../../../domain/perfil/afiliaciones';
import {
  camposAjenosVacios,
  esquemaProduccion,
  estaPublicada,
  MSG_CREADOR_DEBE_SER_AUTOR,
  opcionesDeEstadoProduccion,
  PARTICIPANTE_APROBADO,
  PARTICIPANTE_BAJA,
  PARTICIPANTE_INACTIVO,
  PARTICIPANTE_PENDIENTE,
  PARTICIPANTE_RECHAZADO,
  produccionAFormulario,
  publicaConEstado,
  seccionDeTipo,
  TIPO_MATERIAL,
  type Autor,
  type CampoProduccion,
  type ModoProduccion,
  type Produccion,
} from '../../../domain/perfil/produccionCientifica';
import { useAuthStore } from '../../stores/authStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { ConfirmDialog } from '../ConfirmDialog';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { ItemPestania, Pestanias } from '../licencias/Pestanias';
import { AutoresDeProduccion } from './AutoresDeProduccion';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';

interface Props {
  modo: ModoProduccion;
  item?: Produccion;
  onClose: () => void;
}

type Pestania = 'general' | 'autores';

const INNOVACION_OTRO = 100000004;

const TITULOS: Record<ModoProduccion, { titulo: string; subtitulo: string }> = {
  nuevo: { titulo: 'Producciones Científicas', subtitulo: 'Información de Producciones Científicas' },
  responder: {
    titulo: 'Aprobar / Rechazar Producción Científica',
    subtitulo: 'Revisar y aprobar o rechazar la producción científica',
  },
  editar: { titulo: 'Editar Producción Científica', subtitulo: 'Modificar información de Producción Científica' },
  ver: { titulo: 'Ver Producción Científica', subtitulo: 'Consultar información' },
};

export const ModalProduccion: React.FC<Props> = ({ modo, item, onClose }) => {
  const empleadoId = useAuthStore((s) => s.user?.empleadoid) ?? '';
  const nuevo = modo === 'nuevo';

  const participante = item?.participante ?? null;
  const estadoParticipante = participante?.statuscode ?? null;
  const inactivo = estadoParticipante === PARTICIPANTE_INACTIVO;
  const rechazado = estadoParticipante === PARTICIPANTE_RECHAZADO;
  const dadoDeBaja = estadoParticipante === PARTICIPANTE_BAJA;
  const aprobado = estadoParticipante === PARTICIPANTE_APROBADO;
  const pendiente = estadoParticipante === PARTICIPANTE_PENDIENTE;

  // Autor de una producción ajena (esPorAutor del portal): solo edita si su participación está aprobada.
  const esPorAutor = modo === 'editar' && participante !== null;
  const soloLecturaPorAutor = participante !== null && !aprobado;
  const deshabilitado = modo === 'ver' || modo === 'responder' || soloLecturaPorAutor;
  const publicada = estaPublicada(item);
  const puedeGuardar = modo !== 'ver' && modo !== 'responder' && (participante === null || aprobado);

  const [pestania, setPestania] = useState<Pestania>('general');
  const [guardando, setGuardando] = useState(false);
  const [confirmandoCierre, setConfirmandoCierre] = useState(false);
  const [respuesta, setRespuesta] = useState<boolean | null>(null);
  const [respondiendo, setRespondiendo] = useState(false);

  // Autores (los usa la pestaña y la validación de "Publicar").
  const [autores, setAutores] = useState<Autor[]>([]);
  const [cargandoAutores, setCargandoAutores] = useState(!nuevo);
  const [errorAutores, setErrorAutores] = useState(false);

  const recargarAutores = useCallback(async () => {
    if (!item) return;
    setCargandoAutores(true);
    setErrorAutores(false);
    try {
      setAutores(await cargarAutores(item.id));
    } catch {
      setErrorAutores(true);
    } finally {
      setCargandoAutores(false);
    }
  }, [item]);

  useEffect(() => {
    if (!nuevo) void recargarAutores();
  }, [nuevo, recargarAutores]);

  const valoresIniciales = useMemo(() => produccionAFormulario(item), [item]);
  const { control, handleSubmit, formState, watch, setValue } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales,
    resolver: yupResolver(esquemaProduccion as any),
  });
  const valores = watch();
  const tipoMaterial = valores.tipoMaterial;
  const seccion = seccionDeTipo(tipoMaterial);

  // Al crear, cambiar el tipo descarta lo cargado en los campos que el nuevo tipo no tiene.
  useEffect(() => {
    if (!nuevo) return;
    const parche = camposAjenosVacios(tipoMaterial);
    Object.entries(parche).forEach(([clave, valor]) => {
      setValue(clave, valor, { shouldDirty: false });
    });
  }, [nuevo, tipoMaterial, setValue]);

  const pedirCierre = () => {
    if (guardando || respondiendo) return;
    if (puedeGuardar && formState.isDirty) setConfirmandoCierre(true);
    else onClose();
  };

  const guardar = handleSubmit(async (datos: any) => {
    if (publicaConEstado(datos) && !nuevo) {
      if (errorAutores) {
        toast.error(MSG_ERROR_CARGA_AUTORES);
        return;
      }
      const creadorId = item?.creadorId || empleadoId;
      if (!autores.some((a) => a.colaboradorId === creadorId)) {
        toast.error(MSG_CREADOR_DEBE_SER_AUTOR);
        return;
      }
    }
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarProduccion(datos, nuevo ? undefined : item?.id);
      toast.dismiss(idToast);
      toast.success(nuevo ? 'Producción Científica cargada con éxito.' : 'Producción Científica editada con éxito.');
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(
        mensajeDeErrorApi(
          error,
          nuevo ? 'Error al cargar la Producción Científica.' : 'Error al editar la Producción Científica.',
        ),
      );
    } finally {
      setGuardando(false);
    }
  });

  const confirmarRespuesta = async () => {
    if (!participante || respuesta === null) return;
    setRespondiendo(true);
    const idToast = toast.loading('Procesando...');
    try {
      await responderComoAutor(participante, respuesta);
      toast.dismiss(idToast);
      toast.success(respuesta ? 'Producción científica aprobada con éxito.' : 'Producción científica rechazada.');
      setRespuesta(null);
      onClose();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al responder la participación.'));
    } finally {
      setRespondiendo(false);
    }
  };

  // --- Pestañas ---
  const hayPestanaAutores = !nuevo && (!soloLecturaPorAutor || inactivo || rechazado);
  const pestanias = useMemo<ItemPestania<Pestania>[]>(
    () =>
      hayPestanaAutores
        ? [
            { clave: 'general', etiqueta: 'Información General' },
            { clave: 'autores', etiqueta: 'Autor/es', cantidad: autores.length },
          ]
        : [{ clave: 'general', etiqueta: 'Información General' }],
    [hayPestanaAutores, autores.length],
  );

  const soloLecturaAutores = inactivo || rechazado;
  const puedeAgregarAutor = modo !== 'ver' && (!esPorAutor || aprobado) && !inactivo && !rechazado;
  const esCreadorDeAutores = modo !== 'ver' && !esPorAutor && !inactivo && !rechazado;

  // --- Campos del tipo de material ---
  const renderCampo = (c: CampoProduccion) => {
    if (c.soloEdicion && nuevo) return null;
    if (c.clave === 'otroTipoInnovacion' && !esValor(valores.tipoInnovacion, INNOVACION_OTRO)) return null;
    const bloqueado = deshabilitado || Boolean(c.soloLectura);
    const requerido = Boolean(c.requerido) && !c.soloLectura;

    switch (c.control) {
      case 'opcion': {
        const esEstadoProduccion = c.clave === 'estadoProduccion';
        const opciones = esEstadoProduccion ? opcionesDeEstadoProduccion(publicada) : c.opciones ?? [];
        return (
          <FormSelectField
            key={c.clave}
            control={control}
            name={c.clave}
            label={c.etiqueta}
            required={requerido}
            options={opciones as any}
            disabled={bloqueado || (esEstadoProduccion && publicada)}
            clearable={!requerido}
          />
        );
      }
      case 'fecha':
        return (
          <FormDateField
            key={c.clave}
            control={control}
            name={c.clave}
            label={c.etiqueta}
            required={requerido}
            clearable={!requerido}
            disabled={bloqueado}
          />
        );
      case 'numero':
        return (
          <FormTextField
            key={c.clave}
            control={control}
            name={c.clave}
            label={c.etiqueta}
            required={requerido}
            keyboardType="numeric"
            editable={!bloqueado}
          />
        );
      case 'textoLargo':
        return (
          <FormTextField
            key={c.clave}
            control={control}
            name={c.clave}
            label={c.etiqueta}
            required={requerido}
            multiline
            numberOfLines={4}
            editable={!bloqueado}
            maximo={c.maximo}
            helperText={c.contador && c.maximo ? caracteresRestantes(valores[c.clave], c.maximo) : undefined}
          />
        );
      default:
        return (
          <FormTextField
            key={c.clave}
            control={control}
            name={c.clave}
            label={c.etiqueta}
            required={requerido}
            keyboardType={c.esIsbn ? 'numbers-and-punctuation' : undefined}
            editable={!bloqueado}
            multiline={Boolean(c.contador)}
            numberOfLines={c.contador ? 3 : undefined}
            maximo={c.maximo}
            helperText={c.contador && c.maximo ? caracteresRestantes(valores[c.clave], c.maximo) : undefined}
          />
        );
    }
  };

  const pie =
    modo === 'ver' ? (
      <AppButton title="Cerrar" variant="secondary" onPress={onClose} />
    ) : modo === 'responder' ? (
      <>
        {pendiente ? (
          <>
            <AppButton title="Aprobar" onPress={() => setRespuesta(true)} disabled={respondiendo} />
            <AppButton title="Rechazar" variant="danger" onPress={() => setRespuesta(false)} disabled={respondiendo} />
          </>
        ) : (
          <AppButton title="Cerrar" variant="secondary" onPress={onClose} />
        )}
      </>
    ) : (
      <>
        <AppButton title="Cancelar" variant="secondary" onPress={pedirCierre} disabled={guardando} />
        {pestania === 'general' && puedeGuardar ? (
          <AppButton title="GUARDAR" onPress={() => void guardar()} loading={guardando} />
        ) : null}
      </>
    );

  const textos = TITULOS[modo];

  return (
    <>
      <AppModal
        visible
        onClose={modo === 'ver' || modo === 'responder' ? onClose : pedirCierre}
        titulo={textos.titulo}
        subtitulo={textos.subtitulo}
        cerrable={!guardando && !respondiendo}
        altaCompleta
        pie={pie}
      >
        {pestanias.length > 1 ? <Pestanias items={pestanias} activa={pestania} onCambiar={setPestania} /> : null}

        {pestania === 'general' || pestanias.length === 1 ? (
          <Campos>
            {inactivo ? (
              <InfoAlert tipo="advertencia">
                Tu participación en esta producción científica está en estado Inactivo.
              </InfoAlert>
            ) : null}
            {rechazado ? <InfoAlert tipo="error">Usted ha rechazado esta producción científica.</InfoAlert> : null}
            {dadoDeBaja ? (
              <InfoAlert tipo="error">Usted fue dado de baja en esta producción científica.</InfoAlert>
            ) : null}

            <FormSelectField
              control={control}
              name="tipoMaterial"
              label="Tipo de material"
              required
              options={TIPO_MATERIAL as any}
              disabled={deshabilitado || publicada}
              buscable
            />

            {seccion ? (
              <>
                {seccion.campos.map(renderCampo)}
                {dadoDeBaja && participante ? (
                  <>
                    <FilaDato label="Motivo de baja" valor={participante.motivoDeBaja} />
                    <FilaDato label="Fecha de baja" valor={aFechaVisible(participante.fechaDeBaja)} />
                    <FilaDato label="Creador del proyecto" valor={item?.creadorNombre ?? ''} />
                  </>
                ) : null}
              </>
            ) : null}

            {!deshabilitado ? <PieObligatorios /> : null}
          </Campos>
        ) : null}

        {pestania === 'autores' && item ? (
          <View style={styles.autores}>
            <AutoresDeProduccion
              produccion={item}
              autores={autores}
              cargando={cargandoAutores}
              error={errorAutores}
              puedeAgregar={puedeAgregarAutor}
              esCreador={esCreadorDeAutores}
              soloLectura={soloLecturaAutores}
              mensajeError={MSG_ERROR_CARGA_AUTORES}
              onRecargar={() => void recargarAutores()}
            />
          </View>
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
        titulo={respuesta ? 'Aprobar producción científica' : 'Rechazar producción científica'}
        textoConfirmar="Confirmar"
        textoConfirmando="Procesando..."
        confirmando={respondiendo}
        peligroso={respuesta === false}
        onCancelar={() => setRespuesta(null)}
        onConfirmar={() => void confirmarRespuesta()}
      >
        {respuesta
          ? '¿Confirmás que deseás aprobar esta producción científica? Esta acción notificará al creador.'
          : '¿Confirmás que deseás rechazar esta producción científica? Esta acción notificará al creador.'}
      </ConfirmDialog>
    </>
  );
};

const styles = StyleSheet.create({
  autores: { gap: spacing.md },
});
