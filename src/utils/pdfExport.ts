import jsPDF from 'jspdf';
import { CuttingResult, PartItem, SheetSettings } from '../types/cutting';

export function triggerPrint() {
  window.print();
}

/**
 * Generates and downloads a PDF file with the cutting report and sheet maps.
 */
export async function exportCuttingToPdf(
  projectTitle: string,
  settings: SheetSettings,
  parts: PartItem[],
  result: CuttingResult
) {
  // A4 Landscape format is ideal for furniture sheet layouts (297 x 210 mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper for color conversion
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Helper to draw transliterated/clean text if standard font has encoding issues
  // or use basic latin for robust cross-platform rendering
  const safeText = (str: string) => {
    return str;
  };

  // Page 1: Overview and Sheet #1
  result.sheets.forEach((sheet, sheetIdx) => {
    if (sheetIdx > 0) {
      doc.addPage('a4', 'landscape');
    }

    // Header banner
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, pageWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.text(`RASKROY PRO | ${projectTitle || 'Проект раскроя'}`, 12, 11);

    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225); // slate-300
    const dateStr = new Date().toLocaleDateString('ru-RU');
    doc.text(
      `Лист ${sheet.sheetIndex} из ${result.sheets.length} | ${settings.material} ${settings.width}x${settings.height}x${settings.thickness}мм | Дата: ${dateStr}`,
      pageWidth - 12,
      11,
      { align: 'right' }
    );

    // Stats bar for this sheet
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(12, 22, pageWidth - 24, 12, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(12, 22, pageWidth - 24, 12, 'S');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(9);
    doc.text(
      `Деталей на листе: ${sheet.placedParts.length} шт. | Использование: ${sheet.efficiencyPercent}% | Отходы: ${(100 - sheet.efficiencyPercent).toFixed(1)}% | Пропил: ${settings.kerf}мм | Отступ: ${settings.trim}мм`,
      16,
      30
    );

    // Draw the Sheet visual map
    const mapMarginX = 14;
    const mapMarginY = 38;
    const maxMapWidth = pageWidth - 28;
    const maxMapHeight = pageHeight - 52;

    const sheetAspect = settings.width / settings.height;
    const availableAspect = maxMapWidth / maxMapHeight;

    let drawW: number;
    let drawH: number;

    if (sheetAspect > availableAspect) {
      drawW = maxMapWidth;
      drawH = drawW / sheetAspect;
    } else {
      drawH = maxMapHeight;
      drawW = drawH * sheetAspect;
    }

    const scale = drawW / settings.width;
    const startX = mapMarginX + (maxMapWidth - drawW) / 2;
    const startY = mapMarginY + (maxMapHeight - drawH) / 2;

    // Draw raw sheet boundary
    doc.setFillColor(229, 231, 235); // gray-200
    doc.setDrawColor(156, 163, 175);
    doc.rect(startX, startY, drawW, drawH, 'FD');

    // Draw trimmed boundary (inner dashed area)
    const trimX = startX + settings.trim * scale;
    const trimY = startY + settings.trim * scale;
    const trimW = (settings.width - settings.trim * 2) * scale;
    const trimH = (settings.height - settings.trim * 2) * scale;

    doc.setFillColor(243, 244, 246);
    doc.rect(trimX, trimY, trimW, trimH, 'F');

    // Draw remnants
    sheet.usefulRemnants.forEach((rem) => {
      const rx = startX + rem.x * scale;
      const ry = startY + rem.y * scale;
      const rw = rem.width * scale;
      const rh = rem.height * scale;

      doc.setFillColor(254, 243, 199); // amber-100 (remnant)
      doc.setDrawColor(217, 119, 6);
      doc.rect(rx, ry, rw, rh, 'FD');

      if (rw > 18 && rh > 10) {
        doc.setTextColor(180, 83, 9);
        doc.setFontSize(7);
        doc.text(`Остаток ${Math.round(rem.width)}x${Math.round(rem.height)}`, rx + rw / 2, ry + rh / 2, {
          align: 'center',
          baseline: 'middle',
        });
      }
    });

    // Draw placed parts
    sheet.placedParts.forEach((part) => {
      const px = startX + part.absX * scale;
      const py = startY + part.absY * scale;
      const pw = part.width * scale;
      const ph = part.height * scale;

      const rgb = hexToRgb(part.color || '#3b82f6');
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.setDrawColor(30, 41, 59);
      doc.rect(px, py, pw, ph, 'FD');

      // Part label inside
      if (pw > 14 && ph > 9) {
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(pw < 24 || ph < 14 ? 6 : 8);

        const labelText = `#${part.globalPieceNumber} ${part.name.slice(0, 14)}`;
        const dimText = `${Math.round(part.width)}x${Math.round(part.height)}`;

        if (ph > 14) {
          doc.text(labelText, px + pw / 2, py + ph / 2 - 2, {
            align: 'center',
            baseline: 'middle',
          });
          doc.text(dimText, px + pw / 2, py + ph / 2 + 3, {
            align: 'center',
            baseline: 'middle',
          });
        } else {
          doc.text(`${part.globalPieceNumber}. ${dimText}`, px + pw / 2, py + ph / 2, {
            align: 'center',
            baseline: 'middle',
          });
        }
      }
    });
  });

  const fileName = `Raskroy-PRO-${(projectTitle || 'karta').replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
