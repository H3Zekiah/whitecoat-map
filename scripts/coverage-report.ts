/*
 * School-directory coverage report (Step 2.4 definition of done): every
 * program, every field, with its status — a human verification worksheet
 * for Gate 3.
 *
 *   VALUE (unverified)  extracted from a primary source, awaiting human check
 *   VERIFIED            human-checked against the source
 *   UNAVAILABLE         source checked; figure not published (reason recorded)
 *
 * Run: node scripts/coverage-report.ts
 */

import { loadSchools, type ProvenancedField } from "../src/lib/data.ts";

const FIELDS = [
  "classSize",
  "gpaAverage",
  "gpaRange",
  "mcatAverage",
  "mcatRange",
  "inStatePercent",
] as const;

function status(field: ProvenancedField<unknown>): string {
  if ("unavailable" in field) return "UNAVAILABLE";
  if (field.verifiedBy && field.verifiedOn) return "VERIFIED";
  return "VALUE (unverified)";
}

const schools = loadSchools();
let values = 0;
let verified = 0;
let unavailable = 0;

for (const s of schools) {
  console.log(`\n${s.shortName} — ${s.degree}, ${s.applicationService}`);
  for (const f of FIELDS) {
    const field = s[f] as ProvenancedField<unknown>;
    const st = status(field);
    if (st === "UNAVAILABLE") unavailable++;
    else if (st === "VERIFIED") verified++;
    else values++;
    const detail =
      "unavailable" in field
        ? field.reason
        : `${JSON.stringify(field.value)} <- ${field.sourceId}`;
    console.log(`  ${f.padEnd(16)} ${st.padEnd(20)} ${detail}`);
  }
}

const total = schools.length * FIELDS.length;
console.log(
  `\n${schools.length} schools, ${total} fields: ${verified} verified, ${values} awaiting verification, ${unavailable} explicitly unavailable.`,
);
if (verified + values + unavailable !== total) {
  console.error("Field accounting mismatch.");
  process.exit(1);
}
