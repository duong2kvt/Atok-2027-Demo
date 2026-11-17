/** 23:59:59 */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** 3h 59m 59s */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${pad(m)}m ${pad(s)}s`;
}

/** 7:00 (status bar style, no leading zero on hours) */
export function formatTimeOfDay(epoch: number): string {
  const d = new Date(epoch);
  return `${d.getHours()}:${pad(d.getMinutes())}`;
}

export function formatDateTime(epoch: number): string {
  const d = new Date(epoch);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} · ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 200,967,000.4658 */
export function formatBalance(v: number): string {
  return v.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

/** 0.1584 / 1.98 / 0 — trims trailing zeros like the design */
export function formatAtok(v: number): string {
  return String(Math.round(v * 10_000) / 10_000);
}

/** 4.2 / 12.4 / 0 */
export function formatKm(v: number): string {
  return String(Math.round(v * 10) / 10);
}

const pad = (n: number) => String(n).padStart(2, '0');
