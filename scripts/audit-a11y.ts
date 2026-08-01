/*
 * Accessibility audit (SRD §10: WCAG 2.2 AA).
 *
 * Drives a real browser over the production build and runs axe-core on
 * every route, in both themes. A visualization a blind student cannot
 * read is a broken promise given who this site is for, so this runs in
 * CI and fails the build on any violation.
 *
 * Assumes a server is already running (see the a11y npm script).
 * Run: npm run audit:a11y
 */

import { AxeBuilder } from "@axe-core/playwright";
import { chromium } from "playwright";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";

/* Representative of every template, not every page: the school and guide
   templates are shared, so one instance of each exercises the markup. */
const ROUTES = [
  "/",
  "/data",
  "/schools",
  "/schools/utsw",
  "/texas",
  "/texas/jamp",
  "/guides",
  "/guides/reapplying",
  "/glossary",
  "/about",
  "/method",
  "/styleguide",
];

const THEMES = ["light", "dark"] as const;

/* WCAG 2.2 AA and the WAI best-practice set. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

interface Violation {
  route: string;
  theme: string;
  id: string;
  impact: string;
  help: string;
  nodes: string[];
}

const browser = await chromium.launch();
const found: Violation[] = [];
let checks = 0;

for (const theme of THEMES) {
  const context = await browser.newContext({
    colorScheme: theme,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    const res = await page.goto(`${BASE}${route}`, {
      waitUntil: "networkidle",
    });
    if (!res || !res.ok()) {
      console.error(
        `FAIL  ${route} returned ${res?.status() ?? "no response"}`,
      );
      process.exitCode = 1;
      continue;
    }
    /* Exercise the explicit theme path, not just the media query. */
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    checks++;

    for (const v of results.violations) {
      found.push({
        route,
        theme,
        id: v.id,
        impact: v.impact ?? "unknown",
        help: v.help,
        nodes: v.nodes.slice(0, 3).map((n) => n.html.slice(0, 120)),
      });
    }
    const mark = results.violations.length === 0 ? "PASS" : "FAIL";
    console.log(
      `${mark}  ${theme.padEnd(5)} ${route} (${results.passes.length} checks passed)`,
    );
  }
  await context.close();
}
await browser.close();

console.log(
  `\n${checks} page-theme combinations audited against ${TAGS.join(", ")}.`,
);

if (found.length > 0) {
  console.error(`\n${found.length} violation(s):\n`);
  for (const v of found) {
    console.error(`  [${v.impact}] ${v.id} — ${v.help}`);
    console.error(`    ${v.theme} ${v.route}`);
    for (const n of v.nodes) console.error(`      ${n}`);
  }
  process.exit(1);
}

console.log("No accessibility violations found.");
