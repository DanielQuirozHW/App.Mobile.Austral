// Alta, edición y vista de un hijo/a. Port de Portal-Austral-Dev -> legajo/_components/component/ModalHijos.tsx.
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { actualizarHijo, crearHijo } from '../../../application/legajo/legajoService';
import { aFechaVisible, parsearFecha } from '../../../domain/legajo/fechas';
import { opcionONull } from '../../../domain/legajo/formulario';
import { A_CARGO, COD_A_CARGO_SI, PARENTESCO_HIJO, SEXOS, TIPOS_DOCUMENTO } from '../../../domain/legajo/opciones';
import type { DatosFamiliar } from '../../../domain/legajo/payload';
import type { Familiar } from '../../../domain/legajo/tipos';
import { esquemaHijo } from '../../../domain/legajo/validacion';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';
import { AppButton } from '../AppButton';
import { AppModal } from '../AppModal';
import { AppText } from '../AppText';
import { Etiqueta } from '../Etiqueta';
import { FormDateField } from '../form/FormDateField';
import { FormSelectField } from '../form/FormSelectField';
import { FormTextField } from '../form/FormTextField';
import { FormTileSelector } from '../form/FormTileSelector';
import { propsNumeroDocumento } from './documentoProps';
import { FilaDato } from './FilaDato';

interface ModalHijoProps {
  modo: 'nuevo' | 'editar' | 'ver';
  onClose: () => void;
  /** Hijo/a existente (editar / ver). */
  datos?: Familiar;
}

const valoresIniciales = (datos?: Familiar) => ({
  nombreFamiliar: datos?.nombreFamiliar ?? '',
  apellidoFamiliar: datos?.apellidoFamiliar ?? '',
  tipoDocFamiliar: opcionONull(datos?.tipoDocFamiliar as any),
  docFamiliar: datos?.docFamiliar ?? '',
  generoHijos: opcionONull(datos?.generoHijos),
  aCargo: opcionONull(datos?.aCargo),
  fechaNacimiento: parsearFecha(datos?.fechaNacimiento),
});

const iniciales = (datos?: Familiar): string =>
  [datos?.nombreFamiliar?.[0], datos?.apellidoFamiliar?.[0]].filter(Boolean).join('').toUpperCase();

const estaACargo = (datos?: Familiar): boolean => Number(datos?.aCargo?.value) === COD_A_CARGO_SI;

