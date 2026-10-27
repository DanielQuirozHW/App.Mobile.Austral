// Port de Portal-Austral-Dev -> GestionSolicitudes (columnasGestionSolicitudes), useSolicitudesEquipo y VacacionesEquipoPendientes.
// Licencias y vacaciones del equipo en una sola lista, con filtros por tipo y colaborador, y la pestaña de días pendientes.
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { cargarGestionDelLider } from '../../../application/licencias/licenciasService';
import {
  ESTADOS_GESTION,
  ESTADOS_LICENCIA_A_RESPONDER,
  ESTADO,
  etiquetaEstadoLicencia,
} from '../../../domain/licencias/estados';
import type { Licencia, SolicitudDeEquipo } from '../../../domain/licencias/tipos';
import { useAuthStore } from '../../stores/authStore';
import { useEquipoStore } from '../../stores/equipoStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { Etiqueta } from '../Etiqueta';
import { EstadoChip } from './EstadoChip';
import { ListaPaginada } from './ListaPaginada';
import { ModalAprobarVacacion } from './ModalAprobarVacacion';
import { ModalLicenciaEquipo } from './ModalLicenciaEquipo';
import { ModalVerVacacion, detalleDeSolicitud, type DetalleVacacion } from './ModalVerVacacion';
import { Pestanias, type ItemPestania } from './Pestanias';
import { TarjetaSolicitud } from './TarjetaSolicitud';

type PestaniaGestion = 'ingresadas' | 'aprobadas' | 'rechazadas' | 'pendientes';
type FiltroTipo = 'todos' | 'Licencia' | 'Vacaciones';

interface FilaGestion {
  key: string;
  tipo: 'Licencia' | 'Vacaciones';
  colaborador: string;
  concepto: string;
  dias: number;
  desde: string;
  hasta: string;
  estado: number;
  estadoLabel: string;
  licencia?: Licencia;
  solicitud?: SolicitudDeEquipo;
}

const FILTROS_TIPO: ItemPestania<FiltroTipo>[] = [
  { clave: 'todos', etiqueta: 'Todos' },
  { clave: 'Licencia', etiqueta: 'Licencias' },
  { clave: 'Vacaciones', etiqueta: 'Vacaciones' },
];

