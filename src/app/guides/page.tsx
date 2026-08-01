import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { STAGES, listPages, type ContentPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain-language guides to getting into medical school in Texas, organised by where you are right now: high school, college, applying, gap year, or reapplying.",
};

function Entry({ page }: { page: ContentPage }) {
  return (
    <li className="border-b border-rule pb-6">
      <Link
        href={`/guides/${page.slug}`}
        className="font-display text-2xl font-semibold hover:text-accent"
      >
        {page.frontmatter.title}
      </Link>
      <p className="mt-2 text-muted">{page.frontmatter.description}</p>
    </li>
  );
}

export default function GuidesIndex() {
  const pages = listPages("guides");

  /* Stage guides run in journey order; everything else is a reference
     guide that applies at any stage. */
  const staged = STAGES.map((stage) =>
    pages.find((p) => p.frontmatter.stage === stage),
  ).filter((p): p is ContentPage => p !== undefined);

  const unstaged = pages
    .filter((p) => !p.frontmatter.stage)
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">
            Guides
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Start where you are
          </h1>
          <p className="mt-3 text-lg text-muted">
            What matters now, what to do this semester, what can safely wait,
            and the mistakes people make at each stage.
          </p>
        </header>

        {staged.length > 0 ? (
          <section className="mb-12">
            <h2 className="font-display mb-1 text-sm font-semibold tracking-widest text-muted uppercase">
              By stage
            </h2>
            <p className="mb-5 text-sm text-faint">
              Find yourself on this list. The stage you are at decides what is
              worth your time.
            </p>
            <ol className="space-y-6">
              {staged.map((p, i) => (
                <div key={p.slug} className="grid grid-cols-[2rem_1fr] gap-2">
                  <span
                    aria-hidden="true"
                    className="font-display pt-1 text-lg text-faint tabular-nums"
                  >
                    {i + 1}
                  </span>
                  <Entry page={p} />
                </div>
              ))}
            </ol>
          </section>
        ) : null}

        {unstaged.length > 0 ? (
          <section>
            <h2 className="font-display mb-5 text-sm font-semibold tracking-widest text-muted uppercase">
              Whenever you need them
            </h2>
            <ul className="space-y-6">
              {unstaged.map((p) => (
                <Entry key={p.slug} page={p} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </PageShell>
  );
}
