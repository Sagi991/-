import {
  CuttingResult,
  PartItem,
  PlacedPart,
  RemnantRect,
  SheetCutResult,
  SheetSettings,
} from '../types/cutting';

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PieceToPlace {
  partId: string;
  name: string;
  length: number;
  width: number;
  canRotate: boolean;
  grain: 'none' | 'length' | 'width';
  color: string;
  pieceIndex: number;
  globalPieceNumber: number;
  area: number;
  maxDim: number;
  perimeter: number;
}

type SplitRule = 'shorter_axis' | 'longer_axis' | 'minimize_area';
type FitRule = 'best_area_fit' | 'best_short_side_fit' | 'best_long_side_fit';
type SortRule = 'area_desc' | 'maxdim_desc' | 'perimeter_desc' | 'length_desc';

const PALETTE = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
  '#e11d48', // rose-600
  '#0ea5e9', // sky-500
];

export function getPartColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

/**
 * Validates which orientations of a part can be placed based on canRotate & grain direction.
 * Returns array of [width, height, isRotated] allowed.
 */
function getAllowedOrientations(
  piece: PieceToPlace
): Array<{ pw: number; ph: number; rotated: boolean }> {
  const normal = { pw: piece.length, ph: piece.width, rotated: false };
  const rotated = { pw: piece.width, ph: piece.length, rotated: true };

  // If grain is 'length': length must run along sheet length (X axis)
  if (piece.grain === 'length') {
    return [normal];
  }

  // If grain is 'width': length must run along sheet width (Y axis)
  if (piece.grain === 'width') {
    return [rotated];
  }

  // Grain is 'none'
  if (!piece.canRotate) {
    return [normal];
  }

  // If square, only 1 orientation needed
  if (piece.length === piece.width) {
    return [normal];
  }

  return [normal, rotated];
}

/**
 * Runs guillotine bin packing for a single heuristic configuration.
 */
