"use strict";


const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


const round1 = (n) => Math.round(n * 10) / 10;
const round0 = (n) => Math.round(n);

function categorizeBMI(bmi) {
  if (bmi < 18.5) {
    return {
      key: "light",
      label: "Underweight",
      message:
        "Underweight. Eat a balanced diet and exercise more to build strength and maintain health!",
    };
  }
  if (bmi < 24) {
    return {
      key: "ideal",
      label: "Normal weight",
      message: "Normal weight. Congratulations! Keep it up!",
    };
  }
  if (bmi < 27) {
    return {
      key: "heavy",
      label: "Overweight",
      message:
        "Overweight. Be careful and start practicing healthy weight management!",
    };
  }
  return {
    key: "fat",
    label: "Obese",
    message: "Obese. You should immediately start healthy weight management!",
  };
}

function updateBMIResult({ bmi, category }) {
  const bmiValueEl = $("#yourBmi");
  const evalEl = $("#evaluationMessage");
  const resultCard = $(".bmi-result-content");

  // Update text
  bmiValueEl.textContent = isFinite(bmi) ? round1(bmi).toFixed(1) : "---";
  evalEl.textContent = category ? category.message : "Result";

  // Remove previous status classes and add current
  resultCard.classList.remove("light", "ideal", "heavy", "fat");
  if (category) {
    resultCard.classList.add(category.key);
  }

  // Subtle animation
  bmiValueEl.classList.remove("pulse");
  void bmiValueEl.offsetWidth; // reflow
  bmiValueEl.classList.add("pulse");
}

/**
 * LocalStorage for BMI records
 */
const STORAGE_KEY = "bmiRecords.v1";

function loadBMIRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBMIRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * Render BMI records into the DOM
 */
function renderBMIRecords(records) {
  const list = $(".bmi-record-list ul");
  list.innerHTML = "";
  records.forEach((r) => list.appendChild(createRecordItem(r)));
  toggleClearBtn(records.length > 0);
}

function createRecordItem(record) {
  const li = document.createElement("li");
  li.className = `${record.key}`;
  // Content columns:
  // Category, BMI, Height, Weight, Date
  const cat = document.createElement("span");
  cat.textContent = record.label;

  const bmi = document.createElement("span");
  bmi.textContent = `BMI ${round1(record.bmi).toFixed(1)}`;

  const h = document.createElement("span");
  h.textContent = `Height ${round1(record.height)} cm`;

  const w = document.createElement("span");
  w.textContent = `Weight ${round1(record.weight)} kg`;

  const date = document.createElement("span");
  date.className = "record-date";
  date.textContent = record.date;

  li.append(cat, bmi, h, w, date);
  return li;
}

function toggleClearBtn(show) {
  const clearBtn = $(".clearBMI-btn");
  if (!clearBtn) return;
  clearBtn.classList.toggle("d-none", !show);
}

/**
 * BMR calculation (Mifflin-St Jeor)
 * male:   BMR = 10w + 6.25h - 5a + 5
 * female: BMR = 10w + 6.25h - 5a - 161
 */
