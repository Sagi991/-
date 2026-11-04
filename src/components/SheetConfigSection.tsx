import React from 'react';
import { MaterialType, SheetSettings } from '../types/cutting';
import { SHEET_PRESETS } from '../utils/presets';
import { Layers, Sparkles } from 'lucide-react';

interface SheetConfigSectionProps {
  settings: SheetSettings;
  onChange: (newSettings: SheetSettings) => void;
}

const MATERIALS: MaterialType[] = ['ЛДСП', 'МДФ'];

export const SheetConfigSection: React.FC<SheetConfigSectionProps> = ({
  settings,
  onChange,
}) => {
  const handleMaterialChange = (mat: MaterialType) => {
    onChange({ ...settings, material: mat });
  };

  const handleApplyPreset = (presetW: number, presetH: number, mat: MaterialType) => {
    onChange({
      ...settings,
      width: presetW,
      height: presetH,
      material: mat,
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:p-5 mb-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
              1. Исходный лист материала
            </h2>
            <p className="text-[11px] text-slate-500">
              Материал, размер листа и параметры распила
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          {settings.material} {settings.width}×{settings.height} мм
        </span>
      </div>

      {/* Material selection (strictly ЛДСП & МДФ as requested) */}
      <div className="mb-3.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Материал:
        </label>
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          {MATERIALS.map((mat) => {
            const isSelected = settings.material === mat;
            return (
              <button
                key={mat}
                type="button"
                onClick={() => handleMaterialChange(mat)}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all text-center border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {mat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Sheet Presets (kept as requested) */}
      <div className="mb-3.5">
        <label className="block text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Популярные размеры листа (быстрый выбор):</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SHEET_PRESETS.map((preset) => {
            const isCurrent =
              settings.width === preset.width &&
              settings.height === preset.height &&
              settings.material === preset.material;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset.width, preset.height, preset.material)}
                className={`text-xs px-2.5 py-1.5 rounded-xl transition-all border font-medium ${
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dimensions Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {/* Width */}
        <div className="col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Ширина (мм)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={100}
              max={10000}
              value={settings.width || ''}
              onChange={(e) =>
                onChange({ ...settings, width: Math.max(0, Number(e.target.value)) })
              }
              className="w-full text-base sm:text-lg font-black text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-inner"
              placeholder="2750"
            />
            <span className="absolute right-2.5 top-2 text-[11px] font-medium text-slate-400 pointer-events-none">
              мм
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">например, 2750</span>
        </div>

        {/* Height */}
        <div className="col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Высота (мм)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={100}
              max={10000}
              value={settings.height || ''}
              onChange={(e) =>
                onChange({ ...settings, height: Math.max(0, Number(e.target.value)) })
              }
              className="w-full text-base sm:text-lg font-black text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-inner"
              placeholder="1830"
            />
            <span className="absolute right-2.5 top-2 text-[11px] font-medium text-slate-400 pointer-events-none">
              мм
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">например, 1830</span>
        </div>

        {/* Thickness */}
        <div className="col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Толщина (мм)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={100}
              value={settings.thickness || ''}
              onChange={(e) =>
                onChange({ ...settings, thickness: Math.max(1, Number(e.target.value)) })
              }
              className="w-full text-base sm:text-lg font-black text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-inner"
              placeholder="16"
            />
            <span className="absolute right-2.5 top-2 text-[11px] font-medium text-slate-400 pointer-events-none">
              мм
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">например, 16</span>
        </div>

        {/* Kerf */}
        <div className="col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Пропил пилы (мм)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              step="0.5"
              min={0}
              max={30}
              value={settings.kerf ?? 4}
              onChange={(e) =>
                onChange({ ...settings, kerf: Math.max(0, Number(e.target.value)) })
              }
              className="w-full text-base sm:text-lg font-black text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-inner"
              placeholder="4"
            />
            <span className="absolute right-2.5 top-2 text-[11px] font-medium text-slate-400 pointer-events-none">
              мм
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">стандарт 4 мм</span>
        </div>

        {/* Trim */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            Отступ края (мм)
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              value={settings.trim ?? 10}
              onChange={(e) =>
                onChange({ ...settings, trim: Math.max(0, Number(e.target.value)) })
              }
              className="w-full text-base sm:text-lg font-black text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white shadow-inner"
              placeholder="10"
            />
            <span className="absolute right-2.5 top-2 text-[11px] font-medium text-slate-400 pointer-events-none">
              мм
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">обрезка кромок 10 мм</span>
        </div>
      </div>
    </section>
  );
};
