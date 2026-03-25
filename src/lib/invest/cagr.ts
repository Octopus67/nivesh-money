import type { NAVDataPoint } from './types';

export interface CAGRResult {
  '1y': number | null;
  '3y': number | null;
  '5y': number | null;
  '10y': number | null;
}

export function calculateCAGRFromNAV(navHistory: NAVDataPoint[]): CAGRResult {
  if (!navHistory.length) return { '1y': null, '3y': null, '5y': null, '10y': null };
  const sorted = [...navHistory].sort((a, b) => b.date.getTime() - a.date.getTime());
  const latest = sorted[0];

  const getCAGR = (years: number): number | null => {
    const targetDate = new Date(latest.date);
    targetDate.setFullYear(targetDate.getFullYear() - years);
    const closest = sorted.reduce((prev, curr) =>
      Math.abs(curr.date.getTime() - targetDate.getTime()) < Math.abs(prev.date.getTime() - targetDate.getTime()) ? curr : prev
    );
    const daysDiff = Math.abs(closest.date.getTime() - targetDate.getTime()) / 86400000;
    if (daysDiff > 30) return null;
    const actualDays = (latest.date.getTime() - closest.date.getTime()) / 86400000;
    if (actualDays <= 0 || closest.nav <= 0) return null;
    return Math.round((Math.pow(latest.nav / closest.nav, 365 / actualDays) - 1) * 1000) / 10;
  };

  return { '1y': getCAGR(1), '3y': getCAGR(3), '5y': getCAGR(5), '10y': getCAGR(10) };
}
