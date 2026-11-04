import React, { useState, useEffect } from 'react';
import { Calculator, X, Delete, Copy, Check } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [formula, setFormula] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [resetNext, setResetNext] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleNumber('.');
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('−');
      } else if (e.key === '*' || e.key === 'x') {
        handleOperator('×');
      } else if (e.key === '/') {
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, formula, resetNext]);

  if (!isOpen) return null;

  const handleNumber = (digit: string) => {
    if (resetNext) {
      setDisplay(digit === '.' ? '0.' : digit);
      setResetNext(false);
      return;
    }

    if (digit === '.') {
      if (display.includes('.')) return;
      setDisplay(display + '.');
      return;
    }

    if (display === '0') {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    setResetNext(true);
    if (formula && !resetNext) {
      // Evaluate chained operation
      try {
        const fullExpr = `${formula} ${display}`
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-');
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${fullExpr})`)();
        const safeRes = String(Number(result.toFixed(4)));
        setDisplay(safeRes);
        setFormula(`${safeRes} ${op}`);
      } catch {
        setFormula(`${display} ${op}`);
      }
    } else {
      setFormula(`${display} ${op}`);
    }
  };

  const handleEquals = () => {
    if (!formula) return;
    try {
      const fullExpr = `${formula} ${display}`
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${fullExpr})`)();
      if (!isFinite(result) || isNaN(result)) {
        setDisplay('Ошибка');
      } else {
        const formatted = String(Number(result.toFixed(4)));
        setDisplay(formatted);
      }
      setFormula('');
      setResetNext(true);
    } catch {
      setDisplay('Ошибка');
      setFormula('');
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setFormula('');
    setResetNext(false);
  };

  const handleBackspace = () => {
    if (resetNext) {
      setDisplay('0');
      setResetNext(false);
      return;
    }
    if (display.length <= 1 || display === 'Ошибка') {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleToggleSign = () => {
    if (display === '0' || display === 'Ошибка') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(val / 100));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xs w-full p-4 sm:p-5 shadow-2xl border border-slate-200 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Калькулятор</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-900 text-white rounded-2xl p-3 mb-3 flex flex-col justify-end text-right shadow-inner">
          <div className="text-[11px] text-slate-400 font-mono min-h-[16px] truncate">
            {formula || ' '}
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors py-0.5"
              title="Скопировать число"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Копировать</span>
                </>
              )}
            </button>
            <span className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white select-all">
              {display}
            </span>
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-1.5 select-none">
          {/* Row 1 */}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-700 font-bold text-sm transition-colors"
          >
            C
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center transition-colors"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePercent}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm transition-colors"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className="h-12 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-800 font-black text-base transition-colors"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onClick={() => handleNumber('7')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleNumber('8')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleNumber('9')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className="h-12 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-800 font-black text-base transition-colors"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => handleNumber('4')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleNumber('5')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleNumber('6')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleOperator('−')}
            className="h-12 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-800 font-black text-base transition-colors"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onClick={() => handleNumber('1')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleNumber('2')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleNumber('3')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className="h-12 rounded-xl bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-800 font-black text-base transition-colors"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            type="button"
            onClick={handleToggleSign}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            ±
          </button>
          <button
            type="button"
            onClick={() => handleNumber('0')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleNumber('.')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-base transition-colors shadow-2xs"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-black text-lg shadow-sm transition-colors"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
