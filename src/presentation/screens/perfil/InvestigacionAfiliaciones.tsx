// Perfil > Investigación > Afiliaciones (Perfiles, Categorización externa y PRINUAR, Pertenencia y Jurados).
// Port de Portal-Austral-Dev -> src/app/(dashboard)/perfil/investigacion/perfil/*.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  cargarAfiliaciones,
  eliminarJurado,
  eliminarPertenencia,
  MSG_ERROR_CARGA_AFILIACIONES,
} from '../../../application/perfil/afiliacionesService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { etiquetaDePertenencia } from '../../../domain/perfil/afiliaciones';
import { AppButton } from '../../components/AppButton';
import { AppText } from '../../components/AppText';
import { InfoAlert } from '../../components/InfoAlert';
import { ItemPestania, Pestanias } from '../../components/licencias/Pestanias';
import { FormInvCategoriaExterna } from '../../components/perfil/FormInvCategoriaExterna';
import { FormInvCategoriaPrinuar } from '../../components/perfil/FormInvCategoriaPrinuar';
import { FormInvPerfil } from '../../components/perfil/FormInvPerfil';
import { ModalJurado } from '../../components/perfil/ModalJurado';
import { ModalLectura } from '../../components/perfil/ModalLectura';
import { ModalPertenencia } from '../../components/perfil/ModalPertenencia';
import { SeccionRegistros } from '../../components/perfil/SeccionRegistros';
import { useAfiliacionesStore } from '../../stores/afiliacionesStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';

type Subpagina = 'perfiles' | 'categorizacion' | 'pertenencia' | 'jurados';

const PESTANIAS: ItemPestania<Subpagina>[] = [
  { clave: 'perfiles', etiqueta: 'Perfiles' },
  { clave: 'categorizacion', etiqueta: 'Categorización' },
  { clave: 'pertenencia', etiqueta: 'Pertenencia' },
  { clave: 'jurados', etiqueta: 'Jurados' },
];

const INFO: Record<Subpagina, { titulo: string; texto: string }> = {
  perfiles: {
    titulo: 'Perfiles',
    texto: 'Aquí podrá visualizar la información relacionada a los perfiles.',
  },
  categorizacion: {
    titulo: 'Categorización externa',
    texto: 'Aquí podrá visualizar la información relacionada a la categorización externa.',
  },
  pertenencia: {
    titulo: 'Pertenencia a un centro de investigación / HUA',
    texto: 'Aquí podrá visualizar la información relacionada a la pertenencia a centros de investigación.',
  },
  jurados: {
    titulo: 'Jurados - tribunal',
    texto: 'Aquí podrá visualizar la información relacionada a la participación en jurados - tribunal.',
  },
};

const MENSAJES_ELIMINAR_PERTENENCIA = {
  eliminando: 'Eliminando pertenencia...',
  eliminado: 'Pertenencia eliminada con éxito.',
  errorEliminar: 'Error al eliminar Pertenencia HUA.',
};

