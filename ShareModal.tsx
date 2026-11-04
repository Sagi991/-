import React, { useState } from 'react';
import { CuttingResult, PartItem, SheetSettings } from '../types/cutting';
import {
  generateTextReport,
  shareNativeOrClipboard,
  shareViaTelegram,
  shareViaWhatsApp,
} from '../utils/shareUtils';
import { X, Copy, Check, Send, MessageSquare, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  settings: SheetSettings;
  parts: PartItem[];
  result: CuttingResult;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  settings,
  parts,
  result,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportText = generateTextReport(projectTitle, settings, parts, result);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const status = await shareNativeOrClipboard(projectTitle || 'Раскрой PRO', reportText);
    if (status === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Отправить результат мастеру
              </h3>
              <p className="text-xs text-slate-500">
                Спецификация, карта раскроя и количество листов
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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          <button
            type="button"
            onClick={() => shareViaWhatsApp(reportText)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => shareViaTelegram(reportText)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Telegram</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Поделиться</span>
          </button>
        </div>

        {/* Text Preview & Copy */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Текстовый отчёт для распиловщика:</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать текст</span>
                </>
              )}
            </button>
          </div>
          <textarea
            readOnly
            value={reportText}
            rows={10}
            className="w-full text-xs font-mono p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Close */}
        <div className="flex justify-end">
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
