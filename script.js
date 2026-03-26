"use strict";

/* ═══════════════════════════════════════════
   FITMETRICS — app.js
   BMI · BMR · TDEE · History · Theme · Units
═══════════════════════════════════════════ */

const $   = (s, c = document) => c.querySelector(s);
const $$  = (s, c = document) => [...c.querySelectorAll(s)];
const r1  = n => Math.round(n * 10) / 10;
const r0  = n => Math.round(n);
const fmt = n => isFinite(n) ? r1(n).toFixed(1) : '--';

const STORAGE_KEY = 'fitmetrics_bmi_v3';

/* ──────────────────────────────────────────
   STATE
────────────────────────────────────────── */
let unitMode       = 'metric';   // 'metric' | 'imperial'
let selectedGender = 'female';

/* ──────────────────────────────────────────
   THEME
────────────────────────────────────────── */
const html       = document.documentElement;
const themeBtn   = $('#themeToggle');
const savedTheme = localStorage.getItem('fitmetrics_theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('fitmetrics_theme', next);
});

/* ──────────────────────────────────────────
   TABS / NAVIGATION
────────────────────────────────────────── */
$$('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.nav-item').forEach(b => b.classList.remove('active'));
    $$('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = $(`#panel-${btn.dataset.tab}`);
    if (panel) panel.classList.add('active');
    // Re-render history when switching to it
    if (btn.dataset.tab === 'history') renderRecords(loadRecords());
  });
});

/* ──────────────────────────────────────────
   UNIT SWITCHER
────────────────────────────────────────── */
$$('.unit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.unit-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    unitMode = btn.dataset.unit;

    const isImp = unitMode === 'imperial';
    $('#badge-height').textContent = isImp ? 'in' : 'cm';
    $('#badge-weight').textContent = isImp ? 'lbs' : 'kg';
    $('#inp-height').placeholder   = isImp ? '67' : '170';
    $('#inp-weight').placeholder   = isImp ? '154' : '70';

    clearField('ig-height', 'msg-height');
    clearField('ig-weight', 'msg-weight');
  });
});

/* ──────────────────────────────────────────
   GENDER TOGGLE
────────────────────────────────────────── */
$$('.gender-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.gender-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedGender = btn.dataset.g;
  });
});

/* ──────────────────────────────────────────
   VALIDATION HELPERS
────────────────────────────────────────── */
function setError(groupId, msgId, text) {
  $(`#${groupId}`)?.classList.add('error');
  const m = $(`#${msgId}`);
  if (m) m.textContent = text;
  return false;
}
function clearField(groupId, msgId) {
  $(`#${groupId}`)?.classList.remove('error');
  const m = $(`#${msgId}`);
  if (m) m.textContent = '';
}
function clearBMIFields()  { ['ig-height/msg-height', 'ig-weight/msg-weight'].forEach(s => { const [g,m] = s.split('/'); clearField(g,m); }); }
function clearBMRFields()  { ['ig-age/msg-age', 'ig-bh/msg-bh', 'ig-bw/msg-bw'].forEach(s => { const [g,m] = s.split('/'); clearField(g,m); }); }

/* ──────────────────────────────────────────
   BMI CATEGORIZE
────────────────────────────────────────── */
function categorizeBMI(bmi) {
  if (bmi < 18.5) return { key: 'under',  label: 'Underweight', cssClass: 'sv-under', tagClass: 'st-under', ringClass: 'ring-under', rowClass: 'r-under' };
  if (bmi < 24)   return { key: 'normal', label: 'Normal',      cssClass: 'sv-normal', tagClass: 'st-normal', ringClass: 'ring-normal', rowClass: 'r-normal' };
  if (bmi < 27)   return { key: 'over',   label: 'Overweight',  cssClass: 'sv-over',   tagClass: 'st-over',   ringClass: 'ring-over',   rowClass: 'r-over' };
  return               { key: 'obese',  label: 'Obese',        cssClass: 'sv-obese',  tagClass: 'st-obese',  ringClass: 'ring-obese',  rowClass: 'r-obese' };
}

/* ──────────────────────────────────────────
   GAUGE — map BMI 10..40 → 0..100%
────────────────────────────────────────── */
function bmiToGaugePercent(bmi) {
  return ((Math.min(Math.max(bmi, 10), 40) - 10) / 30) * 100;
}

