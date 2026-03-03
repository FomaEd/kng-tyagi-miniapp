// app.js
function calculateTractionAdapter(input) {
  // @ts-ignore
  if (typeof calculateTraction === 'function') {
    // @ts-ignore
    return calculateTraction(input);
  }
  return {
    note: 'Функция calculateTraction недоступна. Проверь сборку/подключение скриптов.'
  };
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calcForm');
  const resultEl = document.getElementById('result');
  let hintEl = document.getElementById('hints');
  let errorEl = document.getElementById('errors');

  if (!hintEl) {
    hintEl = document.createElement('div');
    hintEl.id = 'hints';
    hintEl.style.marginTop = '16px';
    hintEl.style.fontSize = '14px';
    hintEl.style.color = '#555';
    hintEl.innerHTML = [
      '<strong>Подсказки по диапазонам:</strong>',
      '• Ширина створки: 390–1600 мм.',
      '• First Tilt 160 кг 180°: ширина 445–1600 мм.',
      '• Для скрытых петель 100 кг 90° и стандартных (видимых) 100кг — ширина 390–1600 мм.'
    ].join('<br>');
    form.insertAdjacentElement('afterend', hintEl);
  }

  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = 'errors';
    errorEl.style.marginTop = '8px';
    errorEl.style.color = '#b00020';
    errorEl.style.fontSize = '14px';
    form.insertAdjacentElement('afterend', errorEl);
  }

  if (!form || !resultEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    resultEl.textContent = '';

    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const L1Input = document.getElementById('L1');
    const L2Input = document.getElementById('L2');
    const L3Input = document.getElementById('L3');
    const L4Input = document.getElementById('L4');
    const L5Input = document.getElementById('L5');
    const seriesSelect = document.getElementById('series');
    const hingeSelect = document.getElementById('hinge');

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    const errors = [];

    if (!width || isNaN(width)) {
      errors.push('Укажите корректную ширину створки (мм).');
    }
    if (!height || isNaN(height)) {
      errors.push('Укажите корректную высоту створки (мм).');
    }

    if (width && (width < 390 || width > 1600)) {
      errors.push('Ширина створки должна быть в диапазоне 390–1600 мм.');
    }

    const hinge = hingeSelect.value;

    if (hinge === 'first_tilt_160_180') {
      if (width && (width < 445 || width > 1600)) {
        errors.push(
          'Для First Tilt 160 кг расчёт доступен при ширине 445–1600 мм.'
        );
      }
    }

    if (errors.length > 0) {
      errorEl.innerHTML = errors.join('<br>');
      return;
    }

    const parseNullableNumber = (inputEl) => {
      const v = inputEl.value;
      if (v === '' || v === null || typeof v === 'undefined') return null;
      const num = Number(v);
      return isNaN(num) ? null : num;
    };

    const input = {
      width,
      height,
      series: seriesSelect.value,
      hinge,
      L1: parseNullableNumber(L1Input),
      L2: parseNullableNumber(L2Input),
      L3: parseNullableNumber(L3Input),
      L4: parseNullableNumber(L4Input),
      L5: parseNullableNumber(L5Input)
    };

    const result = calculateTractionAdapter(input);

    const lines = [];
    if (result.note) {
      lines.push(`Примечание: ${result.note}`);
    }
    if (result.usedMode) {
      lines.push(`Режим: ${result.usedMode}`);
    }

    const addTractionLine = (label, value) => {
      if (typeof value === 'number') {
        const sign = value > 0 ? '+' : '';
        lines.push(`${label}: ${sign}${value} мм`);
      }
    };

    addTractionLine('Тяга по L1', result.tractionL1);
    addTractionLine('Тяга по L2', result.tractionL2);
    addTractionLine('Тяга по L3', result.tractionL3);
    addTractionLine('Тяга по L4', result.tractionL4);
    addTractionLine('Тяга по L5', result.tractionL5);

    if (
      result.tractionL3_turn_tilt !== undefined ||
      result.tractionL3_tilt_turn !== undefined
    ) {
      lines.push('Для First Tilt шириной 1200–1600 мм:');
      addTractionLine(
        '  • L3 (поворот-откид)',
        result.tractionL3_turn_tilt
      );
      addTractionLine(
        '  • L3 (откид-поворот)',
        result.tractionL3_tilt_turn
      );
      if (typeof result.extraTraction215 === 'number') {
        lines.push(`  • Доп. тяга: ${result.extraTraction215} мм`);
      }
    }

    if (lines.length === 0) {
      lines.push('Нет рассчитанных тяг — введите хотя бы одно значение L1–L5.');
    }

    resultEl.textContent = lines.join('\n');
  });
});
