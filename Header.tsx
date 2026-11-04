import React from 'react';
import { Layers, FolderOpen, Save, PlusCircle, Printer, Calculator } from 'lucide-react';

interface HeaderProps {
  projectTitle: string;
  onUpdateTitle: (newTitle: string) => void;
  onNewProject: () => void;
  onOpenHistory: () => void;
  onSaveProject: () => void;
  onOpenCalculator: () => void;
  hasCalculated: boolean;
  onPrint?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectTitle,
  onUpdateTitle,
  onNewProject,
  onOpenHistory,
  onSaveProject,
  onOpenCalculator,
  hasCalculated,
  onPrint,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2.5">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-900/30 flex-shrink-0">
              <Layers className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1">
                  РАСКРОЙ <span className="text-emerald-400">PRO</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-800 text-emerald-400 border border-slate-700 rounded-full">
                  Мобильный
                </span>
              </div>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => onUpdateTitle(e.target.value)}
                placeholder="Название проекта"
                className="text-[11px] sm:text-xs text-slate-300 hover:text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-400 focus:outline-none transition-colors w-full sm:w-60 truncate py-0.5"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Calculator button (prominent) */}
            <button
              type="button"
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
              title="Открыть калькулятор размеров и сметы"
            >
              <Calculator className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline sm:inline">Калькулятор</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors shadow-sm"
              title="История сохраненных проектов"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">История</span>
            </button>

            <button
              type="button"
              onClick={onSaveProject}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-medium border border-slate-700 transition-colors shadow-sm"
              title="Сохранить проект"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Сохранить</span>
            </button>

            <button
              type="button"
              onClick={onNewProject}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
              title="Новый проект"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline ml-1">Новый</span>
            </button>

            {hasCalculated && onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
                title="Распечатать карту"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Печать</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
