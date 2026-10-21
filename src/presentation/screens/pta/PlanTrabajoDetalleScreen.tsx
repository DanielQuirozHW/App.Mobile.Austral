// Plan de Trabajo Anual: detalle de un plan. Port de Portal-Austral-Dev ->
// planes-de-trabajo/_components/ModalPlanDeTrabajoDocente.tsx (pestañas Datos personales, Observaciones del Sec.
// Académico y Actividad académica con sus 9 pestañas).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  abrirDetalleDePlan,
  MSG_ERROR_CARGA_DETALLE_PTA,
  registrarLecturaDeObservaciones,
} from '../../../application/pta/ptaService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import {
  SUBPESTANIAS,
  type PestaniaPrincipal,
  type SubPestania,
} from '../../../domain/pta/constantes';
import { estadoEditable, mostrarObservaciones, planDeshabilitado } from '../../../domain/pta/resumen';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { AppTextField } from '../../components/AppTextField';
import { InfoAlert } from '../../components/InfoAlert';
import { Screen } from '../../components/Screen';
import { FilaDato } from '../../components/legajo/FilaDato';
import { EstadoChip } from '../../components/licencias/EstadoChip';
import { Pestanias } from '../../components/licencias/Pestanias';
import { ActividadPta } from '../../components/pta/ActividadPta';
import { CajaPta } from '../../components/pta/CajaPta';
import type { RootStackParams } from '../../navigation/tipos';
import { usePtaStore } from '../../stores/ptaStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';

export const PlanTrabajoDetalleScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { params } = useRoute<RouteProp<RootStackParams, 'PlanTrabajoDetalle'>>();
  const { planId, historico } = params;

  const plan = usePtaStore((s) => s.planes.find((p) => p.id === planId));
  const planActualId = usePtaStore((s) => s.planActualId);
  const cargandoDetalle = usePtaStore((s) => s.cargandoDetalle);
  const errorDetalle = usePtaStore((s) => s.errorDetalle);

  const [principal, setPrincipal] = useState<PestaniaPrincipal>('datos');
  const [sub, setSub] = useState<SubPestania>('docencia');

  const cargar = useCallback(() => {
    void abrirDetalleDePlan(planId);
  }, [planId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarPrincipal = async (clave: PestaniaPrincipal) => {
    setPrincipal(clave);
    // Al abrir "Observaciones del Sec. Académico" el portal registra la fecha de lectura.
    if (clave === 'observaciones' && plan) {
      try {
        await registrarLecturaDeObservaciones(plan);
        toast.success('Observaciones leídas');
      } catch (error) {
        toast.error(mensajeDeErrorApi(error, 'Error al editar el plan de trabajo'));
      }
    }
  };

  if (!plan) {
    return (
      <View style={styles.centro}>
        <AppText variant="body2" tone="secondary">
          No se encontró el plan de trabajo.
        </AppText>
      </View>
    );
  }

  if (planActualId !== planId || cargandoDetalle) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }

  const deshabilitado = planDeshabilitado(plan, historico);
  const editable = estadoEditable(plan);

  const itemsPrincipales: Array<{ clave: PestaniaPrincipal; etiqueta: string }> = [
    { clave: 'datos', etiqueta: 'Datos personales' },
    ...(mostrarObservaciones(plan)
      ? [{ clave: 'observaciones' as PestaniaPrincipal, etiqueta: 'Observaciones del Sec. Académico' }]
      : []),
    { clave: 'actividad', etiqueta: 'Actividad académica' },
  ];
  // Si la pestaña de observaciones deja de existir (cambió el estado) se vuelve a la primera.
  const activa = itemsPrincipales.some((i) => i.clave === principal) ? principal : 'datos';

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <View style={styles.titulos}>
        <AppText variant="h5">Plan de Trabajo Anual</AppText>
        <AppText variant="body2" tone="secondary">{`Año ${plan.anio || '—'}`}</AppText>
        <EstadoChip texto={plan.statuscode.label} />
      </View>

      {errorDetalle ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_DETALLE_PTA}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={cargar} />
        </View>
      ) : null}

      <Pestanias items={itemsPrincipales} activa={activa} onCambiar={cambiarPrincipal} />

      {activa === 'datos' ? (
        <View style={styles.bloque}>
          <CajaPta titulo="Identidad docente">
            <FilaDato label="Docente" valor={plan.docente} />
            <FilaDato label="Unidad académica" valor={plan.unidadAcademica} />
            <FilaDato label="Departamento" valor={plan.departamento} />
          </CajaPta>
          <CajaPta titulo="Dedicación horaria">
            <FilaDato label="Categoría docente" valor={plan.categoriaDocente} />
            <FilaDato
              label="Horas dedicación total"
              valor={plan.horasPtaAnterior ? `${plan.horasPtaAnterior} hs / año` : ''}
            />
            <FilaDato
              label="Investigación anual"
              valor={plan.totalHorasInvestigacionAnual ? `${plan.totalHorasInvestigacionAnual} hs` : ''}
            />
            <FilaDato label="Período" valor={plan.anio} />
            <FilaDato label="Estado" valor={plan.statuscode.label} />
          </CajaPta>
          <CajaPta titulo="Investigación e IAE">
            <FilaDato label="Categoría externa investigador" valor={plan.categoriaConicet} />
            <FilaDato label="Perfil IAE" valor={plan.perfilIAE} />
            <FilaDato
              label="Días contratados IAE"
              valor={plan.diasContratados ? `${plan.diasContratados} días` : ''}
            />
          </CajaPta>
          <AppButton title="Continuar a Actividad" icon="arrow-forward-outline" onPress={() => setPrincipal('actividad')} />
        </View>
      ) : null}

      {activa === 'observaciones' ? (
        <CajaPta titulo="Observaciones del Sec. Académico">
          <AppTextField label="Observaciones" value={plan.observaciones} multiline numberOfLines={6} editable={false} />
        </CajaPta>
      ) : null}

      {activa === 'actividad' ? (
        <View style={styles.bloque}>
          <Pestanias items={SUBPESTANIAS.map((s) => ({ clave: s.clave, etiqueta: s.etiqueta }))} activa={sub} onCambiar={setSub} />
          <ActividadPta
            plan={plan}
            subPestania={sub}
            deshabilitado={deshabilitado}
            editable={editable}
            onEnviado={() => navigation.goBack()}
          />
        </View>
      ) : null}
    </Screen>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    contenido: { padding: spacing.lg, gap: spacing.lg },
    titulos: { gap: spacing.xs },
    aviso: { gap: spacing.sm },
    bloque: { gap: spacing.lg },
  });
