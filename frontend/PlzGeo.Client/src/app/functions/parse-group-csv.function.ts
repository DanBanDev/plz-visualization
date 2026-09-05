import { VisualizationValue } from '../models/visualization-value.model';

const POSTAL_CODE_PATTERN = /^\d{5}$/;

/** Parses comma- or semicolon-delimited postal code/value text for group visualizations, truncating decimal values and skipping invalid 5-digit postal codes. */
export function parseGroupCsv(csvText: string): VisualizationValue[] {
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

    values.push({ postalCode: postalCodeRaw, value: Math.trunc(value) });
  }

  return values;
}
