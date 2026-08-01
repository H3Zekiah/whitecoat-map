import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import {
  SMALL_CELL_MIN,
  buildFunnel,
  buildGrid,
  buildTrend,
  gpaBandFor,
  latestCompleteYear,
  mcatBandFor,
  rampIndex,
  type GridRow,
} from "../src/lib/transforms.ts";

/* ---------- banding ---------- */

test("GPA banding puts boundary values in the higher band", () => {
  assert.equal(gpaBandFor(2.99), "lt300");
  assert.equal(gpaBandFor(3.0), "300");
  assert.equal(gpaBandFor(3.19), "300");
  assert.equal(gpaBandFor(3.2), "320");
  assert.equal(gpaBandFor(3.99), "380");
  assert.equal(gpaBandFor(4.0), "400");
});

test("GPA banding rejects impossible values", () => {
  assert.equal(gpaBandFor(-1), null);
  assert.equal(gpaBandFor(4.5), null);
  assert.equal(gpaBandFor(Number.NaN), null);
});

test("MCAT banding covers the scored range and collapses tails", () => {
  assert.equal(mcatBandFor(472), "lt490");
  assert.equal(mcatBandFor(489), "lt490");
  assert.equal(mcatBandFor(490), "490");
  assert.equal(mcatBandFor(512), "510");
  assert.equal(mcatBandFor(520), "520");
  assert.equal(mcatBandFor(528), "520");
  assert.equal(mcatBandFor(471), null);
  assert.equal(mcatBandFor(529), null);
});

/* ---------- grid ---------- */

const gridFixture: GridRow[] = [
  /* pooled year, same band -> should sum */
  {
    entryYear: 2024,
    gpaBinLow: 3.8,
    mcatBinLow: 510,
    applicants: 100,
    accepted: 60,
  },
  {
    entryYear: 2025,
    gpaBinLow: 3.9,
    mcatBinLow: 510,
    applicants: 100,
    accepted: 40,
  },
  /* out-of-pool years -> excluded */
  {
    entryYear: 2019,
    gpaBinLow: 3.8,
    mcatBinLow: 510,
    applicants: 500,
    accepted: 500,
  },
  {
    entryYear: 2026,
    gpaBinLow: 3.8,
    mcatBinLow: 510,
    applicants: 500,
    accepted: 0,
  },
  /* catch-all GPA bin -> excluded */
  {
    entryYear: 2024,
    gpaBinLow: 0,
    mcatBinLow: 510,
    applicants: 50,
    accepted: 5,
  },
  /* small cell -> counts kept, rate suppressed */
  {
    entryYear: 2024,
    gpaBinLow: 3.0,
    mcatBinLow: 480,
    applicants: 3,
    accepted: 2,
  },
];

test("grid pools only completed years and sums into bands (golden)", () => {
  const cells = buildGrid(gridFixture);
  const big = cells.find((c) => c.gpaBand === "380" && c.mcatBand === "510");
  assert.ok(big);
  assert.equal(big.applicants, 200);
  assert.equal(big.accepted, 100);
  assert.equal(big.rate, 0.5);
  assert.equal(big.suppressed, false);
});

test("grid excludes the catch-all GPA bin entirely", () => {
  const cells = buildGrid(gridFixture);
  const total = cells.reduce((s, c) => s + c.applicants, 0);
  /* 200 from the pooled band + 3 from the small cell; the 50 catch-all
     and both out-of-pool years are gone. */
  assert.equal(total, 203);
});

test("cells below the small-cell threshold keep counts but publish no rate", () => {
  const cells = buildGrid(gridFixture);
  const small = cells.find(
    (c) => c.gpaBand === "300" && c.mcatBand === "lt490",
  );
  assert.ok(small);
  assert.ok(small.applicants < SMALL_CELL_MIN);
  assert.equal(small.suppressed, true);
  assert.equal(small.rate, null);
});

test("grid filters by residency when asked", () => {
  const rows: GridRow[] = [
    {
      entryYear: 2024,
      gpaBinLow: 3.8,
      mcatBinLow: 510,
      applicants: 80,
      accepted: 40,
      residency: "Texas Resident",
    },
    {
      entryYear: 2024,
      gpaBinLow: 3.8,
      mcatBinLow: 510,
      applicants: 20,
      accepted: 4,
      residency: "Non Resident",
    },
  ];
  const tx = buildGrid(rows, { residency: "Texas Resident" });
  assert.equal(tx.length, 1);
  assert.equal(tx[0].applicants, 80);
  assert.equal(tx[0].rate, 0.5);
});

/* ---------- real dataset sanity ---------- */

test("real grid dataset produces sane pooled cells", () => {
  const raw = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), "data/aggregates/gpa-mcat-grid.json"),
      "utf8",
    ),
  );
  const cells = buildGrid(raw.rows);
  assert.ok(cells.length > 20, "expected a populated grid");
  for (const c of cells) {
    assert.ok(c.accepted <= c.applicants, "accepted cannot exceed applicants");
    if (c.rate !== null) {
      assert.ok(c.rate >= 0 && c.rate <= 1, "rate must be a proportion");
      assert.ok(c.applicants >= SMALL_CELL_MIN);
    }
  }
});

/* ---------- funnel & trends ---------- */

test("funnel stages descend and report share of the applicant pool", () => {
  const stages = buildFunnel({
    entryYear: 2025,
    applicants: 9518,
    interviewed: 5568,
    accepted: 3295,
    matriculated: 2900,
  });
  assert.deepEqual(
    stages.map((s) => s.stage),
    ["Applied", "Interviewed", "Accepted", "Matriculated"],
  );
  assert.equal(stages[0].shareOfApplicants, 1);
  assert.ok(stages[1].shareOfApplicants > stages[2].shareOfApplicants);
  assert.ok(Math.abs(stages[3].shareOfApplicants - 2900 / 9518) < 1e-9);
});

test("latestCompleteYear ignores in-progress cycles", () => {
  const rows = [
    {
      entryYear: 2024,
      applicants: 9005,
      interviewed: 5543,
      accepted: 3300,
      matriculated: 2871,
    },
    {
      entryYear: 2025,
      applicants: 9518,
      interviewed: 5568,
      accepted: 3295,
      matriculated: 2900,
    },
    {
      entryYear: 2026,
      applicants: 10240,
      interviewed: 4688,
      accepted: 1249,
      matriculated: 0,
    },
  ];
  assert.equal(latestCompleteYear(rows)?.entryYear, 2025);
  assert.equal(buildTrend(rows).length, 2);
});

/* ---------- ramp scaling ---------- */

test("sqrt ramp spreads skewed counts across steps; linear would not", () => {
  const counts = [4, 37, 142, 378, 923, 1704, 3706];
  const max = 3706;
  const linearSteps = new Set(counts.map((c) => rampIndex(c, max)));
  const sqrtSteps = new Set(counts.map((c) => rampIndex(c, max, "sqrt")));
  assert.ok(
    sqrtSteps.size > linearSteps.size,
    "sqrt must use more of the ramp than linear on skewed counts",
  );
  /* ordering is preserved either way */
  const seq = counts.map((c) => rampIndex(c, max, "sqrt"));
  for (let i = 1; i < seq.length; i++) {
    assert.ok(seq[i] >= seq[i - 1], "ramp must stay monotonic");
  }
});

test("rates map linearly and stay within the ramp", () => {
  assert.equal(rampIndex(0, 1), 0);
  assert.equal(rampIndex(1, 1), 5);
  assert.equal(rampIndex(0.5, 1), 3);
});
