// Port de Portal-Austral-Dev -> licencias/vacaciones/page.tsx: encabezado "Vacaciones" con el botón Solicitar, resumen del
// período vigente, pestañas de solicitudes propias, ver y cancelar.
//
// Igual que el portal:
//  - Se muestra UN solo período: el que todavía no venció y vence primero (elegirPeriodoSolicitable). El resumen
//    es solo de ese período, sin respaldo a otro.
//  - El botón Solicitar está habilitado solo si hay período solicitable; si no, queda deshabilitado y se muestra
//    el aviso "En este momento no hay un periodo activo para la carga de vacaciones."
//  - La pestaña Canceladas no tiene acciones (COLUMNS_VACACIONES_GESTION_CANCELADAS no trae la columna Acciones).
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { cancelarVacacion, cargarModulo } from '../../../application/licencias/licenciasService';
import {
  ESTADOS_VACACIONES_POR_PESTANIA,
  etiquetaEstadoVacacion,
  puedeCancelarVacacion,
  puedeVerVacacion,
  type PestaniaSolicitudes,
} from '../../../domain/licencias/estados';
import { hoyCrm } from '../../../domain/licencias/fechasCrm';
import type { PeriodoVacaciones, VacacionPropia } from '../../../domain/licencias/tipos';
import { elegirPeriodoSolicitable } from '../../../domain/licencias/vacaciones';
import { useLicenciasStore } from '../../stores/licenciasStore';
import { spacing } from '../../utils/responsive';
import { AccionIcono } from '../AccionIcono';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { InfoAlert } from '../InfoAlert';
import { EncabezadoDeSeccion } from './EncabezadoDeSeccion';
import { EstadoChip } from './EstadoChip';
import { ListaPaginada, MSG_ERROR_DE_LECTURA } from './ListaPaginada';
import { ModalSolicitarVacaciones } from './ModalSolicitarVacaciones';
import { ModalVerVacacion, detalleDeVacacionPropia } from './ModalVerVacacion';
import { Pestanias, type ItemPestania } from './Pestanias';
import { TarjetaSolicitud } from './TarjetaSolicitud';
import { VacacionesPanel } from './VacacionesPanel';

const PESTANIAS: { clave: PestaniaSolicitudes; etiqueta: string }[] = [
  { clave: 'ingresadas', etiqueta: 'Ingresadas' },
  { clave: 'aprobadas', etiqueta: 'Aprobadas' },
  { clave: 'rechazadas', etiqueta: 'Rechazadas' },
  { clave: 'canceladas', etiqueta: 'Canceladas' },
];

/** Tooltip del botón Solicitar deshabilitado en el portal. */
const MOTIVO_SIN_PERIODO = 'No hay ningún período de vacaciones abierto para solicitar en este momento.';
/** Aviso que el portal muestra cuando no hay período vigente. */
const AVISO_SIN_PERIODO = 'En este momento no hay un periodo activo para la carga de vacaciones.';

