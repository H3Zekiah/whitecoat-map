import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Callout } from "@/components/Callout";
import { PageShell } from "@/components/PageShell";
import { SchoolFacts } from "@/components/SchoolFacts";
import { SourceChip } from "@/components/SourceChip";
import { loadManifest, loadSchools } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadSchools().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = loadSchools().find((s) => s.slug === slug);
  if (!school) return {};
  return {
    title: school.shortName,
    description: `${school.name} in ${school.city}: ${school.degree} program, applies through ${school.applicationService}. Published class figures with sources.`,
  };
}

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = loadSchools().find((s) => s.slug === slug);
  if (!school) notFound();

  const manifest = loadManifest();
  const usedSourceIds = new Set(
    [
      school.classSize,
      school.gpaAverage,
      school.mcatAverage,
      school.gpaRange,
      school.mcatRange,
      school.inStatePercent,
    ]
      .filter((f) => !("unavailable" in f))
      .map((f) => (f as { sourceId: string }).sourceId),
  );
  const sources = manifest.filter((m) => usedSourceIds.has(m.id));
  const verifiedOn =
    [
      school.classSize,
      school.gpaAverage,
      school.mcatAverage,
      school.inStatePercent,
    ].find((f) => !("unavailable" in f) && "verifiedOn" in f && f.verifiedOn) &&
    "verifiedOn" in school.classSize
      ? (school.classSize.verifiedOn ?? "")
      : "";

  return (
    <PageShell>
      <article className="mx-auto max-w-3xl">
        <header className="mb-6">
          <Link
            href="/schools"
            className="text-sm text-muted hover:text-accent"
          >
            ← All Texas medical schools
          </Link>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
            {school.name}
          </h1>
          <p className="mt-2 text-lg text-muted">
            {school.degree === "MD"
              ? "Doctor of Medicine (MD)"
              : "Doctor of Osteopathic Medicine (DO)"}{" "}
            · {school.city}
          </p>
          <a
            href={school.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-accent underline decoration-accent/40 underline-offset-2"
          >
            Official admissions site
          </a>
        </header>

        {school.applicationService === "TMDSAS" ? (
          <Callout variant="note" title="How you apply">
            This school takes the TMDSAS application, the same one used by
            almost every Texas medical school. One application reaches all of
            them.
          </Callout>
        ) : (
          <Callout variant="warning" title="This one is different">
            This school does <strong>not</strong> use TMDSAS. You apply through{" "}
            {school.applicationService}, on its own timeline, with its own fees.
            Applicants who assume every Texas school is on TMDSAS miss this one.
          </Callout>
        )}

        <h2 className="font-display mt-10 text-2xl font-semibold">
          What this school publishes
        </h2>
        <SchoolFacts
          classSize={school.classSize}
          gpaAverage={school.gpaAverage}
          mcatAverage={school.mcatAverage}
          gpaRange={school.gpaRange}
          mcatRange={school.mcatRange}
          inStatePercent={school.inStatePercent}
        />

        {sources.length > 0 ? (
          <footer className="mt-8 border-t border-rule pt-6">
            <h2 className="font-display mb-3 text-lg font-semibold">Sources</h2>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <SourceChip
                  key={s.id}
                  source={s.name}
                  href={s.url}
                  verifiedOn={verifiedOn}
                />
              ))}
            </div>
          </footer>
        ) : null}

        <p className="mt-8 text-sm text-faint">
          Admissions requirements change. Always confirm details on the
          school&apos;s own site before you plan around them.
        </p>
      </article>
    </PageShell>
  );
}
