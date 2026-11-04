import React, { useState, useRef } from 'react';
import { PlacedPart, RemnantRect, SheetCutResult, SheetSettings } from '../types/cutting';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Info, CheckCircle2 } from 'lucide-react';

interface CuttingMapSvgProps {
  sheet: SheetCutResult;
  settings: SheetSettings;
  totalSheets: number;
}

export const CuttingMapSvg: React.FC<CuttingMapSvgProps> = ({
  sheet,
  settings,
  totalSheets,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [selectedPart, setSelectedPart] = useState<PlacedPart | null>(null);
  const [selectedRemnant, setSelectedRemnant] = useState<RemnantRect | null>(null);
  const [showRemnants, setShowRemnants] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const sheetW = settings.width;
  const sheetH = settings.height;
  const trim = settings.trim;

  // SVG viewport padding for dimension markers
  const padX = 60;
  const padY = 50;
  const viewBoxW = sheetW + padX * 2;
  const viewBoxH = sheetH + padY * 2;

  const handleZoomIn = () => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Sheet Map Header Bar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
            {sheet.sheetIndex}
          </span>
          <div>
            <div className="font-semibold text-sm sm:text-base flex items-center gap-2">
              <span>Лист №{sheet.sheetIndex}</span>
              <span className="text-xs text-slate-400 font-normal">из {totalSheets}</span>
            </div>
            <div className="text-xs text-slate-300">
              {sheetW} × {sheetH} мм • Толщина {settings.thickness} мм • {settings.material}
            </div>
          </div>
        </div>

        {/* Quick Map Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Уменьшить"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs px-1 text-slate-300 min-w-10 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Увеличить"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {zoom !== 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Сбросить масштаб"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Subheader info & toggles */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-3 font-medium">
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            КПД: {sheet.efficiencyPercent}%
          </span>
          <span>Деталей: <strong className="text-slate-800">{sheet.placedParts.length} шт</strong></span>
          {sheet.usefulRemnants.length > 0 && (
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Остатков: {sheet.usefulRemnants.length} шт
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Размеры</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRemnants}
              onChange={(e) => setShowRemnants(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Деловые остатки</span>
          </label>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        ref={containerRef}
        className="relative w-full bg-slate-100 overflow-auto p-3 sm:p-6 flex items-center justify-center min-h-[360px] sm:min-h-[460px] touch-pan-x touch-pan-y"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full flex justify-center max-w-full"
        >
          <svg
            viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
            className="w-full h-auto drop-shadow-md select-none max-h-[72vh]"
            style={{ minWidth: '320px' }}
          >
            <defs>
              {/* Pattern for raw edge / trim */}
              <pattern
                id={`trim-hatch-${sheet.sheetIndex}`}
                width="16"
                height="16"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="0" y2="16" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4" />
              </pattern>

              {/* Pattern for remnants */}
              <pattern
                id={`remnant-pattern-${sheet.sheetIndex}`}
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <line x1="0" y1="0" x2="24" y2="24" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
                <line x1="24" y1="0" x2="0" y2="24" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
              </pattern>
            </defs>

            {/* Background Sheet Base */}
            <g transform={`translate(${padX}, ${padY})`}>
              {/* Raw Sheet Boundary */}
              <rect
                x="0"
                y="0"
                width={sheetW}
                height={sheetH}
                fill="#cbd5e1"
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Trim Margin Area (hatched) */}
              <rect
                x="0"
                y="0"
                width={sheetW}
                height={sheetH}
                fill={`url(#trim-hatch-${sheet.sheetIndex})`}
              />

              {/* Usable Area (white base inside trim) */}
              <rect
                x={trim}
                y={trim}
                width={sheetW - trim * 2}
                height={sheetH - trim * 2}
                fill="#f8fafc"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="8 4"
              />

              {/* Offcuts / Free Remnants */}
              {showRemnants &&
                sheet.allRemnants.map((rem) => {
                  return (
                    <g
                      key={rem.id}
                      className="cursor-pointer group"
                      onClick={() => {
                        setSelectedRemnant(rem);
                        setSelectedPart(null);
                      }}
                    >
                      <rect
                        x={rem.x}
                        y={rem.y}
                        width={rem.width}
                        height={rem.height}
                        fill={rem.isUseful ? '#fef3c7' : '#f1f5f9'}
                        stroke={rem.isUseful ? '#f59e0b' : '#cbd5e1'}
                        strokeWidth={rem.isUseful ? '2' : '1'}
                      />
                      {rem.isUseful && (
                        <rect
                          x={rem.x}
                          y={rem.y}
                          width={rem.width}
                          height={rem.height}
                          fill={`url(#remnant-pattern-${sheet.sheetIndex})`}
                        />
                      )}

                      {/* Remnant Label if big enough */}
                      {rem.isUseful && rem.width > 220 && rem.height > 100 && (
                        <text
                          x={rem.x + rem.width / 2}
                          y={rem.y + rem.height / 2}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#b45309"
                          fontSize="24"
                          fontWeight="600"
                        >
                          Остаток: {Math.round(rem.width)} × {Math.round(rem.height)} ({rem.areaM2} м²)
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* Placed Parts */}
              {sheet.placedParts.map((part) => {
                const isSelected = selectedPart?.globalPieceNumber === part.globalPieceNumber;
                const isSmall = part.width < 180 || part.height < 90;
                const isVerySmall = part.width < 100 || part.height < 60;

                return (
                  <g
                    key={`${part.partId}-${part.pieceIndex}`}
                    className="cursor-pointer transition-transform duration-75"
                    onClick={() => {
                      setSelectedPart(part);
                      setSelectedRemnant(null);
                    }}
                  >
                    {/* Part Box */}
                    <rect
                      x={part.absX}
                      y={part.absY}
                      width={part.width}
                      height={part.height}
                      fill={part.color}
                      stroke={isSelected ? '#0f172a' : '#1e293b'}
                      strokeWidth={isSelected ? '4' : '2'}
                      rx="4"
                      className="hover:opacity-95"
                    />

                    {/* Part Interior Highlight Border */}
                    <rect
                      x={part.absX + 2}
                      y={part.absY + 2}
                      width={Math.max(0, part.width - 4)}
                      height={Math.max(0, part.height - 4)}
                      fill="none"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.5"
                      rx="3"
                    />

                    {/* Content inside part */}
                    {!isVerySmall && (
                      <g
                        transform={`translate(${part.absX + part.width / 2}, ${part.absY + part.height / 2})`}
                      >
                        {/* Number Badge circle */}
                        <circle
                          cx={0}
                          cy={isSmall ? -4 : -18}
                          r={isSmall ? 14 : 20}
                          fill="rgba(15, 23, 42, 0.75)"
                        />
                        <text
                          x={0}
                          y={isSmall ? -4 : -18}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize={isSmall ? '14' : '18'}
                          fontWeight="bold"
                        >
                          {part.globalPieceNumber}
                        </text>

                        {/* Part Name */}
                        {!isSmall && (
                          <text
                            x={0}
                            y={10}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#ffffff"
                            fontSize="18"
                            fontWeight="600"
                            className="drop-shadow"
                          >
                            {part.name.length > 20 ? `${part.name.slice(0, 18)}…` : part.name}
                          </text>
                        )}

                        {/* Part Dimensions */}
                        {showDimensions && (
                          <text
                            x={0}
                            y={isSmall ? 18 : 34}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#ffffff"
                            fontSize={isSmall ? '13' : '16'}
                            fontWeight="500"
                            className="drop-shadow"
                          >
                            {Math.round(part.width)} × {Math.round(part.height)} мм
                            {part.rotated && ' ↻'}
                          </text>
                        )}
                      </g>
                    )}

                    {/* Fallback for very small parts: just the number */}
                    {isVerySmall && (
                      <text
                        x={part.absX + part.width / 2}
                        y={part.absY + part.height / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        fontSize="14"
                        fontWeight="bold"
                      >
                        #{part.globalPieceNumber}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Edge trim annotation */}
              <text
                x={trim / 2}
                y={sheetH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#475569"
                fontSize="14"
                transform={`rotate(-90 ${trim / 2} ${sheetH / 2})`}
              >
                Отступ {trim} мм
              </text>
            </g>

            {/* Outer Sheet Dimension Arrows and Labels */}
            {/* Width along bottom */}
            <g transform={`translate(${padX}, ${sheetH + padY + 16})`}>
              <line x1="0" y1="0" x2={sheetW} y2="0" stroke="#0f172a" strokeWidth="2" />
              <line x1="0" y1="-8" x2="0" y2="8" stroke="#0f172a" strokeWidth="2" />
              <line x1={sheetW} y1="-8" x2={sheetW} y2="8" stroke="#0f172a" strokeWidth="2" />
              <text
                x={sheetW / 2}
                y="20"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fill="#0f172a"
              >
                Ширина листа: {sheetW} мм
              </text>
            </g>

            {/* Height along left */}
            <g transform={`translate(${padX - 16}, ${padY})`}>
              <line x1="0" y1="0" x2="0" y2={sheetH} stroke="#0f172a" strokeWidth="2" />
              <line x1="-8" y1="0" x2="8" y2="0" stroke="#0f172a" strokeWidth="2" />
              <line x1="-8" y1={sheetH} x2="8" y2={sheetH} stroke="#0f172a" strokeWidth="2" />
              <text
                x="-20"
                y={sheetH / 2}
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fill="#0f172a"
                transform={`rotate(-90 -20 ${sheetH / 2})`}
              >
                Высота листа: {sheetH} мм
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Selected Item Detail Card */}
      {selectedPart && (
        <div className="p-3.5 bg-emerald-50 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: selectedPart.color }}
            />
            <div>
              <span className="font-bold text-slate-900">
                #{selectedPart.globalPieceNumber} {selectedPart.name}
              </span>
              <span className="text-slate-600 ml-2">
                (деталь #{selectedPart.pieceIndex})
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-700">
            <span>
              Размер: <strong>{selectedPart.width} × {selectedPart.height} мм</strong>
            </span>
            {selectedPart.rotated && (
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium text-xs">
                Повернута на 90°
              </span>
            )}
            <span>
              Позиция: X: {Math.round(selectedPart.absX)} мм, Y: {Math.round(selectedPart.absY)} мм
            </span>
            <button
              type="button"
              onClick={() => setSelectedPart(null)}
              className="text-slate-400 hover:text-slate-700 underline text-xs"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {selectedRemnant && (
        <div className="p-3.5 bg-amber-50 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-600" />
            <span className="font-bold text-amber-950">
              {selectedRemnant.isUseful ? 'Деловой остаток (пригоден для работы)' : 'Свободный обрез'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-amber-900">
            <span>
              Размер: <strong>{Math.round(selectedRemnant.width)} × {Math.round(selectedRemnant.height)} мм</strong>
            </span>
            <span>
              Площадь: <strong>{selectedRemnant.areaM2} м²</strong>
            </span>
            <span>
              Координаты: X: {Math.round(selectedRemnant.x)}, Y: {Math.round(selectedRemnant.y)}
            </span>
            <button
              type="button"
              onClick={() => setSelectedRemnant(null)}
              className="text-amber-700 hover:text-amber-950 underline text-xs"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Sheet Parts Table Breakdown */}
      <div className="p-4 bg-white border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Детали на этом листе ({sheet.placedParts.length} шт.):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {sheet.placedParts.map((p) => (
            <div
              key={`${p.partId}-${p.pieceIndex}`}
              onClick={() => setSelectedPart(p)}
              className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedPart?.globalPieceNumber === p.globalPieceNumber
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-md flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="font-medium text-slate-800 truncate">
                  #{p.globalPieceNumber} {p.name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 font-mono flex-shrink-0">
                <span>{p.width}×{p.height}</span>
                {p.rotated && <span className="text-amber-600 font-sans" title="Повернута">↻</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
