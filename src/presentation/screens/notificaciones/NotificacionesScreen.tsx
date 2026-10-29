// Notificaciones. Port de Portal-Austral-Dev -> src/app/(dashboard)/notificaciones/page.tsx:
// pestañas Pendientes / Completadas / Todas con su cantidad, filtros "Módulo" y rango de fechas, "Ir" a la sección del
// aviso, "Marcar como leída" y "Marcar todas como leídas" (con confirmación).
// Diferencias de la app mobile (docs/DECISION-UI-MOBILE.md): sin título repetido (ya está en el encabezado), sin botón
// "Actualizar" (se tira para actualizar) y los filtros van plegados detrás de un botón "Filtros".
// Cuando el destino de un aviso todavía no existe en la app (p. ej. Gestión del Desempeño) se muestra un aviso propio
// (AppModal con el tema de la app), no el popup nativo de Android.
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  filtrarNotificaciones,
  resolverDestino,
  type FilaNotificacion,
} from '../../../domain/notificaciones/notificaciones';
import { AppButton } from '../../components/AppButton';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { AppModal } from '../../components/AppModal';
import { AppText } from '../../components/AppText';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { InfoAlert } from '../../components/InfoAlert';
import { Screen } from '../../components/Screen';
import { DateField } from '../../components/form/DateField';
import { Pestanias } from '../../components/licencias/Pestanias';
import { TarjetaNotificacion } from '../../components/notificaciones/TarjetaNotificacion';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import type { RootStackParams } from '../../navigation/tipos';
import { useRolStore } from '../../stores/rolStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';

type PestaniaNotificaciones = 'pendientes' | 'completadas' | 'todas';

/** Aviso informativo de una sola acción ("Entendido"). */
interface AvisoInformativo {
  titulo: string;
  mensaje: string;
  icono: AppIconName;
}

const AVISO_NO_DISPONIBLE: AvisoInformativo = {
  titulo: 'Próximamente',
  mensaje: 'Esta sección todavía se encuentra en construcción. Mientras tanto, podés consultarla desde el portal.',
  icono: 'construct-outline',
};

const AVISO_ENLACE: AvisoInformativo = {
  titulo: 'No se pudo abrir el enlace',
  mensaje: 'Intentá nuevamente en unos instantes.',
  icono: 'alert-circle-outline',
};

const TODOS = '__todos__';

/** "YYYY-MM-DD" con el día de calendario de un Date elegido en el selector (hora del dispositivo). */
const aIso = (fecha: Date | null): string | null => {
  if (!fecha) return null;
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
};

