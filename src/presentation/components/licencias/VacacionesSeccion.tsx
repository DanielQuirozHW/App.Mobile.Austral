// Port de Portal-Austral-Dev -> licencias/vacaciones/page.tsx: progreso por período, solicitar vacaciones,
// pestañas de solicitudes propias, ver y cancelar.
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { cancelarVacacion } from '../../../application/licencias/licenciasService';
import {
  ESTADOS_VACACIONES_POR_PESTANIA,
  etiquetaEstadoVacacion,
  puedeCancelarVacacion,
  puedeVerVacacion,
  type PestaniaSolicitudes,
} from '../../../domain/licencias/estados';
import { hoyCrm } from '../../../domain/licencias/fechasCrm';
import type { PeriodoVacaciones, VacacionPropia } from '../../../domain/licencias/tipos';
import { useLicenciasStore } from '../../stores/licenciasStore';
import { spacing } from '../../utils/responsive';
import { AccionIcono } from '../AccionIcono';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { InfoAlert } from '../InfoAlert';
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

/** El botón Solicitar del período solo aparece si hoy está dentro de su ventana de goce. */
const periodoAbierto = (p: PeriodoVacaciones, hoy: string): boolean =>
  Boolean(p.desdeGoceIso && p.hastaGoceIso) && hoy >= (p.desdeGoceIso as string) && hoy <= (p.hastaGoceIso as string);

export const VacacionesSeccion: React.FC = () => {
  const periodos = useLicenciasStore((s) => s.periodos);
  const bloque = useLicenciasStore((s) => s.vacaciones);
  const [pestania, setPestania] = useState<PestaniaSolicitudes>('ingresadas');
  const [solicitando, setSolicitando] = useState<PeriodoVacaciones | null>(null);
  const [viendo, setViendo] = useState<VacacionPropia | null>(null);
  const [aCancelar, setACancelar] = useState<VacacionPropia | null>(null);
  const [procesando, setProcesando] = useState(false);
  const hoy = hoyCrm();

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

  return (
    <View style={styles.seccion}>
      {periodos.datos.map((p) => (
        <VacacionesPanel key={p.id} periodo={p} onSolicitar={periodoAbierto(p, hoy) ? () => setSolicitando(p) : undefined} />
      ))}
      {periodos.datos.length === 0 && periodos.error ? <InfoAlert tipo="error">{MSG_ERROR_DE_LECTURA}</InfoAlert> : null}
      {periodos.datos.length === 0 && !periodos.error && periodos.cargado && !periodos.cargando ? (
        <AppText variant="body2" tone="secondary">
          No hay períodos de vacaciones vigentes.
        </AppText>
      ) : null}

      <Pestanias items={items} activa={pestania} onCambiar={setPestania} />

      <ListaPaginada
        datos={filtradas}
        cargando={bloque.cargando}
        error={bloque.error}
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
              <>
                {puedeVerVacacion(v.estado) ? (
                  <AccionIcono icono="eye-outline" etiqueta="Ver vacación" onPress={() => setViendo(v)} />
                ) : null}
                {puedeCancelarVacacion(v.estado) ? (
                  <AccionIcono icono="trash-outline" etiqueta="Cancelar vacación" peligro onPress={() => setACancelar(v)} />
                ) : null}
              </>
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
