// Las cinco secciones de Perfil > Trayectoria profesional, en el orden del portal (perfil/trayectoria/page.tsx).
// Las columnas de las listas son las del portal; los rótulos de las que el portal no muestra con texto propio
// son una adaptación a tarjetas del celular.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  eliminarComite,
  eliminarConsultoria,
  eliminarExperiencia,
  eliminarLicenciaProfesional,
  eliminarReconocimiento,
} from '../../../application/perfil/trayectoriaService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import { aMesAnioVisible } from '../../../domain/perfil/trayectoria';
import { useTrayectoriaStore } from '../../stores/trayectoriaStore';
import { spacing } from '../../utils/responsive';
import { ModalComite } from './ModalComite';
import { ModalConsultoria } from './ModalConsultoria';
import { ModalExperiencia } from './ModalExperiencia';
import { ModalLicenciaProfesional } from './ModalLicenciaProfesional';
import { ModalReconocimiento } from './ModalReconocimiento';
import { SeccionRegistros } from './SeccionRegistros';

export const SeccionesTrayectoria: React.FC = () => {
  const experiencias = useTrayectoriaStore((s) => s.experiencias);
  const consultorias = useTrayectoriaStore((s) => s.consultorias);
  const comites = useTrayectoriaStore((s) => s.comites);
  const licencias = useTrayectoriaStore((s) => s.licencias);
  const reconocimientos = useTrayectoriaStore((s) => s.reconocimientos);

  return (
    <View style={styles.contenedor}>
      <SeccionRegistros
        numero={1}
        titulo="Experiencia laboral fuera del ámbito académico"
        items={experiencias}
        idDe={(e) => e.id}
        tituloDe={(e) => e.cargo || '—'}
        subtituloDe={(e) => e.institucion || undefined}
        lineasDe={(e) => [
          { label: 'Sector / Industria', valor: e.sector.label ?? '' },
          { label: 'Fecha de inicio', valor: aFechaVisible(e.fechaInicio) },
          { label: 'Fecha de fin', valor: aFechaVisible(e.fechaFin) },
          { label: 'Dedicación horaria semanal', valor: e.dedicacion },
          { label: 'Personas a cargo', valor: e.personasACargo },
          { label: 'Principales responsabilidades', valor: e.responsabilidades },
        ]}
        textoAgregar="Agregar experiencia"
        textoVacio="Todavía no cargaste experiencias laborales."
        sustantivoEliminar="esta experiencia laboral"
        mensajes={{
          eliminando: 'Eliminando experiencia…',
          eliminado: 'Experiencia eliminada con éxito.',
          errorEliminar: 'Error al eliminar la experiencia.',
        }}
        onEliminar={(e) => eliminarExperiencia(e.id)}
        renderModal={({ modo, item, onClose }) => <ModalExperiencia modo={modo} item={item} onClose={onClose} />}
      />

      <SeccionRegistros
        numero={2}
        titulo="Consultorías externas"
        items={consultorias}
        idDe={(c) => c.id}
        tituloDe={(c) => c.tema || '—'}
        subtituloDe={(c) => c.cliente || undefined}
        lineasDe={(c) => [
          { label: 'Fecha de inicio', valor: aFechaVisible(c.fechaInicio) },
          { label: 'Fecha de fin', valor: aFechaVisible(c.fechaFin) },
          { label: 'Tipo de dedicación', valor: c.tipoDedicacion.label ?? '' },
          { label: 'Dedicación horaria', valor: c.dedicacion },
          { label: 'Financiamiento recibido', valor: c.financiamiento?.label ?? '' },
        ]}
        textoAgregar="Agregar consultoría"
        textoVacio="Todavía no cargaste consultorías externas."
        sustantivoEliminar="esta consultoría"
        mensajes={{
          eliminando: 'Eliminando consultoría…',
          eliminado: 'Consultoría eliminada con éxito.',
          errorEliminar: 'Error al eliminar la consultoría.',
        }}
        onEliminar={(c) => eliminarConsultoria(c.id)}
        renderModal={({ modo, item, onClose }) => <ModalConsultoria modo={modo} item={item} onClose={onClose} />}
      />

      <SeccionRegistros
        numero={3}
        titulo="Comités profesionales o técnicos"
        items={comites}
        idDe={(c) => c.id}
        tituloDe={(c) => c.nombre || '—'}
        subtituloDe={(c) => c.cargo || undefined}
        lineasDe={(c) => [
          { label: 'Fecha de inicio', valor: aFechaVisible(c.fechaInicio) },
          { label: 'Fecha de fin', valor: aFechaVisible(c.fechaFin) },
          { label: 'Ámbito', valor: c.ambito.label ?? '' },
        ]}
        textoAgregar="Agregar comité"
        textoVacio="Todavía no cargaste comités."
        sustantivoEliminar="este comité"
        mensajes={{
          eliminando: 'Eliminando comité…',
          eliminado: 'Comité eliminado con éxito.',
          errorEliminar: 'Error al eliminar el comité.',
        }}
        onEliminar={(c) => eliminarComite(c.id)}
        renderModal={({ modo, item, onClose }) => <ModalComite modo={modo} item={item} onClose={onClose} />}
      />

      <SeccionRegistros
        numero={4}
        titulo="Licencia profesional / Membresías en colegios / Asociaciones profesionales"
        items={licencias}
        idDe={(l) => l.id}
        tituloDe={(l) => l.tipo || '—'}
        subtituloDe={(l) => l.organismo || undefined}
        lineasDe={(l) => [
          { label: 'Fecha de obtención', valor: aMesAnioVisible(l.fechaObtencion) },
          { label: 'Vigencia hasta', valor: aMesAnioVisible(l.vigenciaHasta) },
        ]}
        textoAgregar="Agregar licencia / membresía / asociación"
        textoVacio="Todavía no cargaste licencias, membresías ni asociaciones."
        sustantivoEliminar="esta licencia / membresía / asociación"
        mensajes={{
          eliminando: 'Eliminando licencia / membresía / asociación…',
          eliminado: 'Licencia / Membresía / Asociación eliminada con éxito.',
          errorEliminar: 'Error al eliminar la licencia / membresía / asociación.',
        }}
        onEliminar={(l) => eliminarLicenciaProfesional(l.id)}
        renderModal={({ modo, item, onClose }) => (
          <ModalLicenciaProfesional modo={modo} item={item} onClose={onClose} />
        )}
      />

      <SeccionRegistros
        numero={5}
        titulo="Reconocimientos profesionales"
        items={reconocimientos}
        idDe={(r) => r.id}
        tituloDe={(r) => r.nombre || '—'}
        subtituloDe={(r) => r.tipo || undefined}
        lineasDe={(r) => [
          { label: 'Institución / organismo otorgante', valor: r.institucion },
          { label: 'Ámbito', valor: r.ambito.label ?? '' },
          { label: 'Fecha de otorgamiento', valor: aFechaVisible(r.fecha) },
        ]}
        textoAgregar="Agregar reconocimiento"
        textoVacio="Todavía no cargaste reconocimientos."
        sustantivoEliminar="este reconocimiento"
        mensajes={{
          eliminando: 'Eliminando reconocimiento…',
          eliminado: 'Reconocimiento eliminado con éxito.',
          errorEliminar: 'Error al eliminar el reconocimiento.',
        }}
        onEliminar={(r) => eliminarReconocimiento(r.id)}
        renderModal={({ modo, item, onClose }) => <ModalReconocimiento modo={modo} item={item} onClose={onClose} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.lg },
});
