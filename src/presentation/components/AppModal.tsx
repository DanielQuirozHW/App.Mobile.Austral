import React, { useEffect, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorTokens } from '../theme/colors';
import { useThemeColors } from '../theme/theme';
import { useToastStore } from '../stores/toastStore';
import { borderRadius, iconSizes, spacing } from '../utils/responsive';
import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { ToastHost } from './ToastHost';

interface AppModalProps {
  visible: boolean;
  /** Cierre por el botón, por tocar afuera o por el botón Atrás de Android. */
  onClose: () => void;
  titulo?: string;
  subtitulo?: string;
  children: React.ReactNode;
  /** Zona fija inferior (botones). */
  pie?: React.ReactNode;
  /** 'hoja': panel que sube desde abajo. 'centrado': diálogo en el centro. */
  variante?: 'hoja' | 'centrado';
  /** false: no se puede cerrar (por ejemplo mientras se guarda). */
  cerrable?: boolean;
  /** false: el contenido maneja su propio scroll (listas largas). */
  scroll?: boolean;
  /** true: la hoja ocupa casi toda la pantalla. */
  altaCompleta?: boolean;
}

/**
 * Contenedor de modales de la app (equivale a los Dialog de MUI del portal).
 * Dibuja su propio host de avisos para que los toasts se vean por encima del modal.
 */
export const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  titulo,
  subtitulo,
  children,
  pie,
  variante = 'hoja',
  cerrable = true,
  scroll = true,
  altaCompleta = false,
}) => {
  const { globalColors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);
  const esHoja = variante === 'hoja';

  useEffect(() => {
    if (!visible) return undefined;
    useToastStore.getState().modalAbierto();
    return () => useToastStore.getState().modalCerrado();
  }, [visible]);

  const cerrar = () => {
    if (cerrable) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={esHoja ? 'slide' : 'fade'}
      statusBarTranslucent
      onRequestClose={cerrar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.fondo, esHoja ? styles.fondoHoja : styles.fondoCentrado]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={cerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        />
        <View
          style={[
            styles.panel,
            esHoja ? styles.panelHoja : styles.panelCentrado,
            esHoja && altaCompleta && styles.panelAlto,
            esHoja && { paddingBottom: insets.bottom },
          ]}
        >
          {titulo ? (
            <View style={styles.encabezado}>
              <View style={styles.titulos}>
                <AppText variant="h6">{titulo}</AppText>
                {subtitulo ? (
                  <AppText variant="caption" tone="secondary">
                    {subtitulo}
                  </AppText>
                ) : null}
              </View>
              {cerrable ? (
                <Pressable
                  onPress={onClose}
                  hitSlop={spacing.sm}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  style={styles.cerrar}
                >
                  <AppIcon name="close" size={iconSizes.lg} color={globalColors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {scroll ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.contenido}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.sinScroll}>{children}</View>
          )}

          {pie ? <View style={styles.pie}>{pie}</View> : null}
        </View>
        <ToastHost dentroDeModal />
      </KeyboardAvoidingView>
    </Modal>
  );
};

// El fondo oscuro ya separa el panel del resto: no lleva sombra (junto a overflow 'hidden' se recortaría en Android).
const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    fondo: { flex: 1, backgroundColor: c.overlay },
    fondoHoja: { justifyContent: 'flex-end' },
    fondoCentrado: { justifyContent: 'center', paddingHorizontal: spacing.lg },
    panel: { backgroundColor: c.card, overflow: 'hidden' },
    panelHoja: {
      maxHeight: '90%',
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
    },
    panelAlto: { height: '90%' },
    panelCentrado: {
      maxHeight: '85%',
      borderRadius: borderRadius.lg,
    },
    encabezado: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    titulos: { flex: 1, gap: spacing.xxs },
    cerrar: { padding: spacing.xs },
    scroll: { flexGrow: 0 },
    contenido: { padding: spacing.lg, gap: spacing.lg },
    sinScroll: { flexShrink: 1 },
    pie: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing.md,
      padding: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
  });
