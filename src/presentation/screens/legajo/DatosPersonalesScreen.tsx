// Datos personales. Port de Portal-Austral-Dev -> src/app/(dashboard)/legajo/datos-personales/page.tsx.
// Secciones, textos, validaciones y flujo de guardado: los del portal. Diferencias propias de la app:
//  - avisa antes de salir si hay cambios sin guardar (el portal solo usa `beforeunload` del navegador);
//  - un solo escalonado de campos (una columna) en lugar de la grilla de 12 columnas;
//  - sin el breadcrumb "Legajo > Datos personales" (LegajoPageHeader): el título de la pantalla ya lo dice;
//  - las secciones son colapsables (docs/DECISION-UI-MOBILE.md): cerradas muestran un resumen; al intentar guardar con
//    campos obligatorios vacíos se abre la sección que los tiene. El botón "Guardar cambios" queda fijo abajo.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { cargarDatosPersonales, guardarDatosPersonales } from '../../../application/legajo/legajoService';
import {
  formularioVacio,
  legajoAFormulario,
  type FormularioDatosPersonales,
} from '../../../domain/legajo/formulario';
import { ESTADOS_CIVILES, SEXOS, TIPOS_DOCUMENTO, VINCULOS_EMERGENCIA, esEstadoConConyuge } from '../../../domain/legajo/opciones';
import { contratacionIndeterminada, esRelacionDependencia } from '../../../domain/legajo/tipoContratacion';
import { esquemaDatosPersonales } from '../../../domain/legajo/validacion';
import { AppButton } from '../../components/AppButton';
import { AppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FormDateField } from '../../components/form/FormDateField';
import { FormSelectField } from '../../components/form/FormSelectField';
import { FormTextField } from '../../components/form/FormTextField';
import { ScrollFormulario, type ScrollFormularioRef } from '../../components/form/ScrollFormulario';
import { InfoAlert } from '../../components/InfoAlert';
import { BloqueFamilia } from '../../components/legajo/BloqueFamilia';
import { propsNumeroDocumento } from '../../components/legajo/documentoProps';
import { ModalConyuge } from '../../components/legajo/ModalConyuge';
import { PerfilLegajoBanner } from '../../components/legajo/PerfilLegajoBanner';
import { SeccionCard } from '../../components/SeccionCard';
import type { RootStackParams } from '../../navigation/tipos';
import { useCatalogosStore } from '../../stores/catalogosStore';
import { useFamiliaStore } from '../../stores/familiaStore';
import { useLegajoStore } from '../../stores/legajoStore';
import { ColorTokens } from '../../theme/colors';
import { useThemeColors } from '../../theme/theme';
import { borderRadius, iconSizes, platformSpecific, scale, spacing } from '../../utils/responsive';
import { toast } from '../../utils/toast';

type Props = NativeStackScreenProps<RootStackParams, 'DatosPersonales'>;

// Orden visual de los campos: sirve para llevar el foco al primero con error.
const ORDEN_CAMPOS: Array<keyof FormularioDatosPersonales> = [
  'new_apellidos',
  'new_nombredepila',
  'generoSegunDni',
  'new_tipodocumento',
  'numeroDocumento',
  'new_cuitcuil',
  'estadoCivil',
  'paisNacimiento',
  'fechaNacimiento',
  'segundaNacionalidad',
  'telefonoMovilPais',
  'telefonoMovilDdn',
  'telefonoMovilNumero',
  'email',
  'calle',
  'nroCalle',
  'piso',
  'depto',
  'codigoPostal',
  'pais',
  'provincia',
  'localidad',
  'nombreEmergencia',
  'celularEmergencia',
  'emailEmergencia',
  'vinculoEmergencia',
];

