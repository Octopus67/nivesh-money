export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (value >= 1e7) return `\u20b9${(value / 1e7).toFixed(2)} Cr`;
  if (value >= 1e5) return `\u20b9${(value / 1e5).toFixed(2)} L`;
  if (value >= 1e3) return `\u20b9${(value / 1e3).toFixed(1)}K`;
  return formatINR(value);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNav(value: number): string {
  return `\u20b9${value.toFixed(2)}`;
}
