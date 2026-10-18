// Sección "Nuevo domicilio a declarar" del alta de licencia por mudanza.
// Port de Portal-Austral-Dev -> ModalSolicitud.tsx (SeccionNuevoDomicilio): mismos campos, mismos textos y la
// localidad se filtra por provincia (se vacía al cambiar de provincia).
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Errores, ValoresDomicilio } from '../../../domain/licencias/validaciones';
import { ColorTokens } from '../../theme/colors';
import { useCatalogosStore } from '../../stores/catalogosStore';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, spacing } from '../../utils/responsive';
import { AppText } from '../AppText';
import { AppTextField } from '../AppTextField';
import { SelectField, type OpcionDeSelect } from '../form/SelectField';

interface FormularioDomicilioProps {
  valores: ValoresDomicilio;
  errores: Errores;
  onChange: (valores: ValoresDomicilio) => void;
  disabled?: boolean;
}

export const FormularioDomicilio: React.FC<FormularioDomicilioProps> = ({ valores, errores, onChange, disabled = false }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const paises = useCatalogosStore((s) => s.paises);
  const provincias = useCatalogosStore((s) => s.provincias);
  const localidades = useCatalogosStore((s) => s.localidades);

  useEffect(() => {
    void useCatalogosStore.getState().cargar();
  }, []);

  const provinciaId = valores.provincia?.value !== undefined && valores.provincia?.value !== null ? String(valores.provincia.value) : null;
  const opcionesLocalidad = useMemo<OpcionDeSelect[]>(
    () =>
      (provinciaId ? localidades.filter((l) => l.provincia === provinciaId) : localidades).map((l) => ({
        value: l.value,
        label: l.label,
      })),
    [localidades, provinciaId],
  );

  const cambiar = <K extends keyof ValoresDomicilio>(clave: K, valor: ValoresDomicilio[K]) =>
    onChange({ ...valores, [clave]: valor });

  const cambiarProvincia = (opcion: OpcionDeSelect | null) => {
    const anterior = provinciaId;
    const nueva = opcion && opcion.value !== undefined && opcion.value !== null ? String(opcion.value) : null;
    // Igual que el portal: si la provincia cambia, la localidad elegida deja de ser válida.
    onChange({ ...valores, provincia: opcion, localidad: anterior !== nueva ? null : valores.localidad });
  };

  const opciones = (lista: { value: string; label: string }[]): OpcionDeSelect[] =>
    lista.map((o) => ({ value: o.value, label: o.label }));

  return (
    <View style={styles.caja}>
      <View>
        <AppText variant="subtitle2">Nuevo domicilio a declarar</AppText>
        <AppText variant="caption" tone="secondary">
          Indicá el domicilio al que te mudás.
        </AppText>
      </View>

      <AppTextField
        label="Calle"
        required
        value={valores.calle}
        onChangeText={(t) => cambiar('calle', t)}
        maxLength={100}
        error={errores.calle}
        editable={!disabled}
      />
      <AppTextField
        label="Nro."
        required
        value={valores.nroCalle}
        onChangeText={(t) => cambiar('nroCalle', t)}
        keyboardType="numeric"
        error={errores.nroCalle}
        editable={!disabled}
      />
      <AppTextField
        label="Piso"
        value={valores.piso}
        onChangeText={(t) => cambiar('piso', t)}
        maxLength={100}
        error={errores.piso}
        editable={!disabled}
      />
      <AppTextField
        label="Depto / lote"
        value={valores.depto}
        onChangeText={(t) => cambiar('depto', t)}
        maxLength={100}
        error={errores.depto}
        editable={!disabled}
      />
      <AppTextField
        label="Código postal"
        required
        value={valores.codigoPostal}
        // El portal no deja escribir otra cosa que letras y números y lo muestra en mayúsculas.
        onChangeText={(t) => cambiar('codigoPostal', t.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
        maxLength={10}
        autoCapitalize="characters"
        autoCorrect={false}
        error={errores.codigoPostal}
        editable={!disabled}
      />
      <SelectField
        label="País"
        required
        options={opciones(paises)}
        value={valores.pais}
        onChange={(o) => cambiar('pais', o)}
        placeholder={paises.length === 0 ? 'Cargando…' : 'Seleccionar'}
        error={errores.pais}
        disabled={disabled}
      />
      <SelectField
        label="Provincia"
        required
        options={opciones(provincias)}
        value={valores.provincia}
        onChange={cambiarProvincia}
        placeholder={provincias.length === 0 ? 'Cargando…' : 'Seleccionar'}
        error={errores.provincia}
        disabled={disabled}
      />
      <SelectField
        label="Localidad"
        options={opcionesLocalidad}
        value={valores.localidad}
        onChange={(o) => cambiar('localidad', o)}
        placeholder={localidades.length === 0 ? 'Cargando…' : 'Seleccionar'}
        buscable
        disabled={disabled}
      />
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    caja: {
      gap: spacing.md,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: borderRadius.card,
    },
  });