// Qué campos tiene cada sección: sirve para abrir la que tiene errores al intentar guardar.
const CAMPOS_POR_SECCION: Record<'identidad' | 'contacto' | 'domicilio' | 'emergencia', Array<keyof FormularioDatosPersonales>> = {
  identidad: [
    'new_apellidos',
    'new_nombredepila',
    'generoSegunDni',
    'new_tipodocumento',
    'numeroDocumento',
    'new_cuitcuil',
    'estadoCivil',
    'paisNacimiento',
    'fechaNacimiento',
    'segundaNacionalidad',
  ],
  contacto: ['telefonoMovilPais', 'telefonoMovilDdn', 'telefonoMovilNumero', 'email'],
  domicilio: ['calle', 'nroCalle', 'piso', 'depto', 'codigoPostal', 'pais', 'provincia', 'localidad'],
  emergencia: ['nombreEmergencia', 'celularEmergencia', 'emailEmergencia', 'vinculoEmergencia'],
};

const MSG_DOCUMENTACION_FAMILIAR =
  'La documentación familiar (DNI y constancia) es requerida únicamente en caso de corresponder y solicitar algún beneficio.';

export const DatosPersonalesScreen: React.FC<Props> = ({ navigation }) => {
  const { globalColors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(globalColors), [globalColors]);

  const legajo = useLegajoStore((s) => s.legajo);
  const conyuge = useFamiliaStore((s) => s.conyuge);
  const paises = useCatalogosStore((s) => s.paises);
  const provincias = useCatalogosStore((s) => s.provincias);
  const localidades = useCatalogosStore((s) => s.localidades);
  const errorCatalogos = useCatalogosStore((s) => s.error);

  const scrollRef = useRef<ScrollFormularioRef>(null);
  const conyugeRef = useRef<View>(null);

  const [intento, setIntento] = useState(0);
  const [cargaTerminada, setCargaTerminada] = useState(false);
  const [formListo, setFormListo] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [bajaConyugePendiente, setBajaConyugePendiente] = useState<FormularioDatosPersonales | null>(null);
  const [resaltarConyuge, setResaltarConyuge] = useState(false);
  const [altaConyugeAbierta, setAltaConyugeAbierta] = useState(false);
  // Secciones abiertas. Arranca solo la primera; el resto se abre tocando el encabezado o al intentar guardar con errores.
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({ identidad: true });

  const alternarSeccion = (clave: string) => setAbiertas((previo) => ({ ...previo, [clave]: !previo[clave] }));

  const { control, handleSubmit, reset, setValue, getValues, watch, setFocus, clearErrors, formState } =
    useForm<FormularioDatosPersonales>({
      mode: 'onChange',
      defaultValues: formularioVacio(),
      resolver: yupResolver(esquemaDatosPersonales as any) as any,
    });
  const { isDirty } = formState;

  // ---------------------------------------------------------------- Carga
  // Se lee siempre de nuevo al entrar: el formulario se arma con datos recién traídos, no con los de una visita anterior.
  useEffect(() => {
    let activo = true;
    setCargaTerminada(false);
    Promise.all([cargarDatosPersonales(), useCatalogosStore.getState().cargar()])
      .catch(() => undefined)
      .finally(() => {
        if (activo) setCargaTerminada(true);
      });
    return () => {
      activo = false;
    };
  }, [intento]);

  // Hidratación única del formulario con el legajo (mapearLegajoAForm del portal).
  const hidratado = useRef(false);
  const tipoDocAnterior = useRef<{ value?: unknown } | null>(null);
  useEffect(() => {
    if (!cargaTerminada || !legajo || hidratado.current) return;
    const inicial = legajoAFormulario(legajo, localidades);
    reset(inicial);
    tipoDocAnterior.current = inicial.new_tipodocumento;
    hidratado.current = true;
    setFormListo(true);
  }, [cargaTerminada, legajo, localidades, reset]);

  // ---------------------------------------------------- Cambios sin guardar
  const sinGuardarRef = useRef(false);
  sinGuardarRef.current = isDirty && !actualizando;
  useEffect(() => {
    return navigation.addListener('beforeRemove', (evento) => {
      if (!sinGuardarRef.current) return;
      evento.preventDefault();
      Alert.alert(
        'Cambios sin guardar',
        'Si salís ahora vas a perder los cambios que no guardaste.',
        [
          { text: 'Seguir editando', style: 'cancel' },
          { text: 'Salir sin guardar', style: 'destructive', onPress: () => navigation.dispatch(evento.data.action) },
        ],
      );
    });
  }, [navigation]);

  // ------------------------------------------------------- Valores derivados
  const estadoCivil = watch('estadoCivil');
  const tipoDoc = watch('new_tipodocumento');
  const provincia = watch('provincia');

  // Resúmenes de las secciones cerradas.
  const apellido = watch('new_apellidos');
  const nombrePila = watch('new_nombredepila');
  const emailPersonal = watch('email');
  const calle = watch('calle');
  const nroCalle = watch('nroCalle');
  const nombreEmergencia = watch('nombreEmergencia');
  const resumenIdentidad = [apellido, nombrePila].filter(Boolean).join(', ');
  const resumenDomicilio = [calle, nroCalle].filter(Boolean).join(' ');

  const tipoContratacion = legajo?.tipoContratacion;
  const habilitaFamilia = esRelacionDependencia(tipoContratacion);
  const contratacionSinResolver = contratacionIndeterminada(tipoContratacion);
  const estadoCivilRequiereConyuge = esEstadoConConyuge(estadoCivil?.value);
  const enTransicionEliminandoConyuge = actualizando && Boolean(conyuge?.id) && !estadoCivilRequiereConyuge;
  const mostrarCampoConyuge = estadoCivilRequiereConyuge || Boolean(conyuge?.id);
  const avisarFamiliaNoDisponible = estadoCivilRequiereConyuge && !habilitaFamilia && !contratacionSinResolver;

  const localidadesFiltradas = useMemo(() => {
    const provinciaId = provincia?.value;
    return provinciaId ? localidades.filter((l) => l.provincia === provinciaId) : localidades;
  }, [localidades, provincia?.value]);

  // Cambiar el tipo de documento vacía el número (solo después de la hidratación).
  useEffect(() => {
    if (!hidratado.current) return;
    const anterior = tipoDocAnterior.current;
    if (anterior && anterior.value !== undefined && anterior.value !== tipoDoc?.value && tipoDoc?.value !== undefined) {
      setValue('numeroDocumento', '');
    }
    tipoDocAnterior.current = tipoDoc;
  }, [tipoDoc, setValue]);

  // ------------------------------------------------------------- Guardado
  const guardarLegajo = async (datos: FormularioDatosPersonales, eliminarConyugeId?: string) => {
    setActualizando(true);
    const idToast = toast.loading('Procesando datos del legajo...');
    try {
      const ok = await guardarDatosPersonales(datos, eliminarConyugeId);
      toast.dismiss(idToast);
      if (ok) {
        // Lo guardado pasa a ser el estado base del formulario.
        reset(getValues());
        toast.success('Datos actualizados correctamente.');
      } else {
        toast.error('Hubo un error al actualizar los datos del legajo.');
      }
    } catch {
      toast.dismiss(idToast);
      toast.error('Hubo un error al actualizar los datos.');
    } finally {
      setActualizando(false);
    }
  };

  const actualizarPerfil = async (datos: FormularioDatosPersonales) => {
    const requiereConyuge = esEstadoConConyuge(datos.estadoCivil?.value);

    if (habilitaFamilia && requiereConyuge && !conyuge?.id) {
      toast.error('Debe cargar los datos del cónyuge antes de actualizar.', 4000);
      // La sección Familia tiene que estar abierta para ver y resaltar el campo del cónyuge.
      setAbiertas((previo) => ({ ...previo, familia: true }));
      setResaltarConyuge(true);
      setTimeout(() => scrollRef.current?.scrollAVista(conyugeRef.current), 250);
      setTimeout(() => setResaltarConyuge(false), 3000);
      return;
    }

    // La baja del cónyuge la dispara únicamente el cambio de estado civil, y se confirma antes de ejecutarla.
    if (!requiereConyuge && conyuge?.id) {
      setBajaConyugePendiente(datos);
      return;
    }

    await guardarLegajo(datos);
  };

  const alFormularioInvalido = (errores: Record<string, unknown>) => {
    toast.error('Faltan completar campos obligatorios.', 4000);
    const conError = ORDEN_CAMPOS.filter((campo) => errores[campo]);
    if (conError.length === 0) return;

    // Se abren las secciones que tienen campos con error.
    setAbiertas((previo) => {
      const siguiente = { ...previo };
      (Object.keys(CAMPOS_POR_SECCION) as Array<keyof typeof CAMPOS_POR_SECCION>).forEach((clave) => {
        if (CAMPOS_POR_SECCION[clave].some((campo) => errores[campo])) siguiente[clave] = true;
      });
      return siguiente;
    });

    // Los campos de una sección recién abierta se hacen visibles en el próximo cuadro: se espera antes de enfocar.
    const primero = conError[0];
    setTimeout(() => setFocus(primero), 200);
  };

  const enviar = handleSubmit(actualizarPerfil, alFormularioInvalido as any);

  const cancelarBajaConyuge = () => setBajaConyugePendiente(null);
  const confirmarBajaConyuge = async () => {
    const datos = bajaConyugePendiente;
    setBajaConyugePendiente(null);
    if (datos) await guardarLegajo(datos, conyuge?.id);
  };

  // ---------------------------------------------------------------- Vistas
  if (!cargaTerminada) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={globalColors.accentPrimary} />
        <AppText variant="h6" tone="secondary" style={styles.textoCentrado}>
          Cargando tus datos...
        </AppText>
        <AppText variant="body2" tone="secondary" style={styles.textoCentrado}>
          Un momento, por favor.
        </AppText>
      </View>
    );
  }

  if (!legajo || !formListo) {
    return (
      <View style={styles.centrado}>
        <InfoAlert tipo="error">No pudimos cargar tus datos. Por favor, volvé a intentar.</InfoAlert>
        <AppButton title="Reintentar" onPress={() => setIntento((n) => n + 1)} />
      </View>
    );
  }

  const alfanumerico = propsNumeroDocumento(tipoDoc?.label);

  return (
    <View style={styles.pantalla}>
      <ScrollFormulario ref={scrollRef} contentContainerStyle={styles.contenido}>
        <PerfilLegajoBanner localidadLabel={legajo.localidad?.label || undefined} />

        <InfoAlert>
          <AppText variant="body2">
            Revisá y mantené actualizados tus datos. Tocá una sección para editarla y guardá los cambios al final.
          </AppText>
        </InfoAlert>

        {errorCatalogos ? (
          <InfoAlert tipo="advertencia">
            No pudimos cargar todos los listados (países, provincias y localidades). Salí y volvé a entrar para reintentar.
          </InfoAlert>
        ) : null}

        {/* Identidad */}
        <SeccionCard
          icono="person-outline"
          titulo="Identidad"
          descripcion="Tus datos personales y de identificación oficial."
          resumen={resumenIdentidad}
          colapsable
          abierta={Boolean(abiertas.identidad)}
          onAlternar={() => alternarSeccion('identidad')}
        >
          <FormTextField control={control} name="new_apellidos" label="Apellido(s)" required autoCapitalize="words" />
          <FormTextField control={control} name="new_nombredepila" label="Nombre(s)" required autoCapitalize="words" />
          <FormSelectField control={control} name="generoSegunDni" label="Sexo" required options={SEXOS} />
          <FormSelectField
            control={control}
            name="new_tipodocumento"
            label="Tipo documento"
            required
            options={TIPOS_DOCUMENTO}
          />
          <FormTextField control={control} name="numeroDocumento" label="Nro. documento" required {...alfanumerico} />
          <FormTextField
            control={control}
            name="new_cuitcuil"
            label="CUIT/CUIL"
            required
            soloDigitos
            maximo={11}
            keyboardType="number-pad"
          />
          <FormSelectField control={control} name="estadoCivil" label="Estado Civil" required options={ESTADOS_CIVILES} />
          <FormSelectField control={control} name="paisNacimiento" label="País nacimiento" options={paises} />
          <FormDateField
            control={control}
            name="fechaNacimiento"
            label="Fecha nacimiento"
            fechaInicial={new Date(1990, 0, 1)}
            maximumDate={new Date()}
          />
          <FormSelectField control={control} name="segundaNacionalidad" label="Segunda nacionalidad" options={paises} />
        </SeccionCard>

        {/* Contacto */}
        <SeccionCard
          icono="call-outline"
          titulo="Contacto"
          descripcion="Tu teléfono celular y tu correo electrónico."
          resumen={emailPersonal}
          colapsable
          abierta={Boolean(abiertas.contacto)}
          onAlternar={() => alternarSeccion('contacto')}
        >
          <AppText variant="label" tone="secondary">
            Celular personal
          </AppText>
          <View style={styles.filaCampos}>
            <View style={styles.campoChico}>
              <FormTextField
                control={control}
                name="telefonoMovilPais"
                label="País"
                required
                placeholder="54"
                soloDigitos
                maximo={3}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.campoChico}>
              <FormTextField
                control={control}
                name="telefonoMovilDdn"
                label="Cod. Área"
                required
                placeholder="341"
                soloDigitos
                maximo={4}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.campoGrande}>
              <FormTextField
                control={control}
                name="telefonoMovilNumero"
                label="Número"
                required
                placeholder="2160872"
                soloDigitos
                maximo={8}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <FormTextField
            control={control}
            name="email"
            label="Email personal"
            required
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </SeccionCard>

        {/* Domicilio real */}
        <SeccionCard
          icono="home-outline"
          titulo="Domicilio real"
          descripcion="Donde residís actualmente."
          resumen={resumenDomicilio}
          colapsable
          abierta={Boolean(abiertas.domicilio)}
          onAlternar={() => alternarSeccion('domicilio')}
        >
          <View style={styles.filaCampos}>
            <View style={styles.campoGrande}>
              <FormTextField control={control} name="calle" label="Calle" required />
            </View>
            <View style={styles.campoChico}>
              <FormTextField
                control={control}
                name="nroCalle"
                label="Nro."
                required
                soloDigitos
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View style={styles.filaCampos}>
            <View style={styles.campoChico}>
              <FormTextField control={control} name="piso" label="Piso" />
            </View>
            <View style={styles.campoChico}>
              <FormTextField control={control} name="depto" label="Depto / lote" />
            </View>
            <View style={styles.campoChico}>
              <FormTextField
                control={control}
                name="codigoPostal"
                label="Código Postal"
                required
                maximo={10}
                mayusculas
                transformar={(texto) => texto.replace(/[^a-zA-Z0-9]/g, '')}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
          </View>
          <FormSelectField control={control} name="pais" label="País" required options={paises} />
          <FormSelectField
            control={control}
            name="provincia"
            label="Provincia"
            required
            options={provincias}
            // Al cambiar de provincia la localidad deja de corresponder: se vacía.
            onCambio={() => {
              setValue('localidad', null, { shouldValidate: false, shouldDirty: true });
              clearErrors('localidad');
            }}
          />
          <FormSelectField control={control} name="localidad" label="Localidad" options={localidadesFiltradas} />
        </SeccionCard>

        {/* El estado civil pide cónyuge pero la contratación no habilita la sección Familia: se explica. */}
        {avisarFamiliaNoDisponible ? (
          <InfoAlert>
            <AppText variant="body2">
              Los datos de cónyuge e hijos/as se cargan en la sección Familia, disponible solo para el personal en relación de
              dependencia. Según tu legajo, tu tipo de contratación es{' '}
              <AppText variant="subtitle2">{tipoContratacion?.label}</AppText>, así que esa sección no se muestra. Podés
              guardar igual el cambio de estado civil. Si te corresponde declararlos, comunicate con el área de Personal.
            </AppText>
          </InfoAlert>
        ) : null}

        {/* Familia (solo relación de dependencia) */}
        {habilitaFamilia ? (
          <SeccionCard
            icono="people-outline"
            titulo="Familia"
            descripcion="Tu cónyuge e hijos/as menores de 22 años."
            colapsable
            abierta={Boolean(abiertas.familia)}
            onAlternar={() => alternarSeccion('familia')}
            accionEncabezado={
              <Pressable
                onPress={() => Alert.alert('Documentación familiar', MSG_DOCUMENTACION_FAMILIAR)}
                hitSlop={spacing.sm}
                accessibilityRole="button"
                accessibilityLabel="Información sobre la documentación familiar"
                style={styles.botonAyuda}
              >
                <AppIcon name="information-circle-outline" size={iconSizes.lg} color={globalColors.accentPrimary} />
              </Pressable>
            }
          >
            <BloqueFamilia
              conyugeRef={conyugeRef}
              resaltarConyuge={resaltarConyuge}
              mostrarCampoConyuge={mostrarCampoConyuge}
              enTransicionEliminandoConyuge={enTransicionEliminandoConyuge}
              onAgregarConyuge={() => setAltaConyugeAbierta(true)}
            />
          </SeccionCard>
        ) : null}

        {/* Contacto de emergencia: aplica a todos. */}
        <SeccionCard
          icono="medkit-outline"
          titulo="Contacto de emergencia"
          descripcion="A quién avisar ante una urgencia."
          resumen={nombreEmergencia}
          colapsable
          abierta={Boolean(abiertas.emergencia)}
          onAlternar={() => alternarSeccion('emergencia')}
        >
          <FormTextField
            control={control}
            name="nombreEmergencia"
            label="Nombre de contacto de emergencia"
            required
            maximo={100}
            mostrarContador
          />
          <FormTextField
            control={control}
            name="celularEmergencia"
            label="Celular de emergencia"
            required
            maximo={100}
            mostrarContador
            keyboardType="phone-pad"
          />
          <FormTextField
            control={control}
            name="emailEmergencia"
            label="Email de emergencia"
            required
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FormSelectField
            control={control}
            name="vinculoEmergencia"
            label="Vínculo de contacto"
            required
            options={VINCULOS_EMERGENCIA}
          />
        </SeccionCard>
      </ScrollFormulario>

      {/* Barra inferior fija con la acción principal */}
      <View style={[styles.barra, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton title="Guardar cambios" onPress={enviar} loading={actualizando} disabled={actualizando} grande />
      </View>

      {altaConyugeAbierta ? (
        <ModalConyuge
          modo="nuevo"
          onClose={() => setAltaConyugeAbierta(false)}
          obtenerDatosEmpleado={getValues}
          // El alta guardó el legajo con el estado civil nuevo: el formulario queda como base.
          onGuardado={() => reset(getValues())}
        />
      ) : null}

      <ConfirmDialog
        visible={Boolean(bajaConyugePendiente)}
        titulo="Confirmar cambio de estado civil"
        textoConfirmar="Guardar y eliminar"
        textoConfirmando="Guardando..."
        confirmando={actualizando}
        peligroso
        onCancelar={cancelarBajaConyuge}
        onConfirmar={confirmarBajaConyuge}
      >
        <AppText variant="body1">
          Al guardar con el estado civil <AppText variant="subtitle1">{bajaConyugePendiente?.estadoCivil?.label}</AppText> se
          va a eliminar a{' '}
          <AppText variant="subtitle1">
            {`${conyuge?.nombreFamiliar ?? ''} ${conyuge?.apellidoFamiliar ?? ''}`.trim()}
          </AppText>{' '}
          de tus datos de familia, junto con su documentación.{'\n'}
          <AppText variant="subtitle1">Esta acción no se puede deshacer.</AppText>
        </AppText>
      </ConfirmDialog>
    </View>
  );
};

const createStyles = (c: ColorTokens) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: c.background },
    contenido: { padding: spacing.lg, gap: spacing.md },
    centrado: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.lg,
      padding: spacing.xl,
      backgroundColor: c.background,
    },
    textoCentrado: { textAlign: 'center' },
    filaCampos: { flexDirection: 'row', gap: spacing.sm },
    campoChico: { flex: 1 },
    campoGrande: { flex: 2 },
    botonAyuda: {
      width: scale(40),
      height: scale(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    barra: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      backgroundColor: c.card,
      borderTopWidth: 1,
      borderTopColor: c.border,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      ...platformSpecific.shadow(6),
    },
  });
