/**
 * Fechas "rodantes" para los eventos de demostración.
 *
 * Los datos de ejemplo no pueden tener fechas fijas: en unas semanas quedarían
 * en el pasado y la agenda se vería vacía. Cada evento guarda su día de la
 * semana y hora (de `startsAt`) y un `rollingWeeks`: cuántas semanas después
 * del próximo día que le toca cae. Así siempre quedan en las próximas ~5
 * semanas, y un evento de viernes sigue siendo de viernes.
 *
 * Con eventos reales (fase con base de datos) esto deja de usarse.
 */

const BA_TIME_ZONE = "America/Argentina/Buenos_Aires";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Fecha de hoy en Buenos Aires como { y, m, d } (sin depender del huso del servidor). */
function todayInBuenosAires(now: Date): { y: number; m: number; d: number } {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: BA_TIME_ZONE })
    .format(now)
    .split("-")
    .map(Number);
  return { y, m, d };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Devuelve el `startsAt` (ISO con -03:00, Argentina no usa horario de verano)
 * que corresponde hoy: el próximo día de la semana del evento a partir de
 * mañana, más `rollingWeeks` semanas, con la misma hora.
 */
export function rollStartsAt(startsAt: string, rollingWeeks: number, now: Date = new Date()): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2}(?::\d{2})?)/.exec(startsAt);
  if (!match) return startsAt;

  const [, y, m, d, time] = match;
  const originalWeekday = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d))).getUTCDay();

  const today = todayInBuenosAires(now);
  const todayUtc = Date.UTC(today.y, today.m - 1, today.d);
  const todayWeekday = new Date(todayUtc).getUTCDay();

  // Próxima ocurrencia a partir de mañana (nunca "hoy mismo").
  let daysAhead = (originalWeekday - todayWeekday + 7) % 7;
  if (daysAhead === 0) daysAhead = 7;

  const target = new Date(todayUtc + (daysAhead + rollingWeeks * 7) * DAY_MS);
  return `${target.getUTCFullYear()}-${pad(target.getUTCMonth() + 1)}-${pad(target.getUTCDate())}T${time}-03:00`;
}