function runPackingSimulation(
  pieces: PieceToPlace[],
  usableW: number,
  usableH: number,
  kerf: number,
  trim: number,
  fitRule: FitRule,
  splitRule: SplitRule
): {
  sheets: { placed: PlacedPart[]; freeRects: FreeRect[] }[];
  unplaced: PieceToPlace[];
} {
  const sheets: { placed: PlacedPart[]; freeRects: FreeRect[] }[] = [];
  const remainingPieces = [...pieces];

  while (remainingPieces.length > 0) {
    // Start a new sheet
    const currentPlaced: PlacedPart[] = [];
    const freeRects: FreeRect[] = [{ x: 0, y: 0, w: usableW, h: usableH }];

    let placedAnyInThisSheet = false;

    // Keep placing parts in the current sheet while possible
    let i = 0;
    while (i < remainingPieces.length) {
      const piece = remainingPieces[i];
      const orientations = getAllowedOrientations(piece);

      let bestRectIdx = -1;
      let bestOrientation: { pw: number; ph: number; rotated: boolean } | null = null;
      let bestFitScore = Number.POSITIVE_INFINITY;

      // Find best free rectangle
      for (let rIdx = 0; rIdx < freeRects.length; rIdx++) {
        const fr = freeRects[rIdx];

        for (const ori of orientations) {
          if (ori.pw <= fr.w && ori.ph <= fr.h) {
            let score = Number.POSITIVE_INFINITY;

            if (fitRule === 'best_area_fit') {
              score = fr.w * fr.h - ori.pw * ori.ph;
            } else if (fitRule === 'best_short_side_fit') {
              const leftoverW = fr.w - ori.pw;
              const leftoverH = fr.h - ori.ph;
              score = Math.min(leftoverW, leftoverH);
            } else if (fitRule === 'best_long_side_fit') {
              const leftoverW = fr.w - ori.pw;
              const leftoverH = fr.h - ori.ph;
              score = Math.max(leftoverW, leftoverH);
            }

            if (score < bestFitScore) {
              bestFitScore = score;
              bestRectIdx = rIdx;
              bestOrientation = ori;
            }
          }
        }
      }

      if (bestRectIdx >= 0 && bestOrientation) {
        // Place piece in freeRects[bestRectIdx]
        const fr = freeRects[bestRectIdx];
        const pw = bestOrientation.pw;
        const ph = bestOrientation.ph;

        const placedPart: PlacedPart = {
          partId: piece.partId,
          pieceIndex: piece.pieceIndex,
          globalPieceNumber: piece.globalPieceNumber,
          name: piece.name,
          x: fr.x,
          y: fr.y,
          absX: fr.x + trim,
          absY: fr.y + trim,
          width: pw,
          height: ph,
          originalLength: piece.length,
          originalWidth: piece.width,
          rotated: bestOrientation.rotated,
          grain: piece.grain,
          color: piece.color,
        };

        currentPlaced.push(placedPart);
        placedAnyInThisSheet = true;

        // Remove piece from remaining
        remainingPieces.splice(i, 1);

        // Remove used rectangle and split leftover space
        freeRects.splice(bestRectIdx, 1);

        // Account for kerf saw cut width
        const remW = fr.w - pw - kerf;
        const remH = fr.h - ph - kerf;

        // Guillotine split: Shorter Axis, Longer Axis, or Minimize Area
        let splitHorizontal = true;
        if (splitRule === 'shorter_axis') {
          splitHorizontal = pw <= ph;
        } else if (splitRule === 'longer_axis') {
          splitHorizontal = pw > ph;
        } else {
          // minimize area
          splitHorizontal = fr.w * remH <= remW * fr.h;
        }

        if (splitHorizontal) {
          // Top remnant across full remaining width, Right remnant beside part
          // Remnant right
          if (remW > 0) {
            freeRects.push({
              x: fr.x + pw + kerf,
              y: fr.y,
              w: remW,
              h: ph,
            });
          }
          // Remnant top
          if (remH > 0) {
            freeRects.push({
              x: fr.x,
              y: fr.y + ph + kerf,
              w: fr.w,
              h: remH,
            });
          }
        } else {
          // Vertical split: Right remnant spans full height, Top remnant above part
          // Remnant top
          if (remH > 0) {
            freeRects.push({
              x: fr.x,
              y: fr.y + ph + kerf,
              w: pw,
              h: remH,
            });
          }
          // Remnant right
          if (remW > 0) {
            freeRects.push({
              x: fr.x + pw + kerf,
              y: fr.y,
              w: remW,
              h: fr.h,
            });
          }
        }

        // Restart scan or keep going
        i = 0;
      } else {
        // Cannot fit this piece in this sheet, check next piece
        i++;
      }
    }

    if (!placedAnyInThisSheet) {
      // No piece could fit into a brand new empty sheet! These pieces are unplaceable.
      break;
    }

    sheets.push({ placed: currentPlaced, freeRects });
  }

  return { sheets, unplaced: remainingPieces };
}

/**
 * Main cutting optimization function.
 */
