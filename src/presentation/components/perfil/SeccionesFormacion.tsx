// Las siete secciones de Perfil > Formación, en el orden del portal (perfil/formacion/page.tsx).
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  eliminarAreaExpertise,
  eliminarCertificacion,
  eliminarEspecialidad,
  eliminarIdioma,
  eliminarTitulo,
} from '../../../application/perfil/formacionService';
import { aFechaVisible } from '../../../domain/legajo/fechas';
import type { CategoriaTitulo, Titulo } from '../../../domain/perfil/formacion';
import { AYUDA_AREAS_EXPERTISE, MAXIMO_AREAS_EXPERTISE } from '../../../domain/perfil/formacionOpciones';
import { useFormacionStore } from '../../stores/formacionStore';
import { spacing } from '../../utils/responsive';
import { Etiqueta } from '../Etiqueta';
import { ModalAreaExpertise } from './ModalAreaExpertise';
import { ModalCertificacion } from './ModalCertificacion';
import { ModalEspecialidad } from './ModalEspecialidad';
import { ModalIdioma } from './ModalIdioma';
import { ModalTitulo } from './ModalTitulo';
import { SeccionRegistros } from './SeccionRegistros';

const textoEstado = (estado: { label?: string | null }): React.ReactNode =>
  estado?.label ? (
    <Etiqueta texto={estado.label} tipo={/finalizado/i.test(estado.label) ? 'exito' : 'info'} />
  ) : null;

const SeccionTitulos: React.FC<{
  categoria: CategoriaTitulo;
  numero: number;
  titulo: string;
  textoAgregar: string;
  textoVacio: string;
  items: Titulo[];
}> = ({ categoria, numero, titulo, textoAgregar, textoVacio, items }) => {
  const posdoctoral = categoria === 'posdoctoral';
  return (
    <SeccionRegistros<Titulo>
      numero={numero}
      titulo={titulo}
      items={items}
      idDe={(t) => t.id}
      tituloDe={(t) => t.denominacion || '—'}
      subtituloDe={(t) => t.tipo.label ?? undefined}
      estadoDe={(t) => textoEstado(t.estado)}
      lineasDe={(t) => [
        { label: 'Institución', valor: t.institucion.label ?? t.otraInstitucion },
        { label: posdoctoral ? 'Año de inicio de cursada' : 'Año de inicio', valor: t.anioInicio },
        ...(posdoctoral ? [] : [{ label: 'Año de obtención', valor: t.anioObtencion }]),
      ]}
      textoAgregar={textoAgregar}
      textoVacio={textoVacio}
      sustantivoEliminar={posdoctoral ? 'esta formación' : 'este título'}
      mensajes={{
        eliminando: posdoctoral ? 'Eliminando la formación…' : 'Eliminando el título…',
        eliminado: posdoctoral ? 'Formación eliminada con éxito.' : 'Título eliminado con éxito.',
        errorEliminar: posdoctoral ? 'Error al eliminar la formación.' : 'Error al eliminar el título.',
      }}
      onEliminar={(t) => eliminarTitulo(categoria, t.id)}
      renderModal={({ modo, item, onClose }) => (
        <ModalTitulo categoria={categoria} modo={modo} titulo={item} onClose={onClose} />
      )}
    />
  );
};

