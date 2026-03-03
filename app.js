function calculateTraction(input) {
  var width = input.width, height = input.height, series = input.series, hinge = input.hinge;
  var L1 = input.L1, L2 = input.L2, L3 = input.L3, L4 = input.L4, L5 = input.L5;

  function detectRange(w) {
    if (w >= 390 && w < 700) return '390_700';
    if (w >= 700 && w < 1200) return '700_1200';
    if (w >= 1200 && w <= 1600) return '1200_1600';
    return null;
  }

  var range = detectRange(width);
  if (!range) return { note: 'Ширина створки вне допустимого диапазона (390–1600 мм).' };

  var highSash = height >= 2400;
  var L1o, L2o, L3o, L4o, L5o;
  var notePrefix = '', usedMode = '';

  var STD_VIS = {
    '390_700':  { L1: 170, L2: 170, L3: 350, L4: 180 },
    '700_1200': { L1: 170, L2: 170, L3: 495, L4: 180, L5: 180 }
  };
  var STD_HID = {
    '390_700':  { L1: 170, L2: 170, L3: 357, L4: 180 },
    '700_1200': { L1: 170, L2: 170, L3: 547, L4: 180, L5: 180 }
  };
  var STD_FT = {
    '445_700':  { L1: 75, L2: 170, L3: 410, L4: 180 },
    '700_1200': { L1: 75, L2: 170, L3: 528, L4: 180, L5: 250 }
  };
  var PREM_VIS = {
    '390_700':  { L1: 205, L2: 205 },
    '700_1200': { L1: 205, L2: 205 }
  };
  var PREM_HID = {
    '390_700':  { L1: 205, L2: 205 },
    '700_1200': { L1: 205, L2: 205 }
  };
  var PREM_FT = {
    '445_700':  { L1: 225, L2: 205 },
    '700_1200': { L1: 225, L2: 205 }
  };
  var SQ_VIS = {
    '390_700':  { L1: 248, L2: 248 },
    '700_1200': { L1: 248, L2: 248 }
  };
  var SQ_HID = {
    '390_700':  { L1: 248, L2: 248 },
    '700_1200': { L1: 248, L2: 248 }
  };
  var SQ_FT = {
    '445_700':  { L1: 248, L2: 228 },
    '700_1200': { L1: 248, L2: 228 }
  };

  var HIDDEN_L3_STAR = 707;
  var FT_L3_TT = 688, FT_L3_TiltT = 940, FT_EXTRA = 215;

  if (hinge === 'visible_100') {
    var r = range === '390_700' ? '390_700' : '700_1200';
    var base = STD_VIS[r];
    L1o = base.L1; L2o = base.L2; L3o = base.L3; L4o = base.L4; L5o = base.L5;
    if (series === 'premium_mini_disc') { L1o = PREM_VIS[r].L1; L2o = PREM_VIS[r].L2; notePrefix = 'Premium/Minimalist/Discovery, стандартные петли 100 кг, ширина '; }
    else if (series === 'handle_4square') { L1o = SQ_VIS[r].L1; L2o = SQ_VIS[r].L2; notePrefix = 'Ручки под 4-х гран ред-р, стандартные петли 100 кг, ширина '; }
    else { notePrefix = 'Стандарт/Дизайн, стандартные петли 100 кг, ширина '; }
    notePrefix += range === '390_700' ? '390–700 мм' : range === '700_1200' ? '700–1200 мм' : '1200–1600 мм';
    usedMode = highSash ? 'Высота створки ≥ 2400 мм' : 'Обычная высота створки';

  } else if (hinge === 'hidden_100_90') {
    var r = range === '390_700' ? '390_700' : '700_1200';
    var base = STD_HID[r];
    L1o = base.L1; L2o = base.L2; L3o = base.L3; L4o = base.L4; L5o = base.L5;
    if (highSash) L4o = 800;
    if (series === 'premium_mini_disc') { L1o = PREM_HID[r].L1; L2o = PREM_HID[r].L2; notePrefix = 'Premium/Minimalist/Discovery, скрытые петли 100 кг 90°, ширина '; }
    else if (series === 'handle_4square') { L1o = SQ_HID[r].L1; L2o = SQ_HID[r].L2; notePrefix = 'Ручки под 4-х гран ред-р, скрытые петли 100 кг 90°, ширина '; }
    else { notePrefix = 'Стандарт/Дизайн, скрытые петли 100 кг 90°, ширина '; }
    notePrefix += range === '390_700' ? '390–700 мм' : range === '700_1200' ? '700–1200 мм' : '1200–1600 мм';
    usedMode = highSash ? 'Высота створки ≥ 2400 мм (используется L4*)' : 'Обычная высота створки';

  } else if (hinge === 'first_tilt_160_180') {
    var ftRange = null;
    if (width >= 445 && width <= 700) ftRange = '445_700';
    if (width > 700 && width <= 1600) ftRange = '700_1200';
    if (!ftRange) return { note: 'Для First Tilt 160 кг расчёт возможен при ширине 445–1600 мм.' };
    var base = STD_FT[ftRange];
    L1o = base.L1; L2o = base.L2; L3o = base.L3; L4o = base.L4; L5o = base.L5;
    if (highSash) L4o = 800;
    if (series === 'premium_mini_disc') { L1o = PREM_FT[ftRange].L1; L2o = PREM_FT[ftRange].L2; notePrefix = 'Premium/Minimalist/Discovery, First Tilt 160 кг 180°, ширина '; }
    else if (series === 'handle_4square') { L1o = SQ_FT[ftRange].L1; L2o = SQ_FT[ftRange].L2; notePrefix = 'Ручки под 4-х гран ред-р, First Tilt 160 кг 180°, ширина '; }
    else { notePrefix = 'Скрытые петли First Tilt 160 кг 180°, ширина '; }
    notePrefix += width <= 700 ? '445–700 мм' : width <= 1200 ? '700–1200 мм' : '1200–1600 мм';
    usedMode = highSash ? 'Высота створки ≥ 2400 мм (используется L4*)' : 'Обычная высота створки';
  } else {
    return { note: 'Данный тип петель пока не поддерживается.' };
  }

  var result = { note: notePrefix, usedMode: usedMode };

  if (L1 !== null && !isNaN(L1) && L1o !== undefined) result.tractionL1 = L1 - L1o;
  if (L2 !== null && !isNaN(L2) && L2o !== undefined) result.tractionL2 = L2 - L2o;

  if (L3 !== null && !isNaN(L3)) {
    var isFTWide = hinge === 'first_tilt_160_180' && width > 1200 && width <= 1600;
    var isHidWide = hinge === 'hidden_100_90' && width > 1200 && width <= 1600;
    if (!isFTWide && !isHidWide && L3o !== undefined) result.tractionL3 = L3 - L3o;
    if (isFTWide) { result.tractionL3_turn_tilt = L3 - FT_L3_TT; result.tractionL3_tilt_turn = L3 - FT_L3_TiltT; result.extraTraction215 = FT_EXTRA; }
    if (isHidWide) result.tractionL3 = L3 - HIDDEN_L3_STAR;
  }

  if (L4 !== null && !isNaN(L4) && L4o !== undefined) result.tractionL4 = L4 - L4o;
  if (L5 !== null && !isNaN(L5) && L5o !== undefined) result.tractionL5 = L5 - L5o;

  return result;
}

