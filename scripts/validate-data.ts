/*
 * Validates the source manifest, all school files, and all aggregate
 * datasets against their schemas. Runs in CI.
 *
 * Run: node scripts/validate-data.ts
 */

import fs from "node:fs";
import path from "node:path";
import {
  DATA_ROOT,
  datasetSchemasByKind,
  loadManifest,
  loadSchools,
} from "../src/lib/data.ts";

let failed = false;

try {
  const manifest = loadManifest();
  console.log(`OK  sources.json (${manifest.length} sources)`);
} catch (err) {
  failed = true;
  console.error(String(err instanceof Error ? err.message : err));
}

try {
  const schools = loadSchools();
  console.log(`OK  schools/ (${schools.length} profiles)`);
} catch (err) {
  failed = true;
  console.error(String(err instanceof Error ? err.message : err));
}

const aggregatesDir = path.join(DATA_ROOT, "aggregates");
if (fs.existsSync(aggregatesDir)) {
  for (const f of fs
    .readdirSync(aggregatesDir)
    .filter((f) => f.endsWith(".json"))) {
    const filePath = path.join(aggregatesDir, f);
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const schema =
        datasetSchemasByKind[raw.kind as keyof typeof datasetSchemasByKind];
      if (!schema) {
        throw new Error(`unknown dataset kind: ${String(raw.kind)}`);
      }
      schema.parse(raw);
      console.log(`OK  aggregates/${f}`);
    } catch (err) {
      failed = true;
      console.error(
        `Invalid dataset ${filePath}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}

if (failed) {
  console.error("\nData validation FAILED.");
  process.exit(1);
}
console.log("\nData validation passed.");