/* ──────────────────────────────────────────
   BMI CALCULATE
────────────────────────────────────────── */
$('#btn-calc-bmi').addEventListener('click', () => {
  clearBMIFields();

  let hRaw = parseFloat($('#inp-height').value);
  let wRaw = parseFloat($('#inp-weight').value);

  if (!isFinite(hRaw) || hRaw <= 0) return setError('ig-height','msg-height','Enter a valid height.');
  if (!isFinite(wRaw) || wRaw <= 0) return setError('ig-weight','msg-weight','Enter a valid weight.');

  // Convert to metric
  let hCm = unitMode === 'imperial' ? hRaw * 2.54       : hRaw;
  let wKg = unitMode === 'imperial' ? wRaw * 0.453592   : wRaw;

  if (hCm < 80  || hCm > 300) return setError('ig-height','msg-height','Height must be 80–300 cm.');
  if (wKg < 20  || wKg > 400) return setError('ig-weight','msg-weight','Weight must be 20–400 kg.');

  const hM  = hCm / 100;
  const bmi = wKg / (hM * hM);
  const cat = categorizeBMI(bmi);

  updateBMIDisplay(bmi, cat);
  saveAndRender({ bmi, hCm, wKg, key: cat.key, label: cat.label });
});

/* ──────────────────────────────────────────
   UPDATE BMI UI
────────────────────────────────────────── */
function updateBMIDisplay(bmi, cat) {
  // Score value
  const valEl = $('#bmi-value');
  valEl.textContent = fmt(bmi);
  valEl.className   = `score-value ${cat.cssClass}`;
  bounce(valEl);

  // Tag
  const tag = $('#bmi-tag');
  tag.innerHTML    = `<span>${cat.label}</span>`;
  tag.className    = `score-tag ${cat.tagClass}`;

  // Ring
  const ring = $('#score-ring');
  ring.className   = `score-bg-ring ${cat.ringClass}`;

  // Gauge needle
  $('#gauge-needle').style.left = bmiToGaugePercent(bmi) + '%';

  // Category rows
  $$('.cat-item').forEach(el => {
    el.classList.toggle('active', el.dataset.cat === cat.key);
  });
}

/* ──────────────────────────────────────────
   BMR CALCULATE  (Mifflin–St Jeor)
────────────────────────────────────────── */
$('#btn-calc-bmr').addEventListener('click', () => {
  clearBMRFields();

  const age = parseFloat($('#inp-age').value);
  const h   = parseFloat($('#inp-bh').value);
  const w   = parseFloat($('#inp-bw').value);

  if (!isFinite(age) || age <= 0) return setError('ig-age','msg-age','Enter a valid age.');
  if (!isFinite(h)   || h   <= 0) return setError('ig-bh','msg-bh','Enter a valid height in cm.');
  if (!isFinite(w)   || w   <= 0) return setError('ig-bw','msg-bw','Enter a valid weight in kg.');
  if (age < 10 || age > 120) return setError('ig-age','msg-age','Age must be 10–120 years.');
  if (h < 80   || h   > 250) return setError('ig-bh','msg-bh','Height must be 80–250 cm.');
  if (w < 20   || w   > 300) return setError('ig-bw','msg-bw','Weight must be 20–300 kg.');

  const base = 10 * w + 6.25 * h - 5 * age;
  const bmr  = selectedGender === 'male' ? base + 5 : base - 161;

  updateBMRDisplay(bmr, { h, w, age });
});

/* ──────────────────────────────────────────
   UPDATE BMR UI
────────────────────────────────────────── */
function updateBMRDisplay(bmr, { h, w, age }) {
  const numEl = $('#bmr-value');
  numEl.textContent = r0(bmr);
  bounce(numEl);

  // Formula
  const sign   = selectedGender === 'male' ? '+5' : '−161';
  const gender = selectedGender === 'male' ? 'male' : 'female';
  $('#bmr-formula').textContent =
    `10×${w} + 6.25×${h} − 5×${age} ${sign}   [${gender}]`;

  // Ideal weight range (BMI 18.5–24.9)
  const hM = h / 100;
  const lo = r1(18.5 * hM * hM);
  const hi = r1(24.9 * hM * hM);
  $('#bmr-ideal').textContent = `${lo} – ${hi} kg  (BMI 18.5–24.9)`;

  // TDEE
  const tdeeMap = [
    ['tdee-xs', 1.2],
    ['tdee-sm', 1.375],
    ['tdee-md', 1.55],
    ['tdee-lg', 1.725],
    ['tdee-xl', 1.9],
  ];
  tdeeMap.forEach(([id, m]) => {
    const el = $(`#${id}`);
    if (el) el.textContent = r0(bmr * m);
  });
}

