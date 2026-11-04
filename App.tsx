import React, { useState, useEffect } from 'react';
import { CuttingResult, PartItem, SavedProject, SheetSettings } from './types/cutting';
import { calculateCutting, getPartColor } from './utils/cuttingAlgorithm';
import { exportCuttingToPdf, triggerPrint } from './utils/pdfExport';
import { Header } from './components/Header';
import { SheetConfigSection } from './components/SheetConfigSection';
import { PartListSection } from './components/PartListSection';
import { CuttingResultView } from './components/CuttingResultView';
import { ShareModal } from './components/ShareModal';
import { SavedProjectsModal } from './components/SavedProjectsModal';
import { CalculatorModal } from './components/CalculatorModal';
import { Play, Check, Calculator, Plus } from 'lucide-react';

const STORAGE_KEY_SETTINGS = 'raskroy_pro_settings_v2';
const STORAGE_KEY_PARTS = 'raskroy_pro_parts_v2';
const STORAGE_KEY_PROJECTS = 'raskroy_pro_saved_projects_v2';
const STORAGE_KEY_TITLE = 'raskroy_pro_project_title_v2';

// Initial default parts (ЛДСП / МДФ)
const INITIAL_PARTS: PartItem[] = [
  {
    id: 'part-1',
    name: 'Стенка',
    length: 700,
    width: 500,
    count: 2,
    canRotate: true,
    grain: 'none',
    color: getPartColor(0),
  },
  {
    id: 'part-2',
    name: 'Полка',
    length: 800,
    width: 400,
    count: 4,
    canRotate: true,
    grain: 'none',
    color: getPartColor(1),
  },
  {
    id: 'part-3',
    name: 'Дно',
    length: 1200,
    width: 500,
    count: 2,
    canRotate: true,
    grain: 'none',
    color: getPartColor(2),
  },
  {
    id: 'part-4',
    name: 'Перегородка',
    length: 1800,
    width: 600,
    count: 1,
    canRotate: true,
    grain: 'none',
    color: getPartColor(3),
  },
];

const INITIAL_SETTINGS: SheetSettings = {
  material: 'ЛДСП',
  width: 2750,
  height: 1830,
  thickness: 16,
  kerf: 4,
  trim: 10,
};

