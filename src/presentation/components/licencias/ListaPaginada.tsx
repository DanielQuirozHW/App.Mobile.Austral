import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeColors } from '../../theme/theme';
import { spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppText } from '../AppText';
import { InfoAlert } from '../InfoAlert';

export const MSG_ERROR_DE_LECTURA = 'No pudimos cargar los datos. Por favor, volvé a intentar.';
export const MSG_SIN_REGISTROS = 'Sin registros';

interface ListaPaginadaProps<T> {
  datos: T[];
  cargando: boolean;
  /** true si la última lectura falló. */
  error: boolean;
  keyDe: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  textoVacio?: string;
  porPagina?: number;
  /** Si se pasa, el estado de error muestra el botón "Reintentar". */
  onReintentar?: () => void;
}

/**
 * Lista simple para usar dentro de un scroll: muestra de a `porPagina` elementos y un botón "Ver más".
 * Resuelve los tres estados de la lectura (cargando, error, vacío).
 */
export function ListaPaginada<T>({
  datos,
  cargando,
  error,
  keyDe,
  renderItem,
  textoVacio = MSG_SIN_REGISTROS,
  porPagina = 10,
  onReintentar,
}: ListaPaginadaProps<T>) {
  const { globalColors } = useThemeColors();
  const [visibles, setVisibles] = useState(porPagina);

  // Si cambian los datos (otra pestaña, otro filtro o una recarga) se vuelve a la primera página.
  useEffect(() => {
    setVisibles(porPagina);
  }, [datos, porPagina]);

  if (datos.length === 0) {
    if (cargando) {
      return (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={globalColors.accentPrimary} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.error}>
          <InfoAlert tipo="error">{MSG_ERROR_DE_LECTURA}</InfoAlert>
          {onReintentar ? (
            <AppButton title="Reintentar" variant="secondary" icon="refresh-outline" onPress={onReintentar} />
          ) : null}
        </View>
      );
    }
    return (
      <View style={styles.centro}>
        <AppText variant="body2" tone="secondary">
          {textoVacio}
        </AppText>
      </View>
    );
  }

  const restantes = datos.length - visibles;
  return (
    <View style={styles.lista}>
      {datos.slice(0, visibles).map((item) => (
        <React.Fragment key={keyDe(item)}>{renderItem(item)}</React.Fragment>
      ))}
      {restantes > 0 ? (
        <AppButton
          title={`Ver más (${restantes})`}
          variant="secondary"
          onPress={() => setVisibles((actual) => actual + porPagina)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: spacing.md },
  error: { gap: spacing.sm },
  centro: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
