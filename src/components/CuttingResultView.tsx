import React, { useState } from 'react';
import { CuttingResult, PartItem, SheetSettings } from '../types/cutting';
import { CuttingMapSvg } from './CuttingMapSvg';
import {
  Layers,
  Percent,
  Trash,
  Box,
  FileDown,
  Printer,
  Share2,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Eye,
  Grid,
  Clock,
  Ruler,
} from 'lucide-react';

interface CuttingResultViewProps {
  result: CuttingResult;
  settings: SheetSettings;
  parts: PartItem[];
  projectTitle: string;
  onBackToEdit: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onShare: () => void;
}

export const CuttingResultView: React.FC<CuttingResultViewProps> = ({
  result,
  settings,
  parts,
  projectTitle,
  onBackToEdit,
  onExportPdf,
  onPrint,
  onShare,
}) => {
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'tabs' | 'all'>('tabs');

  const wastePercent = (100 - result.overallEfficiency).toFixed(1);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <button
          type="button"
          onClick={onBackToEdit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Редактировать детали</span>
        </button>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
            title="Скачать PDF документ"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Экспорт в PDF</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
            title="Распечатать карту раскроя"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Печать</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
            title="Отправить результат мастеру в WhatsApp/Telegram"
          >
            <Share2 className="w-4 h-4" />
            <span>Отправить мастеру</span>
          </button>
        </div>
      </div>

      {/* Warning for unplaced pieces if any */}
      {result.unplacedParts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">
              Внимание: не все детали удалось разместить на листе!
            </h4>
            <ul className="text-xs mt-1.5 space-y-1">
              {result.unplacedParts.map((item, idx) => (
                <li key={idx} className="list-disc list-inside">
                  <strong>{item.part.name}</strong> ({item.part.length}×{item.part.width} мм) — {item.remainingCount} шт.: {item.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. Итоговая статистика (KPI Cards) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Итоговая статистика раскроя
            </h2>
            <p className="text-xs text-slate-500">
              {settings.material} • Лист {settings.width} × {settings.height} × {settings.thickness} мм • Пропил: {settings.kerf} мм • Отступ: {settings.trim} мм
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Время расчета: {result.computationTimeMs} мс</span>
          </div>
        </div>

        {/* Highlight Banner Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Sheets Needed */}
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider">Листов</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {result.sheets.length} <span className="text-xs font-normal text-slate-300">шт.</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {result.totalMaterialAreaM2} м² закупка
            </span>
          </div>

          {/* Parts Placed */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider">Деталей</span>
              <Box className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {result.totalPartsPlaced}{' '}
              <span className="text-xs font-normal text-slate-500">
                из {result.totalPartsRequested}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              {result.totalPartsAreaM2} м² площадь
            </span>
          </div>

          {/* Material Efficiency */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider">КПД материала</span>
              <Percent className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {result.overallEfficiency}%
            </div>
            <span className="text-[10px] text-emerald-700 mt-1">
              Использование материала
            </span>
          </div>

          {/* Waste */}
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider">Отходы</span>
              <Trash className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-700">
              {wastePercent}%
            </div>
            <span className="text-[10px] text-rose-700 mt-1">
              {result.totalWasteAreaM2} м² (с пропилами)
            </span>
          </div>

          {/* Useful Remnants Count */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider">Деловые остатки</span>
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800">
              {result.totalUsefulRemnantsCount}{' '}
              <span className="text-xs font-normal text-amber-700">шт.</span>
            </div>
            <span className="text-[10px] text-amber-700 mt-1">
              {result.totalUsefulRemnantsAreaM2} м² пригодно
            </span>
          </div>

          {/* Sheet Specs */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider">Размер листа</span>
              <Ruler className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {settings.width}×{settings.height}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              Толщина: {settings.thickness} мм
            </span>
          </div>
        </div>

        {/* Useful Remnants Detail Bar if any */}
        {result.totalUsefulRemnantsCount > 0 && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Пригодные деловые остатки (можно сохранить для других изделий):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.sheets.flatMap((sh) =>
                sh.usefulRemnants.map((rem) => (
                  <span
                    key={rem.id}
                    className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-300 font-mono shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Лист #{sh.sheetIndex}: {Math.round(rem.width)} × {Math.round(rem.height)} мм ({rem.areaM2} м²)
                  </span>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Visual Cutting Schemes Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Визуальные схемы раскроя
            </h3>
            <p className="text-xs text-slate-500">
              Карта каждого листа с номерами деталей, размерами и линиями пропила
            </p>
          </div>

          {/* View Mode & Sheet Navigation Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('tabs')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'tabs'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                По листам
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Все листы ({result.sheets.length})
              </button>
            </div>
          </div>
        </div>

        {/* Sheet Tabs Bar (in tab view mode) */}
        {viewMode === 'tabs' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {result.sheets.map((sh) => {
              const isActive = activeSheetIndex === sh.sheetIndex;
              return (
                <button
                  key={sh.sheetIndex}
                  type="button"
                  onClick={() => setActiveSheetIndex(sh.sheetIndex)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Лист №{sh.sheetIndex}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {sh.efficiencyPercent}%
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* SVG Maps Rendering */}
        {viewMode === 'tabs' ? (
          <div>
            {result.sheets
              .filter((sh) => sh.sheetIndex === activeSheetIndex)
              .map((sh) => (
                <CuttingMapSvg
                  key={sh.sheetIndex}
                  sheet={sh}
                  settings={settings}
                  totalSheets={result.sheets.length}
                />
              ))}
          </div>
        ) : (
          <div className="space-y-6">
            {result.sheets.map((sh) => (
              <CuttingMapSvg
                key={sh.sheetIndex}
                sheet={sh}
                settings={settings}
                totalSheets={result.sheets.length}
              />
            ))}
          </div>
        )}
      </div>

      {/* Part Specification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
            Спецификация всех деталей ({result.totalPartsPlaced} шт.)
          </h4>
          <span className="text-xs text-slate-500">
            Общая площадь деталей: <strong>{result.totalPartsAreaM2} м²</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px] bg-slate-50">
                <th className="py-2.5 px-3">№</th>
                <th className="py-2.5 px-3">Название</th>
                <th className="py-2.5 px-3">Длина</th>
                <th className="py-2.5 px-3">Ширина</th>
                <th className="py-2.5 px-3">Кол-во</th>
                <th className="py-2.5 px-3">Площадь</th>
                <th className="py-2.5 px-3">Поворот</th>
                <th className="py-2.5 px-3">Текстура</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {parts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-500">#{idx + 1}</td>
                  <td className="py-2 px-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0 shadow-2xs"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.name}</span>
                  </td>
                  <td className="py-2 px-3 font-mono font-medium">{p.length} мм</td>
                  <td className="py-2 px-3 font-mono font-medium">{p.width} мм</td>
                  <td className="py-2 px-3 font-bold text-slate-900">{p.count} шт</td>
                  <td className="py-2 px-3 font-mono">
                    {((p.length * p.width * p.count) / 1_000_000).toFixed(3)} м²
                  </td>
                  <td className="py-2 px-3">
                    {p.canRotate ? (
                      <span className="text-emerald-700">Да</span>
                    ) : (
                      <span className="text-slate-400">Нет</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {p.grain === 'length'
                      ? 'Вдоль длины (↔)'
                      : p.grain === 'width'
                      ? 'Вдоль ширины (↕)'
                      : 'Без текстуры'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Sticky Action Bar on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-20 flex items-center justify-between gap-2 shadow-lg sm:hidden print:hidden">
        <button
          type="button"
          onClick={onBackToEdit}
          className="flex-1 py-2.5 px-3 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold text-center"
        >
          ← Редактировать
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex-1 py-2.5 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold text-center shadow"
        >
          Мастеру
        </button>
        <button
          type="button"
          onClick={onExportPdf}
          className="p-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          title="PDF"
        >
          <FileDown className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </div>
  );
};
