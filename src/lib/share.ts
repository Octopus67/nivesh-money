import { toast } from 'sonner';

export function encodeCalcParams(params: Record<string, number>): string {
  return new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
}

export function decodeCalcParams(
  searchParams: Record<string, string | undefined>,
  defaults: Record<string, number>,
  ranges?: Record<string, { min: number; max: number }>
): Record<string, number> {
  const result: Record<string, number> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const val = searchParams[key];
    if (val !== undefined) {
      const parsed = Number(val);
      if (!Number.isNaN(parsed)) {
        if (ranges?.[key]) {
          result[key] = Math.max(ranges[key].min, Math.min(ranges[key].max, parsed));
        } else {
          result[key] = parsed;
        }
      }
    }
  }
  return result;
}

export async function shareCalculator(
  path: string,
  params: Record<string, number>
): Promise<void> {
  const url = new URL(path, window.location.origin);
  url.search = encodeCalcParams(params);
  try {
    await navigator.clipboard.writeText(url.toString());
    toast.success('Link copied! Share it on WhatsApp.');
  } catch {
    toast.error('Could not copy link. Please try again.');
  }
}
