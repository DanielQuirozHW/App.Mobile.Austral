// Port de Portal-Austral-Dev -> licencias/licencias/page.tsx: pestañas Ingresadas / Aprobadas / Rechazadas /
// Canceladas, ver detalle, cancelar y solicitar una licencia nueva.
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { cancelarLicencia, cargarModulo } from '../../../application/licencias/licenciasService';
import {
  ESTADOS_LICENCIAS_POR_PESTANIA,
  etiquetaEstadoLicencia,
  puedeCancelarLicencia,
  type PestaniaSolicitudes,
} from '../../../domain/licencias/estados';
import { hoyCrm } from '../../../domain/licencias/fechasCrm';
import type { Licencia } from '../../../domain/licencias/tipos';
import { useLicenciasStore } from '../../stores/licenciasStore';
import { spacing } from '../../utils/responsive';
import { AccionIcono } from '../AccionIcono';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { ConfirmDialog } from '../ConfirmDialog';
import { EstadoChip } from './EstadoChip';
import { ListaPaginada } from './ListaPaginada';
import { ModalSolicitarLicencia } from './ModalSolicitarLicencia';
import { ModalVerLicencia } from './ModalVerLicencia';
import { Pestanias, type ItemPestania } from './Pestanias';
import { TarjetaSolicitud } from './TarjetaSolicitud';

const PESTANIAS: { clave: PestaniaSolicitudes; etiqueta: string }[] = [
  { clave: 'ingresadas', etiqueta: 'Ingresadas' },
  { clave: 'aprobadas', etiqueta: 'Aprobadas' },
  { clave: 'rechazadas', etiqueta: 'Rechazadas' },
  { clave: 'canceladas', etiqueta: 'Canceladas' },
];

export const MisLicenciasSeccion: React.FC = () => {
  const bloque = useLicenciasStore((s) => s.licencias);
  const [pestania, setPestania] = useState<PestaniaSolicitudes>('ingresadas');
  const [solicitando, setSolicitando] = useState(false);
  const [viendo, setViendo] = useState<Licencia | null>(null);
  const [aCancelar, setACancelar] = useState<Licencia | null>(null);
  const [procesando, setProcesando] = useState(false);
  const hoy = hoyCrm();

  const filtradas = useMemo(
    () => bloque.datos.filter((l) => ESTADOS_LICENCIAS_POR_PESTANIA[pestania].includes(l.estado)),
    [bloque.datos, pestania],
  );
  const items = useMemo<ItemPestania<PestaniaSolicitudes>[]>(
    () =>
      PESTANIAS.map((p) => ({
        ...p,
        cantidad: bloque.datos.filter((l) => ESTADOS_LICENCIAS_POR_PESTANIA[p.clave].includes(l.estado)).length,
      })),
    [bloque.datos],
  );

  const confirmarCancelacion = async () => {
    if (!aCancelar) return;
    setProcesando(true);
    await cancelarLicencia(aCancelar.id);
    setProcesando(false);
    setACancelar(null);
  };

  return (
    <View style={styles.seccion}>
      <AppButton title="Solicitar licencia" icon="add-circle-outline" onPress={() => setSolicitando(true)} />
      <Pestanias items={items} activa={pestania} onCambiar={setPestania} />

      <ListaPaginada
        datos={filtradas}
        cargando={bloque.cargando}
        error={bloque.error}
        onReintentar={() => void cargarModulo()}
        keyDe={(l) => l.id}
        renderItem={(l) => (
          <TarjetaSolicitud
            titulo={l.tipoLicencia}
            estado={<EstadoChip estado={l.estado} texto={etiquetaEstadoLicencia(l.estado)} />}
            lineas={[
              { label: 'Fecha de solicitud', valor: l.fechaSolicitud },
              { label: 'Días solicitados', valor: String(l.diasSolicitados) },
              { label: 'Fecha desde', valor: l.fechaDesde },
              { label: 'Fecha hasta', valor: l.fechaHasta },
            ]}
            acciones={
              <>
                <AccionIcono icono="eye-outline" etiqueta="Ver licencia" onPress={() => setViendo(l)} />
                {puedeCancelarLicencia(l.estado, l.desdeIso, hoy) ? (
                  <AccionIcono icono="trash-outline" etiqueta="Cancelar licencia" peligro onPress={() => setACancelar(l)} />
                ) : null}
              </>
            }
          />
        )}
      />

      <ModalSolicitarLicencia visible={solicitando} onClose={() => setSolicitando(false)} />
      <ModalVerLicencia visible={viendo !== null} licencia={viendo} onClose={() => setViendo(null)} />
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
        <AppText variant="body1">¿Desea cancelar la solicitud de licencia seleccionada?</AppText>
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
