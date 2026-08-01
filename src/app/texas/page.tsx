import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { listPages, type Section } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Texas reference",
  description:
    "The Texas-specific rules that decide medical school admissions here: residency, the TMDSAS application, and JAMP.",
};

/* Editorial order — most consequential first, not alphabetical. */
const ORDER = ["residency", "jamp", "tmdsas"];

export default function TexasIndex() {
  const pages = listPages("texas" as Section).sort(
    (a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug),
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">
            The Texas Reference
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            The Texas rules
          </h1>
          <p className="mt-3 text-lg text-muted">
            Texas runs its admissions differently from the rest of the country.
            These are the rules that change what you should do.
          </p>
        </header>

        <ul className="space-y-6">
          {pages.map((p) => (
            <li key={p.slug} className="border-b border-rule pb-6">
              <Link
                href={`/texas/${p.slug}`}
                className="font-display text-2xl font-semibold hover:text-accent"
              >
                {p.frontmatter.title}
              </Link>
              <p className="mt-2 text-muted">{p.frontmatter.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
