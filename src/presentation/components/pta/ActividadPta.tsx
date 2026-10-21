// Contenido de cada pestaña de "Actividad académica" del Plan de Trabajo. Port de ModalPlanDeTrabajoDocente.tsx
// (Portal-Austral-Dev): qué secciones, qué formularios sueltos y qué totales muestra cada una.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { SubPestania } from '../../../domain/pta/constantes';
import { SECCIONES_POR_SUBPESTANIA, TOTALES_POR_SUBPESTANIA } from '../../../domain/pta/resumen';
import type { ClaveSeccion, PlanDeTrabajo } from '../../../domain/pta/tipos';
import { spacing } from '../../utils/responsive';
import { AppText } from '../AppText';
import { AsesoramientoAcademico, ComentarioHorasClases } from './DatosDocenciaPta';
import { FormacionVinculacionInv, TotalInvestigacion } from './DatosInvestigacionPta';
import { ResumenPta } from './ResumenPta';
import { SeccionPta } from './SeccionPta';
import { TotalesPta } from './TotalesPta';

interface Props {
  plan: PlanDeTrabajo;
  subPestania: SubPestania;
  /** isDisabled del portal. */
  deshabilitado: boolean;
  /** El estado del PTA permite cargar (1 o 100000000). */
  editable: boolean;
  onEnviado: () => void;
}

export const ActividadPta: React.FC<Props> = ({ plan, subPestania, deshabilitado, editable, onEnviado }) => {
  if (subPestania === 'resumen') {
    return <ResumenPta plan={plan} deshabilitado={deshabilitado} editable={editable} onEnviado={onEnviado} />;
  }

  const secciones = SECCIONES_POR_SUBPESTANIA[subPestania] ?? [];
  const seccion = (clave: ClaveSeccion) => {
    const datos = secciones.find((s) => s.clave === clave);
    if (!datos) return null;
    return (
      <SeccionPta
        key={clave}
        clave={clave}
        encabezado={datos.encabezado}
        planId={plan.id}
        deshabilitado={deshabilitado}
      />
    );
  };

  const total = TOTALES_POR_SUBPESTANIA[subPestania];

  return (
    <View style={styles.contenedor}>
      {subPestania === 'docencia' ? (
        <>
          {seccion('clases')}
          <ComentarioHorasClases plan={plan} deshabilitado={deshabilitado} />
          <AsesoramientoAcademico plan={plan} deshabilitado={deshabilitado} />
        </>
      ) : null}

      {subPestania === 'investigacion' ? (
        <>
          <FormacionVinculacionInv plan={plan} deshabilitado={deshabilitado} editable={editable} />
          {seccion('areas')}
          {seccion('proyectos')}
          <AppText variant="h6">4. Resultados esperados</AppText>
          {seccion('publicaciones')}
          {seccion('congresos')}
          <TotalInvestigacion plan={plan} deshabilitado={deshabilitado} editable={editable} />
          {seccion('divulgaciones')}
        </>
      ) : null}

      {subPestania === 'formacion' ? (
        <>
          <AppText variant="h6">Formación disciplinar</AppText>
          {seccion('formacionDoctoral')}
          {seccion('formacionEspecifica')}
          {seccion('formacionHumanistica')}
          {seccion('formacionPedagogica')}
          {seccion('seminarios')}
        </>
      ) : null}

      {subPestania !== 'docencia' && subPestania !== 'investigacion' && subPestania !== 'formacion'
        ? secciones.map((s) => seccion(s.clave))
        : null}

      {total ? (
        <TotalesPta
          totales={[
            { etiqueta: total.etiquetaHoras, valor: total.horas(plan) },
            { etiqueta: total.etiquetaDias, valor: total.dias(plan) },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  contenedor: { gap: spacing.lg },
});
