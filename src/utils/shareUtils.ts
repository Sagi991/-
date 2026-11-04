import { CuttingResult, PartItem, SheetSettings } from '../types/cutting';

export function generateTextReport(
  projectTitle: string,
  settings: SheetSettings,
  parts: PartItem[],
  result: CuttingResult
): string {
  const dateStr = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [
    `📐 РАСКРОЙ PRO — Отчёт по раскрою`,
    `Проект: ${projectTitle || 'Без названия'}`,
    `Дата: ${dateStr}`,
    `--------------------------------`,
    `📋 ПАРАМЕТРЫ МАТЕРИАЛА:`,
    `• Материал: ${settings.material}${settings.customMaterialName ? ` (${settings.customMaterialName})` : ''}`,
    `• Размер листа: ${settings.width} × ${settings.height} × ${settings.thickness} мм`,
    `• Пропил пилы: ${settings.kerf} мм`,
    `• Отступ от края: ${settings.trim} мм`,
    `--------------------------------`,
    `📊 ИТОГИ РАСЧЕТА:`,
    `• Необходимо листов: ${result.sheets.length} шт.`,
    `• Всего деталей: ${result.totalPartsPlaced} из ${result.totalPartsRequested} шт.`,
    `• Использование материала: ${result.overallEfficiency}%`,
    `• Отходы: ${(100 - result.overallEfficiency).toFixed(1)}% (${result.totalWasteAreaM2} м²)`,
    `• Общая площадь деталей: ${result.totalPartsAreaM2} м²`,
    `• Закупаемая площадь: ${result.totalMaterialAreaM2} м²`,
  ];

  if (result.totalUsefulRemnantsCount > 0) {
    lines.push(`• Деловых остатков: ${result.totalUsefulRemnantsCount} шт. (${result.totalUsefulRemnantsAreaM2} м²)`);
  }

  lines.push(`--------------------------------`);
  lines.push(`📦 СПЕЦИФИКАЦИЯ ДЕТАЛЕЙ:`);
  parts.forEach((p, idx) => {
    const grainText =
      p.grain === 'length' ? ', текстура вдоль' : p.grain === 'width' ? ', текстура поперек' : '';
    const rotText = !p.canRotate ? ', без поворота' : '';
    lines.push(
      `${idx + 1}. ${p.name}: ${p.length} × ${p.width} мм — ${p.count} шт.${grainText}${rotText}`
    );
  });

  if (result.unplacedParts.length > 0) {
    lines.push(`--------------------------------`);
    lines.push(`⚠️ НЕ ПОМЕСТИЛИСЬ ДЕТАЛИ:`);
    result.unplacedParts.forEach((up) => {
      lines.push(`• ${up.part.name} (${up.part.length}×${up.part.width} мм) — ${up.remainingCount} шт: ${up.reason}`);
    });
  }

  lines.push(`--------------------------------`);
  lines.push(`Рассчитано в «Раскрой PRO»`);

  return lines.join('\n');
}

export function shareViaWhatsApp(text: string) {
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function shareViaTelegram(text: string) {
  const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export async function shareNativeOrClipboard(title: string, text: string): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Раскрой PRO: ${title}`,
        text,
      });
      return 'shared';
    } catch {
      // User cancelled or share failed, fallback to clipboard
    }
  }

  await navigator.clipboard.writeText(text);
  return 'copied';
}
