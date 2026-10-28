// Plan de Trabajo Anual: lista de planes del docente. Port de Portal-Austral-Dev ->
// src/app/(dashboard)/planes-de-trabajo/page.tsx (solo rol docente).
// Tirar para actualizar vuelve a leer la lista de planes (decisión 98). Sin título repetido: ya está en el encabezado.
// Mientras no terminó el primer intento de lectura se muestra la carga (no "No hay planes"): en el primer cuadro todavía
// no empezó a cargar y se vería un instante el mensaje de lista vacía.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cargarListaDePlanes, MSG_ERROR_CARGA_PTA } from '../../../application/pta/ptaService';
import { PESTANIAS_LISTA, TEXTO_AYUDA_LISTA, type PestaniaLista } from '../../../domain/pta/constantes';
import { fechaUtcVisible } from '../../../domain/pta/fechas';
import { filtrarPlanes } from '../../../domain/pta/resumen';
import { AccionIcono } from '../../components/AccionIcono';
import { AppButton } from '../../components/AppButton';
import { AppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { InfoAlert } from '../../components/InfoAlert';
import { Screen } from '../../components/Screen';
import { EstadoChip } from '../../components/licencias/EstadoChip';
import { Pestanias } from '../../components/licencias/Pestanias';
import { TarjetaSolicitud } from '../../components/licencias/TarjetaSolicitud';
import type { RootStackParams } from '../../navigation/tipos';
import { usePtaStore } from '../../stores/ptaStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { iconSizes, spacing } from '../../utils/responsive';

export const PlanTrabajoScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const planes = usePtaStore((s) => s.planes);
  const cargando = usePtaStore((s) => s.cargando);
  const cargado = usePtaStore((s) => s.cargado);
  const error = usePtaStore((s) => s.error);
  const [pestania, setPestania] = useState<PestaniaLista>('desarrollo');
  const [intentado, setIntentado] = useState(false);

  const recargar = useCallback(() => {
    void Promise.resolve(cargarListaDePlanes())
      .catch(() => undefined)
      .finally(() => setIntentado(true));
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const visibles = useMemo(() => filtrarPlanes(planes, pestania), [planes, pestania]);
  const info = PESTANIAS_LISTA.find((p) => p.clave === pestania)?.info ?? '';

  if (!cargado && (!intentado || cargando)) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }

  return (
    <Screen scroll onRefresh={() => cargarListaDePlanes()} contentContainerStyle={styles.contenido}>
      <InfoAlert tipo="info">{TEXTO_AYUDA_LISTA}</InfoAlert>

      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_PTA}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      <Pestanias
        items={PESTANIAS_LISTA.map((p) => ({ clave: p.clave, etiqueta: p.etiqueta }))}
        activa={pestania}
        onCambiar={setPestania}
      />
      <AppText variant="body2" tone="secondary">
        {info}
      </AppText>

      {visibles.length === 0 ? (
        <View style={styles.vacio}>
          <AppIcon name="clipboard-outline" size={iconSizes.xxxl} color={globalColors.textTertiary} />
          <AppText variant="body1" tone="secondary">
            No hay planes de trabajo en esta pestaña.
          </AppText>
        </View>
      ) : (
        <View style={styles.lista}>
          {visibles.map((plan) => (
            <TarjetaSolicitud
              key={plan.id}
              titulo={`Año ${plan.anio || '—'}`}
              estado={<EstadoChip texto={plan.statuscode.label} />}
              lineas={[
                { label: 'Fecha de presentación', valor: fechaUtcVisible(plan.fechaPresentacion) },
                { label: 'Categoría Docente', valor: plan.categoriaDocente },
                { label: 'Unidad Académica', valor: plan.unidadAcademica },
              ]}
              acciones={
                <AccionIcono
                  icono="eye-outline"
                  etiqueta="Ver plan de trabajo"
                  onPress={() =>
                    navigation.navigate('PlanTrabajoDetalle', {
                      planId: plan.id,
                      // estadoHistorico del portal: true al estar en VIGENTE o HISTÓRICO.
                      historico: pestania !== 'desarrollo',
                    })
                  }
                />
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
};

// El margen de la pantalla ya lo pone Screen: acá solo el espacio entre bloques.
const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
    aviso: { gap: spacing.sm },
    lista: { gap: spacing.md },
    vacio: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxxl },
  });
