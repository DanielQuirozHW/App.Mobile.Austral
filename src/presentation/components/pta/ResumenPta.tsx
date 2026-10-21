// Pestaña Resumen: indicadores de distribución, observaciones / comentarios, totales registrados, informe del año
// anterior y envío a Secretaría Académica. Port de ModalPlanDeTrabajoDocente.tsx (Portal-Austral-Dev).
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  eliminarInformeAdjunto,
  enviarASecretariaAcademica,
  guardarObservacionesDelResumen,
  subirInformeDelAnioAnterior,
} from '../../../application/pta/ptaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { MSG_CONFIRMAR_ENVIO, MSG_SIN_ADJUNTO_PARA_ENVIAR } from '../../../domain/pta/constantes';
import type { IndicadorPta, NotaPta, PlanDeTrabajo } from '../../../domain/pta/tipos';
import type { ArchivoElegido } from '../../../infrastructure/archivos/seleccionArchivos';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { usePtaStore } from '../../stores/ptaStore';
import { borderRadius, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { ConfirmDialog } from '../ConfirmDialog';
import { SelectorArchivos } from '../licencias/SelectorArchivos';
import { TarjetaSolicitud } from '../licencias/TarjetaSolicitud';
import { CajaPta } from './CajaPta';
import { ejecutarConToast } from './ejecutarPta';
import { TotalesPta } from './TotalesPta';

interface Props {
  plan: PlanDeTrabajo;
  deshabilitado: boolean;
  /** El estado del PTA permite cargar (1 o 100000000). */
  editable: boolean;
  /** Se llama después de enviar el plan (el portal cierra el modal). */
  onEnviado: () => void;
}

const formatoNumero = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ''));

const Indicadores: React.FC<{ indicadores: IndicadorPta[] }> = ({ indicadores }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  if (indicadores.length === 0) {
    return (
      <AppText variant="body2" tone="secondary">
        Todavía no hay datos cargados para mostrar.
      </AppText>
    );
  }
  return (
    <View style={styles.indicadores}>
      {indicadores.map((i) => (
        <View key={i.id} style={styles.indicador}>
          <View style={styles.indicadorEncabezado}>
            <AppText variant="subtitle2" style={{ flex: 1 }}>
              {i.label}
            </AppText>
            <AppText variant="subtitle2" tone="primary">{`${formatoNumero(i.porcentaje)}%`}</AppText>
          </View>
          <View style={styles.pista}>
            <View style={[styles.barra, { width: `${Math.min(Math.max(i.porcentaje, 0), 100)}%` }]} />
          </View>
          <View style={styles.indicadorDatos}>
            <AppText variant="caption" tone="secondary">{`Horas: ${formatoNumero(i.value)}`}</AppText>
            <AppText variant="caption" tone="secondary">{`Días: ${formatoNumero(i.cantidadDias)}`}</AppText>
          </View>
        </View>
      ))}
    </View>
  );
};