export const SeccionesFormacion: React.FC = () => {
  const pregrado = useFormacionStore((s) => s.pregrado);
  const posgrado = useFormacionStore((s) => s.posgrado);
  const posdoctoral = useFormacionStore((s) => s.posdoctoral);
  const especialidades = useFormacionStore((s) => s.especialidades);
  const certificaciones = useFormacionStore((s) => s.certificaciones);
  const idiomas = useFormacionStore((s) => s.idiomas);
  const areas = useFormacionStore((s) => s.areas);

  return (
    <View style={styles.contenedor}>
      <SeccionTitulos
        categoria="pregrado"
        numero={1}
        titulo="Título de pregrado / grado"
        textoAgregar="Agregar título"
        textoVacio="Todavía no cargaste títulos de pregrado o grado."
        items={pregrado}
      />
      <SeccionTitulos
        categoria="posgrado"
        numero={2}
        titulo="Título de posgrado"
        textoAgregar="Agregar título"
        textoVacio="Todavía no cargaste títulos de posgrado."
        items={posgrado}
      />

      <SeccionRegistros
        numero={3}
        titulo="Especialidad certificada por organismo/s de salud"
        items={especialidades}
        idDe={(e) => e.id}
        tituloDe={(e) => e.especialidad.label ?? e.otraEspecialidad ?? '—'}
        subtituloDe={(e) => e.tipoFormacion.label ?? undefined}
        estadoDe={(e) => textoEstado(e.estado)}
        lineasDe={(e) => [
          { label: 'Fecha de inicio', valor: aFechaVisible(e.fechaInicio) },
          { label: 'Fecha de fin', valor: aFechaVisible(e.fechaFin) },
          { label: 'Año de obtención', valor: e.anioObtencion },
        ]}
        textoAgregar="Agregar especialidad"
        textoVacio="Todavía no cargaste especialidades."
        sustantivoEliminar="esta especialidad"
        mensajes={{
          eliminando: 'Eliminando especialidad…',
          eliminado: 'Especialidad eliminada con éxito.',
          errorEliminar: 'Error al eliminar la especialidad.',
        }}
        onEliminar={(e) => eliminarEspecialidad(e.id)}
        renderModal={({ modo, item, onClose }) => <ModalEspecialidad modo={modo} item={item} onClose={onClose} />}
      />

      <SeccionRegistros
        numero={4}
        titulo="Certificaciones / Capacitaciones"
        items={certificaciones}
        idDe={(c) => c.id}
        tituloDe={(c) => c.denominacion || '—'}
        subtituloDe={(c) => c.tipoFormacion.label ?? undefined}
        estadoDe={(c) => textoEstado(c.estado)}
        lineasDe={(c) => [
          { label: 'Origen', valor: c.tipoCapacitacion.label ?? '' },
          { label: 'Eje formativo', valor: c.segmento.label ?? '' },
          { label: 'Fecha de inicio', valor: aFechaVisible(c.fechaInicio) },
          { label: 'Fecha de finalización', valor: aFechaVisible(c.fechaFin) },
        ]}
        textoAgregar="Agregar certificación / capacitación"
        textoVacio="Todavía no cargaste certificaciones ni capacitaciones."
        sustantivoEliminar="esta certificación"
        mensajes={{
          eliminando: 'Eliminando certificación…',
          eliminado: 'Certificación eliminada con éxito.',
          errorEliminar: 'Error al eliminar la certificación.',
        }}
        onEliminar={(c) => eliminarCertificacion(c.id)}
        renderModal={({ modo, item, onClose }) => <ModalCertificacion modo={modo} item={item} onClose={onClose} />}
      />

      <SeccionRegistros
        numero={5}
        titulo="Idioma"
        items={idiomas}
        idDe={(i) => i.id}
        tituloDe={(i) => i.idioma || '—'}
        lineasDe={(i) => [
          { label: 'Nivel', valor: i.nivel.label ?? '' },
          { label: 'Otro idioma', valor: i.otroIdioma },
        ]}
        textoAgregar="Agregar idioma"
        textoVacio="Todavía no cargaste idiomas."
        sustantivoEliminar="este idioma"
        mensajes={{
          eliminando: 'Eliminando idioma…',
          eliminado: 'Idioma eliminado con éxito.',
          errorEliminar: 'Error al eliminar el idioma.',
        }}
        onEliminar={(i) => eliminarIdioma(i.id)}
        renderModal={({ modo, item, onClose }) => <ModalIdioma modo={modo} item={item} onClose={onClose} />}
      />

      <SeccionTitulos
        categoria="posdoctoral"
        numero={6}
        titulo="Formación posdoctoral"
        textoAgregar="Agregar formación"
        textoVacio="Todavía no cargaste formación posdoctoral."
        items={posdoctoral}
      />

      <SeccionRegistros
        numero={7}
        titulo="Áreas de expertise - Áreas de Actuación"
        ayuda={AYUDA_AREAS_EXPERTISE}
        items={areas}
        idDe={(a) => a.id}
        tituloDe={(a) => a.actuacion.label ?? a.otraActuacion ?? '—'}
        subtituloDe={(a) => a.agrupador.label ?? undefined}
        lineasDe={(a) => [
          { label: 'Área', valor: a.area.label ?? '' },
          { label: 'Otra área de expertise', valor: a.otraArea },
          { label: 'Otra área de actuación', valor: a.otraActuacion },
        ]}
        textoAgregar="Agregar área"
        puedeAgregar={areas.length < MAXIMO_AREAS_EXPERTISE}
        textoVacio="Todavía no cargaste áreas de expertise."
        sustantivoEliminar="esta área de expertise"
        mensajes={{
          eliminando: 'Eliminando área de expertise…',
          eliminado: 'Área de Expertise eliminada con éxito.',
          errorEliminar: 'Error al eliminar el área de expertise.',
        }}
        onEliminar={(a) => eliminarAreaExpertise(a.id)}
        renderModal={({ modo, item, onClose }) => <ModalAreaExpertise modo={modo} item={item} onClose={onClose} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.lg },
});