export const VacacionesSeccion: React.FC = () => {
  const periodos = useLicenciasStore((s) => s.periodos);
  const bloque = useLicenciasStore((s) => s.vacaciones);
  const [pestania, setPestania] = useState<PestaniaSolicitudes>('ingresadas');
  const [solicitando, setSolicitando] = useState<PeriodoVacaciones | null>(null);
  const [viendo, setViendo] = useState<VacacionPropia | null>(null);
  const [aCancelar, setACancelar] = useState<VacacionPropia | null>(null);
  const [procesando, setProcesando] = useState(false);
  const hoy = hoyCrm();

  const solicitable = useMemo(() => elegirPeriodoSolicitable(periodos.datos, hoy), [periodos.datos, hoy]);

  const filtradas = useMemo(
    () => bloque.datos.filter((v) => ESTADOS_VACACIONES_POR_PESTANIA[pestania].includes(v.estado)),
    [bloque.datos, pestania],
  );
  const items = useMemo<ItemPestania<PestaniaSolicitudes>[]>(
    () =>
      PESTANIAS.map((p) => ({
        ...p,
        cantidad: bloque.datos.filter((v) => ESTADOS_VACACIONES_POR_PESTANIA[p.clave].includes(v.estado)).length,
      })),
    [bloque.datos],
  );

  const confirmarCancelacion = async () => {
    if (!aCancelar) return;
    setProcesando(true);
    await cancelarVacacion(aCancelar.id);
    setProcesando(false);
    setACancelar(null);
  };

  const periodosListos = periodos.cargado && !periodos.cargando;

  return (
    <View style={styles.seccion}>
      <EncabezadoDeSeccion
        icono="umbrella-outline"
        titulo="Vacaciones"
        subtitulo="¡Llegó tu momento de descansar y disfrutar! Solicitá tu licencia de vacaciones en esta sección."
        textoBoton="Solicitar"
        botonDeshabilitado={!solicitable}
        accesibilidadBoton={solicitable ? 'Solicitar' : `Solicitar. ${MOTIVO_SIN_PERIODO}`}
        onBoton={() => setSolicitando(solicitable)}
      />

      {solicitable ? <VacacionesPanel periodo={solicitable} /> : null}
      {!solicitable && periodos.error ? <InfoAlert tipo="error">{MSG_ERROR_DE_LECTURA}</InfoAlert> : null}
      {!solicitable && !periodos.error && periodosListos ? <InfoAlert tipo="info">{AVISO_SIN_PERIODO}</InfoAlert> : null}

      <Pestanias items={items} activa={pestania} onCambiar={setPestania} />

      <ListaPaginada
        datos={filtradas}
        cargando={bloque.cargando}
        error={bloque.error}
        onReintentar={() => void cargarModulo()}
        keyDe={(v) => v.id}
        renderItem={(v) => (
          <TarjetaSolicitud
            titulo={v.periodoVacacional ? `Período ${v.periodoVacacional}` : 'Vacaciones'}
            estado={<EstadoChip estado={v.estado} texto={etiquetaEstadoVacacion(v.estado)} />}
            lineas={[
              { label: 'Fecha de solicitud', valor: v.fechaSolicitud },
              { label: 'Días solicitados', valor: String(v.diasSolicitados) },
              { label: 'Fecha desde', valor: v.fechaDesde },
              { label: 'Fecha hasta', valor: v.fechaHasta },
            ]}
            acciones={
              pestania === 'canceladas' ? undefined : (
                <>
                  {puedeVerVacacion(v.estado) ? (
                    <AccionIcono icono="eye-outline" etiqueta="Ver vacación" onPress={() => setViendo(v)} />
                  ) : null}
                  {puedeCancelarVacacion(v.estado) ? (
                    <AccionIcono icono="trash-outline" etiqueta="Cancelar vacación" peligro onPress={() => setACancelar(v)} />
                  ) : null}
                </>
              )
            }
          />
        )}
      />

      <ModalSolicitarVacaciones visible={solicitando !== null} periodo={solicitando} onClose={() => setSolicitando(null)} />
      <ModalVerVacacion
        visible={viendo !== null}
        detalle={viendo ? detalleDeVacacionPropia(viendo) : null}
        onClose={() => setViendo(null)}
      />
      <ConfirmDialog
        visible={aCancelar !== null}
        titulo="Confirmar cancelación"
        textoCancelar="No"
        textoConfirmar="Si"
        textoConfirmando="Cancelando..."
        confirmando={procesando}
        peligroso
        onCancelar={() => setACancelar(null)}
        onConfirmar={confirmarCancelacion}
      >
        <AppText variant="body1">¿Desea cancelar la solicitud de vacaciones seleccionada?</AppText>
        <AppText variant="body2" tone="secondary">
          Esta acción no se puede deshacer.
        </AppText>
      </ConfirmDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  seccion: { gap: spacing.lg },
});
