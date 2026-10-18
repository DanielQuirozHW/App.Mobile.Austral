// Port de Portal-Austral-Dev -> licencias/_components/licencias/Componentes/DomicilioDeclarado.tsx
// (mismo orden de campos y mismos textos).
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { DomicilioLicencia } from '../../../domain/licencias/tipos';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, spacing } from '../../utils/responsive';
import { AppIcon } from '../AppIcon';
import { AppText } from '../AppText';

const CAMPOS: { clave: keyof DomicilioLicencia; label: string }[] = [
  { clave: 'calle', label: 'Calle' },
  { clave: 'nro', label: 'Nro.' },
  { clave: 'piso', label: 'Piso' },
  { clave: 'depto', label: 'Depto / lote' },
  { clave: 'codigoPostal', label: 'Código postal' },
  { clave: 'pais', label: 'País' },
  { clave: 'provincia', label: 'Provincia' },
  { clave: 'localidad', label: 'Localidad' },
];

interface DomicilioDeclaradoProps {
  domicilio?: DomicilioLicencia;
}

export const DomicilioDeclarado: React.FC<DomicilioDeclaradoProps> = ({ domicilio }) => {
  const { globalColors } = useThemeColors();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const sinDatos = CAMPOS.every(({ clave }) => !domicilio?.[clave]);

  return (
    <View style={styles.caja}>
      <View style={styles.encabezado}>
        <View style={styles.icono}>
          <AppIcon name="home-outline" size={iconSizes.md} color={globalColors.accentPrimary} />
        </View>
        <View style={styles.titulos}>
          <AppText variant="subtitle2">Nuevo domicilio declarado</AppText>
          <AppText variant="caption" tone="secondary">
            {sinDatos ? 'La solicitud no tiene un domicilio cargado.' : 'Informado al solicitar la licencia.'}
          </AppText>
        </View>
      </View>
      {sinDatos ? null : (
        <View style={styles.campos}>
          {CAMPOS.map(({ clave, label }) => (
            <View key={clave} style={styles.campo}>
              <AppText variant="caption" tone="secondary">
                {label}
              </AppText>
              <AppText variant="body2" tone={domicilio?.[clave] ? 'default' : 'tertiary'} style={styles.valor}>
                {domicilio?.[clave] || '—'}
              </AppText>
            </View>
          ))}
        </View>
      )}
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
    encabezado: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    icono: {
      width: 32,
      height: 32,
      borderRadius: borderRadius.md,
      backgroundColor: c.accentPrimaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulos: { flex: 1 },
    campos: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, columnGap: spacing.lg },
    campo: { minWidth: '40%', flexGrow: 1 },
    valor: { fontWeight: '500' },
  });
