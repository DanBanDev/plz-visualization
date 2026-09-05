import { VisualizationValue } from '../models/visualization-value.model';

const POSTAL_CODE_PATTERN = /^\d{5}$/;

/** Parses comma- or semicolon-delimited postal code/value text, skipping the header and any row with an invalid 5-digit postal code or non-numeric value. */
export function parseHeatmapCsv(csvText: string): VisualizationValue[] {
  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const values: VisualizationValue[] = [];

  for (const line of lines) {
    const [postalCodeRaw, valueRaw] = line.split(/[;,]/).map(part => part.trim());

    if (!POSTAL_CODE_PATTERN.test(postalCodeRaw)) {
      continue;
    }

    const value = Number(valueRaw);

    if (Number.isNaN(value)) {
      continue;
    }

    values.push({ postalCode: postalCodeRaw, value });
  }

  return values;
}
