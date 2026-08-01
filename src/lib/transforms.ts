/*
 * Display transforms for the aggregate datasets.
 *
 * Stored data stays as close to the source as possible (native bins), so
 * every judgment call about how figures are presented lives here, in one
 * place, under golden tests. The calls made and why:
 *
 *  - Pool entry years 2020-2025. Six completed cycles on the current bin
 *    scheme give usable per-cell counts. EY2026 is in progress (partial
 *    acceptances, no matriculation) and is excluded from every rate;
 *    EY2016-2019 are excluded to keep the pool recent and comparable.
 *  - Drop the catch-all GPA bin (0.0) and rows with no MCAT: a crossed
 *    view needs both axes present.
 *  - Roll native 0.1-wide GPA bins into readable bands; keep MCAT's
 *    native 5-wide bands, collapsing the sparse tails.
 *  - Suppress rates below 10 pooled applicants. The count is still shown;
 *    the rate is not, because a 2-of-3 cell reads as "67%" to exactly the
 *    student least equipped to discount it.
 */

export const POOL_YEARS = [2020, 2021, 2022, 2023, 2024, 2025] as const;
export const SMALL_CELL_MIN = 10;

export interface GridRow {
  entryYear: number;
  gpaBinLow: number;
  mcatBinLow: number;
  applicants: number;
  accepted: number;
  residency?: string;
}

export const GPA_BANDS = [
  { id: "lt300", label: "Below 3.00", low: -Infinity, high: 3.0 },
  { id: "300", label: "3.00–3.19", low: 3.0, high: 3.2 },
  { id: "320", label: "3.20–3.39", low: 3.2, high: 3.4 },
  { id: "340", label: "3.40–3.59", low: 3.4, high: 3.6 },
  { id: "360", label: "3.60–3.79", low: 3.6, high: 3.8 },
  { id: "380", label: "3.80–3.99", low: 3.8, high: 4.0 },
  { id: "400", label: "4.00", low: 4.0, high: Infinity },
] as const;

export const MCAT_BANDS = [
  { id: "lt490", label: "Below 490", low: -Infinity, high: 490 },
  { id: "490", label: "490–494", low: 490, high: 495 },
  { id: "495", label: "495–499", low: 495, high: 500 },
  { id: "500", label: "500–504", low: 500, high: 505 },
  { id: "505", label: "505–509", low: 505, high: 510 },
  { id: "510", label: "510–514", low: 510, high: 515 },
  { id: "515", label: "515–519", low: 515, high: 520 },
  { id: "520", label: "520 and above", low: 520, high: Infinity },
] as const;

export type GpaBandId = (typeof GPA_BANDS)[number]["id"];
export type McatBandId = (typeof MCAT_BANDS)[number]["id"];

export function gpaBandFor(gpa: number): GpaBandId | null {
  if (!Number.isFinite(gpa) || gpa < 0 || gpa > 4) return null;
  const band = GPA_BANDS.find((b) => gpa >= b.low && gpa < b.high);
  return band ? band.id : null;
}

export function mcatBandFor(mcat: number): McatBandId | null {
  if (!Number.isFinite(mcat) || mcat < 472 || mcat > 528) return null;
  const band = MCAT_BANDS.find((b) => mcat >= b.low && mcat < b.high);
  return band ? band.id : null;
}

export interface GridCell {
  gpaBand: GpaBandId;
  mcatBand: McatBandId;
  applicants: number;
  accepted: number;
  /* null when the cell is below the small-cell threshold */
  rate: number | null;
  suppressed: boolean;
}

export function buildGrid(
  rows: GridRow[],
  options: { residency?: string } = {},
): GridCell[] {
  const acc = new Map<string, { applicants: number; accepted: number }>();

  for (const r of rows) {
    if (!(POOL_YEARS as readonly number[]).includes(r.entryYear)) continue;
    if (options.residency !== undefined && r.residency !== options.residency) {
      continue;
    }
    /* Catch-all GPA bin: no usable GPA on file. */
    if (r.gpaBinLow === 0) continue;

    const gpaBand = gpaBandFor(r.gpaBinLow);
    const mcatBand = mcatBandFor(r.mcatBinLow);
    if (!gpaBand || !mcatBand) continue;

    const key = `${gpaBand}|${mcatBand}`;
    const cur = acc.get(key) ?? { applicants: 0, accepted: 0 };
    cur.applicants += r.applicants;
    cur.accepted += r.accepted;
    acc.set(key, cur);
  }

  const cells: GridCell[] = [];
  for (const [key, v] of acc) {
    const [gpaBand, mcatBand] = key.split("|") as [GpaBandId, McatBandId];
    const suppressed = v.applicants < SMALL_CELL_MIN;
    cells.push({
      gpaBand,
      mcatBand,
      applicants: v.applicants,
      accepted: v.accepted,
      rate: suppressed ? null : v.accepted / v.applicants,
      suppressed,
    });
  }
  return cells;
}

/* ---------- funnel ---------- */

export interface FunnelRow {
  entryYear: number;
  applicants: number;
  interviewed: number;
  accepted: number;
  matriculated: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  /* share of the applicant pool reaching this stage */
  shareOfApplicants: number;
}

export function buildFunnel(row: FunnelRow): FunnelStage[] {
  const stages: Array<[string, number]> = [
    ["Applied", row.applicants],
    ["Interviewed", row.interviewed],
    ["Accepted", row.accepted],
    ["Matriculated", row.matriculated],
  ];
  return stages.map(([stage, count]) => ({
    stage,
    count,
    shareOfApplicants: row.applicants === 0 ? 0 : count / row.applicants,
  }));
}

/* Latest entry year with a completed cycle (matriculation recorded). */
export function latestCompleteYear(rows: FunnelRow[]): FunnelRow | null {
  const complete = rows
    .filter((r) => r.matriculated > 0)
    .sort((a, b) => a.entryYear - b.entryYear);
  return complete.at(-1) ?? null;
}

/* ---------- trends ---------- */

export interface TrendPoint {
  entryYear: number;
  applicants: number;
  matriculated: number;
}

export function buildTrend(rows: FunnelRow[]): TrendPoint[] {
  return rows
    .filter((r) => r.matriculated > 0)
    .sort((a, b) => a.entryYear - b.entryYear)
    .map((r) => ({
      entryYear: r.entryYear,
      applicants: r.applicants,
      matriculated: r.matriculated,
    }));
}

/* ---------- colour ramp mapping ---------- */

/* Number of steps in the sequential ramp (see globals.css --seq-1..6). */
export const RAMP_STEPS = 6;

/*
 * Rates spread evenly across 0-1, so they map linearly. Applicant counts
 * are heavily skewed — a handful of squares hold most people — and a
 * linear map drops two thirds of the grid into the lightest step,
 * showing nothing. Square-root compression spreads them legibly while
 * keeping the ordering honest.
 */
export function rampIndex(
  value: number,
  max: number,
  scale: "linear" | "sqrt" = "linear",
): number {
  if (max <= 0) return 0;
  const t = scale === "sqrt" ? Math.sqrt(value / max) : value / max;
  return Math.min(RAMP_STEPS - 1, Math.max(0, Math.floor(t * RAMP_STEPS)));
}
