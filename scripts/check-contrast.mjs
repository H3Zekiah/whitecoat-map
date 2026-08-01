/*
 * WCAG 2.2 contrast check for the design-token pairs the UI actually uses.
 * Fails (exit 1) if any pair drops below its required ratio.
 * Keep the hex values in sync with src/app/globals.css.
 */

const light = {
  paper: "#faf7f2",
  surface: "#ffffff",
  ink: "#211c15",
  muted: "#6d6357",
  faint: "#7b705d",
  accent: "#0d6157",
  accentSoft: "#e2efec",
  warn: "#7a5200",
  warnSoft: "#fdf0d3",
  opinion: "#5b4a72",
  opinionSoft: "#efeaf6",
};

const dark = {
  paper: "#171310",
  surface: "#211c17",
  ink: "#ece5da",
  muted: "#a89b8b",
  faint: "#8d8173",
  accent: "#56b8a9",
  accentSoft: "#14332e",
  warn: "#e2b566",
  warnSoft: "#2e2410",
  opinion: "#b5a3d4",
  opinionSoft: "#292134",
};

function luminance(hex) {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const [l1, l2] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [description, fg, bg, minimum]
function pairs(t, themeName) {
  return [
    [`${themeName}: body text on paper`, t.ink, t.paper, 4.5],
    [`${themeName}: body text on surface`, t.ink, t.surface, 4.5],
    [`${themeName}: muted text on paper`, t.muted, t.paper, 4.5],
    [`${themeName}: faint text on paper`, t.faint, t.paper, 4.5],
    [`${themeName}: accent link on paper`, t.accent, t.paper, 4.5],
    [`${themeName}: body text on accent-soft`, t.ink, t.accentSoft, 4.5],
    [`${themeName}: accent label on accent-soft`, t.accent, t.accentSoft, 4.5],
    [`${themeName}: body text on warn-soft`, t.ink, t.warnSoft, 4.5],
    [`${themeName}: warn label on warn-soft`, t.warn, t.warnSoft, 4.5],
    [`${themeName}: body text on opinion-soft`, t.ink, t.opinionSoft, 4.5],
    [
      `${themeName}: opinion label on opinion-soft`,
      t.opinion,
      t.opinionSoft,
      4.5,
    ],
  ];
}

let failed = false;
for (const [desc, fg, bg, min] of [
  ...pairs(light, "light"),
  ...pairs(dark, "dark"),
]) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed = true;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${desc}: ${r.toFixed(2)}:1 (needs ${min}:1)`,
  );
}

process.exit(failed ? 1 : 0);
