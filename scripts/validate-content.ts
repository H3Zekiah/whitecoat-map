/*
 * Validates every content page and the glossary against their schemas.
 * Runs in CI before the build for fast, readable failures; the build
 * itself would also fail, because pages render through the same loader.
 *
 * Run: node scripts/validate-content.ts
 */

import { SECTIONS, listPages } from "../src/lib/content.ts";
import { loadGlossary } from "../src/lib/glossary.ts";

let pages = 0;
let failed = false;

for (const section of SECTIONS) {
  try {
    const found = listPages(section);
    pages += found.length;
    for (const p of found) {
      console.log(`OK  ${section}/${p.slug}  (${p.frontmatter.title})`);
    }
  } catch (err) {
    failed = true;
    console.error(String(err instanceof Error ? err.message : err));
  }
}

try {
  const terms = loadGlossary();
  console.log(`OK  glossary (${terms.length} terms)`);
} catch (err) {
  failed = true;
  console.error(String(err instanceof Error ? err.message : err));
}

if (failed) {
  console.error("\nContent validation FAILED.");
  process.exit(1);
}
console.log(`\nContent validation passed: ${pages} page(s) + glossary.`);
