// Pantalla del módulo Licencias y vacaciones. Equivale a las páginas licencias/licencias, licencias/vacaciones,
// el calendario y la gestión de solicitudes del equipo (solo para líderes) de Portal-Austral-Dev.
// El portal abre con tarjetas de inicio y después muestra las pestañas; en el celular se va directo a las pestañas.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cargarGestionDelLider, cargarModulo } from '../../../application/licencias/licenciasService';
import { CalendarioSeccion } from '../../components/licencias/CalendarioSeccion';
import { GestionSeccion } from '../../components/licencias/GestionSeccion';
import { MisLicenciasSeccion } from '../../components/licencias/MisLicenciasSeccion';
import { Pestanias, type ItemPestania } from '../../components/licencias/Pestanias';
import { VacacionesSeccion } from '../../components/licencias/VacacionesSeccion';
import type { RootStackParams } from '../../navigation/tipos';
import { useEquipoStore } from '../../stores/equipoStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

type Seccion = 'licencias' | 'vacaciones' | 'calendario' | 'equipo';

export const LicenciasScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParams, 'Licencias'>>();
  const esLider = useEquipoStore((s) => s.esLider.datos);
  const liderCargado = useEquipoStore((s) => s.esLider.cargado);

  const [seccion, setSeccion] = useState<Seccion>(route.params?.seccion ?? 'licencias');
  const [refrescando, setRefrescando] = useState(false);

  const recargar = useCallback(async () => {
    await Promise.all([cargarModulo(), cargarGestionDelLider()]);
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  // Si piden la gestión y la persona no es líder (ya consultado), se vuelve a Mis licencias.
  useEffect(() => {
    if (seccion === 'equipo' && liderCargado && !esLider) setSeccion('licencias');
  }, [seccion, liderCargado, esLider]);

  const items = useMemo<ItemPestania<Seccion>[]>(() => {
    const base: ItemPestania<Seccion>[] = [
      { clave: 'licencias', etiqueta: 'Licencias' },
      { clave: 'vacaciones', etiqueta: 'Vacaciones' },
      { clave: 'calendario', etiqueta: 'Calendario' },
    ];
    // En el portal la pestaña de los líderes se llama "Gestión" (licencias/page.tsx).
    return esLider ? [...base, { clave: 'equipo', etiqueta: 'Gestión' }] : base;
  }, [esLider]);

  const refrescar = async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  };

  return (
    <View style={styles.pantalla}>
      <View style={styles.pestanias}>
        <Pestanias items={items} activa={seccion} onCambiar={setSeccion} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.contenido, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={refrescar}
            tintColor={globalColors.accentPrimary}
            colors={[globalColors.accentPrimary]}
          />
        }
      >
        {seccion === 'licencias' ? <MisLicenciasSeccion /> : null}
        {seccion === 'vacaciones' ? <VacacionesSeccion /> : null}
        {seccion === 'calendario' ? <CalendarioSeccion /> : null}
        {seccion === 'equipo' && esLider ? <GestionSeccion /> : null}
      </ScrollView>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: c.background },
    pestanias: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
    contenido: { padding: spacing.lg, gap: spacing.lg },
  });
