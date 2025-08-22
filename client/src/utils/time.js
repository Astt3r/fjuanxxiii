// Utilidades de tiempo y fechas
// Retorna un ISO string ajustado a un offset horario fijo (ej: -4 horas)
export function isoWithOffsetHours(offsetHours = -4, date = new Date()) {
  // Clonar fecha
  const d = new Date(date.getTime());
  // Ajustar restando (offset negativo significa restar horas a UTC actual para obtener UTC-4)
  // Queremos una marca de tiempo que represente "ahora" en UTC-04:00, así que
  // tomamos ahora y restamos (offsetHours * 60min * 60s * 1000ms) si offsetHours es negativo.
  d.setUTCHours(d.getUTCHours() + offsetHours);
  return d.toISOString();
}

// Devuelve fecha (YYYY-MM-DD) en offset fijo para campos <input type=date>
export function dateInputValueOffset(offsetHours = -4, date = new Date()) {
  return isoWithOffsetHours(offsetHours, date).split('T')[0];
}
