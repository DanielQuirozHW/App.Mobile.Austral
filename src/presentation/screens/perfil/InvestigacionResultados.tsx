// Perfil > Investigación > Resultados / Impacto I+D (Producción científica, Participación en jornada y Estancias).
// Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/investigacion/resultados-impacto-i+d/{produccion-cientifica,participacion-jornadas,estancias}/page.tsx.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  cargarResultados,
  eliminarEstancia,
  eliminarJornada,
  MSG_ERROR_CARGA_RESULTADOS,
} from '../../../application/perfil/resultadosService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { InfoAlert } from '../../components/InfoAlert';
import { ItemPestania, Pestanias } from '../../components/licencias/Pestanias';
import { ModalEstancia } from '../../components/perfil/ModalEstancia';
import { ModalJornada } from '../../components/perfil/ModalJornada';
import { SeccionProducciones } from '../../components/perfil/SeccionProducciones';
import { SeccionRegistros } from '../../components/perfil/SeccionRegistros';
import { useResultadosStore } from '../../stores/resultadosStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

type Subpagina = 'produccion' | 'jornadas' | 'estancias';

const PESTANIAS: ItemPestania<Subpagina>[] = [
  { clave: 'produccion', etiqueta: 'Producción científica' },
  { clave: 'jornadas', etiqueta: 'Participación en jornada' },
  { clave: 'estancias', etiqueta: 'Estancias' },
];

const TEXTO_PORTAL = 'Click en el icono (ojo) para acceder a la carga/visualización de contenido.';

const INFO: Record<Subpagina, { titulo: string; texto: string }> = {
  produccion: { titulo: 'Producción científica', texto: TEXTO_PORTAL },
  jornadas: { titulo: 'Participación en jornada', texto: TEXTO_PORTAL },
  estancias: { titulo: 'Estancias', texto: TEXTO_PORTAL },
};

const MSG_ELIMINAR_JORNADA = {
  eliminando: 'Procesando...',
  eliminado: 'Participación en jornadas eliminada con éxito',
  errorEliminar: 'Error al eliminar la participación en jornadas',
};

const MSG_ELIMINAR_ESTANCIA = {
  eliminando: 'Procesando...',
  eliminado: 'Estancia eliminada con éxito',
  errorEliminar: 'Error al eliminar la estancia',
};

export const InvestigacionResultados: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const [subpagina, setSubpagina] = useState<Subpagina>('produccion');

  const jornadas = useResultadosStore((s) => s.jornadas);
  const estancias = useResultadosStore((s) => s.estancias);
  const cargando = useResultadosStore((s) => s.cargando);
  const cargado = useResultadosStore((s) => s.cargado);
  const error = useResultadosStore((s) => s.error);

  const recargar = useCallback(() => {
    void cargarResultados();
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  if (!cargado && cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }

  const info = INFO[subpagina];

  return (
    <View style={styles.contenido}>
      <Pestanias items={PESTANIAS} activa={subpagina} onCambiar={setSubpagina} />

      <View style={styles.titulos}>
        <AppText variant="h5">{info.titulo}</AppText>
        <AppText variant="body2" tone="secondary">
          {info.texto}
        </AppText>
      </View>

      {error ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_RESULTADOS}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      {subpagina === 'produccion' ? <SeccionProducciones /> : null}

      {subpagina === 'jornadas' ? (
        <SeccionRegistros
          numero={1}
          titulo="Participación en jornadas, congresos y eventos"
          items={jornadas}
          idDe={(j) => j.id}
          tituloDe={(j) => j.nombre || '—'}
          subtituloDe={(j) => j.tipoActividad?.label || undefined}
          lineasDe={(j) => [
            { label: 'Tipo de participación', valor: j.tipoParticipacion?.label ?? '' },
            { label: 'Lugar', valor: j.lugar },
            { label: 'Fecha', valor: aFechaVisible(j.fecha) },
          ]}
          textoAgregar="Agregar participación"
          textoVacio="Todavía no cargaste participaciones en jornadas, congresos o eventos."
          sustantivoEliminar="esta participación"
          mensajes={MSG_ELIMINAR_JORNADA}
          onEliminar={(j) => eliminarJornada(j.id)}
          renderModal={({ modo, item, onClose }) => <ModalJornada modo={modo} item={item} onClose={onClose} />}
        />
      ) : null}

      {subpagina === 'estancias' ? (
        <SeccionRegistros
          numero={1}
          titulo="Estancias"
          items={estancias}
          idDe={(e) => e.id}
          tituloDe={(e) => e.institucion || '—'}
          subtituloDe={(e) => e.tipoActividad?.label || undefined}
          lineasDe={(e) => [
            { label: 'País', valor: e.pais.label ?? '' },
            { label: 'Fecha de inicio', valor: aFechaVisible(e.fechaInicio) },
            { label: 'Fecha de fin', valor: aFechaVisible(e.fechaFin) },
          ]}
          textoAgregar="Agregar estancia"
          textoVacio="Todavía no cargaste estancias."
          sustantivoEliminar="esta estancia"
          mensajes={MSG_ELIMINAR_ESTANCIA}
          onEliminar={(e) => eliminarEstancia(e.id)}
          renderModal={({ modo, item, onClose }) => <ModalEstancia modo={modo} item={item} onClose={onClose} />}
        />
      ) : null}
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { paddingVertical: spacing.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    contenido: { gap: spacing.lg },
    titulos: { gap: spacing.xs },
    aviso: { gap: spacing.sm },
  });
