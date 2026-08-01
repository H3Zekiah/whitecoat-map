import assert from "node:assert/strict";
import { test } from "node:test";
import {
  funnelDatasetSchema,
  isDatasetVerified,
  isUnavailable,
  loadManifest,
  loadSchools,
  schoolSchema,
  verifiedValue,
} from "../src/lib/data.ts";
import { classifyFetch, sha256 } from "../src/lib/snapshots.ts";

/* ---------- the core promise: unverified figures cannot render ---------- */

test("verifiedValue returns the value only when human verification is recorded", () => {
  const verified = {
    value: 230,
    sourceId: "utsw-class-profile",
    retrieved: "2026-08-01",
    verifiedBy: "Hezekiah Lasater",
    verifiedOn: "2026-08-01",
  };
  assert.equal(verifiedValue(verified), 230);
});

test("extracted-but-unverified field renders nothing", () => {
  const extractedOnly = {
    value: 230,
    sourceId: "utsw-class-profile",
    retrieved: "2026-08-01",
  };
  assert.equal(verifiedValue(extractedOnly), null);
});

test("explicitly unavailable field renders nothing and is distinguishable", () => {
  const unavailable = {
    unavailable: true as const,
    reason: "school publishes median only, no range",
    checkedOn: "2026-08-01",
  };
  assert.equal(verifiedValue<number>(unavailable), null);
  assert.equal(isUnavailable(unavailable), true);
});

test("dataset without verification is not renderable", () => {
  const dataset = {
    provenance: {
      sourceId: "tmdsas-dashboard",
      retrieved: "2026-08-01",
      snapshotHashes: ["a".repeat(64)],
      extractedBy: "scripts/extract-tmdsas.ts",
    },
  };
  assert.equal(isDatasetVerified(dataset), false);
  assert.equal(
    isDatasetVerified({
      provenance: {
        ...dataset.provenance,
        verifiedBy: "Hezekiah Lasater",
        verifiedOn: "2026-08-01",
      },
    }),
    true,
  );
});

/* ---------- schemas ---------- */

test("source manifest loads with unique ids", () => {
  const manifest = loadManifest();
  assert.ok(manifest.length >= 8);
  const ids = manifest.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("school schema rejects a bare number without provenance", () => {
  const school = {
    slug: "example",
    name: "Example School of Medicine",
    shortName: "Example",
    degree: "MD",
    applicationService: "TMDSAS",
    city: "Austin",
    website: "https://example.edu",
    classSize: 230,
    gpaAverage: {
      unavailable: true,
      reason: "not published",
      checkedOn: "2026-08-01",
    },
    gpaRange: {
      unavailable: true,
      reason: "not published",
      checkedOn: "2026-08-01",
    },
    mcatAverage: {
      unavailable: true,
      reason: "not published",
      checkedOn: "2026-08-01",
    },
    mcatRange: {
      unavailable: true,
      reason: "not published",
      checkedOn: "2026-08-01",
    },
    inStatePercent: {
      unavailable: true,
      reason: "not published",
      checkedOn: "2026-08-01",
    },
  };
  assert.equal(schoolSchema.safeParse(school).success, false);
});

test("school directory holds exactly the expected programs, no duplicates", () => {
  const schools = loadSchools();
  /* 12 MD + 2 DO TMDSAS programs, plus UIWSOM (AACOMAS) per Gate 1. */
  assert.equal(schools.length, 15);
  const slugs = schools.map((s) => s.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(
    schools.filter((s) => s.applicationService === "TMDSAS").length,
    14,
  );
  assert.equal(schools.filter((s) => s.degree === "DO").length, 3);
});

test("funnel dataset schema accepts a well-formed dataset", () => {
  const dataset = {
    kind: "funnel",
    provenance: {
      sourceId: "tmdsas-dashboard",
      retrieved: "2026-08-01",
      snapshotHashes: ["b".repeat(64)],
      extractedBy: "scripts/extract-tmdsas.ts",
      verifiedBy: "Hezekiah Lasater",
      verifiedOn: "2026-08-01",
    },
    rows: [
      {
        entryYear: 2025,
        applicants: 9518,
        interviewed: 5568,
        accepted: 3295,
        matriculated: 2900,
      },
    ],
  };
  assert.equal(funnelDatasetSchema.safeParse(dataset).success, true);
});

/* ---------- snapshot change detection ---------- */

test("classifyFetch distinguishes new, unchanged, and changed", () => {
  const body = new TextEncoder().encode("document v1");
  const hash = sha256(body);
  assert.equal(classifyFetch(undefined, hash), "new");
  const previous = {
    sourceId: "x",
    url: "https://example.com",
    retrievedAt: "2026-08-01T00:00:00Z",
    sha256: hash,
    bytes: body.byteLength,
    file: "data/snapshots/x/2026-08-01-abc.pdf",
    contentType: "application/pdf",
  };
  assert.equal(classifyFetch(previous, hash), "unchanged");
  const changedHash = sha256(new TextEncoder().encode("document v2"));
  assert.equal(classifyFetch(previous, changedHash), "changed");
});
