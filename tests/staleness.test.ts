import assert from "node:assert/strict";
import { test } from "node:test";
import { isStale } from "../src/lib/staleness.ts";

const NOW = Date.parse("2026-08-01");

test("fresh verification is not stale", () => {
  assert.equal(isStale("2026-07-01", NOW), false);
});

test("verification older than a year is stale", () => {
  assert.equal(isStale("2025-06-15", NOW), true);
});

test("missing date is not flagged (validation guarantees presence on factual pages)", () => {
  assert.equal(isStale(undefined, NOW), false);
});
