import fs from "node:fs";
import path from "node:path";
import { DATA_ROOT, datasetSchemasByKind, isDatasetVerified } from "./data";

/*
 * Server-side loaders for the aggregate datasets.
 *
 * Verification is enforced at the boundary: an unverified dataset is
 * returned as null and pages render an honest placeholder instead of
 * figures. This is the §7 promise in load-bearing form — no component
 * can accidentally display numbers a human has not signed off on.
 */

function loadDataset<K extends keyof typeof datasetSchemasByKind>(
  file: string,
  kind: K,
): import("zod").infer<(typeof datasetSchemasByKind)[K]> | null {
  const p = path.join(DATA_ROOT, "aggregates", file);
  if (!fs.existsSync(p)) return null;
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  const parsed = datasetSchemasByKind[kind].safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid dataset ${file}: ${parsed.error.message}`);
  }
  const data = parsed.data;
  if (!isDatasetVerified(data)) return null;
  return data as never;
}

export const loadFunnel = () => loadDataset("funnel.json", "funnel");
export const loadResidencyFunnel = () =>
  loadDataset("residency-funnel.json", "residency-funnel");
export const loadGrid = () =>
  loadDataset("gpa-mcat-grid.json", "gpa-mcat-grid");
export const loadGridByResidency = () =>
  loadDataset("gpa-mcat-grid-residency.json", "gpa-mcat-grid-residency");

/* Source-chip metadata shared by every figure drawn from the dashboard. */
export const TMDSAS_DASHBOARD = {
  name: "TMDSAS statistics dashboard",
  href: "https://www.tmdsas.com/stats-dashboard/medical-report.html",
} as const;
