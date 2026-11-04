export type MaterialType = 'ЛДСП' | 'МДФ';

export type GrainDirection = 'none' | 'length' | 'width';

export interface SheetSettings {
  material: MaterialType;
  customMaterialName?: string;
  width: number; // mm (e.g. 2750)
  height: number; // mm (e.g. 1830)
  thickness: number; // mm (e.g. 16)
  kerf: number; // mm (saw cut width, default 4)
  trim: number; // mm (edge trim margin on all 4 sides, default 10)
  pricePerSheet?: number; // optional price in rub/currency
}

export interface PartItem {
  id: string;
  name: string;
  length: number; // mm
  width: number; // mm
  count: number;
  canRotate: boolean; // default true
  grain: GrainDirection; // 'none' | 'length' | 'width'
  color?: string;
}

export interface PlacedPart {
  partId: string;
  pieceIndex: number; // 1-based index within the part's total count
  globalPieceNumber: number; // unique sequential piece # (1, 2, 3...)
  name: string;
  x: number; // mm from trimmed origin
  y: number; // mm from trimmed origin
  absX: number; // mm from raw sheet origin (includes trim)
  absY: number; // mm from raw sheet origin (includes trim)
  width: number; // placed dimension along X (length or width)
  height: number; // placed dimension along Y (width or length)
  originalLength: number;
  originalWidth: number;
  rotated: boolean;
  grain: GrainDirection;
  color: string;
}

export interface RemnantRect {
  id: string;
  x: number; // mm from raw sheet origin
  y: number; // mm from raw sheet origin
  width: number;
  height: number;
  areaM2: number;
  isUseful: boolean; // area >= 0.15 m² and min dimension >= 200mm
}

export interface SheetCutResult {
  sheetIndex: number; // 1-based
  placedParts: PlacedPart[];
  usefulRemnants: RemnantRect[];
  allRemnants: RemnantRect[];
  usedAreaMm2: number;
  totalSheetAreaMm2: number;
  usableSheetAreaMm2: number;
  wasteAreaMm2: number;
  efficiencyPercent: number;
}

export interface CuttingResult {
  sheets: SheetCutResult[];
  totalPartsRequested: number;
  totalPartsPlaced: number;
  unplacedParts: {
    part: PartItem;
    remainingCount: number;
    reason: string;
  }[];
  totalMaterialAreaM2: number;
  totalPartsAreaM2: number;
  totalWasteAreaM2: number;
  overallEfficiency: number;
  totalUsefulRemnantsCount: number;
  totalUsefulRemnantsAreaM2: number;
  computationTimeMs: number;
}

export interface SavedProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sheetSettings: SheetSettings;
  parts: PartItem[];
  result?: CuttingResult;
}
