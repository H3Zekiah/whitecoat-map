import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { listPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain-language guides to getting into medical school: what things cost, what matters when, and what you can safely ignore.",
};

export default function GuidesIndex() {
  const pages = listPages("guides").sort((a, b) =>
    a.frontmatter.title.localeCompare(b.frontmatter.title),
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">
            Guides
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Guides
          </h1>
          <p className="mt-3 text-lg text-muted">
            What matters, when it matters, and what you can safely ignore.
          </p>
        </header>

        {pages.length === 0 ? (
          <p className="text-muted">Guides are being written.</p>
        ) : (
          <ul className="space-y-6">
            {pages.map((p) => (
              <li key={p.slug} className="border-b border-rule pb-6">
                <Link
                  href={`/guides/${p.slug}`}
                  className="font-display text-2xl font-semibold hover:text-accent"
                >
                  {p.frontmatter.title}
                </Link>
                <p className="mt-2 text-muted">{p.frontmatter.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
