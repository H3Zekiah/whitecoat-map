import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

/*
 * The SRD §4 constraints are product promises, so they are tested as
 * source-level invariants rather than left to review discipline. If
 * someone later wires a rate into the position view, or reaches for
 * localStorage, or ships a "your chances" string, these fail.
 */

const read = (p: string) =>
  fs.readFileSync(path.join(process.cwd(), p), "utf8");

const whereIStand = read("src/components/WhereIStand.tsx");
const grid = read("src/components/charts/AcceptanceGrid.tsx");

test("Where I Stand persists nothing and transmits nothing", () => {
  for (const forbidden of [
    "localStorage",
    "sessionStorage",
    "document.cookie",
    "indexedDB",
    "fetch(",
    "XMLHttpRequest",
    "navigator.sendBeacon",
  ]) {
    assert.ok(
      !whereIStand.includes(forbidden),
      `Where I Stand must not use ${forbidden}`,
    );
  }
});

test("Where I Stand form does not submit anywhere", () => {
  assert.ok(
    !/<form[^>]*\saction=/.test(whereIStand),
    "form must have no action target",
  );
  assert.ok(
    whereIStand.includes("onSubmit={(e) => e.preventDefault()}"),
    "form submission must be prevented",
  );
});

test("no verdict, prediction, or recommendation language ships", () => {
  /* Phrases that would turn position into a judgment. Checked case-insensitively
     against the rendered copy of both components. */
  const forbidden = [
    "your chances",
    "your odds",
    "likelihood",
    "probability of",
    "you should apply",
    "you will get in",
    "not competitive",
    "safety school",
    "reach school",
    "recommended schools",
  ];
  const haystack = (whereIStand + grid).toLowerCase();
  for (const phrase of forbidden) {
    assert.ok(!haystack.includes(phrase), `must not contain "${phrase}"`);
  }
});

test("marking a position structurally switches the grid off rate display", () => {
  /* The measure is derived from `position`, never accepted as a prop, so
     a marked cell cannot render an acceptance rate. */
  assert.ok(
    grid.includes(
      'const measure: "rate" | "applicants" = position ? "applicants" : "rate";',
    ),
    "grid measure must be derived from position",
  );
  assert.ok(
    !/measure[?]?:\s*("rate"|"applicants")[^=]*\}\s*:/.test(
      grid.split("export function AcceptanceGrid")[1] ?? "",
    ),
    "measure must not be a caller-supplied prop",
  );
  assert.ok(
    !grid.includes(
      "position?.gpaBand === g.id && position?.mcatBand === m.id ? cell.rate",
    ),
    "no rate readout keyed to the marked cell",
  );
});

test("AcceptanceGrid only reports rates in the rate view", () => {
  /* Every place a rate could reach the reader — the accessible per-cell
     label, the hover readout, and the table view — is gated on the rate
     view, which a marked position turns off. */
  const rateMentions = grid.match(/cell\.rate|hover\.rate|c\.rate/g) ?? [];
  assert.ok(rateMentions.length > 0, "expected rate handling to exist");

  for (const [region, snippet] of [
    ["accessible label", 'measure === "applicants"\n'],
    ["hover readout", 'measure === "rate"'],
    ["table view", 'measure === "rate" ? <th scope="col">Accepted</th> : null'],
  ] as const) {
    assert.ok(
      grid.includes(snippet.trim()),
      `${region} must be gated on the measure`,
    );
  }
});

test("suppressed cells never publish a rate", () => {
  const transforms = read("src/lib/transforms.ts");
  assert.ok(
    transforms.includes("rate: suppressed ? null : v.accepted / v.applicants"),
    "suppressed cells must carry a null rate",
  );
});
