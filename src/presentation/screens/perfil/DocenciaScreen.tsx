// Perfil > Docencia. Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/docencia/*/page.tsx (categorización
// docente, nombramientos, docencia y asesoramiento académico). Las subpáginas del portal se muestran como pestañas de
// una sola pantalla; los "Vigentes / Históricos" del portal son dos secciones apiladas. El menú lateral entra directo a
// cada una con el parámetro de ruta `pestania` (decisión 100); sin parámetro abre en Categorización.
// Promoción NO se migra (decisión 100): la pestaña figura, como la entrada del menú del portal, y muestra "En construcción".
// Nombramientos está hecho pero todavía no se habilita (pedido de Daniel): también muestra "En construcción". Para
// habilitarlo se lo saca de PESTANIAS_PROXIMAMENTE (y se quita `enConstruccion` en navigation/modulosMenu.ts).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import {
  cargarDocencia,
  eliminarAsesoramiento,
  eliminarDocenciaExterna,
  eliminarDocenciaUA,
  MSG_ERROR_CARGA_DOCENCIA,
} from '../../../application/perfil/docenciaService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { EnConstruccion } from '../../components/EnConstruccion';
import { InfoAlert } from '../../components/InfoAlert';
import { ItemPestania, Pestanias } from '../../components/licencias/Pestanias';
import { ModalAsesoramiento } from '../../components/perfil/ModalAsesoramiento';
import { ModalDocenciaExterna } from '../../components/perfil/ModalDocenciaExterna';
import { ModalDocenciaUA } from '../../components/perfil/ModalDocenciaUA';
import { ModalLectura } from '../../components/perfil/ModalLectura';
import { SeccionRegistros } from '../../components/perfil/SeccionRegistros';
import { Screen } from '../../components/Screen';
import type { PestaniaDocencia, RootStackParams } from '../../navigation/tipos';
import { useDocenciaStore } from '../../stores/docenciaStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

const PESTANIAS: ItemPestania<PestaniaDocencia>[] = [
  { clave: 'categorizacion', etiqueta: 'Categorización' },
  { clave: 'nombramientos', etiqueta: 'Nombramientos' },
  { clave: 'promocion', etiqueta: 'Promoción' },
  { clave: 'docencia', etiqueta: 'Docencia' },
  { clave: 'asesoramiento', etiqueta: 'Asesoramiento' },
];

/** Pestañas que todavía no se ofrecen: muestran "Próximamente" en lugar de su contenido. */
const PESTANIAS_PROXIMAMENTE: PestaniaDocencia[] = ['nombramientos', 'promocion'];

const INFO: Record<PestaniaDocencia, { titulo: string; texto: string }> = {
  categorizacion: {
    titulo: 'Categorización docente',
    texto: 'Aquí podrá visualizar la información relacionada a la categorización docente vigente.',
  },
  nombramientos: {
    titulo: 'Nombramientos',
    texto: 'Aquí podrá visualizar la información relacionada a los nombramientos docentes.',
  },
  promocion: {
    titulo: 'Promoción',
    texto: 'Aquí podrá visualizar la información relacionada a las promociones docentes.',
  },
  docencia: {
    titulo: 'Docencia',
    texto: 'Aquí podrá visualizar la información relacionada a la Docencia Universidad Austral.',
  },
  asesoramiento: {
    titulo: 'Asesoramiento académico',
    texto: 'Aquí podrá visualizar la información relacionada al asesoramiento académico.',
  },
};

const AYUDA_BACK_OFFICE =
  'La información de este apartado surge de forma automática, es cargada y actualizada desde el back office. Cualquier duda comunicarse con el referente académico de su Unidad.';

