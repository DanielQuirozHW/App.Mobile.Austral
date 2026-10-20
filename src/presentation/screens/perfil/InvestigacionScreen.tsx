// Perfil > Investigación. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/investigacion/*.
// El portal separa Afiliaciones, Actividad I+D y Resultados / Impacto I+D; acá son secciones de una sola pantalla,
// cada una con las pestañas de sus subpáginas.
// Etapa actual: Afiliaciones, Actividad I+D y Resultados / Impacto I+D.
import React, { useMemo, useState } from 'react';
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
  const styles = useMemo(() => createStyles(), []);

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <Pestanias items={SECCIONES} activa={seccion} onCambiar={setSeccion} />
      {seccion === 'afiliaciones' ? <InvestigacionAfiliaciones /> : null}
      {seccion === 'actividad' ? <InvestigacionActividad /> : null}
      {seccion === 'resultados' ? <InvestigacionResultados /> : null}
    </Screen>
  );
};

const createStyles = () =>
  StyleSheet.create({
    contenido: { padding: spacing.lg, gap: spacing.lg },
  });
