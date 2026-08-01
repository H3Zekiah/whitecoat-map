import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/*
 * The glossary is data, not prose: content/glossary.json holds every term
 * used anywhere on the site (SRD §6 — no unexplained jargon). Terms are
 * auto-linked in page bodies by the remark plugin in remark-glossary.ts.
 */

const termSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  term: z.string().min(1),
  short: z.string().min(10),
  /* Extra spellings that should also link to this term. */
  aka: z.array(z.string().min(1)).default([]),
});

export type GlossaryTerm = z.infer<typeof termSchema>;

const glossarySchema = z.array(termSchema).superRefine((terms, ctx) => {
  const seen = new Set<string>();
  for (const t of terms) {
    if (seen.has(t.slug)) {
      ctx.addIssue({
        code: "custom",
        message: `duplicate glossary slug: ${t.slug}`,
      });
    }
    seen.add(t.slug);
  }
});

export function loadGlossary(): GlossaryTerm[] {
  const filePath = path.join(process.cwd(), "content", "glossary.json");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const parsed = glossarySchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid glossary in ${filePath}:\n${issues}`);
  }
  return [...parsed.data].sort((a, b) => a.term.localeCompare(b.term));
}