function calculateBMR({ weightKg, heightCm, ageYears, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return gender === "male" ? base + 5 : base - 161;
}

function updateBMRResult(bmr) {
  $("#yourBmr").textContent = isFinite(bmr) ? round0(bmr) : "---";

  const tdeeMultipliers = [
    { id: "bmrVolumeXs", m: 1.2 },
    { id: "bmrVolumeSm", m: 1.375 },
    { id: "bmrVolumeMd", m: 1.55 },
    { id: "bmrVolumeLg", m: 1.72 },
    { id: "bmrVolumeXL", m: 1.9 },
  ];
  tdeeMultipliers.forEach(({ id, m }) => {
    const el = document.getElementById(id);
    if (el) el.textContent = isFinite(bmr) ? round0(bmr * m) : "---";
  });

  // Animate BMR
  const bmrEl = $("#yourBmr");
  bmrEl.classList.remove("pulse");
  void bmrEl.offsetWidth;
  bmrEl.classList.add("pulse");
}

/**
 * Validation helpers
 */
function invalidate(el, msg) {
  if (!el) return false;
  el.classList.add("is-invalid");
  el.setAttribute("title", msg);
  return false;
}

function clearInvalid(...els) {
  els.forEach((el) => {
    if (!el) return;
    el.classList.remove("is-invalid");
    el.removeAttribute("title");
  });
}

/**
 * Main
 */
document.addEventListener("DOMContentLoaded", () => {
  // Elements for BMI
  const hInput = document.getElementById("cmInput");
  const wInput = document.getElementById("kgInput");
  const calcBmiBtn = document.getElementById("calculateBmiBtn");

  // Elements for BMR
  const bmrHInput = document.getElementById("BmrCmInput");
  const bmrWInput = document.getElementById("BmrKgInput");
  const bmrAgeInput = document.getElementById("BmrOldInput");
  const calcBmrBtn = document.getElementById("calculateBmrBtn");

  // Records
  const clearBtn = document.querySelector(".clearBMI-btn");
  const records = loadBMIRecords();
  renderBMIRecords(records);

  // BMI Calculate
  calcBmiBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    clearInvalid(hInput, wInput);

    const h = parseFloat(hInput?.value || "");
    const w = parseFloat(wInput?.value || "");

    if (!isFinite(h) || h <= 0) return invalidate(hInput, "Please enter a valid height in cm.");
    if (!isFinite(w) || w <= 0) return invalidate(wInput, "Please enter a valid weight in kg.");
    if (h < 80 || h > 300) return invalidate(hInput, "Height must be between 80 and 300 cm.");
    if (w < 20 || w > 400) return invalidate(wInput, "Weight must be between 20 and 400 kg.");

    const hM = h / 100;
    const bmi = w / (hM * hM);
    const category = categorizeBMI(bmi);
    updateBMIResult({ bmi, category });

    // Persist record
    const now = new Date();
    const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(
      now.getDate()
    ).padStart(2, "0")}`;

    const record = {
      bmi,
      height: h,
      weight: w,
      key: category.key,
      label: category.label,
      date,
      ts: now.getTime(),
    };
    const newList = [record, ...loadBMIRecords()].slice(0, 50); // keep last 50
    saveBMIRecords(newList);
    renderBMIRecords(newList);
  });

  // Clear BMI records
  clearBtn?.addEventListener("click", () => {
    saveBMIRecords([]);
    renderBMIRecords([]);
  });

  // BMR Calculate
  calcBmrBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    clearInvalid(bmrHInput, bmrWInput, bmrAgeInput);

    const h = parseFloat(bmrHInput?.value || "");
    const w = parseFloat(bmrWInput?.value || "");
    const a = parseFloat(bmrAgeInput?.value || "");
    const gender = document.querySelector('input[name="options"]:checked')?.value || "female";

    if (!isFinite(h) || h <= 0) return invalidate(bmrHInput, "Please enter a valid height in cm.");
    if (!isFinite(w) || w <= 0) return invalidate(bmrWInput, "Please enter a valid weight in kg.");
    if (!isFinite(a) || a <= 0) return invalidate(bmrAgeInput, "Please enter a valid age in years.");
    if (h < 80 || h > 250) return invalidate(bmrHInput, "Height must be between 80 and 250 cm.");
    if (w < 20 || w > 300) return invalidate(bmrWInput, "Weight must be between 20 and 300 kg.");
    if (a < 10 || a > 120) return invalidate(bmrAgeInput, "Age must be between 10 and 120 years.");

    const bmr = calculateBMR({ weightKg: w, heightCm: h, ageYears: a, gender });
    updateBMRResult(bmr);
  });

  // Enter key triggers calculation within corresponding form
  $("#pills-bmi form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    calcBmiBtn?.click();
  });
  $("#pills-bmr form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    calcBmrBtn?.click();
  });
});