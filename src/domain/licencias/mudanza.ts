// Licencia por mudanza. Port de Portal-Austral-Dev -> src/@core/utils/licenciaMudanza.
// Se detecta por el nombre del tipo (no hay un campo propio): /mudanza/i.

export const esLicenciaPorMudanza = (tipo: unknown): boolean => {
  if (!tipo) return false;
  if (typeof tipo === 'string') return /mudanza/i.test(tipo);
  const objeto = tipo as { new_name?: unknown; label?: unknown };
  return /mudanza/i.test(String(objeto.new_name ?? objeto.label ?? ''));
};