/* ──────────────────────────────────────────
   RECORDS — STORAGE
────────────────────────────────────────── */
function loadRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function saveRecords(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function saveAndRender({ bmi, hCm, wKg, key, label }) {
  const now  = new Date();
  const date = now.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const rec  = { bmi, hCm, wKg, key, label, date, ts: now.getTime() };
  const list = [rec, ...loadRecords()].slice(0, 60);
  saveRecords(list);
  // Silently update history if visible
  renderRecords(list);
}

/* ──────────────────────────────────────────
   RECORDS — RENDER
────────────────────────────────────────── */
function renderRecords(list) {
  const listEl   = $('#records-list');
  const emptyEl  = $('#empty-state');
  const chartCard = $('#chart-card');
  const clearBtn  = $('#btn-clear');

  clearBtn.style.display = list.length ? 'inline-flex' : 'none';
  emptyEl.style.display  = list.length ? 'none' : 'block';
  listEl.style.display   = list.length ? 'flex'  : 'none';
  chartCard.style.display = list.length >= 2 ? 'block' : 'none';

  if (!list.length) return;

  listEl.innerHTML = list.map((r, i) => `
    <div class="rec-row ${r.rowClass || 'r-'+r.key}" style="animation-delay:${i * 0.03}s">
      <span class="rec-badge">${r.label}</span>
      <div>
        <div class="rec-val">BMI ${r1(r.bmi).toFixed(1)}</div>
        <div class="rec-meta">Score</div>
      </div>
      <div>
        <div class="rec-val">${r1(r.hCm)} cm</div>
        <div class="rec-meta">Height</div>
      </div>
      <div>
        <div class="rec-val">${r1(r.wKg)} kg</div>
        <div class="rec-meta">Weight</div>
      </div>
      <div class="rec-date">${r.date}</div>
    </div>
  `).join('');

  if (list.length >= 2) drawTrendChart(list);
}

/* ──────────────────────────────────────────
   TREND CHART (SVG)
────────────────────────────────────────── */
function drawTrendChart(list) {
  const svg  = $('#trend-svg');
  if (!svg) return;

  const pts  = [...list].reverse(); // oldest first
  const W = 600, H = 120, PX = 20, PY = 14;
  const vals = pts.map(r => r.bmi);
  const minV = Math.max(10,  Math.min(...vals) - 2);
  const maxV = Math.min(45, Math.max(...vals) + 2);

  const toX = i   => PX + (i / (pts.length - 1)) * (W - PX * 2);
  const toY = val => PY + ((maxV - val) / (maxV - minV)) * (H - PY * 2);

  // Area path
  const linePts = pts.map((r, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(r.bmi).toFixed(1)}`).join(' ');
  const areaPath = linePts +
    ` L${toX(pts.length - 1).toFixed(1)},${H} L${toX(0).toFixed(1)},${H} Z`;

  // Reference lines
  const refLines = [18.5, 24, 27].map(v => {
    if (v < minV || v > maxV) return '';
    const y = toY(v).toFixed(1);
    const colors = { 18.5: '#4e8bff', 24: '#00c98f', 27: '#ffb340' };
    return `<line x1="${PX}" y1="${y}" x2="${W - PX}" y2="${y}"
      stroke="${colors[v]}" stroke-width="1" stroke-dasharray="5 4" opacity="0.45"/>`;
  }).join('');

  // Dots
  const dotColors = { under: '#4e8bff', normal: '#00c98f', over: '#ffb340', obese: '#ff4e6a' };
  const dots = pts.map((r, i) => {
    const cx = toX(i).toFixed(1);
    const cy = toY(r.bmi).toFixed(1);
    const fill = dotColors[r.key] || '#aaa';
    return `<circle cx="${cx}" cy="${cy}" r="4" fill="${fill}" stroke="var(--bg-card)" stroke-width="2"/>`;
  }).join('');

  svg.innerHTML = `
    <defs>
      <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#4e8bff" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4e8bff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${refLines}
    <path d="${areaPath}" fill="url(#area-grad)"/>
    <path d="${linePts}" fill="none" stroke="#4e8bff" stroke-width="2.2"
      stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}
  `;
}

/* ──────────────────────────────────────────
   CLEAR RECORDS
────────────────────────────────────────── */
$('#btn-clear').addEventListener('click', () => {
  saveRecords([]);
  renderRecords([]);
});

/* ──────────────────────────────────────────
   BOUNCE / POP ANIMATION
────────────────────────────────────────── */
function bounce(el) {
  el.classList.remove('pop');
  void el.offsetWidth; // reflow
  el.classList.add('pop');
}

/* ──────────────────────────────────────────
   KEYBOARD — submit on Enter
────────────────────────────────────────── */
['#inp-height','#inp-weight'].forEach(id => {
  $(id)?.addEventListener('keydown', e => {
    if (e.key === 'Enter') $('#btn-calc-bmi').click();
  });
});
['#inp-age','#inp-bh','#inp-bw'].forEach(id => {
  $(id)?.addEventListener('keydown', e => {
    if (e.key === 'Enter') $('#btn-calc-bmr').click();
  });
});

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────── */
renderRecords(loadRecords());