// Alta, edición y vista de títulos: pregrado/grado, posgrado y formación posdoctoral.
// Port de Portal-Austral-Dev -> perfil/_components/formacion/modales (pregrado, posgrado y posdoctoral).
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import { etiquetaTipo } from '../../../domain/legajo/archivos';
import type { Adjunto } from '../../../domain/legajo/tipos';
import { opcionesDeAnios, opcionABoolean, OPCIONES_SI_NO } from '../../../domain/perfil/comun';
import {
  tituloAFormulario,
  type CategoriaTitulo,
  type FormularioTitulo,
  type Titulo,
} from '../../../domain/perfil/formacion';
import {
  AYUDA_ESTADOS_POSGRADO,
  ESTADOS_POSDOCTORAL,
  ESTADOS_TITULO,
  ESTADO_FINALIZADO,
  TIPOS_CARRERA_POSGRADO,
  TIPOS_CARRERA_PREGRADO,
} from '../../../domain/perfil/formacionOpciones';
import { esquemaTitulo } from '../../../domain/perfil/formacionValidacion';
import { guardarTitulo, obtenerAdjuntosDeTitulo } from '../../../application/perfil/formacionService';
import { abrirAdjunto } from '../../../infrastructure/archivos/visorArchivos';
import { useCatalogosStore } from '../../stores/catalogosStore';
import { useFormacionStore } from '../../stores/formacionStore';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AccionIcono } from '../AccionIcono';
import { AppText } from '../AppText';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FilaDato } from '../legajo/FilaDato';
import { Pestanias } from '../licencias/Pestanias';
import { SelectorArchivos } from '../licencias/SelectorArchivos';
import { Campos, InfoAlert, PieObligatorios } from './CamposComunes';
import { ModalPerfil } from './ModalPerfil';

interface ModalTituloProps {
  categoria: CategoriaTitulo;
  modo: 'nuevo' | 'editar' | 'ver';
  titulo?: Titulo;
  onClose: () => void;
}

const NOMBRES: Record<CategoriaTitulo, { modal: string; nuevo: string; editar: string; exito: string; edicion: string }> = {
  pregrado: {
    modal: 'Título de pregrado / grado',
    nuevo: 'Agrega un nuevo título de pregrado o grado',
    editar: 'Modifica la información del título',
    exito: 'Título cargado con éxito',
    edicion: 'Título modificado con éxito',
  },
  posgrado: {
    modal: 'Título de posgrado',
    nuevo: 'Agrega un nuevo título de posgrado',
    editar: 'Modifica la información del título',
    exito: 'Título cargado con éxito',
    edicion: 'Título modificado con éxito',
  },
  posdoctoral: {
    modal: 'Formación posdoctoral',
    nuevo: 'Agrega una nueva formación posdoctoral',
    editar: 'Modifica la información de la formación posdoctoral',
    exito: 'Formación posdoctoral cargada con éxito',
    edicion: 'Formación posdoctoral modificada con éxito',
  },
};

const OPCIONES_ANIOS = opcionesDeAnios();

