// Datos del Tablero de Inicio: feriados y cumpleaños. Equivale a useGetFeriados + useGetCumpleanios del portal
// y a los useMemo de src/app/(dashboard)/page.tsx.
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  calcularCumpleaniosDeHoy,
  calcularProximosFeriados,
  fechaDeHoyEnArgentina,
  type FeriadoProximo,
  type PersonaCumpleanios,
} from '../../domain/inicio/tablero';
import { leerEmpleadosParaCumpleanios, leerFeriados } from '../../infrastructure/inicio/tableroApi';

interface Tablero {
  proximosFeriados: FeriadoProximo[];
  cargandoFeriados: boolean;
  cumpleaniosHoy: PersonaCumpleanios[];
  /** "26 OCT". */
  fechaDeHoy: string;
}

export const useTablero = (): Tablero => {
  const feriados = useQuery({ queryKey: ['tablero', 'feriados'], queryFn: leerFeriados });
  const empleados = useQuery({ queryKey: ['tablero', 'cumpleanios'], queryFn: leerEmpleadosParaCumpleanios });

  const ahora = new Date();
  const fechaDeHoy = fechaDeHoyEnArgentina(ahora).rotulo;
  const proximosFeriados = useMemo(() => calcularProximosFeriados(feriados.data, new Date()), [feriados.data]);
  const cumpleaniosHoy = useMemo(() => calcularCumpleaniosDeHoy(empleados.data, new Date()), [empleados.data]);

  return { proximosFeriados, cargandoFeriados: feriados.isLoading, cumpleaniosHoy, fechaDeHoy };
};