export const ResumenPta: React.FC<Props> = ({ plan, deshabilitado, editable, onEnviado }) => {
  const indicadores = usePtaStore((s) => s.indicadores);
  const notas = usePtaStore((s) => s.notas);

  const [observaciones, setObservaciones] = useState(plan.observacionesResumen);
  const [guardando, setGuardando] = useState(false);
  const [archivos, setArchivos] = useState<ArchivoElegido[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [notaAEliminar, setNotaAEliminar] = useState<NotaPta | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [confirmandoEnvio, setConfirmandoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => setObservaciones(plan.observacionesResumen), [plan.observacionesResumen]);

  // disabledObservacionResumen del portal: estado no editable o PTA deshabilitado.
  const sinEdicion = !editable || deshabilitado;
  const modificado = observaciones !== plan.observacionesResumen;

  const guardarObservaciones = async () => {
    setGuardando(true);
    await ejecutarConToast(() => guardarObservacionesDelResumen(plan, observaciones), {
      procesando: 'Procesando...',
      exito: 'Cambios guardados correctamente',
      error: 'Error al editar el plan de trabajo',
    });
    setGuardando(false);
  };

  const subir = async () => {
    if (archivos.length === 0) return;
    setSubiendo(true);
    const ok = await ejecutarConToast(() => subirInformeDelAnioAnterior(plan.id, archivos), {
      procesando: 'Procesando archivo...',
      exito: 'Archivo cargado con éxito',
      error: 'Error al cargar archivo',
    });
    if (ok) setArchivos([]);
    setSubiendo(false);
  };

  const eliminarNota = async () => {
    if (!notaAEliminar) return;
    setEliminando(true);
    const ok = await ejecutarConToast(() => eliminarInformeAdjunto(plan.id, notaAEliminar.id), {
      procesando: 'Eliminando adjunto...',
      exito: 'Adjunto eliminado correctamente',
      error: 'Error al eliminar el adjunto',
    });
    setEliminando(false);
    if (ok) setNotaAEliminar(null);
  };

  const pedirEnvio = () => {
    if (notas.length === 0) {
      toast.error(MSG_SIN_ADJUNTO_PARA_ENVIAR);
      return;
    }
    setConfirmandoEnvio(true);
  };

  const confirmarEnvio = async () => {
    setEnviando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await enviarASecretariaAcademica(plan);
      toast.dismiss(idToast);
      toast.success('Enviado con éxito');
      setConfirmandoEnvio(false);
      onEnviado();
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'No se pudo cambiar el estado del plan de trabajo'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.contenedor}>
      <CajaPta titulo="Distribución de la dedicación">
        <Indicadores indicadores={indicadores} />
      </CajaPta>

      <CajaPta titulo="Observaciones / Comentarios">
        <AppTextField
          label="Observaciones / Comentarios"
          value={observaciones}
          onChangeText={setObservaciones}
          multiline
          numberOfLines={3}
          editable={!sinEdicion}
        />
        <AppButton
          title="Guardar"
          onPress={guardarObservaciones}
          loading={guardando}
          disabled={sinEdicion || guardando || !modificado}
        />
      </CajaPta>

      <TotalesPta
        totales={[
          { etiqueta: 'TOTAL HORAS DEDICACIÓN ANUAL', valor: plan.horasPtaAnterior },
          { etiqueta: 'TOTAL HORAS PTA', valor: plan.horasDedicacion },
          { etiqueta: 'DIFERENCIA HORAS PTA CON HORAS DEDICACIÓN ANUAL', valor: plan.diferenciaPta },
        ]}
      />

      <CajaPta titulo="Adjuntar Informe PTA del año Anterior">
        <SelectorArchivos archivos={archivos} onChange={setArchivos} disabled={deshabilitado || subiendo} />
        <AppButton
          title="Cargar archivos"
          icon="cloud-upload-outline"
          onPress={subir}
          loading={subiendo}
          disabled={deshabilitado || subiendo || archivos.length === 0}
        />
        {notas.length === 0 ? (
          <AppText variant="body2" tone="secondary">
            Todavía no se cargó ningún informe.
          </AppText>
        ) : (
          notas.map((nota) => (
            <TarjetaSolicitud
              key={nota.id}
              titulo={nota.filename || '—'}
              lineas={[
                { label: 'Documento cargado', valor: nota.cargado ? 'Sí' : '—' },
                { label: 'Fecha de última carga realizada', valor: nota.fechaCarga ?? '' },
              ]}
              acciones={
                deshabilitado ? null : (
                  <AccionIcono icono="trash-outline" etiqueta="Eliminar" peligro onPress={() => setNotaAEliminar(nota)} />
                )
              }
            />
          ))
        )}
      </CajaPta>

      <AppButton
        title="Enviar a Sec. Académico"
        icon="send-outline"
        onPress={pedirEnvio}
        loading={enviando}
        disabled={sinEdicion || enviando}
      />

      <ConfirmDialog
        visible={notaAEliminar !== null}
        titulo="Confirmar eliminación"
        textoConfirmar="Eliminar"
        textoConfirmando="Eliminando..."
        confirmando={eliminando}
        peligroso
        onCancelar={() => setNotaAEliminar(null)}
        onConfirmar={eliminarNota}
      >
        ¿Desea eliminar este registro? Esta acción no se puede deshacer.
      </ConfirmDialog>

      <ConfirmDialog
        visible={confirmandoEnvio}
        titulo="Confirmación"
        textoConfirmar="Aceptar"
        confirmando={enviando}
        onCancelar={() => setConfirmandoEnvio(false)}
        onConfirmar={confirmarEnvio}
      >
        {MSG_CONFIRMAR_ENVIO}
      </ConfirmDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.lg },
});

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    indicadores: { gap: spacing.md },
    indicador: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: c.surfaceSecondary,
    },
    indicadorEncabezado: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    pista: { height: 8, borderRadius: borderRadius.round, backgroundColor: c.border, overflow: 'hidden' },
    barra: { height: 8, borderRadius: borderRadius.round, backgroundColor: c.accentPrimary },
    indicadorDatos: { flexDirection: 'row', gap: spacing.lg },
  });