export const ModalTitulo: React.FC<ModalTituloProps> = ({ categoria, modo, titulo, onClose }) => {
  const { globalColors } = useThemeColors();
  const paises = useCatalogosStore((s) => s.paises);
  const instituciones = useFormacionStore((s) => s.instituciones);
  const [guardando, setGuardando] = useState(false);
  const [pestania, setPestania] = useState<'detalle' | 'adjuntos'>('detalle');
  const nombres = NOMBRES[categoria];
  const posdoctoral = categoria === 'posdoctoral';
  const nuevo = modo === 'nuevo';
  const tieneConstancias = (titulo?.adjuntos.length ?? 0) > 0;

  const { control, handleSubmit, watch, setValue, formState } = useForm<any>({
    mode: 'onChange',
    defaultValues: tituloAFormulario(titulo, categoria),
    resolver: yupResolver(esquemaTitulo(categoria, !tieneConstancias) as any),
  });

  const estado = watch('estado');
  const institucion = watch('institucion');
  const becado = watch('becado');
  const archivos = watch('archivosAdjuntos');
  const finalizado = Number(estado?.value) === ESTADO_FINALIZADO;
  const otraInstitucion = typeof institucion?.label === 'string' && institucion.label.toLowerCase().includes('otra');
  const conBeca = opcionABoolean(becado) === true;

  // Si el estado deja de ser Finalizado, se vacían el año de obtención y las constancias (el portal también).
  useEffect(() => {
    if (finalizado || posdoctoral) return;
    if (watch('anioObtencion')) setValue('anioObtencion', null, { shouldDirty: true });
    if ((watch('archivosAdjuntos') ?? []).length > 0) setValue('archivosAdjuntos', [], { shouldDirty: true });
  }, [finalizado, posdoctoral, watch, setValue]);

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading(nuevo ? 'Guardando el título…' : 'Guardando los cambios…');
    try {
      const datos = valores as FormularioTitulo;
      const resultado = await guardarTitulo({
        categoria,
        id: nuevo ? undefined : titulo?.id,
        datos,
        archivos: finalizado || posdoctoral ? (datos.archivosAdjuntos ?? []) : [],
        onEtapa: (mensaje) => {
          toast.dismiss(idToast);
          toast.loading(mensaje);
        },
      });
      toast.dismiss();
      if (!resultado.guardado) {
        toast.error('Error al cargar');
        return;
      }
      if (resultado.adjuntoFallo) toast.error('El título se guardó, pero no se pudo cargar el adjunto.');
      else toast.success(nuevo ? nombres.exito : nombres.edicion);
      onClose();
    } catch (error) {
      toast.dismiss();
      toast.error(mensajeDeErrorApi(error, 'Error al cargar'));
    } finally {
      setGuardando(false);
    }
  });

  // ---------------------------------------------------------------- Vista
  if (modo === 'ver' && titulo) {
    return (
      <ModalPerfil
        modo="ver"
        titulo={nombres.modal}
        subtituloNuevo={nombres.nuevo}
        subtituloEditar={nombres.editar}
        onClose={onClose}
      >
        {!posdoctoral ? (
          <Pestanias
            items={[
              { clave: 'detalle', etiqueta: 'Detalle' },
              { clave: 'adjuntos', etiqueta: 'Adjuntos', cantidad: titulo.adjuntos.length },
            ]}
            activa={pestania}
            onCambiar={setPestania}
          />
        ) : null}
        {pestania === 'detalle' || posdoctoral ? (
          <View style={styles.vista}>
            <FilaDato label="Tipo" valor={titulo.tipo.label} />
            <FilaDato
              label={posdoctoral ? 'Denominación de la formación' : 'Denominación del título'}
              valor={titulo.denominacion}
            />
            <FilaDato label="País" valor={titulo.pais.label} />
            <FilaDato label="Institución otorgante" valor={titulo.institucion.label} />
            {titulo.otraInstitucion ? <FilaDato label="Otra institución" valor={titulo.otraInstitucion} /> : null}
            <FilaDato
              label={posdoctoral ? 'Año de inicio de cursada' : 'Año de inicio de cursada'}
              valor={titulo.anioInicio}
            />
            <FilaDato label="Estado" valor={titulo.estado.label} />
            {!posdoctoral ? <FilaDato label="Año de obtención de título" valor={titulo.anioObtencion} /> : null}
            {!posdoctoral ? <FilaDato label="Título de la Tesis" valor={titulo.tituloTesis} /> : null}
            {categoria !== 'pregrado' ? <FilaDato label="¿Lo realizó con una beca?" valor={titulo.becado?.label} /> : null}
            {categoria !== 'pregrado' && titulo.institucionFinanciadora ? (
              <FilaDato label="Institución financiadora" valor={titulo.institucionFinanciadora} />
            ) : null}
          </View>
        ) : (
          <AdjuntosDelTitulo tituloId={titulo.id} />
        )}
      </ModalPerfil>
    );
  }

  // ------------------------------------------------------------- Formulario
  return (
    <ModalPerfil
      modo={modo}
      titulo={nombres.modal}
      subtituloNuevo={nombres.nuevo}
      subtituloEditar={nombres.editar}
      onClose={onClose}
      hayCambios={formState.isDirty}
      guardando={guardando}
      onGuardar={guardar}
    >
      <Campos>
        {!posdoctoral ? (
          <FormSelectField
            control={control}
            name="tipo"
            label="Tipo"
            required
            options={(categoria === 'pregrado' ? TIPOS_CARRERA_PREGRADO : TIPOS_CARRERA_POSGRADO) as any}
          />
        ) : null}
        <FormTextField
          control={control}
          name="denominacion"
          label={posdoctoral ? 'Denominación de la formación' : 'Denominación del título'}
          required
          maximo={100}
          mostrarContador
        />
        <FormSelectField control={control} name="pais" label="País" required options={paises as any} buscable />
        <FormSelectField
          control={control}
          name="institucion"
          label="Institución otorgante"
          required
          options={instituciones as any}
          buscable
        />
        <AppText variant="caption" tone="secondary">
          Elija "Otra" si la institución otorgante no está en el listado
        </AppText>
        {otraInstitucion ? (
          <FormTextField
            control={control}
            name="otraInstitucion"
            label="Otra (Institución otorgante)"
            required
            maximo={100}
            mostrarContador
          />
        ) : null}
        <FormSelectField
          control={control}
          name="anioInicio"
          label="Año de inicio de cursada"
          required
          options={OPCIONES_ANIOS as any}
          buscable
        />
        <FormSelectField
          control={control}
          name="estado"
          label="Estado"
          required
          options={(posdoctoral ? ESTADOS_POSDOCTORAL : ESTADOS_TITULO) as any}
        />
        {categoria === 'posgrado' ? (
          <InfoAlert tipo="info">
            {AYUDA_ESTADOS_POSGRADO.map((a) => `${a.estado}: ${a.texto}`).join('\n')}
          </InfoAlert>
        ) : null}
        {finalizado && !posdoctoral ? (
          <FormSelectField
            control={control}
            name="anioObtencion"
            label="Año de obtención de título"
            required
            options={OPCIONES_ANIOS as any}
            buscable
          />
        ) : null}
        {!posdoctoral ? (
          <FormTextField
            control={control}
            name="tituloTesis"
            label="Título de la Tesis"
            maximo={200}
            mostrarContador
          />
        ) : null}
        {categoria !== 'pregrado' ? (
          <FormSelectField
            control={control}
            name="becado"
            label="¿Lo realizó con una beca?"
            required={posdoctoral}
            options={OPCIONES_SI_NO as any}
            clearable={!posdoctoral}
          />
        ) : null}
        {categoria !== 'pregrado' && conBeca ? (
          <FormTextField
            control={control}
            name="institucionFinanciadora"
            label="Institución financiadora"
            required
            maximo={100}
            mostrarContador
          />
        ) : null}

        {finalizado && !posdoctoral ? (
          <View style={styles.adjuntos}>
            <AppText variant="subtitle2">{tieneConstancias ? 'Agregar otra constancia' : 'Constancia del título'}</AppText>
            {tieneConstancias ? (
              <AdjuntosDelTitulo tituloId={titulo!.id} />
            ) : null}
            <SelectorArchivos
              archivos={archivos ?? []}
              onChange={(lista) => setValue('archivosAdjuntos', lista, { shouldDirty: true, shouldValidate: true })}
              disabled={guardando}
            />
            {formState.errors.archivosAdjuntos ? (
              <AppText variant="helper" tone="danger">
                {String((formState.errors.archivosAdjuntos as any).message)}
              </AppText>
            ) : null}
          </View>
        ) : null}

        <PieObligatorios />
      </Campos>
    </ModalPerfil>
  );
};

