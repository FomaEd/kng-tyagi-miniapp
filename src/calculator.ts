export type HandleSeries =
  | 'standard_design'
  | 'premium_mini_disc'
  | 'handle_4square';

export type HingeType =
  | 'visible_100'
  | 'hidden_100_90'
  | 'first_tilt_160_180';

export interface UserInput {
  width: number;
  height: number;
  series: HandleSeries;
  hinge: HingeType;
  L1: number | null;
  L2: number | null;
  L3: number | null;
  L4: number | null;
  L5: number | null;
}

export interface TractionResult {
  tractionL1?: number | null;
  tractionL2?: number | null;
  tractionL3?: number | null;
  tractionL4?: number | null;
  tractionL5?: number | null;
  tractionL3_turn_tilt?: number | null;
  tractionL3_tilt_turn?: number | null;
  extraTraction215?: number | null;
  usedMode?: string;
  note?: string;
}

type WidthRange = '390_700' | '700_1200' | '1200_1600';

function detectWidthRange(width: number): WidthRange | null {
  if (width >= 390 && width < 700) return '390_700';
  if (width >= 700 && width < 1200) return '700_1200';
  if (width >= 1200 && width <= 1600) return '1200_1600';
  return null;
}

const HIGH_SASH_HEIGHT = 2400;

// === БАЗА для Стандарт/Дизайн (из первого листа) ===[file:37]

// Видимые петли 100 кг
const OFFSETS_VISIBLE_100_STD: Record<
  Exclude<WidthRange, '1200_1600'>,
  { L1: number; L2: number; L3: number; L4: number; L5?: number }
> = {
  '390_700': { L1: 170, L2: 170, L3: 350, L4: 180 },
  '700_1200': { L1: 170, L2: 170, L3: 495, L4: 180, L5: 180 }
};

// Скрытые петли 100 кг 90°
const OFFSETS_HIDDEN_100_90_STD: Record<
  Exclude<WidthRange, '1200_1600'>,
  { L1: number; L2: number; L3: number; L4: number; L5?: number }
> = {
  '390_700': { L1: 170, L2: 170, L3: 357, L4: 180 },
  '700_1200': { L1: 170, L2: 170, L3: 547, L4: 180, L5: 180 }
};

// First Tilt 160 кг 180°
const OFFSETS_FIRST_TILT_BASE_STD: Record<
  '445_700' | '700_1200',
  { L1: number; L2: number; L3: number; L4: number; L5?: number }
> = {
  '445_700': { L1: 75, L2: 170, L3: 410, L4: 180 },
  '700_1200': { L1: 75, L2: 170, L3: 528, L4: 180, L5: 250 }
};

const FIRST_TILT_L3_TURN_TILT = 688;
const FIRST_TILT_L3_TILT_TURN = 940;
const FIRST_TILT_EXTRA_215 = 215;

// L3* для скрытых 100 кг 90° при ширине 1200–1600
const HIDDEN_100_90_L3_STAR = 707;

// === Premium / Minimalist / Discovery — свои L1/L2 (лист Premium) ===[file:37]

const OFFSETS_VISIBLE_100_PREMIUM: Record<
  Exclude<WidthRange, '1200_1600'>,
  { L1: number; L2: number }
> = {
  '390_700': { L1: 205, L2: 205 },
  '700_1200': { L1: 205, L2: 205 }
};

const OFFSETS_HIDDEN_100_90_PREMIUM: Record<
  Exclude<WidthRange, '1200_1600'>,
  { L1: number; L2: number }
> = {
  '390_700': { L1: 205, L2: 205 },
  '700_1200': { L1: 205, L2: 205 }
};

const OFFSETS_FIRST_TILT_PREMIUM_L1L2: Record<
  '445_700' | '700_1200',
  { L1: number; L2: number }
> = {
  '445_700': { L1: 225, L2: 205 },
  '700_1200': { L1: 225, L2: 205 }
};

// === Ручки под 4-х гран ред-р — L1/L2 из листа «4-гран KN230AO 100 кг» ===[file:37]

// Стандартные петли 100 кг, 4-гран: L1 = -248, L2 = -248 → 248
const OFFSETS_VISIBLE_100_4SQUARE: Record<
  Exclude<WidthRange, '1200_1600'>,
  { L1: number; L2: number }
