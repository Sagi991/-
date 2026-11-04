import React, { useRef } from 'react';
import { SavedProject } from '../types/cutting';
import { FolderOpen, X, Trash2, ArrowRight, Download, Upload, Calendar, Layers, Box } from 'lucide-react';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (id: string) => void;
  onImportProjects: (projects: SavedProject[]) => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onLoadProject,
  onDeleteProject,
  onImportProjects,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportAll = () => {
    const jsonStr = JSON.stringify(savedProjects, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raskroy-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportProjects(parsed);
        } else if (parsed && typeof parsed === 'object' && parsed.id) {
          onImportProjects([parsed]);
        }
      } catch (err) {
        alert('Ошибка при чтении файла проекта');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scaleUp max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                История и сохраненные проекты
              </h3>
              <p className="text-xs text-slate-500">
                Сохраненные раскрои в памяти устройства ({savedProjects.length})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Export / Import */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportAll}
              disabled={savedProjects.length === 0}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Экспорт JSON</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Импорт JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 mb-0.5">
                Пока нет сохраненных проектов
              </p>
              <p className="text-xs text-slate-500">
                Нажмите «Сохранить» в верхней панели, чтобы добавить текущий расчет в историю.
              </p>
            </div>
          ) : (
            savedProjects.map((proj) => {
              const totalPieces = proj.parts.reduce((s, p) => s + (p.count || 1), 0);
              return (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {proj.title || 'Проект без названия'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        {proj.sheetSettings.material} {proj.sheetSettings.width}×{proj.sheetSettings.height}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Box className="w-3 h-3 text-blue-500" />
                        {totalPieces} дет.
                      </span>
                      {proj.result && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">
                            {proj.result.sheets.length} лист(ов) • КПД {proj.result.overallEfficiency}%
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onLoadProject(proj)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Открыть</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Удалить проект"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 mt-3 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
