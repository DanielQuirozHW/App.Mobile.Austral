// Perfil > Investigación. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/investigacion/*.
// El portal separa Afiliaciones, Actividad I+D y Resultados / Impacto I+D; acá son secciones de una sola pantalla,
// cada una con las pestañas de sus subpáginas.
// Etapa actual: Afiliaciones, Actividad I+D y Resultados / Impacto I+D.
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ItemPestania, Pestanias } from '../../components/licencias/Pestanias';
import { Screen } from '../../components/Screen';
import { spacing } from '../../utils/responsive';
import { InvestigacionActividad } from './InvestigacionActividad';
import { InvestigacionAfiliaciones } from './InvestigacionAfiliaciones';
import { InvestigacionResultados } from './InvestigacionResultados';

type Seccion = 'afiliaciones' | 'actividad' | 'resultados';

const SECCIONES: ItemPestania<Seccion>[] = [
  { clave: 'afiliaciones', etiqueta: 'Afiliaciones' },
  { clave: 'actividad', etiqueta: 'Actividad I+D' },
  { clave: 'resultados', etiqueta: 'Resultados / Impacto I+D' },
];

export const InvestigacionScreen: React.FC = () => {
  const [seccion, setSeccion] = useState<Seccion>('afiliaciones');

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