> = {
  '390_700': { L1: 248, L2: 248 },
  '700_1200': { L1: 248, L2: 248 }
};

// Скрытые петли 100 кг 90°, 4-гран: L1 = -248, L2 = -248 → 248
const OFFSETS_HIDDEN_100_90_4SQUARE: Record<
  Exclude<WidthRange, '1200_1600'>,
  { L1: number; L2: number }
> = {
  '390_700': { L1: 248, L2: 248 },
  '700_1200': { L1: 248, L2: 248 }
};

// First Tilt 160 кг 180°, 4-гран, «130 кг» блок: 445–700 / 700–1200: L1 = -248, L2 = -228 → 248 / 228
const OFFSETS_FIRST_TILT_4SQUARE_L1L2: Record<
  '445_700' | '700_1200',
  { L1: number; L2: number }
> = {
  '445_700': { L1: 248, L2: 228 },
  '700_1200': { L1: 248, L2: 228 }
};

export function calculateTraction(input: UserInput): TractionResult {
  const { width, height, series, hinge, L1, L2, L3, L4, L5 } = input;

  const range = detectWidthRange(width);
  if (!range) {
    return { note: 'Ширина створки вне допустимого диапазона (390–1600 мм).' };
  }

  const highSash = height >= HIGH_SASH_HEIGHT;

  let notePrefix = '';
  let usedMode = '';

  let L1o: number | undefined;
  let L2o: number | undefined;
  let L3o: number | undefined;
  let L4o: number | undefined;
  let L5o: number | undefined;

  // ===== ВИДИМЫЕ петли 100 кг =====
  if (hinge === 'visible_100') {
    if (range === '390_700') {
      ({ L1: L1o, L2: L2o, L3: L3o, L4: L4o } =
        OFFSETS_VISIBLE_100_STD['390_700']);
    } else {
      ({ L1: L1o, L2: L2o, L3: L3o, L4: L4o, L5: L5o } =
        OFFSETS_VISIBLE_100_STD['700_1200']);
    }

    if (series === 'premium_mini_disc') {
      const src =
        range === '390_700'
          ? OFFSETS_VISIBLE_100_PREMIUM['390_700']
          : OFFSETS_VISIBLE_100_PREMIUM['700_1200'];
      L1o = src.L1;
      L2o = src.L2;
      notePrefix =
        'Premium/Minimalist/Discovery, стандартные петли 100 кг, ширина ';
    } else if (series === 'handle_4square') {
      const src =
        range === '390_700'
          ? OFFSETS_VISIBLE_100_4SQUARE['390_700']
          : OFFSETS_VISIBLE_100_4SQUARE['700_1200'];
      L1o = src.L1;
      L2o = src.L2;
      notePrefix =
        'Ручки под 4-х гран ред-р, стандартные петли 100 кг, ширина ';
    } else {
      notePrefix =
        'Стандарт/Дизайн, стандартные петли 100 кг, ширина ';
    }

    notePrefix +=
      range === '390_700'
        ? '390–700 мм'
        : range === '700_1200'
        ? '700–1200 мм'
        : '1200–1600 мм';

    usedMode = highSash
      ? 'Высота створки ≥ 2400 мм (видимые петли)'
      : 'Обычная высота створки (видимые петли)';

  // ===== СКРЫТЫЕ петли 100 кг 90° =====
  } else if (hinge === 'hidden_100_90') {
    if (range === '390_700') {
      ({ L1: L1o, L2: L2o, L3: L3o, L4: L4o } =
        OFFSETS_HIDDEN_100_90_STD['390_700']);
    } else {
      ({ L1: L1o, L2: L2o, L3: L3o, L4: L4o, L5: L5o } =
        OFFSETS_HIDDEN_100_90_STD['700_1200']);
    }
    if (highSash) L4o = 800;

    if (series === 'premium_mini_disc') {
      const src =
        range === '390_700'
          ? OFFSETS_HIDDEN_100_90_PREMIUM['390_700']
          : OFFSETS_HIDDEN_100_90_PREMIUM['700_1200'];
      L1o = src.L1;
      L2o = src.L2;
      notePrefix =
        'Premium/Minimalist/Discovery, скрытые петли 100 кг 90°, ширина ';
    } else if (series === 'handle_4square') {
      const src =
        range === '390_700'
          ? OFFSETS_HIDDEN_100_90_4SQUARE['390_700']
          : OFFSETS_HIDDEN_100_90_4SQUARE['700_1200'];
      L1o = src.L1;
      L2o = src.L2;
      notePrefix =
        'Ручки под 4-х гран ред-р, скрытые петли 100 кг 90°, ширина ';
    } else {
      notePrefix =
        'Стандарт/Дизайн, скрытые петли 100 кг 90°, ширина ';
    }

    notePrefix +=
      range === '390_700'
        ? '390–700 мм'
        : range === '700_1200'
        ? '700–1200 мм'
        : '1200–1600 мм';

    usedMode = highSash
      ? 'Высота створки ≥ 2400 мм (используется L4*)'
      : 'Обычная высота створки';

  // ===== First Tilt 160 кг 180° =====
  } else if (hinge === 'first_tilt_160_180') {
    let ftRange: '445_700' | '700_1200' | null = null;
    if (width >= 445 && width <= 700) ftRange = '445_700';
    if (width > 700 && width <= 1600) ftRange = '700_1200';

    if (!ftRange) {
      return {
        note:
          'Для First Tilt 160 кг расчёт возможен при ширине створки 445–1600 мм.'
      };
    }

    ({ L1: L1o, L2: L2o, L3: L3o, L4: L4o, L5: L5o } =
      OFFSETS_FIRST_TILT_BASE_STD[ftRange]);

    if (series === 'premium_mini_disc') {
      const src = OFFSETS_FIRST_TILT_PREMIUM_L1L2[ftRange];
      L1o = src.L1;
      L2o = src.L2;
      notePrefix =
        'Premium/Minimalist/Discovery, First Tilt 160 кг 180°, ширина ';
    } else if (series === 'handle_4square') {
      // для 4-гран First Tilt: L1/L2 берём из блока «130 кг» листа 4-гран,
      // L3–L5 остаются как в базе First Tilt
      const src = OFFSETS_FIRST_TILT_4SQUARE_L1L2[ftRange];
      L1o = src.L1;
      L2o = src.L2;
      notePrefix =
        'Ручки под 4-х гран ред-р, First Tilt 160 кг 180° (130 кг блок), ширина ';
    } else {
      notePrefix =
        'Скрытые петли First Tilt 160 кг 180°, ширина ';
    }

    if (highSash) L4o = 800;

    notePrefix +=
      width <= 700 ? '445–700 мм' : width <= 1200 ? '700–1200 мм' : '1200–1600 мм';

    usedMode = highSash
      ? 'Высота створки ≥ 2400 мм (используется L4*)'
      : 'Обычная высота створки';
  } else {
    return { note: 'Данный тип петель пока не поддерживается в калькуляторе.' };
  }

  const result: TractionResult = {
    note: notePrefix,
    usedMode
  };

  // L1–L2
  if (L1 !== null && !Number.isNaN(L1) && L1o !== undefined) {
    result.tractionL1 = L1 - L1o;
  }
  if (L2 !== null && !Number.isNaN(L2) && L2o !== undefined) {
    result.tractionL2 = L2 - L2o;
  }

  // L3
  if (L3 !== null && !Number.isNaN(L3)) {
    const isFirstTiltWide =
      hinge === 'first_tilt_160_180' && width > 1200 && width <= 1600;
    const isHiddenWide =
      hinge === 'hidden_100_90' && width > 1200 && width <= 1600;

    if (!isFirstTiltWide && !isHiddenWide && L3o !== undefined) {
      result.tractionL3 = L3 - L3o;
    }

    if (isFirstTiltWide) {
      result.tractionL3_turn_tilt = L3 - FIRST_TILT_L3_TURN_TILT;
      result.tractionL3_tilt_turn = L3 - FIRST_TILT_L3_TILT_TURN;
      result.extraTraction215 = FIRST_TILT_EXTRA_215;
    }

    if (isHiddenWide) {
      result.tractionL3 = L3 - HIDDEN_100_90_L3_STAR;
    }
  }

  // L4 и L5
  if (L4 !== null && !Number.isNaN(L4) && L4o !== undefined) {
    result.tractionL4 = L4 - L4o;
  }
  if (L5 !== null && !Number.isNaN(L5) && L5o !== undefined) {
    result.tractionL5 = L5 - L5o;
  }

  return result;
}