/** Constancias ya cargadas de un título (se piden al abrir, con su contenido). */
const AdjuntosDelTitulo: React.FC<{ tituloId: string }> = ({ tituloId }) => {
  const { globalColors } = useThemeColors();
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    let activo = true;
    obtenerAdjuntosDeTitulo(tituloId)
      .then((lista) => {
        if (activo) setAdjuntos(lista);
      })
      .catch(() => {
        if (activo) setFallo(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [tituloId]);

  const abrir = async (adjunto: Adjunto) => {
    try {
      await abrirAdjunto(adjunto);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo abrir el documento.');
    }
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator color={globalColors.accentPrimary} />
      </View>
    );
  }
  if (fallo) return <InfoAlert tipo="error">No pudimos cargar los documentos. Por favor, volvé a intentar.</InfoAlert>;
  if (adjuntos.length === 0) {
    return (
      <AppText variant="body2" tone="secondary">
        Este título todavía no tiene documentos cargados.
      </AppText>
    );
  }
  return (
    <View style={styles.vista}>
      <AppText variant="caption" tone="secondary">
        Aquí verás los documentos asociados a tu Título
      </AppText>
      {adjuntos.map((adjunto) => (
        <View key={adjunto.id} style={[styles.fila, { borderColor: globalColors.border }]}>
          <View style={styles.textos}>
            <AppText variant="body2" numberOfLines={2}>
              {adjunto.filename}
            </AppText>
            <AppText variant="caption" tone="secondary">
              {`${etiquetaTipo(adjunto.mimetype, adjunto.filename)} · ${adjunto.createdon ?? '—'}`}
            </AppText>
          </View>
          <AccionIcono icono="eye-outline" etiqueta={`Previsualizar ${adjunto.filename}`} onPress={() => abrir(adjunto)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  vista: { gap: spacing.sm },
  adjuntos: { gap: spacing.sm },
  centro: { alignItems: 'center', padding: spacing.lg },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  textos: { flex: 1, gap: spacing.xxs },
});
