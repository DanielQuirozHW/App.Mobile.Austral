// Docencia: comentario para explicar el racional de horas y "2. Asesoramiento académico personal - Grado".
// Port de ModalPlanDeTrabajoDocente.tsx (Portal-Austral-Dev).
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { guardarDatosDelPlan } from '../../../application/pta/ptaService';
import { AYUDA_ASESORAMIENTO } from '../../../domain/pta/constantes';
import type { PlanDeTrabajo } from '../../../domain/pta/tipos';
import { spacing } from '../../utils/responsive';
import { AppButton } from '../AppButton';
import { AppTextField } from '../AppTextField';
import { InfoAlert } from '../InfoAlert';
import { CajaPta } from './CajaPta';
import { ejecutarConToast } from './ejecutarPta';

interface Props {
  plan: PlanDeTrabajo;
  deshabilitado: boolean;
}

const TEXTOS = {
  procesando: 'Procesando...',
  exito: 'Cambios guardados correctamente',
  error: 'Error al editar el plan de trabajo',
};
const MAX_COMENTARIO = 1000;
const soloDigitos = (t: string): string => t.replace(/\D/g, '');
const aTexto = (n: number | null): string => (n === null || n === undefined ? '' : String(n));

export const ComentarioHorasClases: React.FC<Props> = ({ plan, deshabilitado }) => {
  const [comentario, setComentario] = useState(plan.comentariosHorasClases);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => setComentario(plan.comentariosHorasClases), [plan.comentariosHorasClases]);

  const guardar = async () => {
    setGuardando(true);
    await ejecutarConToast(() => guardarDatosDelPlan(plan, { comentariosHorasClases: comentario }), TEXTOS);
    setGuardando(false);
  };

  return (
    <View style={{ gap: spacing.md }}>
      <AppTextField
        label="Comentario para explicar racional de horas"
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
        maxLength={MAX_COMENTARIO}
        editable={!deshabilitado}
        helperText={`${Math.max(MAX_COMENTARIO - comentario.length, 0)} caracteres restantes`}
      />
      <AppButton title="Guardar" onPress={guardar} loading={guardando} disabled={deshabilitado || guardando} />
    </View>
  );
};

export const AsesoramientoAcademico: React.FC<Props> = ({ plan, deshabilitado }) => {
  const [alumnos, setAlumnos] = useState(aTexto(plan.numeroAlumnos));
  const [entrevistas, setEntrevistas] = useState(aTexto(plan.numeroEntrevistas));
  const [horas, setHoras] = useState(aTexto(plan.horasDocente));
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setAlumnos(aTexto(plan.numeroAlumnos));
    setEntrevistas(aTexto(plan.numeroEntrevistas));
    setHoras(aTexto(plan.horasDocente));
  }, [plan.numeroAlumnos, plan.numeroEntrevistas, plan.horasDocente]);

  const guardar = async () => {
    setGuardando(true);
    await ejecutarConToast(
      () => guardarDatosDelPlan(plan, { numeroAlumnos: alumnos, numeroEntrevistas: entrevistas, horasDocente: horas }),
      TEXTOS,
    );
    setGuardando(false);
  };

  return (
    <CajaPta titulo="2. Asesoramiento académico personal - Grado">
      <InfoAlert tipo="info">{AYUDA_ASESORAMIENTO}</InfoAlert>
      <AppTextField
        label="Nro Alumnos"
        value={alumnos}
        onChangeText={(t) => setAlumnos(soloDigitos(t))}
        keyboardType="number-pad"
        editable={!deshabilitado}
      />
      <AppTextField
        label="Nro. Entrevistas por alumno (promedio anual)"
        value={entrevistas}
        onChangeText={(t) => setEntrevistas(soloDigitos(t))}
        keyboardType="number-pad"
        editable={!deshabilitado}
        helperText={AYUDA_ASESORAMIENTO}
      />
      <AppTextField
        label="Cantidad Horas"
        value={horas}
        onChangeText={(t) => setHoras(soloDigitos(t))}
        keyboardType="number-pad"
        editable={!deshabilitado}
        helperText={AYUDA_ASESORAMIENTO}
      />
      <AppButton title="Guardar" onPress={guardar} loading={guardando} disabled={deshabilitado || guardando} />
    </CajaPta>
  );
};