export function calculateCutting(
  settings: SheetSettings,
  parts: PartItem[]
): CuttingResult {
  const startTime = performance.now();

  const rawW = Number(settings.width);
  const rawH = Number(settings.height);
  const kerf = Number(settings.kerf ?? 4);
  const trim = Number(settings.trim ?? 10);

  const usableW = Math.max(0, rawW - trim * 2);
  const usableH = Math.max(0, rawH - trim * 2);

  // Expand pieces
  const pieces: PieceToPlace[] = [];
  let globalPieceCount = 0;

  parts.forEach((part, partIdx) => {
    const color = part.color || getPartColor(partIdx);
    const count = Math.max(0, Math.floor(part.count));
    for (let k = 1; k <= count; k++) {
      globalPieceCount++;
      pieces.push({
        partId: part.id,
        name: part.name || `Деталь #${partIdx + 1}`,
        length: Number(part.length),
        width: Number(part.width),
        canRotate: Boolean(part.canRotate),
        grain: part.grain,
        color,
        pieceIndex: k,
        globalPieceNumber: globalPieceCount,
        area: Number(part.length) * Number(part.width),
        maxDim: Math.max(Number(part.length), Number(part.width)),
        perimeter: 2 * (Number(part.length) + Number(part.width)),
      });
    }
  });

  const totalPartsRequested = pieces.length;

  if (totalPartsRequested === 0 || usableW <= 0 || usableH <= 0) {
    return {
      sheets: [],
      totalPartsRequested,
      totalPartsPlaced: 0,
      unplacedParts: [],
      totalMaterialAreaM2: 0,
      totalPartsAreaM2: 0,
      totalWasteAreaM2: 0,
      overallEfficiency: 0,
      totalUsefulRemnantsCount: 0,
      totalUsefulRemnantsAreaM2: 0,
      computationTimeMs: Math.round(performance.now() - startTime),
    };
  }

  // Pre-filter impossible pieces that exceed usable sheet dimensions
  const validPieces: PieceToPlace[] = [];
  const impossiblePiecesMap = new Map<string, { part: PartItem; count: number; reason: string }>();

  for (const piece of pieces) {
    const orientations = getAllowedOrientations(piece);
    const fitsAny = orientations.some((o) => o.pw <= usableW && o.ph <= usableH);

    if (fitsAny) {
      validPieces.push(piece);
    } else {
      const partObj = parts.find((p) => p.id === piece.partId)!;
      let reason = 'Деталь превышает полезный размер листа с учетом отступов';
      if (piece.grain !== 'none' && !piece.canRotate) {
        reason += ' (с учетом направления текстуры)';
      }
      const existing = impossiblePiecesMap.get(piece.partId);
      if (existing) {
        existing.count++;
      } else {
        impossiblePiecesMap.set(piece.partId, {
          part: partObj,
          count: 1,
          reason,
        });
      }
    }
  }

  // Sorters
  const sorters: Record<SortRule, (a: PieceToPlace, b: PieceToPlace) => number> = {
    area_desc: (a, b) => b.area - a.area || b.maxDim - a.maxDim,
    maxdim_desc: (a, b) => b.maxDim - a.maxDim || b.area - a.area,
    perimeter_desc: (a, b) => b.perimeter - a.perimeter || b.area - a.area,
    length_desc: (a, b) => b.length - a.length || b.width - a.width,
  };

  // Configurations to evaluate
  const configurations: Array<{
    sortRule: SortRule;
    fitRule: FitRule;
    splitRule: SplitRule;
  }> = [
    { sortRule: 'area_desc', fitRule: 'best_area_fit', splitRule: 'shorter_axis' },
    { sortRule: 'area_desc', fitRule: 'best_short_side_fit', splitRule: 'shorter_axis' },
    { sortRule: 'maxdim_desc', fitRule: 'best_area_fit', splitRule: 'shorter_axis' },
    { sortRule: 'maxdim_desc', fitRule: 'best_short_side_fit', splitRule: 'longer_axis' },
    { sortRule: 'perimeter_desc', fitRule: 'best_area_fit', splitRule: 'shorter_axis' },
    { sortRule: 'length_desc', fitRule: 'best_short_side_fit', splitRule: 'shorter_axis' },
    { sortRule: 'area_desc', fitRule: 'best_long_side_fit', splitRule: 'shorter_axis' },
    { sortRule: 'area_desc', fitRule: 'best_area_fit', splitRule: 'longer_axis' },
  ];

  type SimulationResult = ReturnType<typeof runPackingSimulation>;
  let bestSimulation: SimulationResult | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const cfg of configurations) {
    const sorted = [...validPieces].sort(sorters[cfg.sortRule]);
    const sim = runPackingSimulation(
      sorted,
      usableW,
      usableH,
      kerf,
      trim,
      cfg.fitRule,
      cfg.splitRule
    );

    // Scoring:
    // 1. Minimum sheets (huge penalty per extra sheet)
    // 2. Minimum unplaced valid pieces (huge penalty)
    // 3. Maximum packing efficiency / compactness
    const sheetCount = sim.sheets.length;
    const unplacedCount = sim.unplaced.length;

    let totalPlacedArea = 0;
    sim.sheets.forEach((sh) => {
      sh.placed.forEach((p) => {
        totalPlacedArea += p.width * p.height;
      });
    });

    const score =
      -sheetCount * 1000000 -
      unplacedCount * 50000000 +
      totalPlacedArea / (usableW * usableH || 1) * 100;

    if (score > bestScore) {
      bestScore = score;
      bestSimulation = sim;
    }
  }

  // Fallback if all pieces were impossible
  const simulation = bestSimulation || { sheets: [], unplaced: [] };

  // Combine impossible pieces and any unplaced
  const unplacedPartsList: { part: PartItem; remainingCount: number; reason: string }[] = [];
  impossiblePiecesMap.forEach((val) => {
    unplacedPartsList.push({
      part: val.part,
      remainingCount: val.count,
      reason: val.reason,
    });
  });

  if (simulation.unplaced.length > 0) {
    const unplacedGroup = new Map<string, number>();
    simulation.unplaced.forEach((p) => {
      unplacedGroup.set(p.partId, (unplacedGroup.get(p.partId) || 0) + 1);
    });
    unplacedGroup.forEach((cnt, pId) => {
      const partObj = parts.find((p) => p.id === pId);
      if (partObj) {
        unplacedPartsList.push({
          part: partObj,
          remainingCount: cnt,
          reason: 'Не удалось оптимально уместить на листе',
        });
      }
    });
  }

  // Format sheet cut results
  const rawSheetAreaMm2 = rawW * rawH;
  const usableSheetAreaMm2 = usableW * usableH;

  const sheetsResult: SheetCutResult[] = simulation.sheets.map((sheet, index) => {
    let placedAreaMm2 = 0;
    sheet.placed.forEach((p) => {
      placedAreaMm2 += p.width * p.height;
    });

    // Remnants
    const allRemnants: RemnantRect[] = sheet.freeRects
      .filter((r) => r.w >= 10 && r.h >= 10)
      .map((r, rIdx) => {
        const areaM2 = (r.w * r.h) / 1_000_000;
        // Useful remnant if area >= 0.12 m² and min dimension >= 180 mm
        const isUseful = (r.w * r.h >= 120_000) && Math.min(r.w, r.h) >= 180;
        return {
          id: `sheet-${index + 1}-remnant-${rIdx + 1}`,
          x: r.x + trim,
          y: r.y + trim,
          width: r.w,
          height: r.h,
          areaM2: Number(areaM2.toFixed(3)),
          isUseful,
        };
      });

    const usefulRemnants = allRemnants.filter((r) => r.isUseful);

    const wasteAreaMm2 = Math.max(0, rawSheetAreaMm2 - placedAreaMm2);
    const efficiencyPercent =
      rawSheetAreaMm2 > 0 ? Number(((placedAreaMm2 / rawSheetAreaMm2) * 100).toFixed(1)) : 0;

    return {
      sheetIndex: index + 1,
      placedParts: sheet.placed,
      usefulRemnants,
      allRemnants,
      usedAreaMm2: placedAreaMm2,
      totalSheetAreaMm2: rawSheetAreaMm2,
      usableSheetAreaMm2,
      wasteAreaMm2,
      efficiencyPercent,
    };
  });

  const totalPartsPlaced = sheetsResult.reduce((sum, s) => sum + s.placedParts.length, 0);
  const totalMaterialAreaM2 = Number(((sheetsResult.length * rawSheetAreaMm2) / 1_000_000).toFixed(2));
  const totalPartsAreaMm2 = sheetsResult.reduce((sum, s) => sum + s.usedAreaMm2, 0);
  const totalPartsAreaM2 = Number((totalPartsAreaMm2 / 1_000_000).toFixed(2));
  const totalWasteAreaM2 = Number((Math.max(0, totalMaterialAreaM2 - totalPartsAreaM2)).toFixed(2));

  const overallEfficiency =
    totalMaterialAreaM2 > 0
      ? Number(((totalPartsAreaM2 / totalMaterialAreaM2) * 100).toFixed(1))
      : 0;

  const totalUsefulRemnantsCount = sheetsResult.reduce(
    (sum, s) => sum + s.usefulRemnants.length,
    0
  );
  const totalUsefulRemnantsAreaM2 = Number(
    sheetsResult
      .reduce((sum, s) => sum + s.usefulRemnants.reduce((rSum, r) => rSum + r.areaM2, 0), 0)
      .toFixed(2)
  );

  const computationTimeMs = Math.round(performance.now() - startTime);

  return {
    sheets: sheetsResult,
    totalPartsRequested,
    totalPartsPlaced,
    unplacedParts: unplacedPartsList,
    totalMaterialAreaM2,
    totalPartsAreaM2,
    totalWasteAreaM2,
    overallEfficiency,
    totalUsefulRemnantsCount,
    totalUsefulRemnantsAreaM2,
    computationTimeMs,
  };
}
