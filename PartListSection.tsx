import React from 'react';
import { GrainDirection, PartItem } from '../types/cutting';
import { getPartColor } from '../utils/cuttingAlgorithm';
import {
  Plus,
  Trash2,
  Copy,
  RotateCw,
  ArrowLeftRight,
  Calculator,
  FileSpreadsheet,
} from 'lucide-react';

interface PartListSectionProps {
  parts: PartItem[];
  onPartsChange: (parts: PartItem[]) => void;
  onOpenCalculator: () => void;
}

const COMMON_PART_NAMES = [
  'Стенка',
  'Полка',
  'Дно',
  'Фасад',
  'Цоколь',
  'Перегородка',
  'Крышка',
  'Царга',
];

export const PartListSection: React.FC<PartListSectionProps> = ({
  parts,
  onPartsChange,
  onOpenCalculator,
}) => {
  const handleAddPart = () => {
    const newId = `part-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newPart: PartItem = {
      id: newId,
      name: `Деталь #${parts.length + 1}`,
      length: 600,
      width: 400,
      count: 1,
      canRotate: true,
      grain: 'none',
      color: getPartColor(parts.length),
    };
    onPartsChange([...parts, newPart]);
  };

  const handleUpdatePart = (id: string, updates: Partial<PartItem>) => {
    onPartsChange(
      parts.map((p) => {
        if (p.id !== id) return p;
        return { ...p, ...updates };
      })
    );
  };

  const handleDuplicatePart = (part: PartItem) => {
    const newId = `part-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const copy: PartItem = {
      ...part,
      id: newId,
      name: `${part.name} (копия)`,
      color: getPartColor(parts.length),
    };
    onPartsChange([...parts, copy]);
  };

  const handleDeletePart = (id: string) => {
    onPartsChange(parts.filter((p) => p.id !== id));
  };

  const handleSwapDimensions = (id: string, length: number, width: number) => {
    handleUpdatePart(id, { length: width, width: length });
  };

  const totalPieces = parts.reduce((sum, p) => sum + (Number(p.count) || 0), 0);
  const totalAreaM2 = parts
    .reduce((sum, p) => sum + (p.length * p.width * (p.count || 0)) / 1_000_000, 0)
    .toFixed(2);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:p-5 mb-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm">
            2
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              Список деталей для раскроя
            </h2>
            <p className="text-[11px] text-slate-500">
              Столбец деталей: размеры, количество, текстура
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
            {totalPieces} шт. • {totalAreaM2} м²
          </span>

          <button
            type="button"
            onClick={onOpenCalculator}
            className="text-[11px] sm:text-xs px-2.5 py-1 rounded-xl text-slate-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 font-bold transition-all flex items-center gap-1 active:scale-95"
            title="Рассчитать размеры шкафа / тумбы калькулятором"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-800" />
            <span>Калькулятор</span>
          </button>
        </div>
      </div>

      {/* Parts Column List */}
      {parts.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
          <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-700 text-sm mb-1">
            Список деталей пуст
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
            Добавьте деталь вручную или используйте калькулятор корпусов для автоматического расчета.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleAddPart}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить деталь</span>
            </button>
            <button
              type="button"
              onClick={onOpenCalculator}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Рассчитать тумбу</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {parts.map((part, index) => (
            <div
              key={part.id}
              className="p-3 sm:p-3.5 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all hover:border-slate-300 shadow-2xs"
            >
              {/* Part Top Row: Color indicator, Name input, Quick suggestions, and Delete/Copy */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span
                    className="w-4 h-4 rounded-md shadow-sm flex-shrink-0"
                    style={{ backgroundColor: part.color || getPartColor(index) }}
                    title="Цвет детали на карте"
                  />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={part.name}
                      onChange={(e) => handleUpdatePart(part.id, { name: e.target.value })}
                      placeholder="Название детали"
                      className="w-full text-xs sm:text-sm font-bold text-slate-900 bg-white px-2.5 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDuplicatePart(part)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors"
                    title="Дублировать деталь"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePart(part.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-100/70 rounded-lg transition-colors"
                    title="Удалить деталь"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Name Quick Suggestions (chips) */}
              <div className="flex flex-wrap items-center gap-1 mb-2.5">
                <span className="text-[10px] text-slate-400 font-medium mr-0.5">Быстро:</span>
                {COMMON_PART_NAMES.map((presetName) => (
                  <button
                    key={presetName}
                    type="button"
                    onClick={() => handleUpdatePart(part.id, { name: presetName })}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 transition-colors"
                  >
                    {presetName}
                  </button>
                ))}
              </div>

              {/* Part Main Fields: Length, Width, Swap button, Count stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-12 gap-2 items-end">
                {/* Length */}
                <div className="col-span-1 md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Длина (мм)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={10}
                      max={6000}
                      value={part.length || ''}
                      onChange={(e) =>
                        handleUpdatePart(part.id, {
                          length: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full text-sm font-black text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="700"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-slate-400">
                      мм
                    </span>
                  </div>
                </div>

                {/* Width */}
                <div className="col-span-1 md:col-span-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-bold text-slate-600">
                      Ширина (мм)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSwapDimensions(part.id, part.length, part.width)}
                      className="text-[9px] text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 font-semibold"
                      title="Поменять местами"
                    >
                      <ArrowLeftRight className="w-2.5 h-2.5" />
                      <span>обмен</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={10}
                      max={6000}
                      value={part.width || ''}
                      onChange={(e) =>
                        handleUpdatePart(part.id, {
                          width: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full text-sm font-black text-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      placeholder="500"
                    />
                    <span className="absolute right-2 top-2 text-[10px] text-slate-400">
                      мм
                    </span>
                  </div>
                </div>

                {/* Count with Stepper */}
                <div className="col-span-1 md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Количество (шт)
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePart(part.id, {
                          count: Math.max(1, (part.count || 1) - 1),
                        })
                      }
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors font-black text-sm"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min={1}
                      max={500}
                      value={part.count || 1}
                      onChange={(e) =>
                        handleUpdatePart(part.id, {
                          count: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-full text-center font-black text-sm text-slate-900 py-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdatePart(part.id, {
                          count: (part.count || 1) + 1,
                        })
                      }
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors font-black text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Area Preview for this row */}
                <div className="col-span-1 md:col-span-3 flex flex-col justify-end">
                  <div className="text-[10px] text-slate-500 mb-0.5 font-medium">
                    Площадь:
                  </div>
                  <div className="py-1 px-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 text-center font-mono">
                    {((part.length * part.width * (part.count || 1)) / 1_000_000).toFixed(3)} м²
                  </div>
                </div>
              </div>

              {/* Part Bottom Controls: Rotation & Grain Direction */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* 90° Rotation Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={part.canRotate}
                    onChange={(e) =>
                      handleUpdatePart(part.id, { canRotate: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                    <RotateCw className="w-3 h-3 text-slate-500" />
                    Поворот 90°
                  </span>
                </label>

                {/* Grain Direction */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold">
                    Текстура:
                  </span>
                  <select
                    value={part.grain}
                    onChange={(e) =>
                      handleUpdatePart(part.id, {
                        grain: e.target.value as GrainDirection,
                      })
                    }
                    className="text-[11px] font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="none">Любое (без текстуры)</option>
                    <option value="length">Вдоль длины (↔)</option>
                    <option value="width">Вдоль ширины (↕)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Button "+ Добавить деталь" */}
      <div className="mt-3 flex flex-row items-center gap-2">
        <button
          type="button"
          onClick={handleAddPart}
          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Plus className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>+ Добавить деталь</span>
        </button>

        {parts.length > 0 && (
          <button
            type="button"
            onClick={() => onPartsChange([])}
            className="text-xs text-rose-600 hover:text-rose-700 hover:underline py-2 px-3"
          >
            Очистить
          </button>
        )}
      </div>
    </section>
  );
};
