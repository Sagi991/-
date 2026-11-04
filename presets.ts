import { MaterialType, SheetSettings } from '../types/cutting';

export interface SheetPreset {
  name: string;
  width: number;
  height: number;
  material: MaterialType;
  description: string;
}

export const SHEET_PRESETS: SheetPreset[] = [
  {
    name: '2750 × 1830 (ЛДСП)',
    width: 2750,
    height: 1830,
    material: 'ЛДСП',
    description: 'Стандартный формат Kronospan, Kastamonu',
  },
  {
    name: '2800 × 2070 (ЛДСП Egger)',
    width: 2800,
    height: 2070,
    material: 'ЛДСП',
    description: 'Большой формат Egger, Lamarty',
  },
  {
    name: '2440 × 1830 (ЛДСП)',
    width: 2440,
    height: 1830,
    material: 'ЛДСП',
    description: 'Формат ЧФМК, Томск',
  },
  {
    name: '2800 × 1220 (МДФ)',
    width: 2800,
    height: 1220,
    material: 'МДФ',
    description: 'МДФ для фасадов и панелей',
  },
  {
    name: '2440 × 1220 (МДФ)',
    width: 2440,
    height: 1220,
    material: 'МДФ',
    description: 'Стандартный лист МДФ',
  },
];
