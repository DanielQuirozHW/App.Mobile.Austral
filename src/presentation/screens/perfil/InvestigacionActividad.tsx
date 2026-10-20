// Perfil > Investigación > Actividad I+D (Proyectos de investigación, Financiamientos y Formación de RRHH).
// Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/investigacion/actividad-i+d/{proyectos-investigacion,financiamientos,formacion-rrhh}/page.tsx.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  cargarActividad,
  eliminarDireccion,
  eliminarFinanciamientoExterno,
  eliminarFinanciamientoPropio,
  eliminarTesista,
  MSG_ERROR_CARGA_ACTIVIDAD,
} from '../../../application/perfil/actividadService';
import { cargarProyectos, MSG_ERROR_CARGA_PROYECTOS } from '../../../application/perfil/proyectosService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { montoVisible } from '../../../domain/perfil/financiamientos';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { InfoAlert } from '../../components/InfoAlert';
import { ItemPestania, Pestanias } from '../../components/licencias/Pestanias';
import { ModalDireccion } from '../../components/perfil/ModalDireccion';
import { ModalFinanciamientoExterno } from '../../components/perfil/ModalFinanciamientoExterno';
import { ModalFinanciamientoPropio } from '../../components/perfil/ModalFinanciamientoPropio';
import { ModalTesista } from '../../components/perfil/ModalTesista';
import { SeccionProyectos } from '../../components/perfil/SeccionProyectos';
import { SeccionRegistros } from '../../components/perfil/SeccionRegistros';
import { useActividadStore } from '../../stores/actividadStore';
import { useProyectosStore } from '../../stores/proyectosStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

type Subpagina = 'proyectos' | 'financiamientos' | 'formacion';

const PESTANIAS: ItemPestania<Subpagina>[] = [
  { clave: 'proyectos', etiqueta: 'Proyectos de investigación' },
  { clave: 'financiamientos', etiqueta: 'Financiamientos' },
  { clave: 'formacion', etiqueta: 'Formación de RRHH' },
];

const INFO: Record<Subpagina, { titulo: string; texto: string }> = {
  proyectos: {
    titulo: 'Proyectos de investigación',
    texto: 'Aquí podrá visualizar la información relacionada a los proyectos de investigación.',
  },
  financiamientos: {
    titulo: 'Financiamientos',
    texto: 'Aquí podrá visualizar la información relacionada a los financiamientos y subsidios.',
  },
  formacion: {
    titulo: 'Formación de recursos humanos',
    texto: 'Aquí podrá visualizar la información relacionada a la formación de recursos humanos.',
  },
};

const MSG_ELIMINAR_FINANCIAMIENTO = {
  eliminando: 'Eliminando financiamiento...',
  eliminado: 'Financiamiento eliminado con éxito',
  errorEliminar: 'Error al eliminar Financiamiento',
};

const MSG_ELIMINAR_EXTERNO = {
  eliminando: 'Eliminando financiamiento...',
  eliminado: 'Financiamiento externo eliminado con éxito',
  errorEliminar: 'Error al eliminar Financiamiento externo',
};

const MSG_ELIMINAR_TESISTA = {
  eliminando: 'Eliminando formación...',
  eliminado: 'Formación tesista eliminada con éxito',
  errorEliminar: 'Error al eliminar la formación tesista',
};

const MSG_ELIMINAR_DIRECCION = {
  eliminando: 'Eliminando formación...',
  eliminado: 'Investigadores becarios eliminados con éxito',
  errorEliminar: 'Error al eliminar los investigadores becarios',
};

