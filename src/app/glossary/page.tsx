import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { loadGlossary } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Every term used on Whitecoat Map, defined in plain language. No page on this site assumes you already know the vocabulary.",
};

export default function GlossaryPage() {
  const terms = loadGlossary();

  return (
    <PageShell>
      <div className="mx-auto max-w-prose">
        <header className="mb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Glossary
          </h1>
          <p className="mt-3 text-lg text-muted">
            Every term used on this site, in plain language. Terms link here
            automatically the first time they appear on a page.
          </p>
        </header>
        <dl className="space-y-6">
          {terms.map((t) => (
            <div
              key={t.slug}
              id={t.slug}
              className="scroll-mt-24 border-b border-rule pb-5"
            >
              <dt className="font-display text-xl font-semibold">{t.term}</dt>
              <dd className="mt-1 leading-relaxed text-muted">{t.short}</dd>
            </div>
          ))}
        </dl>
      </div>
    </PageShell>
  );
}