export const NotificacionesScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const role = useRolStore((s) => s.role);
  const { pendientes, completadas, cargando, error, refrescar, marcarLeida, marcarTodas } = useNotificaciones();

  const [pestania, setPestania] = useState<PestaniaNotificaciones>('pendientes');
  const [modulo, setModulo] = useState<string>(TODOS);
  const [desde, setDesde] = useState<Date | null>(null);
  const [hasta, setHasta] = useState<Date | null>(null);
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [marcandoId, setMarcandoId] = useState<string | null>(null);
  const [confirmarTodas, setConfirmarTodas] = useState(false);
  const [marcandoTodas, setMarcandoTodas] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [aviso, setAviso] = useState<AvisoInformativo | null>(null);
  // Se recuerda el último aviso mostrado para que el texto no desaparezca durante la animación de cierre del modal.
  const [ultimoAviso, setUltimoAviso] = useState<AvisoInformativo>(AVISO_NO_DISPONIBLE);

  const mostrarAviso = useCallback((nuevo: AvisoInformativo) => {
    setUltimoAviso(nuevo);
    setAviso(nuevo);
  }, []);

  const todas = useMemo(() => [...pendientes, ...completadas], [pendientes, completadas]);
  const filasDeLaPestania = pestania === 'pendientes' ? pendientes : pestania === 'completadas' ? completadas : todas;

  // Los módulos del filtro salen de las filas de la pestaña (el select del portal lista los valores de la grilla).
  const modulos = useMemo(
    () => Array.from(new Set(filasDeLaPestania.map((f) => f.modulo))).sort((a, b) => a.localeCompare(b, 'es')),
    [filasDeLaPestania],
  );
  const moduloActivo = modulo !== TODOS && modulos.includes(modulo) ? modulo : TODOS;
  const filtrosActivos = (moduloActivo !== TODOS ? 1 : 0) + (desde ? 1 : 0) + (hasta ? 1 : 0);

  const visibles = useMemo(
    () =>
      filtrarNotificaciones(filasDeLaPestania, {
        modulo: moduloActivo === TODOS ? '' : moduloActivo,
        desde: aIso(desde),
        hasta: aIso(hasta),
      }),
    [filasDeLaPestania, moduloActivo, desde, hasta],
  );

  // "Ir" del portal hace router.push(ruta): abre la página con su pestaña / sección / filtro. Acá se pasa lo mismo como
  // parámetros de la pantalla (pestania de Docencia, seccion de Investigación, seccion y tipo de Licencias).
  const irA = useCallback(
    (fila: FilaNotificacion) => {
      const destino = resolverDestino(fila.destino, { esDocente: role === 'docente' });
      if (destino.tipo === 'url') {
        void Linking.openURL(destino.url).catch(() => mostrarAviso(AVISO_ENLACE));
        return;
      }
      if (destino.tipo === 'noDisponible') {
        mostrarAviso(AVISO_NO_DISPONIBLE);
        return;
      }
      switch (destino.nombre) {
        case 'Licencias':
          navigation.navigate('Licencias', { seccion: destino.seccion, tipo: destino.tipoGestion });
          break;
        case 'Docencia':
          navigation.navigate('Docencia', { pestania: destino.pestania });
          break;
        case 'Investigacion':
          navigation.navigate('Investigacion', { seccion: destino.seccion });
          break;
        case 'PlanesDeTrabajo':
          navigation.navigate('PlanesDeTrabajo');
          break;
        default:
          navigation.navigate('Inicio');
      }
    },
    [mostrarAviso, navigation, role],
  );

  const marcarUna = async (fila: FilaNotificacion) => {
    setMarcandoId(fila.id);
    try {
      await marcarLeida(fila.id);
    } finally {
      setMarcandoId(null);
    }
  };

  const confirmarMarcarTodas = async () => {
    setMarcandoTodas(true);
    try {
      await marcarTodas();
      setConfirmarTodas(false);
    } finally {
      setMarcandoTodas(false);
    }
  };

  const actualizar = async () => {
    setActualizando(true);
    try {
      await refrescar();
    } finally {
      setActualizando(false);
    }
  };

  const limpiarFiltros = () => {
    setModulo(TODOS);
    setDesde(null);
    setHasta(null);
  };

  // Spinner de pantalla completa solo mientras no hay nada que mostrar: si se desmontara el scroll durante una
  // actualización (tirar para actualizar), se cortaría el gesto.
  if (cargando && todas.length === 0) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }

  return (
    <Screen scroll onRefresh={() => refrescar()} contentContainerStyle={styles.contenido}>
      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">No se pudieron cargar las notificaciones. Intentá nuevamente.</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={actualizar} loading={actualizando} />
        </View>
      ) : null}

      <Pestanias
        items={[
          { clave: 'pendientes', etiqueta: 'Pendientes', cantidad: pendientes.length },
          { clave: 'completadas', etiqueta: 'Completadas', cantidad: completadas.length },
          { clave: 'todas', etiqueta: 'Todas', cantidad: todas.length },
        ]}
        activa={pestania}
        onCambiar={setPestania}
      />

      {/* Acciones: filtros plegables y marcar todas */}
      <View style={styles.acciones}>
        <Pressable
          onPress={() => setFiltrosAbiertos((valor) => !valor)}
          accessibilityRole="button"
          accessibilityLabel="Filtros"
          accessibilityState={{ expanded: filtrosAbiertos }}
          android_ripple={{ color: globalColors.hairline }}
          style={styles.accion}
        >
          <AppIcon name="options-outline" size={iconSizes.md} color={globalColors.accentPrimary} />
          <AppText variant="subtitle2" tone="primary">
            {filtrosActivos > 0 ? `Filtros (${filtrosActivos})` : 'Filtros'}
          </AppText>
          <AppIcon
            name={filtrosAbiertos ? 'chevron-up' : 'chevron-down'}
            size={iconSizes.sm}
            color={globalColors.accentPrimary}
          />
        </Pressable>

        {pendientes.length > 0 ? (
          <Pressable
            onPress={() => setConfirmarTodas(true)}
            accessibilityRole="button"
            accessibilityLabel="Marcar todas como leídas"
            android_ripple={{ color: globalColors.hairline }}
            style={styles.accion}
          >
            <AppIcon name="checkmark-done-outline" size={iconSizes.md} color={globalColors.accentPrimary} />
            <AppText variant="subtitle2" tone="primary">
              Marcar todas como leídas
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {filtrosAbiertos ? (
        <View style={styles.filtros}>
          <AppText variant="label" tone="secondary">
            Módulo
          </AppText>
          <Pestanias
            items={[{ clave: TODOS, etiqueta: 'Todos' }, ...modulos.map((m) => ({ clave: m, etiqueta: m }))]}
            activa={moduloActivo}
            onCambiar={setModulo}
          />
          <DateField label="Desde" value={desde} onChange={setDesde} maximumDate={hasta ?? undefined} />
          <DateField label="Hasta" value={hasta} onChange={setHasta} minimumDate={desde ?? undefined} />
          {filtrosActivos > 0 ? (
            <AppButton title="Limpiar filtros" variant="secondary" onPress={limpiarFiltros} />
          ) : null}
        </View>
      ) : null}

      {visibles.length === 0 ? (
        <View style={styles.vacio}>
          <AppIcon name="notifications-off-outline" size={iconSizes.xxxl} color={globalColors.textTertiary} />
          <AppText variant="body1" tone="secondary">
            No hay notificaciones en esta pestaña.
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {visibles.map((fila) => (
            <TarjetaNotificacion
              key={`${fila.pendiente ? 'p' : 'c'}-${fila.id}`}
              fila={fila}
              marcando={marcandoId === fila.id}
              onIr={irA}
              onMarcarLeida={marcarUna}
            />
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={confirmarTodas}
        titulo="Marcar todas como leídas"
        textoConfirmar="Marcar todas"
        textoConfirmando="Marcando..."
        confirmando={marcandoTodas}
        onCancelar={() => setConfirmarTodas(false)}
        onConfirmar={confirmarMarcarTodas}
      >
        <AppText variant="body1">
          Se van a marcar como leídas las {pendientes.length} notificaciones pendientes. Se envían de a tandas, así que
          puede demorar unos segundos.
        </AppText>
      </ConfirmDialog>

      {/* Aviso propio: sección que todavía no está en la app (o enlace que no se pudo abrir) */}
      <AppModal
        visible={aviso !== null}
        onClose={() => setAviso(null)}
        variante="centrado"
        scroll={false}
        pie={<AppButton title="Entendido" onPress={() => setAviso(null)} />}
      >
        <View style={styles.avisoCuerpo}>
          <View style={styles.avisoCirculo}>
            <AppIcon name={ultimoAviso.icono} size={iconSizes.xxl} color={globalColors.accentPrimary} />
          </View>
          <AppText variant="h6" style={styles.avisoTexto}>
            {ultimoAviso.titulo}
          </AppText>
          <AppText variant="body1" tone="secondary" style={styles.avisoTexto}>
            {ultimoAviso.mensaje}
          </AppText>
        </View>
      </AppModal>
    </Screen>
  );
};

// El margen de la pantalla ya lo pone Screen: acá solo el espacio entre bloques.
const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
    aviso: { gap: spacing.sm },
    acciones: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: spacing.lg, rowGap: spacing.xs },
    accion: {
      minHeight: platformSpecific.minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.md,
    },
    filtros: {
      gap: spacing.sm,
      padding: spacing.lg,
      backgroundColor: c.card,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: c.border,
    },
    lista: { gap: spacing.md },
    vacio: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl },
    avisoCuerpo: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
    avisoCirculo: {
      width: scale(72),
      height: scale(72),
      borderRadius: scale(36),
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avisoTexto: { textAlign: 'center' },
  });
