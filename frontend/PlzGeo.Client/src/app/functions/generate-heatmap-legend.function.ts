import { HeatmapLegendItem } from '../models/heatmap-legend-item.model';

const MAX_INTERVALS = 6;

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColor(startColor: string, endColor: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(startColor);
  const [r2, g2, b2] = hexToRgb(endColor);

  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  );
}

/** Builds up to 6 equal-width value intervals across the distinct values, colored by a start/end gradient. */
export function generateHeatmapLegend(
  values: number[],
  startColor: string,
  endColor: string
): HeatmapLegendItem[] {
  const distinctValues = Array.from(new Set(values)).sort((a, b) => a - b);

  if (distinctValues.length === 0) {
    return [];
  }

  const min = distinctValues[0];
  const max = distinctValues[distinctValues.length - 1];
  const intervalCount = Math.min(MAX_INTERVALS, distinctValues.length);

  if (min === max) {
    return [{ fromValue: min, toValue: max, color: startColor }];
  }

  const width = (max - min) / intervalCount;
  const legend: HeatmapLegendItem[] = [];

  for (let i = 0; i < intervalCount; i++) {
    const fromValue = min + i * width;
    const toValue = i === intervalCount - 1 ? max : min + (i + 1) * width;
    const t = intervalCount === 1 ? 0 : i / (intervalCount - 1);

    legend.push({
      fromValue: Math.round(fromValue * 100) / 100,
      toValue: Math.round(toValue * 100) / 100,
      color: interpolateColor(startColor, endColor, t)
    });
  }

  return legend;
}