export const ModalHijo: React.FC<ModalHijoProps> = ({ modo: modoInicial, onClose, datos }) => {
  const { globalColors } = useThemeColors();
  // Desde la vista se puede pasar a editar sin cerrar el modal (botón "Editar datos").
  const [modo, setModo] = useState(modoInicial);
  const [guardando, setGuardando] = useState(false);
  const nuevo = modo === 'nuevo';

  const { control, handleSubmit, setValue, watch } = useForm<any>({
    mode: 'onChange',
    defaultValues: valoresIniciales(datos),
    resolver: yupResolver(esquemaHijo as any),
  });

  const tipoDoc = watch('tipoDocFamiliar');
  const propsDoc = propsNumeroDocumento(tipoDoc?.label);

  const guardar = handleSubmit(async (valores: any) => {
    setGuardando(true);
    const idToast = toast.loading(nuevo ? 'Guardando datos del hijo...' : 'Actualizando datos del hijo...');
    try {
      const hijo: DatosFamiliar = {
        id: datos?.id,
        nombreFamiliar: String(valores.nombreFamiliar).trim(),
        apellidoFamiliar: String(valores.apellidoFamiliar).trim(),
        tipoDocFamiliar: valores.tipoDocFamiliar,
        docFamiliar: valores.docFamiliar,
        tipoParentesco: PARENTESCO_HIJO,
        generoHijos: valores.generoHijos,
        aCargo: valores.aCargo,
        fechaNacimiento: valores.fechaNacimiento,
      };
      const ok = nuevo ? await crearHijo(hijo) : await actualizarHijo(hijo);
      toast.dismiss(idToast);
      if (!ok) {
        toast.error(nuevo ? 'Error al guardar los datos del hijo.' : 'Error al actualizar los datos del hijo.');
        return;
      }
      toast.success(nuevo ? 'Datos del hijo guardados correctamente.' : 'Datos del hijo actualizados correctamente.');
      onClose();
    } catch {
      toast.dismiss(idToast);
      toast.error(nuevo ? 'Error al guardar los datos del hijo.' : 'Error al actualizar los datos del hijo.');
    } finally {
      setGuardando(false);
    }
  });

  // ---------------------------------------------------------------- Vista
  if (modo === 'ver') {
    const cantidadDocumentos = datos?.adjuntos?.length ?? 0;
    const aCargo = estaACargo(datos);
    return (
      <AppModal
        visible
        onClose={onClose}
        titulo="Datos de hijo/a"
        pie={
          <>
            <AppButton title="Cerrar" variant="secondary" onPress={onClose} />
            <AppButton title="Editar datos" onPress={() => setModo('editar')} />
          </>
        }
      >
        <View style={styles.cabeceraVista}>
          <View style={[styles.avatar, { backgroundColor: globalColors.primaryLight }]}>
            <AppText variant="subtitle1" tone="primary">
              {iniciales(datos)}
            </AppText>
          </View>
          <View style={styles.cabeceraTextos}>
            <AppText variant="overline" tone="secondary">
              Grupo familiar · Hijo/a
            </AppText>
            <AppText variant="h6">{`${datos?.nombreFamiliar ?? ''} ${datos?.apellidoFamiliar ?? ''}`.trim()}</AppText>
            <View style={styles.badges}>
              <Etiqueta texto="Hijo/a" />
              <Etiqueta texto={aCargo ? 'A cargo' : 'No declarado a cargo'} tipo={aCargo ? 'info' : 'neutro'} />
            </View>
          </View>
        </View>

        <View style={styles.seccionVista}>
          <AppText variant="overline" tone="secondary">
            01 · Identidad y documento
          </AppText>
          <FilaDato label="Nombre" valor={datos?.nombreFamiliar} />
          <FilaDato label="Apellido" valor={datos?.apellidoFamiliar} />
          <FilaDato label="Tipo de documento" valor={(datos?.tipoDocFamiliar as any)?.label} />
          <FilaDato label="Nro. de documento" valor={datos?.docFamiliar} />
        </View>

        <View style={styles.seccionVista}>
          <AppText variant="overline" tone="secondary">
            02 · Datos personales
          </AppText>
          <FilaDato label="Fecha de nacimiento" valor={aFechaVisible(datos?.fechaNacimiento)} />
          <FilaDato label="Sexo" valor={datos?.generoHijos?.label} />
          <FilaDato
            label="¿Está a cargo?"
            valor={aCargo ? 'Sí, a cargo' : 'No, sólo informativo'}
            descripcion={aCargo ? 'Se solicitará comprobante' : 'No genera carga fiscal de Ganancias'}
          />
          <FilaDato label="Vínculo" valor="Hijo/a" />
        </View>

        <View style={styles.seccionVista}>
          <AppText variant="overline" tone="secondary">
            03 · Documentación adjunta
          </AppText>
          <FilaDato
            label="Documentos"
            valor={cantidadDocumentos > 0 ? `${cantidadDocumentos} documento(s) cargado(s)` : null}
          />
        </View>
      </AppModal>
    );
  }

  // ------------------------------------------------------------- Formulario
  return (
    <AppModal
      visible
      onClose={onClose}
      titulo={nuevo ? 'Cargar datos de hijo/a' : 'Editar datos de hijo/a'}
      cerrable={!guardando}
      altaCompleta
      pie={
        <>
          <AppButton title="Cancelar" variant="secondary" onPress={onClose} disabled={guardando} />
          <AppButton
            title={guardando ? (nuevo ? 'Guardando...' : 'Actualizando...') : 'Guardar hijo/a'}
            onPress={guardar}
            loading={guardando}
          />
        </>
      }
    >
      <AppText variant="overline" tone="secondary">
        Identidad
      </AppText>
      <View style={styles.campos}>
        <FormTextField control={control} name="nombreFamiliar" label="Nombre" required />
        <FormTextField control={control} name="apellidoFamiliar" label="Apellido" required />
      </View>

      <AppText variant="overline" tone="secondary">
        Documento
      </AppText>
      <View style={styles.campos}>
        <FormSelectField
          control={control}
          name="tipoDocFamiliar"
          label="Tipo de documento"
          required
          options={TIPOS_DOCUMENTO}
          // En el alta, cambiar el tipo vacía el número (el portal lo hace solo con `nuevo`).
          onCambio={() => {
            if (nuevo) setValue('docFamiliar', '', { shouldValidate: false });
          }}
        />
        <FormTextField control={control} name="docFamiliar" label="Nro. de documento" required {...propsDoc} />
      </View>

      <AppText variant="overline" tone="secondary">
        Datos personales
      </AppText>
      <View style={styles.campos}>
        <FormDateField
          control={control}
          name="fechaNacimiento"
          label="Fecha de nacimiento"
          required
          maximumDate={new Date()}
        />
        <FormTileSelector
          control={control}
          name="generoHijos"
          label="Sexo"
          required
          opciones={SEXOS.map((opcion) => ({ opcion, titulo: String(opcion.label) }))}
        />
      </View>

      <AppText variant="overline" tone="secondary">
        Vínculo con el empleado
      </AppText>
      <FormTileSelector
        control={control}
        name="aCargo"
        label="¿Está a cargo?"
        required
        ayuda="Marcá esta opción para incluir al hijo/a como carga familiar de Ganancias."
        disposicion="columna"
        opciones={[
          { opcion: A_CARGO[0], titulo: 'Sí, a cargo', descripcion: 'Se solicitará comprobante' },
          { opcion: A_CARGO[1], titulo: 'No, sólo informativo', descripcion: 'No genera carga fiscal' },
        ]}
      />

      <AppText variant="caption" tone="secondary">
        * Campos obligatorios
      </AppText>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  campos: { gap: spacing.md },
  cabeceraVista: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cabeceraTextos: { flex: 1, gap: spacing.xxs },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  seccionVista: { gap: spacing.sm },
});
