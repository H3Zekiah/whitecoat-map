import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import { parsePageFile } from "../src/lib/content.ts";
import { loadGlossary } from "../src/lib/glossary.ts";

const fixtures = (name: string) =>
  path.join(process.cwd(), "tests", "fixtures", name);

test("valid page passes validation", () => {
  const { frontmatter } = parsePageFile(fixtures("valid.mdx"));
  assert.equal(frontmatter.title, "A Valid Page");
  assert.equal(frontmatter.factual, true);
  assert.equal(frontmatter.sources.length, 1);
});

test("factual page without sources fails", () => {
  assert.throws(
    () => parsePageFile(fixtures("missing-sources.mdx")),
    /requires at least one entry in `sources`/,
  );
});

test("factual page without verification fails", () => {
  assert.throws(
    () => parsePageFile(fixtures("missing-verified.mdx")),
    (err) => {
      const msg = String(err);
      return (
        msg.includes("requires `lastVerified`") &&
        msg.includes("requires `verifiedBy`")
      );
    },
  );
});

test("verification date in the future fails", () => {
  assert.throws(
    () => parsePageFile(fixtures("future-date.mdx")),
    /cannot be in the future/,
  );
});

test("page with factual false may omit provenance", () => {
  const { frontmatter } = parsePageFile(fixtures("opt-out.mdx"));
  assert.equal(frontmatter.factual, false);
  assert.equal(frontmatter.sources.length, 0);
});

test("glossary loads, sorted, with unique slugs", () => {
  const terms = loadGlossary();
  assert.ok(terms.length >= 10);
  const slugs = terms.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term));
  assert.deepEqual(
    terms.map((t) => t.slug),
    sorted.map((t) => t.slug),
  );
});