window.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('calcForm');
  var resultEl = document.getElementById('result');
  var errorEl = document.getElementById('errors');
  var hintEl = document.getElementById('hints');

  if (hintEl) {
    hintEl.innerHTML = [
      '<strong>Подсказки по диапазонам:</strong>',
      '• Ширина створки: 390–1600 мм.',
      '• First Tilt 160 кг 180°: ширина 445–1600 мм.',
      '• Для скрытых петель 100 кг 90° и стандартных (видимых) 100кг — ширина 390–1600 мм.'
    ].join('<br>');
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    errorEl.textContent = '';
    resultEl.textContent = '';

    var width = Number(document.getElementById('width').value);
    var height = Number(document.getElementById('height').value);
    var hinge = document.getElementById('hinge').value;
    var series = document.getElementById('series').value;

    var errors = [];
    if (!width || isNaN(width)) errors.push('Укажите корректную ширину створки (мм).');
    if (!height || isNaN(height)) errors.push('Укажите корректную высоту створки (мм).');
    if (width && (width < 390 || width > 1600)) errors.push('Ширина створки должна быть в диапазоне 390–1600 мм.');
    if (hinge === 'first_tilt_160_180' && width && (width < 445 || width > 1600)) errors.push('Для First Tilt 160 кг расчёт доступен при ширине 445–1600 мм.');

    if (errors.length > 0) { errorEl.innerHTML = errors.join('<br>'); return; }

    function parseNum(id) {
      var v = document.getElementById(id).value;
      if (v === '' || v === null) return null;
      var n = Number(v);
      return isNaN(n) ? null : n;
    }

    var input = {
      width: width, height: height, series: series, hinge: hinge,
      L1: parseNum('L1'), L2: parseNum('L2'), L3: parseNum('L3'),
      L4: parseNum('L4'), L5: parseNum('L5')
    };

    var result = calculateTraction(input);
    var lines = [];
    if (result.note) lines.push('Примечание: ' + result.note);
    if (result.usedMode) lines.push('Режим: ' + result.usedMode);

    function addLine(label, val) {
      if (typeof val === 'number') {
        lines.push(label + ': ' + (val > 0 ? '+' : '') + val + ' мм');
      }
    }

    addLine('Тяга по L1', result.tractionL1);
    addLine('Тяга по L2', result.tractionL2);
    addLine('Тяга по L3', result.tractionL3);
    addLine('Тяга по L4', result.tractionL4);
    addLine('Тяга по L5', result.tractionL5);

    if (result.tractionL3_turn_tilt !== undefined || result.tractionL3_tilt_turn !== undefined) {
      lines.push('Для First Tilt шириной 1200–1600 мм:');
      addLine('  • L3 (поворот-откид)', result.tractionL3_turn_tilt);
      addLine('  • L3 (откид-поворот)', result.tractionL3_tilt_turn);
      if (typeof result.extraTraction215 === 'number') lines.push('  • Доп. тяга: ' + result.extraTraction215 + ' мм');
    }

    if (lines.length === 0) lines.push('Нет рассчитанных тяг — введите хотя бы одно значение L1–L5.');
    resultEl.textContent = lines.join('\n');
  });
});
