import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import OLMap from 'ol/Map';
import { PdfExportOptions } from '../../../models/pdf-export-options.model';

export interface PdfLegendRow {
  color: string;
  label: string;
}

export interface MapPdfExportData {
  map: OLMap;
  visualizationName: string | null;
  mappedPostalCodeCount: number;
  legendRows: ReadonlyArray<PdfLegendRow>;
}

@Injectable({ providedIn: 'root' })
export class MapPdfExportService {
  export(options: PdfExportOptions, data: MapPdfExportData): void {
    const originalSize = data.map.getSize();
    const originalExtent = data.map.getView().calculateExtent(originalSize);
    const pageSizeInches = this.getPageSizeInches(options.pageFormat, options.orientation);
    const exportSize: [number, number] = [
      Math.round(pageSizeInches.width * options.dpi),
      Math.round(pageSizeInches.height * options.dpi)
    ];

    data.map.once('rendercomplete', () => {
      try {
        const imageData = this.createMapImage(data.map, exportSize);
        const pdf = new jsPDF({
          orientation: options.orientation,
          unit: 'mm',
          format: options.pageFormat
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight);
        this.addLegendToPdf(pdf, data, pageWidth, pageHeight);
        pdf.save('map-export.pdf');
      } finally {
        data.map.setSize(originalSize);
        data.map.getView().fit(originalExtent, { size: originalSize, duration: 0 });
        data.map.renderSync();
      }
    });

    data.map.setSize(exportSize);
    data.map.getView().fit(originalExtent, { size: exportSize, duration: 0 });
    data.map.renderSync();
  }

  private createMapImage(map: OLMap, size: [number, number]): string {
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const context = mapCanvas.getContext('2d');

    if (!context) {
      throw new Error('Unable to create the map export canvas.');
    }

    map.getViewport().querySelectorAll<HTMLCanvasElement>('.ol-layer canvas, canvas.ol-layer').forEach(canvas => {
      if (canvas.width === 0 || canvas.height === 0) {
        return;
      }

      const parent = canvas.parentElement;
      const opacity = parent ? Number(parent.style.opacity || '1') : 1;
      const transform = canvas.style.transform.match(/^matrix\(([^)]+)\)$/);
      const matrix = transform?.[1].split(',').map(Number);

      context.globalAlpha = opacity;
      if (matrix?.length === 6) {
        context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
      } else {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
      context.drawImage(canvas, 0, 0);
    });

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalAlpha = 1;
    return mapCanvas.toDataURL('image/png');
  }

  private addLegendToPdf(pdf: jsPDF, data: MapPdfExportData, pageWidth: number, pageHeight: number): void {
    if (!data.visualizationName || data.legendRows.length === 0) {
      return;
    }

    const margin = 8;
    const padding = 4;
    const lineHeight = 5;
    const swatchSize = 4;
    const titleLines = pdf.splitTextToSize(data.visualizationName, 62);
    const rowLabels = data.legendRows.map(row => pdf.splitTextToSize(row.label, 52));
    const rowHeights = rowLabels.map(lines => Math.max(lineHeight, lines.length * lineHeight));
    const contentHeight = titleLines.length * lineHeight + lineHeight + rowHeights.reduce((sum, height) => sum + height, 0);
    const panelWidth = Math.min(76, pageWidth - margin * 2);
    const panelHeight = Math.min(contentHeight + padding * 2, pageHeight - margin * 2);

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(150, 150, 150);
    pdf.roundedRect(margin, margin, panelWidth, panelHeight, 1.5, 1.5, 'FD');

    let cursorY = margin + padding;
    pdf.setTextColor(20, 20, 20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(titleLines, margin + padding, cursorY + 3);
    cursorY += titleLines.length * lineHeight;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(70, 70, 70);
    pdf.text(`${data.mappedPostalCodeCount} PLZ`, margin + padding, cursorY + 3);
    cursorY += lineHeight;

    for (let index = 0; index < data.legendRows.length; index++) {
      const row = data.legendRows[index];
      const lines = rowLabels[index];
      const rowHeight = rowHeights[index];

      if (cursorY + rowHeight > margin + panelHeight - padding) {
        break;
      }

      const color = this.getPdfColor(row.color);
      pdf.setFillColor(color.red, color.green, color.blue);
      pdf.setDrawColor(100, 100, 100);
      pdf.rect(margin + padding, cursorY + 0.5, swatchSize, swatchSize, 'FD');

      pdf.setTextColor(20, 20, 20);
      pdf.text(lines, margin + padding + swatchSize + 3, cursorY + 3.5);
      cursorY += rowHeight;
    }
  }

  private getPdfColor(color: string): { red: number; green: number; blue: number } {
    const rgbaMatch = color.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);

    if (rgbaMatch) {
      return {
        red: Number(rgbaMatch[1]),
        green: Number(rgbaMatch[2]),
        blue: Number(rgbaMatch[3])
      };
    }

    const hex = color.replace('#', '');
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return {
        red: parseInt(hex.slice(0, 2), 16),
        green: parseInt(hex.slice(2, 4), 16),
        blue: parseInt(hex.slice(4, 6), 16)
      };
    }

    return { red: 238, green: 238, blue: 238 };
  }

  private getPageSizeInches(pageFormat: PdfExportOptions['pageFormat'], orientation: PdfExportOptions['orientation']): { width: number; height: number } {
    const size = pageFormat === 'a3'
      ? { width: 11.69, height: 16.54 }
      : pageFormat === 'letter'
        ? { width: 8.5, height: 11 }
        : { width: 8.27, height: 11.69 };

    return orientation === 'landscape'
      ? { width: size.height, height: size.width }
      : size;
  }
}