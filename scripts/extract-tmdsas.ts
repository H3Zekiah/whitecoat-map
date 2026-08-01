/*
 * TMDSAS dashboard extraction (Step 2.3).
 *
 * Queries the public Power BI dataset behind the official TMDSAS stats
 * dashboard for the aggregate figures backing the site's visualizations:
 *   1. funnel by entry year (applicants / interviewed / accepted / matriculated)
 *   2. the same funnel split by residency
 *   3. the GPA x MCAT grid (native bins), overall and by residency
 *
 * Every raw API response is archived through the append-only snapshot
 * store before any transformation. Output datasets carry provenance but
 * NO verification — verifiedBy/verifiedOn stay empty until a human
 * checks the figures against the dashboard (Gate 3), and unverified
 * datasets cannot render.
 *
 * Run: npm run data:extract   (network; not run in CI)
 */

import fs from "node:fs";
import path from "node:path";
import { DATA_ROOT } from "../src/lib/data.ts";
import {
  COLS,
  QUERY_URL,
  TMDSAS_MODEL,
  TRUE_LABELS,
  buildGroupedCountQuery,
  decodeDsr,
  flagCountsByYear,
  type Cell,
} from "../src/lib/powerbi.ts";
import { storeSnapshot } from "../src/lib/snapshots.ts";

const DASHBOARD_PAGE =
  "https://www.tmdsas.com/stats-dashboard/medical-report.html";
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- resource key resolution ---------- */

async function resolveResourceKey(): Promise<string> {
  try {
    const res = await fetch(DASHBOARD_PAGE, {
      headers: { "User-Agent": "WhitecoatMapArchiver/0.1" },
    });
    const html = await res.text();
    const m = html.match(/app\.powerbi\.com\/view\?r=([A-Za-z0-9%_=-]+)/);
    if (m) {
      const decoded = JSON.parse(
        Buffer.from(decodeURIComponent(m[1]), "base64").toString("utf8"),
      ) as { k?: string };
      if (decoded.k) {
        if (decoded.k !== TMDSAS_MODEL.resourceKey) {
          console.log(`NOTE: embed resource key changed; using live key.`);
        }
        return decoded.k;
      }
    }
  } catch {
    /* fall through to the known key */
  }
  console.log("NOTE: could not read live embed key; using known key.");
  return TMDSAS_MODEL.resourceKey;
}

/* ---------- query + archive ---------- */

const snapshotHashes: string[] = [];

async function groupedCount(
  resourceKey: string,
  name: string,
  groupProps: string[],
): Promise<Cell[][]> {
  const body = buildGroupedCountQuery(groupProps);
  const res = await fetch(QUERY_URL, {
    method: "POST",
    headers: {
      "X-PowerBI-ResourceKey": resourceKey,
      ActivityId: crypto.randomUUID(),
      RequestId: crypto.randomUUID(),
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${name}: HTTP ${res.status} ${await res.text()}`);
  }
  const response = (await res.json()) as Parameters<typeof decodeDsr>[0];

  /* Archive the raw exchange verbatim, self-describing. Each query gets
     its own archive lane so change detection is per query, not a churn of
     false CHANGED reports across different queries. */
  const archived = storeSnapshot({
    sourceId: `tmdsas-dashboard-${name}`,
    url: `${QUERY_URL}#${name}`,
    body: new TextEncoder().encode(
      JSON.stringify({ query: name, request: body, response }, null, 2),
    ),
    contentType: "application/json",
  });
  snapshotHashes.push(archived.record.sha256);
  console.log(
    `${archived.outcome.toUpperCase().padEnd(10)} raw:${name}  sha256:${archived.record.sha256.slice(0, 12)}`,
  );

  return decodeDsr(response).rows;
}

function provenance() {
  return {
    sourceId: "tmdsas-dashboard",
    retrieved: TODAY,
    snapshotHashes: [...new Set(snapshotHashes)],
    extractedBy: "scripts/extract-tmdsas.ts",
  };
}

function writeDataset(filename: string, dataset: object) {
  const dir = path.join(DATA_ROOT, "aggregates");
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, filename);
  fs.writeFileSync(p, JSON.stringify(dataset, null, 2) + "\n");
  console.log(`WROTE      data/aggregates/${filename}`);
}

/* ---------- transforms ---------- */

function toIntMap2<K extends string>(
  rows: Cell[][],
  trueLabels: string[],
): Map<string, number> {
  /* [year, key, flagLabel, count] -> "year|key" -> count where flag true */
  const out = new Map<string, number>();
  for (const [year, key, label, count] of rows) {
    if (typeof label === "string" && trueLabels.includes(label)) {
      const k = `${Number(year)}|${String(key) as K}`;
      out.set(k, (out.get(k) ?? 0) + Number(count));
    }
  }
  return out;
}

/* ---------- main ---------- */

const resourceKey = await resolveResourceKey();

/* 1. Funnel by entry year */
const interviewRows = await groupedCount(resourceKey, "funnel-interviewed", [
  COLS.entryYear,
  COLS.isInterviewed,
]);
const acceptRows = await groupedCount(resourceKey, "funnel-accepted", [
  COLS.entryYear,
  COLS.isAccepted,
]);
const matricRows = await groupedCount(resourceKey, "funnel-matriculated", [
  COLS.entryYear,
  COLS.isMatriculated,
]);