export default function App() {
  const [projectTitle, setProjectTitle] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_TITLE) || 'Проект раскроя №1';
  });

  const [sheetSettings, setSheetSettings] = useState<SheetSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure material is strictly ЛДСП or МДФ
        if (parsed.material !== 'ЛДСП' && parsed.material !== 'МДФ') {
          parsed.material = 'ЛДСП';
        }
        return parsed;
      }
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [parts, setParts] = useState<PartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PARTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PARTS;
  });

  const [result, setResult] = useState<CuttingResult | null>(null);
  const [viewState, setViewState] = useState<'input' | 'results'>('input');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Saved Projects List
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Save current project state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TITLE, projectTitle);
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(sheetSettings));
      localStorage.setItem(STORAGE_KEY_PARTS, JSON.stringify(parts));
    } catch {}
  }, [projectTitle, sheetSettings, parts]);

  // Save projects list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(savedProjects));
    } catch {}
  }, [savedProjects]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Perform calculation
  const handleCalculate = () => {
    if (parts.length === 0) {
      showToast('Добавьте хотя бы одну деталь для раскроя');
      return;
    }

    const res = calculateCutting(sheetSettings, parts);
    setResult(res);
    setViewState('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to new project
  const handleNewProject = () => {
    if (confirm('Создать новый проект? Несохраненные изменения текущего проекта будут очищены.')) {
      setProjectTitle('Новый проект раскроя');
      setSheetSettings(INITIAL_SETTINGS);
      setParts([]);
      setResult(null);
      setViewState('input');
      showToast('Создан новый проект');
    }
  };

  // Save current project to history
  const handleSaveProject = () => {
    const newProject: SavedProject = {
      id: `proj-${Date.now()}`,
      title: projectTitle || 'Без названия',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sheetSettings,
      parts,
      result: result || undefined,
    };

    setSavedProjects((prev) => [newProject, ...prev.filter((p) => p.id !== newProject.id)]);
    showToast('Проект сохранен в историю');
  };

  // Load a saved project
  const handleLoadProject = (proj: SavedProject) => {
    setProjectTitle(proj.title);
    setSheetSettings(proj.sheetSettings);
    setParts(proj.parts);
    if (proj.result) {
      setResult(proj.result);
      setViewState('results');
    } else {
      setResult(null);
      setViewState('input');
    }
    setIsHistoryOpen(false);
    showToast(`Загружен проект «${proj.title}»`);
  };

  // Delete saved project
  const handleDeleteProject = (id: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
    showToast('Проект удален из истории');
  };

  // Import projects from JSON
  const handleImportProjects = (imported: SavedProject[]) => {
    setSavedProjects((prev) => [...imported, ...prev]);
    showToast(`Импортировано проектов: ${imported.length}`);
  };


  const handleExportPdf = () => {
    if (!result) return;
    exportCuttingToPdf(projectTitle, sheetSettings, parts, result);
    showToast('PDF формируется и скачивается...');
  };

  const handlePrint = () => {
    triggerPrint();
  };

  const totalPartsPieces = parts.reduce((sum, p) => sum + (Number(p.count) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans antialiased flex flex-col pb-16 sm:pb-0">
      {/* App Header */}
      <Header
        projectTitle={projectTitle}
        onUpdateTitle={setProjectTitle}
        onNewProject={handleNewProject}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSaveProject={handleSaveProject}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        hasCalculated={Boolean(result)}
        onPrint={handlePrint}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {viewState === 'input' ? (
          <div>
            {/* View Switch / Status Bar if results already exist */}
            {result && (
              <div className="mb-3.5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-xs">
                <span className="font-bold text-emerald-950">
                  Готовый раскрой: {result.sheets.length} лист(а), КПД {result.overallEfficiency}%
                </span>
                <button
                  type="button"
                  onClick={() => setViewState('results')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-2xs text-xs"
                >
                  Смотреть карту →
                </button>
              </div>
            )}

            {/* 1. Sheet Configuration Section (ЛДСП, МДФ, популярные размеры) */}
            <SheetConfigSection
              settings={sheetSettings}
              onChange={setSheetSettings}
            />

            {/* 2. Parts List Section */}
            <PartListSection
              parts={parts}
              onPartsChange={setParts}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
            />

            {/* 3. The Big Green Calculation Button («РАССЧИТАТЬ РАСКРОЙ») */}
            <div className="mt-5 mb-8">
              <button
                type="button"
                onClick={handleCalculate}
                className="w-full py-4 sm:py-5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black text-base sm:text-xl tracking-wider uppercase shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer border-2 border-emerald-400"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950 stroke-[2]" />
                <span>РАССЧИТАТЬ РАСКРОЙ</span>
                <span className="text-xs sm:text-sm font-bold bg-slate-950 text-emerald-400 px-2.5 py-0.5 rounded-full normal-case">
                  {totalPartsPieces} дет.
                </span>
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2">
                2D алгоритм гильотинного раскроя • Минимизация отходов • Учет текстуры
              </p>
            </div>
          </div>
        ) : (
          result && (
            <CuttingResultView
              result={result}
              settings={sheetSettings}
              parts={parts}
              projectTitle={projectTitle}
              onBackToEdit={() => setViewState('input')}
              onExportPdf={handleExportPdf}
              onPrint={handlePrint}
              onShare={() => setIsShareOpen(true)}
            />
          )
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb friendly on smartphones) */}
      {viewState === 'input' && (
        <div className="fixed bottom-0 left-0 right-0 p-2.5 bg-white/95 backdrop-blur-md border-t border-slate-200 z-20 flex items-center justify-between gap-2 shadow-lg sm:hidden print:hidden">
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            className="flex-1 py-2.5 px-3 bg-slate-100 active:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Калькулятор</span>
          </button>

          <button
            type="button"
            onClick={handleCalculate}
            className="flex-[2] py-2.5 px-3 bg-emerald-500 active:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black text-center shadow-md flex items-center justify-center gap-1.5 border border-emerald-400 uppercase tracking-wide"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Рассчитать ({totalPartsPieces})</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500 print:hidden hidden sm:block">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>«РАСКРОЙ PRO» — Мобильный инструмент для мастеров (ЛДСП / МДФ)</span>
          <span className="text-slate-400 font-mono text-[11px]">2D Guillotine Packing</span>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-medium border border-slate-700 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Share Modal */}
      {result && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          projectTitle={projectTitle}
          settings={sheetSettings}
          parts={parts}
          result={result}
        />
      )}

      {/* Saved Projects Modal */}
      <SavedProjectsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedProjects={savedProjects}
        onLoadProject={handleLoadProject}
        onDeleteProject={handleDeleteProject}
        onImportProjects={handleImportProjects}
      />

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
