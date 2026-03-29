import type { Time } from "@/lib/types";

export function timeToMinutes(t: Time): number {
  return t.hours * 60 + t.minutes;
}

export function minutesToTime(m: number): Time {
  const total = ((m % 1440) + 1440) % 1440;
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}

export function addMinutes(t: Time, mins: number): Time {
  return minutesToTime(timeToMinutes(t) + mins);
}

export function formatTime(t: Time): string {
  const period = t.hours >= 12 ? "PM" : "AM";
  const h = t.hours % 12 || 12;
  return `${h}:${String(t.minutes).padStart(2, "0")} ${period}`;
}

export function formatTime24(t: Time): string {
  return `${String(t.hours).padStart(2, "0")}:${String(t.minutes).padStart(2, "0")}`;
}

export function sleepDuration(bedtime: Time, wakeTime: Time): number {
  const diff = timeToMinutes(wakeTime) - timeToMinutes(bedtime);
  return ((diff % 1440) + 1440) % 1440;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function timeToAngle(t: Time): number {
  return (timeToMinutes(t) / 1440) * 360 - 90;
}

export function angleToTime(deg: number): Time {
  const norm = ((deg + 90) % 360 + 360) % 360;
  const total = Math.round((norm / 360) * 1440 / 15) * 15;
  return minutesToTime(total);
}

export function polar(
  cx: number,
  cy: number,
  r: number,
  deg: number
): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function svgArcPath(
  cx: number,
  cy: number,
  r: number,
  bedtime: Time,
  wakeTime: Time
): string {
  const startDeg = timeToAngle(bedtime);
  const endDeg = timeToAngle(wakeTime);
  const arcMins = sleepDuration(bedtime, wakeTime);
  const arcDeg = (arcMins / 1440) * 360;

  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const largeArc = arcDeg > 180 ? 1 : 0;

  if (arcMins === 0) return "";
  if (arcMins === 1440) {
    // Full circle: two half-arcs
    const mid = polar(cx, cy, r, startDeg + 180);
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${mid.x} ${mid.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
  }

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}
