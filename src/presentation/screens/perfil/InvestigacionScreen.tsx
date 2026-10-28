// Perfil > Investigación. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/investigacion/*.
// El portal separa Afiliaciones, Actividad I+D y Resultados / Impacto I+D; acá son secciones de una sola pantalla,
// cada una con las pestañas de sus subpáginas. El menú lateral entra directo a cada una con el parámetro de ruta
// `seccion` (decisión 100); sin parámetro abre en Perfil/afiliaciones.
// Etapa actual: Afiliaciones, Actividad I+D y Resultados / Impacto I+D.
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { ItemPestania, Pestanias } from '../../components/licencias/Pestanias';
import { Screen } from '../../components/Screen';
import type { RootStackParams, SeccionInvestigacion } from '../../navigation/tipos';
import { spacing } from '../../utils/responsive';
import { InvestigacionActividad } from './InvestigacionActividad';
import { InvestigacionAfiliaciones } from './InvestigacionAfiliaciones';
import { InvestigacionResultados } from './InvestigacionResultados';

const SECCIONES: ItemPestania<SeccionInvestigacion>[] = [
  { clave: 'afiliaciones', etiqueta: 'Afiliaciones' },
  { clave: 'actividad', etiqueta: 'Actividad I+D' },
  { clave: 'resultados', etiqueta: 'Resultados / Impacto I+D' },
];

export const InvestigacionScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParams, 'Investigacion'>>();
  const [seccion, setSeccion] = useState<SeccionInvestigacion>(route.params?.seccion ?? 'afiliaciones');

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      {/* Nivel de arriba subrayado (Tabs del portal) y subpáginas de cada sección en chips: así no se apilan dos filas iguales. */}
      <Pestanias items={SECCIONES} activa={seccion} onCambiar={setSeccion} estilo="subrayado" />
      {seccion === 'afiliaciones' ? <InvestigacionAfiliaciones /> : null}
      {seccion === 'actividad' ? <InvestigacionActividad /> : null}
      {seccion === 'resultados' ? <InvestigacionResultados /> : null}
    </Screen>
  );
};

// El margen de la pantalla ya lo pone Screen: acá solo el espacio entre bloques.
const styles = StyleSheet.create({
  contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
});
