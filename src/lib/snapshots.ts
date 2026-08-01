import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DATA_ROOT } from "./data.ts";

/*
 * Snapshot archive (SRD §7): every retrieval of a source document is
 * stored in-repo with its retrieval date and content hash. Snapshots are
 * append-only — a changed source produces a new file and a CHANGED
 * report, never an overwrite, so any published figure stays traceable
 * to the exact document it was extracted from.
 */

export const SNAPSHOT_DIR = path.join(DATA_ROOT, "snapshots");
const INDEX_PATH = path.join(SNAPSHOT_DIR, "index.json");

export interface SnapshotRecord {
  sourceId: string;
  url: string;
  retrievedAt: string;
  sha256: string;
  bytes: number;
  file: string;
  contentType: string;
}

export function sha256(buf: Uint8Array): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export function loadIndex(): SnapshotRecord[] {
  if (!fs.existsSync(INDEX_PATH)) return [];
  return JSON.parse(fs.readFileSync(INDEX_PATH, "utf8")) as SnapshotRecord[];
}

export function latestFor(
  index: SnapshotRecord[],
  sourceId: string,
): SnapshotRecord | undefined {
  return index
    .filter((r) => r.sourceId === sourceId)
    .sort((a, b) => a.retrievedAt.localeCompare(b.retrievedAt))
    .at(-1);
}

export function extensionFor(contentType: string, url: string): string {
  if (contentType.includes("pdf") || url.endsWith(".pdf")) return "pdf";
  if (contentType.includes("html")) return "html";
  if (contentType.includes("json")) return "json";
  return "bin";
}

export type FetchOutcome = "new" | "unchanged" | "changed";

export function classifyFetch(
  previous: SnapshotRecord | undefined,
  hash: string,
): FetchOutcome {
  if (!previous) return "new";
  return previous.sha256 === hash ? "unchanged" : "changed";
}

export function storeSnapshot(record: {
  sourceId: string;
  url: string;
  body: Uint8Array;
  contentType: string;
  now?: Date;
}): { record: SnapshotRecord; outcome: FetchOutcome } {
  const now = record.now ?? new Date();
  const hash = sha256(record.body);
  const index = loadIndex();
  const outcome = classifyFetch(latestFor(index, record.sourceId), hash);

  if (outcome === "unchanged") {
    const existing = latestFor(index, record.sourceId);
    if (!existing) throw new Error("unreachable: unchanged without previous");
    return { record: existing, outcome };
  }

  const date = now.toISOString().slice(0, 10);
  const ext = extensionFor(record.contentType, record.url);
  const dir = path.join(SNAPSHOT_DIR, record.sourceId);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(
    "data",
    "snapshots",
    record.sourceId,
    `${date}-${hash.slice(0, 8)}.${ext}`,
  );
  fs.writeFileSync(path.join(process.cwd(), file), record.body);

  const entry: SnapshotRecord = {
    sourceId: record.sourceId,
    url: record.url,
    retrievedAt: now.toISOString(),
    sha256: hash,
    bytes: record.body.byteLength,
    file,
    contentType: record.contentType,
  };
  index.push(entry);
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n");
  return { record: entry, outcome };
}
