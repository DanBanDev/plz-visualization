export interface PdfExportOptions {
  pageFormat: 'a4' | 'a3' | 'letter';
  orientation: 'portrait' | 'landscape';
  dpi: 150 | 200 | 300;
}