export const DocenciaScreen: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const route = useRoute<RouteProp<RootStackParams, 'Docencia'>>();
  const [subpagina, setSubpagina] = useState<PestaniaDocencia>(route.params?.pestania ?? 'categorizacion');

  const categorizacionVigente = useDocenciaStore((s) => s.categorizacionVigente);
  const categorizacionHistorica = useDocenciaStore((s) => s.categorizacionHistorica);
  const nombramientosVigentes = useDocenciaStore((s) => s.nombramientosVigentes);
  const nombramientosHistoricos = useDocenciaStore((s) => s.nombramientosHistoricos);
  const docenciasUA = useDocenciaStore((s) => s.docenciasUA);
  const docenciasExternas = useDocenciaStore((s) => s.docenciasExternas);
  const asesoramientos = useDocenciaStore((s) => s.asesoramientos);
  const cargando = useDocenciaStore((s) => s.cargando);
  const cargado = useDocenciaStore((s) => s.cargado);
  const error = useDocenciaStore((s) => s.error);

  const recargar = useCallback(() => {
    void cargarDocencia();
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
  const enConstruccion = PESTANIAS_PROXIMAMENTE.includes(subpagina);

  return (
    <Screen scroll contentContainerStyle={styles.contenido}>
      <Pestanias items={PESTANIAS} activa={subpagina} onCambiar={setSubpagina} />

      {enConstruccion ? (
        <EnConstruccion titulo={info.titulo} ubicacion="Perfil › Docencia" compacto />
      ) : (
        <View style={styles.titulos}>
          <AppText variant="h6">{info.titulo}</AppText>
          <AppText variant="body2" tone="secondary">
            {info.texto}
          </AppText>
        </View>
      )}

      {error && !enConstruccion ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_DOCENCIA}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      {subpagina === 'categorizacion' ? (
        <>
          <SeccionRegistros
            numero={1}
            titulo="Categorización docente vigente"
            ayuda={AYUDA_BACK_OFFICE}
            items={categorizacionVigente}
            idDe={(c) => c.id}
            tituloDe={(c) => c.categoriaDocente || '—'}
            subtituloDe={(c) => c.unidadAcademica || undefined}
            lineasDe={(c) => [
              { label: 'Tipo de carrera docente', valor: c.tipoCarrera },
              { label: 'Nivel', valor: c.nivel },
              { label: 'Agrupador de categorías', valor: c.agrupador },
              { label: 'Fecha de inicio de categoría', valor: c.fechaInicio },
            ]}
            textoAgregar=""
            soloLectura
            textoVacio="No hay una categorización docente vigente."
            renderModal={({ item, onClose }) =>
              item ? (
                <ModalLectura
                  titulo="Categorización docente vigente"
                  subtitulo="Información de la categorización docente vigente"
                  onClose={onClose}
                  filas={[
                    { label: 'Unidad Académica de pertenencia', valor: item.unidadAcademica },
                    { label: 'Tipo de carrera docente', valor: item.tipoCarrera },
                    { label: 'Categoría docente', valor: item.categoriaDocente },
                    { label: 'Nivel', valor: item.nivel },
                    { label: 'Agrupador de categorías', valor: item.agrupador },
                    { label: 'Fecha de inicio de categoría', valor: item.fechaInicio },
                  ]}
                />
              ) : null
            }
          />
          <SeccionRegistros
            numero={2}
            titulo="Categorización docente histórica"
            ayuda={AYUDA_BACK_OFFICE}
            items={categorizacionHistorica}
            idDe={(c) => c.id}
            tituloDe={(c) => c.categoriaDocente || '—'}
            subtituloDe={(c) => c.unidadAcademica || undefined}
            lineasDe={(c) => [
              { label: 'Fecha de inicio de categoría', valor: c.fechaInicio },
              { label: 'Fecha de fin de categoría', valor: c.fechaFin },
              { label: 'Dedicación', valor: c.dedicacion },
            ]}
            textoAgregar=""
            soloLectura
            textoVacio="No hay categorizaciones históricas."
            renderModal={({ item, onClose }) =>
              item ? (
                <ModalLectura
                  titulo="Histórico categorías"
                  subtitulo="Información del histórico de categorías"
                  onClose={onClose}
                  filas={[
                    { label: 'Unidad Académica de pertenencia', valor: item.unidadAcademica },
                    { label: 'Categoría docente', valor: item.categoriaDocente },
                    { label: 'Fecha de inicio', valor: item.fechaInicio },
                    { label: 'Fecha de fin', valor: item.fechaFin },
                    { label: 'Dedicación', valor: item.dedicacion },
                  ]}
                />
              ) : null
            }
          />
        </>
      ) : null}

      {subpagina === 'nombramientos' && !enConstruccion ? (
        <>
          <SeccionRegistros
            numero={1}
            titulo="Nombramientos aprobados / vigentes"
            ayuda={AYUDA_BACK_OFFICE}
            items={nombramientosVigentes}
            idDe={(n) => n.id}
            tituloDe={(n) => n.categoria || '—'}
            subtituloDe={(n) => n.unidadAcademica || undefined}
            lineasDe={(n) => [
              { label: 'Condición', valor: n.condicion },
              { label: 'Fecha de nombramiento', valor: n.fechaNombramiento },
              { label: 'Duración / Vigencia en años', valor: n.duracion },
              { label: 'Resolución', valor: n.resolucion },
              { label: 'Estado', valor: n.estado },
              { label: 'Ciclo lectivo', valor: n.cicloLectivo },
            ]}
            textoAgregar=""
            soloLectura
            textoVacio="No hay nombramientos vigentes."
            renderModal={({ item, onClose }) =>
              item ? (
                <ModalLectura
                  titulo="Nombramiento docente"
                  subtitulo="Información del nombramiento docente"
                  onClose={onClose}
                  filas={[
                    { label: 'Condición', valor: item.condicion },
                    { label: 'Categoría', valor: item.categoria },
                    { label: 'Unidad Académica de pertenencia', valor: item.unidadAcademica },
                    { label: 'Fecha de nombramiento', valor: item.fechaNombramiento },
                    { label: 'Duración / Vigencia en años', valor: item.duracion },
                    { label: 'Resolución', valor: item.resolucion },
                  ]}
                />
              ) : null
            }
          />
          <SeccionRegistros
            numero={2}
            titulo="Nombramientos históricos"
            ayuda={AYUDA_BACK_OFFICE}
            items={nombramientosHistoricos}
            idDe={(n) => n.id}
            tituloDe={(n) => n.categoria || '—'}
            subtituloDe={(n) => n.unidadAcademica || undefined}
            lineasDe={(n) => [
              { label: 'Condición', valor: n.condicion },
              { label: 'Fecha de nombramiento', valor: n.fechaNombramiento },
              { label: 'Duración / Vigencia en años', valor: n.duracion },
              { label: 'Resolución', valor: n.resolucion },
              { label: 'Estado', valor: n.estado },
              { label: 'Ciclo lectivo', valor: n.cicloLectivo },
            ]}
            textoAgregar=""
            soloLectura
            textoVacio="No hay nombramientos históricos."
            renderModal={({ item, onClose }) =>
              item ? (
                <ModalLectura
                  titulo="Nombramiento docente"
                  subtitulo="Información del nombramiento docente"
                  onClose={onClose}
                  filas={[
                    { label: 'Condición', valor: item.condicion },
                    { label: 'Categoría', valor: item.categoria },
                    { label: 'Unidad Académica de pertenencia', valor: item.unidadAcademica },
                    { label: 'Fecha de nombramiento', valor: item.fechaNombramiento },
                    { label: 'Duración / Vigencia en años', valor: item.duracion },
                    { label: 'Resolución', valor: item.resolucion },
                  ]}
                />
              ) : null
            }
          />
        </>
      ) : null}

      {subpagina === 'docencia' ? (
        <>
          <SeccionRegistros
            numero={1}
            titulo="Docencia Universidad Austral"
            items={docenciasUA}
            idDe={(d) => d.id}
            tituloDe={(d) => d.materia || '—'}
            subtituloDe={(d) => d.carrera || undefined}
            lineasDe={(d) => [
              { label: 'Unidad Académica', valor: d.unidadAcademica.label ?? '' },
              { label: 'Nivel', valor: d.nivel.label ?? '' },
              { label: 'Régimen de dictado', valor: d.regimen.label ?? '' },
              { label: 'Dedicación total', valor: `${d.dedicacion} ${d.unidadMedida.label ?? ''}`.trim() },
              { label: 'Modalidad de dictado', valor: d.modalidad.label ?? '' },
              { label: 'Fecha de inicio', valor: aFechaVisible(d.fechaInicio) },
              { label: 'Fecha de fin', valor: aFechaVisible(d.fechaFin) },
            ]}
            textoAgregar="Agregar docencia"
            textoVacio="Todavía no cargaste docencias en la Universidad Austral."
            sustantivoEliminar="esta docencia"
            mensajes={{
              eliminando: 'Eliminando docencia...',
              eliminado: 'Docencia eliminada con éxito.',
              errorEliminar: 'Error al eliminar la docencia.',
            }}
            onEliminar={(d) => eliminarDocenciaUA(d.id)}
            renderModal={({ modo, item, onClose }) => <ModalDocenciaUA modo={modo} item={item} onClose={onClose} />}
          />
          <SeccionRegistros
            numero={2}
            titulo="Docencia externa Universidad Austral"
            items={docenciasExternas}
            idDe={(d) => d.id}
            tituloDe={(d) => d.asignatura || '—'}
            subtituloDe={(d) => d.carrera || undefined}
            lineasDe={(d) => [
              { label: 'Institución', valor: d.institucion.label ?? '' },
              { label: 'Unidad Académica / Facultad', valor: d.unidadAcademica },
              { label: 'Cargo', valor: d.cargo.label ?? '' },
              { label: 'Nivel', valor: d.nivel.label ?? '' },
              { label: 'Régimen de dictado', valor: d.regimen.label ?? '' },
              { label: 'Dedicación horaria', valor: d.dedicacionHoraria },
              { label: 'Dedicación', valor: d.dedicacion.label ?? '' },
              { label: 'Fecha de inicio', valor: aFechaVisible(d.fechaInicio) },
              { label: 'Fecha de fin', valor: aFechaVisible(d.fechaFin) },
            ]}
            textoAgregar="Agregar docencia externa"
            textoVacio="Todavía no cargaste docencias externas."
            sustantivoEliminar="esta docencia"
            mensajes={{
              eliminando: 'Eliminando docencia...',
              eliminado: 'Docencia eliminada con éxito.',
              errorEliminar: 'Error al eliminar la docencia.',
            }}
            onEliminar={(d) => eliminarDocenciaExterna(d.id)}
            renderModal={({ modo, item, onClose }) => (
              <ModalDocenciaExterna modo={modo} item={item} onClose={onClose} />
            )}
          />
        </>
      ) : null}

      {subpagina === 'asesoramiento' ? (
        <SeccionRegistros
          numero={1}
          titulo="Asesoramiento Académico"
          items={asesoramientos}
          idDe={(a) => a.id}
          tituloDe={(a) => a.unidadAcademica.label || '—'}
          subtituloDe={(a) => (a.anio ? `Año ${a.anio}` : undefined)}
          lineasDe={(a) => [{ label: 'Cantidad de alumnos asignados', valor: a.cantidadAlumnos }]}
          textoAgregar="Agregar asesoramiento"
          textoVacio="Todavía no cargaste asesoramientos académicos."
          sustantivoEliminar="este asesoramiento"
          mensajes={{
            eliminando: 'Eliminando asesoramiento académico...',
            eliminado: 'Asesoramiento académico eliminado con éxito.',
            errorEliminar: 'Error al eliminar el asesoramiento académico.',
          }}
          onEliminar={(a) => eliminarAsesoramiento(a.id)}
          renderModal={({ modo, item, onClose }) => <ModalAsesoramiento modo={modo} item={item} onClose={onClose} />}
        />
      ) : null}
    </Screen>
  );
};

// El margen de la pantalla ya lo pone Screen: acá solo el espacio entre bloques.
const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    contenido: { gap: spacing.lg, paddingBottom: spacing.xxxl },
    titulos: { gap: spacing.xs },
    aviso: { gap: spacing.sm },
  });