export const InvestigacionActividad: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const [subpagina, setSubpagina] = useState<Subpagina>('proyectos');

  const propios = useActividadStore((s) => s.propios);
  const externos = useActividadStore((s) => s.externos);
  const tesistas = useActividadStore((s) => s.tesistas);
  const direcciones = useActividadStore((s) => s.direcciones);
  const cargando = useActividadStore((s) => s.cargando);
  const cargado = useActividadStore((s) => s.cargado);
  const error = useActividadStore((s) => s.error);

  const proyectosCargando = useProyectosStore((s) => s.cargando);
  const proyectosCargado = useProyectosStore((s) => s.cargado);
  const proyectosError = useProyectosStore((s) => s.error);

  const recargarActividad = useCallback(() => {
    void cargarActividad();
  }, []);

  const recargarProyectos = useCallback(() => {
    void cargarProyectos();
  }, []);

  useEffect(() => {
    recargarActividad();
    recargarProyectos();
  }, [recargarActividad, recargarProyectos]);

  const esProyectos = subpagina === 'proyectos';
  const primeraCarga = esProyectos ? !proyectosCargado && proyectosCargando : !cargado && cargando;

  if (primeraCarga) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
      </View>
    );
  }

  const info = INFO[subpagina];
  const hayError = esProyectos ? proyectosError : error;

  return (
    <View style={styles.contenido}>
      <Pestanias items={PESTANIAS} activa={subpagina} onCambiar={setSubpagina} />

      <View style={styles.titulos}>
        <AppText variant="h5">{info.titulo}</AppText>
        <AppText variant="body2" tone="secondary">
          {info.texto}
        </AppText>
      </View>

      {hayError ? (
        <View style={styles.aviso}>
          <InfoAlert tipo="error">{esProyectos ? MSG_ERROR_CARGA_PROYECTOS : MSG_ERROR_CARGA_ACTIVIDAD}</InfoAlert>
          <AppButton
            title="Reintentar"
            variant="secondary"
            onPress={esProyectos ? recargarProyectos : recargarActividad}
            loading={esProyectos ? proyectosCargando : cargando}
          />
        </View>
      ) : null}

      {subpagina === 'proyectos' ? <SeccionProyectos /> : null}

      {subpagina === 'financiamientos' ? (
        <>
          <SeccionRegistros
            numero={1}
            titulo="Financiamiento propio de la UA"
            items={propios}
            idDe={(f) => f.id}
            tituloDe={(f) => f.nombre || '—'}
            subtituloDe={(f) => f.estado?.label || undefined}
            lineasDe={(f) => [
              { label: 'Rol', valor: f.rol?.label ?? '' },
              { label: 'Tipo de financiamiento', valor: f.tipo?.label ?? '' },
              { label: 'Modalidad', valor: f.modalidad?.label ?? '' },
              { label: 'Monto', valor: montoVisible(f.moneda, f.montoFormato, f.monto) },
              { label: 'Fecha de inicio', valor: aFechaVisible(f.fechaInicio) },
              { label: 'Fecha de fin', valor: aFechaVisible(f.fechaFin) },
              { label: 'Fecha de otorgamiento', valor: aFechaVisible(f.fechaOtorgamiento) },
            ]}
            textoAgregar="Agregar financiamiento propio"
            textoVacio="Todavía no cargaste financiamientos propios de la UA."
            sustantivoEliminar="este financiamiento"
            mensajes={MSG_ELIMINAR_FINANCIAMIENTO}
            onEliminar={(f) => eliminarFinanciamientoPropio(f.id)}
            renderModal={({ modo, item, onClose }) => (
              <ModalFinanciamientoPropio modo={modo} item={item} onClose={onClose} />
            )}
          />
          <SeccionRegistros
            numero={2}
            titulo="Financiamiento externo a la UA"
            items={externos}
            idDe={(f) => f.id}
            tituloDe={(f) => f.nombre || '—'}
            subtituloDe={(f) => f.estado?.label || undefined}
            lineasDe={(f) => [
              { label: 'Rol', valor: f.rol?.label ?? '' },
              { label: 'Destino del financiamiento', valor: f.destino?.label ?? '' },
              { label: 'Institución otorgante', valor: f.institucion },
              { label: 'Monto', valor: montoVisible(f.moneda, f.montoFormato, f.monto) },
              { label: 'Fecha de inicio', valor: aFechaVisible(f.fechaInicio) },
              { label: 'Fecha de fin', valor: aFechaVisible(f.fechaFin) },
              { label: 'Fecha de otorgamiento', valor: aFechaVisible(f.fechaOtorgamiento) },
            ]}
            textoAgregar="Agregar financiamiento externo"
            textoVacio="Todavía no cargaste financiamientos externos a la UA."
            sustantivoEliminar="este financiamiento"
            mensajes={MSG_ELIMINAR_EXTERNO}
            onEliminar={(f) => eliminarFinanciamientoExterno(f.id)}
            renderModal={({ modo, item, onClose }) => (
              <ModalFinanciamientoExterno modo={modo} item={item} onClose={onClose} />
            )}
          />
        </>
      ) : null}

      {subpagina === 'formacion' ? (
        <>
          <SeccionRegistros
            numero={1}
            titulo="Formación tesistas"
            items={tesistas}
            idDe={(t) => t.id}
            tituloDe={(t) => t.titulo || t.formacion?.label || '—'}
            subtituloDe={(t) => (t.titulo ? t.formacion?.label : undefined) || undefined}
            lineasDe={(t) => [
              { label: 'Director', valor: t.directorNombre },
              { label: 'Codirector', valor: t.codirectorNombre },
              { label: 'Tesista', valor: t.tesista },
              { label: 'Programa', valor: t.programa },
              { label: 'Estado', valor: t.estado?.label ?? '' },
              { label: 'Fecha de inicio', valor: aFechaVisible(t.fechaInicio) },
              { label: 'Fecha de la defensa', valor: aFechaVisible(t.fechaDefensa) },
            ]}
            textoAgregar="Agregar formación de tesista"
            textoVacio="Todavía no cargaste formación de tesistas."
            sustantivoEliminar="esta formación"
            mensajes={MSG_ELIMINAR_TESISTA}
            onEliminar={(t) => eliminarTesista(t.id)}
            renderModal={({ modo, item, onClose }) => <ModalTesista modo={modo} item={item} onClose={onClose} />}
          />
          <SeccionRegistros
            numero={2}
            titulo="Dirección de Investigadores y/o Becarios"
            items={direcciones}
            idDe={(d) => d.id}
            tituloDe={(d) => d.becarioNombre || '—'}
            subtituloDe={(d) => d.carrera?.label || undefined}
            lineasDe={(d) => [
              { label: 'Director', valor: d.directorNombre },
              { label: 'Codirector', valor: d.codirectorNombre },
              { label: 'Fecha de inicio', valor: aFechaVisible(d.fechaInicio) },
              { label: 'Fecha de fin', valor: aFechaVisible(d.fechaFin) },
              { label: 'En curso', valor: d.enCurso?.label ?? '' },
            ]}
            textoAgregar="Agregar dirección de investigador / becario"
            textoVacio="Todavía no cargaste dirección de investigadores y/o becarios."
            sustantivoEliminar="esta formación"
            mensajes={MSG_ELIMINAR_DIRECCION}
            onEliminar={(d) => eliminarDireccion(d.id)}
            renderModal={({ modo, item, onClose }) => <ModalDireccion modo={modo} item={item} onClose={onClose} />}
          />
        </>
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