const normalizar = (texto: string): string =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const GestionSeccion: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const empleadoId = useAuthStore((s) => s.user?.empleadoid);
  const licencias = useEquipoStore((s) => s.licencias);
  const vacaciones = useEquipoStore((s) => s.vacaciones);
  const pendientes = useEquipoStore((s) => s.pendientes);

  const [pestania, setPestania] = useState<PestaniaGestion>('ingresadas');
  const [tipo, setTipo] = useState<FiltroTipo>('todos');
  const [colaborador, setColaborador] = useState('');
  const [licenciaAbierta, setLicenciaAbierta] = useState<Licencia | null>(null);
  const [vacacionAResponder, setVacacionAResponder] = useState<SolicitudDeEquipo | null>(null);
  const [vacacionVista, setVacacionVista] = useState<DetalleVacacion | null>(null);

  const filas = useMemo<FilaGestion[]>(() => {
    // useSolicitudesEquipo del portal rotula licencias y vacaciones con etiquetaEstadoLicencia.
    const deLicencias = licencias.datos.map<FilaGestion>((l) => ({
      key: `licencia-${l.id}`,
      tipo: 'Licencia',
      colaborador: l.empleado,
      concepto: l.tipoLicencia,
      dias: l.diasSolicitados,
      desde: l.fechaDesde,
      hasta: l.fechaHasta,
      estado: l.estado,
      estadoLabel: etiquetaEstadoLicencia(l.estado),
      licencia: l,
    }));
    const deVacaciones = vacaciones.datos.map<FilaGestion>((s) => ({
      key: `vacaciones-${s.id}`,
      tipo: 'Vacaciones',
      colaborador: s.empleadoName,
      concepto: s.tipoDeLicencia.label || 'VACACIONES',
      dias: s.diasSolicitados,
      desde: s.fechaDesde,
      hasta: s.fechaHasta,
      estado: s.estado,
      estadoLabel: etiquetaEstadoLicencia(s.estado),
      solicitud: s,
    }));
    return [...deLicencias, ...deVacaciones];
  }, [licencias.datos, vacaciones.datos]);

  const items = useMemo<ItemPestania<PestaniaGestion>[]>(
    () => [
      { clave: 'ingresadas', etiqueta: 'Ingresadas', cantidad: filas.filter((f) => ESTADOS_GESTION.ingresadas.includes(f.estado)).length },
      { clave: 'aprobadas', etiqueta: 'Aprobadas', cantidad: filas.filter((f) => ESTADOS_GESTION.aprobadas.includes(f.estado)).length },
      { clave: 'rechazadas', etiqueta: 'Rechazadas', cantidad: filas.filter((f) => ESTADOS_GESTION.rechazadas.includes(f.estado)).length },
      { clave: 'pendientes', etiqueta: 'Días pendientes', cantidad: pendientes.datos.length },
    ],
    [filas, pendientes.datos.length],
  );

  const buscado = normalizar(colaborador.trim());
  const visibles = useMemo(() => {
    if (pestania === 'pendientes') return [];
    return filas.filter(
      (f) =>
        ESTADOS_GESTION[pestania].includes(f.estado) &&
        (tipo === 'todos' || f.tipo === tipo) &&
        (!buscado || normalizar(f.colaborador).includes(buscado)),
    );
  }, [filas, pestania, tipo, buscado]);

  const pendientesVisibles = useMemo(
    () => pendientes.datos.filter((p) => !buscado || normalizar(p.empleado).includes(buscado)),
    [pendientes.datos, buscado],
  );

  // Licencia: responde quien figura como aprobador 1 de la solicitud (idAprobador1) y solo en los estados a responder.
  // Vacaciones: RowOptionsVacacionEquipo del portal ofrece Responder en todas las filas con estado Solicitada
  // (la bandeja ya viene filtrada al equipo del líder).
  const sePuedeResponder = (fila: FilaGestion): boolean => {
    if (fila.tipo === 'Licencia') {
      return (
        !!empleadoId &&
        fila.licencia?.idAprobador1 === empleadoId &&
        ESTADOS_LICENCIA_A_RESPONDER.includes(fila.estado)
      );
    }
    return fila.estado === ESTADO.SOLICITADA;
  };

  const abrir = (fila: FilaGestion) => {
    if (fila.tipo === 'Licencia' && fila.licencia) {
      setLicenciaAbierta(fila.licencia);
      return;
    }
    if (fila.solicitud) {
      if (sePuedeResponder(fila)) setVacacionAResponder(fila.solicitud);
      else setVacacionVista(detalleDeSolicitud(fila.solicitud));
    }
  };

  const reintentar = () => void cargarGestionDelLider();

  return (
    <View style={styles.seccion}>
      <View>
        <AppText variant="h6">Gestión de Solicitudes</AppText>
        <AppText variant="body2" tone="secondary">
          Revisá y aprobá las solicitudes de licencias y vacaciones de tu equipo.
        </AppText>
      </View>

      <Pestanias items={items} activa={pestania} onCambiar={setPestania} />
      {pestania !== 'pendientes' ? <Pestanias items={FILTROS_TIPO} activa={tipo} onCambiar={setTipo} /> : null}
      <AppTextField
        label="Colaborador"
        value={colaborador}
        onChangeText={setColaborador}
        placeholder="Buscar por nombre"
        autoCorrect={false}
      />

      {pestania === 'pendientes' ? (
        <ListaPaginada
          datos={pendientesVisibles}
          cargando={pendientes.cargando}
          error={pendientes.error}
          onReintentar={reintentar}
          keyDe={(p) => p.id}
          renderItem={(p) => (
            <TarjetaSolicitud
              titulo={p.empleado}
              lineas={[
                { label: 'Período', valor: p.periodo },
                { label: 'Días pendientes', valor: p.diasPendientes },
                { label: 'Fecha desde', valor: p.fechaDesde },
                { label: 'Fecha hasta', valor: p.fechaHasta },
              ]}
            />
          )}
        />
      ) : (
        <ListaPaginada
          datos={visibles}
          cargando={licencias.cargando || vacaciones.cargando}
          error={licencias.error || vacaciones.error}
          onReintentar={reintentar}
          keyDe={(f) => f.key}
          renderItem={(f) => (
            <TarjetaSolicitud
              titulo={f.colaborador}
              subtitulo={f.concepto}
              estado={
                <View style={styles.chips}>
                  <Etiqueta texto={f.tipo === 'Vacaciones' ? 'Vacaciones' : 'Licencia'} tipo={f.tipo === 'Vacaciones' ? 'advertencia' : 'info'} />
                  <EstadoChip texto={f.estadoLabel} />
                </View>
              }
              lineas={[
                { label: 'Días solicitados', valor: String(f.dias) },
                { label: 'Fecha desde', valor: f.desde },
                { label: 'Fecha hasta', valor: f.hasta },
              ]}
              acciones={
                <AppButton
                  title={sePuedeResponder(f) ? 'Responder' : 'Ver'}
                  variant={sePuedeResponder(f) ? 'primary' : 'secondary'}
                  onPress={() => abrir(f)}
                />
              }
            />
          )}
        />
      )}

      <ModalLicenciaEquipo visible={licenciaAbierta !== null} licencia={licenciaAbierta} onClose={() => setLicenciaAbierta(null)} />
      <ModalAprobarVacacion visible={vacacionAResponder !== null} solicitud={vacacionAResponder} onClose={() => setVacacionAResponder(null)} />
      <ModalVerVacacion visible={vacacionVista !== null} detalle={vacacionVista} onClose={() => setVacacionVista(null)} />
    </View>
  );
};

const createStyles = (_c: ColorTokens) =>
  StyleSheet.create({
    seccion: { gap: spacing.lg },
    chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  });
