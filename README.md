# Body Metrics Calculator (BMI + BMR + TDEE) 🧮💪

A modern, responsive web app to calculate:
- BMI (Body Mass Index)
- BMR (Basal Metabolic Rate)
- TDEE (Total Daily Energy Expenditure) with multiple activity levels
- Plus: local BMI history with clear records

<p>
  <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7E01D?style=for-the-badge&logo=javascript&logoColor=000">
  <img alt="Bootstrap" src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-00b894?style=for-the-badge">
</p>


## ✨ Features

- 🎯 BMI calculator with live categorization
  - Underweight, Normal, Overweight, Obese ranges
- 🔥 BMR calculator (Mifflin–St Jeor equation)
- ⚡ TDEE estimates across 5 activity levels
- 📝 BMI records saved to localStorage (with one-click clear)
- 🌓 Polished, accessible, responsive UI
- ⌨️ Keyboard-friendly, focus-ring support
- 🛠 No build step — just open index.html


## 🧱 Tech Stack

- HTML5 + Bootstrap 5 (CDN)
- Vanilla CSS (custom theme) and JS
- LocalStorage (for BMI records)


## 📁 Project Structure

. ├─ index.html # Main UI with BMI/BMR tabs ├─ style.css # Theme, layout, components └─ script.js # Calculations, state, and interactions


## 🚀 Getting Started

- Option A: Double-click index.html to open in your browser.
- Option B: Serve locally (recommended for CORS/asset consistency).
  - Using Node: npx serve . or npx http-server .
  - Using Python: python3 -m http.server 8080

Then navigate to http://localhost:3000 or http://localhost:8080 depending on the tool.


## 🛡 Permissions/Privacy

- All calculations run entirely in your browser.
- BMI records are stored only in your browser’s localStorage.
- No data is sent to any server.


## 🧠 How It Works

- BMI
  - Formula: BMI = weight_kg / (height_m)^2
  - Categories:
    - < 18.5: Underweight
    - 18.5–23.9: Normal
    - 24–26.9: Overweight
    - ≥ 27: Obese

- BMR (Mifflin–St Jeor)
  - Male: BMR = 10w + 6.25h − 5a + 5
  - Female: BMR = 10w + 6.25h − 5a − 161
  - w = weight (kg), h = height (cm), a = age (years)

- TDEE (Daily Calories)
  - Sedentary: BMR × 1.2
  - Light: BMR × 1.375
  - Moderate: BMR × 1.55
  - Very active: BMR × 1.72
  - Extra active: BMR × 1.9


## 🧭 Usage Guide

1. BMI Tab
   - Enter Height (cm) and Weight (kg)
   - Click “Calculate Now”
   - View BMI value, category, and a guideline list
   - Record gets saved in “BMI Records”; clear anytime

2. BMR Tab
   - Select Gender
   - Enter Height (cm), Age (years), and Weight (kg)
   - Click “Calculate Now”
   - View your BMR and TDEE values for different activity levels

Tip: Press Enter inside a form to trigger calculation.


## 🎨 Customization

- Colors, radii, shadows: tweak CSS variables at the top of style.css (e.g., --accent, --surface)
- Activity multipliers: edit in script.js (IDs: bmrVolumeXs, bmrVolumeSm, bmrVolumeMd, bmrVolumeLg, bmrVolumeXL)
- BMI ranges or messages: update categorizeBMI() in script.js

## ♿ Accessibility

- Visible focus rings on interactive elements
- Sufficient color contrast on dark background
- Keyboard navigation friendly
- Reduced motion support via prefers-reduced-motion

## 📷 Screenshots (optional)

 preview:
- ![image](https://github.com/MdSaifAli063/Body-Metrics-Calculator/blob/c74b3cd3aff95bdac4e843269bd0e642c9f132f9/Screenshot%202025-09-10%20005456.png)
- ![image](https://github.com/MdSaifAli063/Body-Metrics-Calculator/blob/9518a8f9cbb0b1bda223ed392f1581f400752a6e/Screenshot%202025-09-10%20005630.png)

## 🌐 Deployment

- GitHub Pages
  - Push repo
  - Settings → Pages → Deploy from main branch
  - Point custom domain if needed
- Netlify/Vercel
  - Drag-and-drop or link repo, target root

## 🔧 Troubleshooting

- Tabs not switching?
  - Ensure Bootstrap JS bundle is loaded (CDN in index.html head).
- Styles look off?
  - Make sure style.css is linked and not cached; hard reload (Ctrl/Cmd + Shift + R).
- Records not saving?
  - Check browser privacy mode; localStorage may be blocked.

## 🙌 Credits

- UI/UX styling and interactions by the project authors
- Icons used in UI are from provided image links
- Built with Bootstrap 5

## 📜 License

MIT License — feel free to use, modify, and distribute with attribution.
