// Formulario de la categorización externa vigente (CONICET, CIC, Agencia u otra).
// Port de Portal-Austral-Dev -> perfil/investigacion/perfil/categorizacion-externa/page.tsx (formulario Externa).
// Con una categoría ya cargada el portal bloquea todo salvo la fecha de fin; con lugar de trabajo en la Universidad Austral
// la categoría la carga el área central y el formulario queda bloqueado.
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { guardarCategorizacionExterna } from '../../../application/perfil/afiliacionesService';
import { mensajeDeErrorApi } from '../../../config/api/apiError';
import {
  CATEGORIAS_AGENCIA,
  categoriasCicPorTipo,
  categoriasConicetPorTipo,
  CATEGORIZACION_EXTERNA,
  esOtra,
  esquemaExterna,
  EXTERNA_AGENCIA,
  EXTERNA_CIC,
  EXTERNA_CONICET,
  EXTERNA_OTRA,
  externaAFormulario,
  esValor,
  lugaresExterna,
  SI_NO_NUM,
  tieneValor,
  TIPO_CATEGORIZACION,
  type FormularioExterna,
} from '../../../domain/perfil/afiliaciones';
import { useAfiliacionesStore } from '../../stores/afiliacionesStore';
import { spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { InfoAlert } from '../InfoAlert';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { Campos, PieObligatorios } from './CamposComunes';

const ETIQUETA_LUGAR: Record<number, string> = {
  [EXTERNA_CONICET]: 'Lugar de trabajo CONICET',
  [EXTERNA_CIC]: 'Lugar de trabajo CIC',
  [EXTERNA_AGENCIA]: 'Lugar de trabajo Agencia',
  [EXTERNA_OTRA]: 'Lugar de trabajo Cat.',
};

const TITULO_SECCION: Record<number, string> = {
  [EXTERNA_CONICET]: 'Categoría CONICET',
  [EXTERNA_CIC]: 'Categoría CIC',
  [EXTERNA_AGENCIA]: 'Categoría Agencia',
  [EXTERNA_OTRA]: 'Otra Categorización Externa',
};

export const FormInvCategoriaExterna: React.FC = () => {
  const externa = useAfiliacionesStore((s) => s.externa);
  const unidades = useAfiliacionesStore((s) => s.unidades);
  const instituciones = useAfiliacionesStore((s) => s.instituciones);
  const [guardando, setGuardando] = useState(false);

  const valores = useMemo(
    () => externaAFormulario(externa, unidades, instituciones),
    [externa, unidades, instituciones],
  );
  // Categoría ya cargada: solo se puede tocar la fecha de fin.
  const cargada = tieneValor(valores.categoria);
  const resolver = useMemo(() => yupResolver(esquemaExterna(cargada) as any), [cargada]);

  const { control, handleSubmit, formState, reset, setValue, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valores,
    resolver,
  });

  useEffect(() => {
    reset(valores);
  }, [valores, reset]);

  const ua = watch('ua');
  const categoria = watch('categoria');
  const tipo = watch('tipo');
  const lugar = watch('lugar');
  const otraCategoria = watch('otraCategoria');

  const esUA = esValor(ua, 1);
  const bloqueadoGeneral = esUA || cargada;
  const codigo = tieneValor(categoria) ? Number(categoria.value) : null;
  const lugares = lugaresExterna(ua, unidades, instituciones);
  const limpiar = (...campos: string[]) =>
    campos.forEach((c) => setValue(c, c.startsWith('fecha') ? null : c.startsWith('otro') || c.startsWith('texto') ? '' : null, { shouldDirty: true }));

  const guardar = handleSubmit(async (v: any) => {
    setGuardando(true);
    const idToast = toast.loading('Procesando...');
    try {
      await guardarCategorizacionExterna(v as FormularioExterna);
      toast.dismiss(idToast);
      toast.success('Categorizaciones guardadas con éxito');
    } catch (error) {
      toast.dismiss(idToast);
      toast.error(mensajeDeErrorApi(error, 'Error al guardar categorizaciones'));
    } finally {
      setGuardando(false);
    }
  });

  const alGuardar = () => {
    if (!formState.isDirty) {
      toast.error('No hay cambios para guardar');
      return;
    }
    void guardar();
  };

  return (
    <View style={styles.contenedor}>
      {esUA ? (
        <InfoAlert tipo="info">Si tu lugar de trabajo es la Universidad Austral, lo cargará el área central.</InfoAlert>
      ) : null}
      <Campos>
        <FormSelectField
          control={control}
          name="ua"
          label="Lugar de trabajo Universidad Austral"
          required
          options={SI_NO_NUM as any}
          disabled={cargada}
          onCambio={() => limpiar('lugar', 'otroLugar')}
        />
        <FormSelectField
          control={control}
          name="categoria"
          label="Categorización externa"
          required={!esUA}
          options={CATEGORIZACION_EXTERNA as any}
          disabled={bloqueadoGeneral}
          clearable
          onCambio={() =>
            limpiar(
              'tipo',
              'categoriaConicet',
              'categoriaCic',
              'categoriaAgencia',
              'otraCategoria',
              'lugar',
              'fechaInicio',
              'fechaFin',
              'otroLugar',
              'textoOtraCategoria',
            )
          }
        />

        {codigo !== null ? (
          <AppText variant="h5">{TITULO_SECCION[codigo]}</AppText>
        ) : null}

        {codigo === EXTERNA_CONICET || codigo === EXTERNA_CIC ? (
          <FormSelectField
            control={control}
            name="tipo"
            label="Tipo"
            required
            options={TIPO_CATEGORIZACION as any}
            disabled={bloqueadoGeneral}
            onCambio={() => limpiar('categoriaConicet', 'categoriaCic')}
          />
        ) : null}
        {codigo === EXTERNA_CONICET && tieneValor(tipo) ? (
          <FormSelectField
            control={control}
            name="categoriaConicet"
            label="Categoría CONICET"
            required
            options={categoriasConicetPorTipo(tipo) as any}
            disabled={bloqueadoGeneral}
          />
        ) : null}
        {codigo === EXTERNA_CIC && tieneValor(tipo) ? (
          <FormSelectField
            control={control}
            name="categoriaCic"
            label="Categoría CIC"
            required
            options={categoriasCicPorTipo(tipo) as any}
            disabled={bloqueadoGeneral}
          />
        ) : null}
        {codigo === EXTERNA_AGENCIA ? (
          <FormSelectField
            control={control}
            name="categoriaAgencia"
            label="Categoría Agencia"
            required
            options={CATEGORIAS_AGENCIA as any}
            disabled={bloqueadoGeneral}
          />
        ) : null}
        {codigo === EXTERNA_OTRA ? (
          <FormSelectField
            control={control}
            name="otraCategoria"
            label="Otra Categoría"
            required
            options={SI_NO_NUM as any}
            disabled={bloqueadoGeneral}
          />
        ) : null}
        {codigo === EXTERNA_OTRA && esValor(otraCategoria, 1) ? (
          <FormTextField
            control={control}
            name="textoOtraCategoria"
            label="Categoría"
            required
            maximo={100}
            editable={!bloqueadoGeneral}
          />
        ) : null}

        {codigo !== null ? (
          <>
            <FormDateField
              control={control}
              name="fechaInicio"
              label="Fecha de inicio"
              required
              disabled={bloqueadoGeneral}
            />
            {/* Con una categoría cargada es lo único que se puede editar (salvo que sea de la UA). */}
            <FormDateField control={control} name="fechaFin" label="Fecha de fin" clearable disabled={esUA} />
            <FormSelectField
              control={control}
              name="lugar"
              label={ETIQUETA_LUGAR[codigo]}
              required
              options={lugares as any}
              buscable
              disabled={bloqueadoGeneral}
              onCambio={() => limpiar('otroLugar')}
            />
            {esOtra(lugar) ? (
              <FormTextField
                control={control}
                name="otroLugar"
                label="Otro lugar de trabajo"
                required
                maximo={100}
                editable={!bloqueadoGeneral}
              />
            ) : null}
            {codigo === EXTERNA_CONICET && esUA ? (
              <FormTextField
                control={control}
                name="unidadCertificante"
                label="Unidad Certificante"
                required
                maximo={100}
                editable={!bloqueadoGeneral}
              />
            ) : null}
          </>
        ) : null}
        <PieObligatorios />
      </Campos>
      <AppButton title={guardando ? 'Guardando...' : 'Guardar'} onPress={alGuardar} loading={guardando} />
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.lg },
});
