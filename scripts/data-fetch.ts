/*
 * Acquisition (SRD §7): fetches every http-retrievable source in the
 * manifest and archives it via the append-only snapshot store. Reports
 * NEW / UNCHANGED / CHANGED per source; CHANGED means the publisher
 * altered the document since our last retrieval and downstream figures
 * need re-verification.
 *
 * Run: npm run data:fetch   (network; not run in CI)
 */

import { loadManifest } from "../src/lib/data.ts";
import { storeSnapshot } from "../src/lib/snapshots.ts";

const UA =
  "WhitecoatMapArchiver/0.1 (independent education project; contact: hezekiahlasater@gmail.com)";

let failures = 0;
let changed = 0;

for (const source of loadManifest()) {
  if (source.retrieval.method !== "http") {
    console.log(`SKIP       ${source.id} (${source.retrieval.method})`);
    continue;
  }
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
    });
    if (!res.ok) {
      failures++;
      console.error(`FAIL       ${source.id}: HTTP ${res.status}`);
      continue;
    }
    const body = new Uint8Array(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "";
    const { record, outcome } = storeSnapshot({
      sourceId: source.id,
      url: source.url,
      body,
      contentType,
    });
    if (outcome === "changed") changed++;
    console.log(
      `${outcome.toUpperCase().padEnd(10)} ${source.id}  ${record.bytes} bytes  sha256:${record.sha256.slice(0, 12)}`,
    );
  } catch (err) {
    failures++;
    console.error(
      `FAIL       ${source.id}: ${err instanceof Error ? err.message : err}`,
    );
  }
}

if (changed > 0) {
  console.log(
    `\n${changed} source(s) CHANGED since last retrieval — figures extracted from them need re-verification.`,
  );
}
if (failures > 0) {
  console.error(`\n${failures} fetch(es) failed.`);
  process.exit(1);
}
