// Perfil > Investigación. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/investigacion/*.
// El portal separa Afiliaciones, Actividad I+D y Resultados / Impacto I+D; acá son secciones de una sola pantalla,
// cada una con las pestañas de sus subpáginas.
// Etapa actual: Afiliaciones y Actividad I+D (financiamientos y formación de RRHH).
import React, { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ItemPestania, Pestanias } from '../../components/licencias/Pestanias';
import { Screen } from '../../components/Screen';
import { spacing } from '../../utils/responsive';
import { InvestigacionActividad } from './InvestigacionActividad';
import { InvestigacionAfiliaciones } from './InvestigacionAfiliaciones';

type Seccion = 'afiliaciones' | 'actividad';

const SECCIONES: ItemPestania<Seccion>[] = [
  { clave: 'afiliaciones', etiqueta: 'Afiliaciones' },
  { clave: 'actividad', etiqueta: 'Actividad I+D' },
];

export const InvestigacionScreen: React.FC = () => {
  const [seccion, setSeccion] = useState<Seccion>('afiliaciones');
  const styles = useMemo(() => createStyles(), []);

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <Pestanias items={SECCIONES} activa={seccion} onCambiar={setSeccion} />
      {seccion === 'afiliaciones' ? <InvestigacionAfiliaciones /> : null}
      {seccion === 'actividad' ? <InvestigacionActividad /> : null}
    </Screen>
  );
};

const createStyles = () =>
  StyleSheet.create({
    contenido: { padding: spacing.lg, gap: spacing.lg },
  });