export const InvestigacionAfiliaciones: React.FC = () => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const [subpagina, setSubpagina] = useState<Subpagina>('perfiles');

  const externasHistoricas = useAfiliacionesStore((s) => s.externasHistoricas);
  const prinuarHistoricas = useAfiliacionesStore((s) => s.prinuarHistoricas);
  const pertenencias = useAfiliacionesStore((s) => s.pertenencias);
  const jurados = useAfiliacionesStore((s) => s.jurados);
  const cargando = useAfiliacionesStore((s) => s.cargando);
  const cargado = useAfiliacionesStore((s) => s.cargado);
  const error = useAfiliacionesStore((s) => s.error);

  const vigentes = useMemo(() => pertenencias.filter((p) => !p.historica), [pertenencias]);
  const historicas = useMemo(() => pertenencias.filter((p) => p.historica), [pertenencias]);

  const recargar = useCallback(() => {
    void cargarAfiliaciones();
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
          <InfoAlert tipo="error">{MSG_ERROR_CARGA_AFILIACIONES}</InfoAlert>
          <AppButton title="Reintentar" variant="secondary" onPress={recargar} loading={cargando} />
        </View>
      ) : null}

      {subpagina === 'perfiles' ? <FormInvPerfil /> : null}

      {subpagina === 'categorizacion' ? (
        <>
          <AppText variant="h5">Categorización externa</AppText>
          <FormInvCategoriaExterna />
          <SeccionRegistros
            numero={1}
            titulo="Histórico de categorización externa"
            items={externasHistoricas}
            idDe={(c) => c.id}
            tituloDe={(c) => c.categorizacion || '—'}
            subtituloDe={(c) => c.categoria || undefined}
            lineasDe={(c) => [
              { label: 'Fecha de inicio', valor: c.fechaInicio },
              { label: 'Fecha de fin', valor: c.fechaFin },
              { label: 'Lugar de trabajo', valor: c.lugar },
              { label: 'Otro lugar de trabajo', valor: c.otroLugar },
            ]}
            textoAgregar=""
            soloLectura
            textoVacio="No hay categorizaciones externas históricas."
            renderModal={({ item, onClose }) =>
              item ? (
                <ModalLectura
                  titulo="Histórico de categorización externa"
                  subtitulo="Información de la categorización externa"
                  onClose={onClose}
                  filas={[
                    { label: 'Categorización externa', valor: item.categorizacion },
                    { label: 'Categoría investigador', valor: item.categoria },
                    { label: 'Fecha de inicio', valor: item.fechaInicio },
                    { label: 'Fecha de fin', valor: item.fechaFin },
                    { label: 'Lugar de trabajo', valor: item.lugar },
                    { label: 'Otro lugar de trabajo', valor: item.otroLugar },
                  ]}
                />
              ) : null
            }
          />

          <AppText variant="h5">Categorización Prinuar</AppText>
          <FormInvCategoriaPrinuar />
          <SeccionRegistros
            numero={2}
            titulo="Histórico de categorización Prinuar"
            items={prinuarHistoricas}
            idDe={(c) => c.id}
            tituloDe={(c) => c.categoria || '—'}
            lineasDe={(c) => [
              { label: 'Fecha de inicio', valor: c.fechaInicio },
              { label: 'Fecha de fin', valor: c.fechaFin },
              { label: 'Lugar de trabajo', valor: c.lugar },
              { label: 'Otro lugar de trabajo', valor: c.otroLugar },
            ]}
            textoAgregar=""
            soloLectura
            textoVacio="No hay categorizaciones Prinuar históricas."
            renderModal={({ item, onClose }) =>
              item ? (
                <ModalLectura
                  titulo="Histórico de categorización Prinuar"
                  subtitulo="Información de la categorización Prinuar"
                  onClose={onClose}
                  filas={[
                    { label: 'Categoría Prinuar', valor: item.categoria },
                    { label: 'Fecha de inicio', valor: item.fechaInicio },
                    { label: 'Fecha de fin', valor: item.fechaFin },
                    { label: 'Lugar de trabajo', valor: item.lugar },
                    { label: 'Otro lugar de trabajo', valor: item.otroLugar },
                  ]}
                />
              ) : null
            }
          />
        </>
      ) : null}

      {subpagina === 'pertenencia' ? (
        <>
          <SeccionRegistros
            numero={1}
            titulo="Pertenencia vigente"
            items={vigentes}
            idDe={(p) => p.id}
            tituloDe={(p) => etiquetaDePertenencia(p) || '—'}
            lineasDe={(p) => [
              { label: 'Centro / instituto / HUA de la UA', valor: p.centro?.label ?? '' },
              { label: 'Fecha de inicio', valor: aFechaVisible(p.fechaInicio) },
              { label: 'Fecha fin', valor: aFechaVisible(p.fechaFin) },
            ]}
            textoAgregar="Agregar pertenencia"
            textoVacio="Todavía no cargaste pertenencias."
            sustantivoEliminar="esta pertenencia"
            mensajes={MENSAJES_ELIMINAR_PERTENENCIA}
            onEliminar={(p) => eliminarPertenencia(p.id)}
            renderModal={({ modo, item, onClose }) => <ModalPertenencia modo={modo} item={item} onClose={onClose} />}
          />
          <SeccionRegistros
            numero={2}
            titulo="Pertenencia histórica"
            items={historicas}
            idDe={(p) => p.id}
            tituloDe={(p) => etiquetaDePertenencia(p) || '—'}
            lineasDe={(p) => [
              { label: 'Centro / instituto / HUA de la UA', valor: p.centro?.label ?? '' },
              { label: 'Fecha de inicio', valor: aFechaVisible(p.fechaInicio) },
              { label: 'Fecha fin', valor: aFechaVisible(p.fechaFin) },
            ]}
            textoAgregar=""
            soloLectura
            textoVacio="No hay pertenencias históricas."
            renderModal={({ item, onClose }) => <ModalPertenencia modo="ver" item={item} onClose={onClose} />}
          />
        </>
      ) : null}

      {subpagina === 'jurados' ? (
        <SeccionRegistros
          numero={1}
          titulo="Jurados - tribunal"
          items={jurados}
          idDe={(j) => j.id}
          tituloDe={(j) => j.tipoActividad?.label || '—'}
          subtituloDe={(j) => j.institucion || undefined}
          lineasDe={(j) => [
            { label: 'Rol', valor: j.rol?.label ?? '' },
            { label: 'Fecha de inicio', valor: aFechaVisible(j.fechaInicio) },
            { label: 'Fecha de fin', valor: aFechaVisible(j.fechaFin) },
            { label: 'País', valor: j.pais.label ?? '' },
            { label: 'Ciudad', valor: j.ciudad },
          ]}
          textoAgregar="Agregar jurado - tribunal"
          textoVacio="Todavía no cargaste participaciones en jurados - tribunal."
          sustantivoEliminar="este registro"
          mensajes={{
            eliminando: 'Eliminando jurados - tribunal...',
            eliminado: 'Jurados - tribunal eliminado con éxito.',
            errorEliminar: 'Error al eliminar los jurados - tribunal.',
          }}
          onEliminar={(j) => eliminarJurado(j.id)}
          renderModal={({ modo, item, onClose }) => <ModalJurado modo={modo} item={item} onClose={onClose} />}
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