const iv = flagCountsByYear(interviewRows, TRUE_LABELS[COLS.isInterviewed]);
const ac = flagCountsByYear(acceptRows, TRUE_LABELS[COLS.isAccepted]);
const mt = flagCountsByYear(matricRows, TRUE_LABELS[COLS.isMatriculated]);

const years = [...iv.total.keys()].sort((a, b) => a - b);
const funnelRows = years.map((y) => ({
  entryYear: y,
  applicants: iv.total.get(y) ?? 0,
  interviewed: iv.inGroup.get(y) ?? 0,
  accepted: ac.inGroup.get(y) ?? 0,
  matriculated: mt.inGroup.get(y) ?? 0,
}));

/* Cross-check: totals must agree across the three independent queries. */
for (const y of years) {
  if (
    iv.total.get(y) !== ac.total.get(y) ||
    iv.total.get(y) !== mt.total.get(y)
  ) {
    throw new Error(
      `applicant totals disagree across queries for EY${y}: ` +
        `${iv.total.get(y)} / ${ac.total.get(y)} / ${mt.total.get(y)}`,
    );
  }
}

writeDataset("funnel.json", {
  kind: "funnel",
  provenance: provenance(),
  rows: funnelRows,
});

/* 2. Funnel by residency */
const resApplicants = await groupedCount(resourceKey, "residency-applicants", [
  COLS.entryYear,
  COLS.residency,
]);
const resInterviewed = await groupedCount(
  resourceKey,
  "residency-interviewed",
  [COLS.entryYear, COLS.residency, COLS.isInterviewed],
);
const resAccepted = await groupedCount(resourceKey, "residency-accepted", [
  COLS.entryYear,
  COLS.residency,
  COLS.isAccepted,
]);
const resMatriculated = await groupedCount(
  resourceKey,
  "residency-matriculated",
  [COLS.entryYear, COLS.residency, COLS.isMatriculated],
);

const resIv = toIntMap2(resInterviewed, TRUE_LABELS[COLS.isInterviewed]);
const resAc = toIntMap2(resAccepted, TRUE_LABELS[COLS.isAccepted]);
const resMt = toIntMap2(resMatriculated, TRUE_LABELS[COLS.isMatriculated]);

const residencyRows: object[] = [];
for (const [year, residency, count] of resApplicants) {
  if (residency === null) continue;
  const k = `${Number(year)}|${String(residency)}`;
  residencyRows.push({
    entryYear: Number(year),
    residency: String(residency),
    applicants: Number(count),
    interviewed: resIv.get(k) ?? 0,
    accepted: resAc.get(k) ?? 0,
    matriculated: resMt.get(k) ?? 0,
  });
}

writeDataset("residency-funnel.json", {
  kind: "residency-funnel",
  provenance: provenance(),
  rows: residencyRows,
});

/* 3. GPA x MCAT grid, native bins */
function gridRowsFrom(rows: Cell[][], withResidency: boolean): object[] {
  /* columns: year, [residency], gpaBin, mcatBin, flagLabel, count */
  const acc = new Map<string, { applicants: number; accepted: number }>();
  for (const row of rows) {
    const [year, ...rest] = row;
    const residency = withResidency ? rest.shift() : undefined;
    const [gpaBin, mcatBin, label, count] = rest;
    if (gpaBin === null || mcatBin === null) continue;
    const gpa = Math.round(Number(gpaBin) * 10) / 10;
    const key = [Number(year), residency ?? "", gpa, Number(mcatBin)].join("|");
    const entry = acc.get(key) ?? { applicants: 0, accepted: 0 };
    entry.applicants += Number(count);
    if (
      typeof label === "string" &&
      TRUE_LABELS[COLS.isAccepted].includes(label)
    ) {
      entry.accepted += Number(count);
    }
    acc.set(key, entry);
  }
  return [...acc.entries()].map(([key, v]) => {
    const [year, residency, gpa, mcat] = key.split("|");
    const base = {
      entryYear: Number(year),
      gpaBinLow: Number(gpa),
      mcatBinLow: Number(mcat),
      applicants: v.applicants,
      accepted: v.accepted,
    };
    return withResidency ? { residency, ...base } : base;
  });
}

const gridRows = await groupedCount(resourceKey, "grid-overall", [
  COLS.entryYear,
  COLS.gpaBins,
  COLS.mcatBins,
  COLS.isAccepted,
]);
writeDataset("gpa-mcat-grid.json", {
  kind: "gpa-mcat-grid",
  provenance: provenance(),
  rows: gridRowsFrom(gridRows, false),
});

const gridResRows = await groupedCount(resourceKey, "grid-residency", [
  COLS.entryYear,
  COLS.residency,
  COLS.gpaBins,
  COLS.mcatBins,
  COLS.isAccepted,
]);
writeDataset("gpa-mcat-grid-residency.json", {
  kind: "gpa-mcat-grid-residency",
  provenance: provenance(),
  rows: gridRowsFrom(gridResRows, true),
});

/* Summary */
console.log("\nFunnel by entry year:");
for (const r of funnelRows) {
  console.log(
    `  EY${r.entryYear}  applicants ${r.applicants}  interviewed ${r.interviewed}  accepted ${r.accepted}  matriculated ${r.matriculated}`,
  );
}
console.log(
  "\nDatasets written UNVERIFIED: verifiedBy/verifiedOn are empty until a human checks figures against the dashboard (Gate 3). Unverified datasets do not render.",
);
