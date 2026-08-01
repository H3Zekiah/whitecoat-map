import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/Callout";
import { PageShell } from "@/components/PageShell";
import { loadSchools, verifiedValue } from "@/lib/data";

export const metadata: Metadata = {
  title: "Texas medical schools",
  description:
    "Every medical school in Texas: MD and DO, which application service each uses, class size and published admissions figures, each one sourced.",
};

export default function SchoolsPage() {
  const schools = loadSchools().sort((a, b) =>
    a.shortName.localeCompare(b.shortName),
  );
  const tmdsas = schools.filter((s) => s.applicationService === "TMDSAS");
  const other = schools.filter((s) => s.applicationService !== "TMDSAS");

  function Row({ school }: { school: (typeof schools)[number] }) {
    const size = verifiedValue(school.classSize);
    const gpa = verifiedValue(school.gpaAverage);
    const mcat = verifiedValue(school.mcatAverage);
    return (
      <li className="border-b border-rule py-4">
        <Link
          href={`/schools/${school.slug}`}
          className="font-display text-lg font-semibold hover:text-accent"
        >
          {school.name}
        </Link>
        <p className="mt-1 text-sm text-muted">
          {school.degree} · {school.city} · applies through{" "}
          {school.applicationService}
        </p>
        <p className="mt-1 text-sm text-faint">
          {size !== null
            ? `Class of about ${size}`
            : "Class size not published"}
          {gpa !== null ? ` · average GPA ${gpa.toFixed(2)}` : ""}
          {mcat !== null ? ` · average MCAT ${Math.round(mcat)}` : ""}
        </p>
      </li>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">
            The Texas Reference
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Texas medical schools
          </h1>
          <p className="mt-3 text-lg text-muted">
            Every medical school in Texas, what each publishes about its
            entering class, and which application you use to reach it.
          </p>
        </header>

        <Callout variant="note" title="Why some figures are missing">
          Schools differ enormously in what they publish. Some post a full class
          profile; others publish nothing, or release figures only through the
          paid AAMC MSAR. Where a number is not published, this site says so
          rather than filling the gap with someone else&apos;s estimate.
        </Callout>

        <h2 className="font-display mt-10 mb-2 text-2xl font-semibold">
          Apply through TMDSAS
        </h2>
        <p className="mb-2 text-sm text-muted">
          {tmdsas.length} schools, one application.
        </p>
        <ul>
          {tmdsas.map((s) => (
            <Row key={s.slug} school={s} />
          ))}
        </ul>

        {other.length > 0 ? (
          <>
            <h2 className="font-display mt-10 mb-2 text-2xl font-semibold">
              Apply separately
            </h2>
            <p className="mb-2 text-sm text-muted">
              In Texas but not part of TMDSAS — easy to miss for exactly that
              reason.
            </p>
            <ul>
              {other.map((s) => (
                <Row key={s.slug} school={s} />
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </PageShell>
  );
}
