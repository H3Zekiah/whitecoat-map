import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/*
 * Content collection loader with enforced provenance (SRD §6, §7).
 * A factual page that lacks sources, a verified-on date, or a verifier
 * fails validation — and validation failure fails the build, because
 * every page renders through this loader at static-generation time.
 *
 * No JSX in this file: scripts/validate-content.ts runs it directly
 * under Node's type stripping.
 */

export const CONTENT_ROOT = path.join(process.cwd(), "content");

export const SECTIONS = ["texas", "guides", "data", "about"] as const;

export const STAGES = [
  "deciding",
  "high-school",
  "early-college",
  "late-college",
  "application-year",
  "gap-year",
  "reapplying",
] as const;

const sourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
});

/* gray-matter's YAML parser turns unquoted dates into Date objects. */
const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)")
    .refine((d) => !Number.isNaN(Date.parse(d)), "must be a real date")
    .refine(
      (d) => Date.parse(d) <= Date.now(),
      "verification date cannot be in the future",
    ),
);

export const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(10),
    section: z.enum(SECTIONS),
    stage: z.enum(STAGES).optional(),
    /*
     * factual defaults to true: a page must explicitly opt out of the
     * provenance requirement, never silently skip it.
     */
    factual: z.boolean().default(true),
    sources: z.array(sourceSchema).default([]),
    lastVerified: isoDate.optional(),
    verifiedBy: z.string().min(1).optional(),
  })
  .superRefine((fm, ctx) => {
    if (!fm.factual) return;
    if (fm.sources.length === 0) {
      ctx.addIssue({
        code: "custom",
        message:
          "factual page requires at least one entry in `sources` (set `factual: false` only for pages with no factual claims)",
      });
    }
    if (!fm.lastVerified) {
      ctx.addIssue({
        code: "custom",
        message: "factual page requires `lastVerified` (YYYY-MM-DD)",
      });
    }
    if (!fm.verifiedBy) {
      ctx.addIssue({
        code: "custom",
        message: "factual page requires `verifiedBy`",
      });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type PageSource = z.infer<typeof sourceSchema>;
export type Section = (typeof SECTIONS)[number];

export interface ContentPage {
  slug: string;
  section: Section;
  frontmatter: Frontmatter;
  body: string;
}

/* Parses and validates one MDX file. Throws with the file path on failure. */
export function parsePageFile(filePath: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(page)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid frontmatter in ${filePath}:\n${issues}`);
  }
  return { frontmatter: parsed.data, body: content };
}

export function listPages(section: Section): ContentPage[] {
  const dir = path.join(CONTENT_ROOT, section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { frontmatter, body } = parsePageFile(path.join(dir, f));
      return {
        slug: f.replace(/\.mdx$/, ""),
        section,
        frontmatter,
        body,
      };
    });
}

export function getPage(section: Section, slug: string): ContentPage | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const filePath = path.join(CONTENT_ROOT, section, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const { frontmatter, body } = parsePageFile(filePath);
  return { slug, section, frontmatter, body };
}
