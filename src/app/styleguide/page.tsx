import type { Metadata } from "next";
import { Callout } from "@/components/Callout";
import { DataTable } from "@/components/DataTable";
import { PageShell } from "@/components/PageShell";
import { Prose } from "@/components/Prose";
import { SourceChip } from "@/components/SourceChip";
import { StalenessNotice } from "@/components/StalenessNotice";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false },
};

const swatches = [
  { name: "paper", className: "bg-paper", note: "page background" },
  { name: "surface", className: "bg-surface", note: "cards, raised areas" },
  { name: "ink", className: "bg-ink", note: "primary text" },
  { name: "muted", className: "bg-muted", note: "secondary text" },
  { name: "faint", className: "bg-faint", note: "tertiary text" },
  { name: "rule", className: "bg-rule", note: "borders, dividers" },
  { name: "accent", className: "bg-accent", note: "links, signal" },
  { name: "accent-soft", className: "bg-accent-soft", note: "accent tint" },
  { name: "warn", className: "bg-warn", note: "staleness, caution" },
  { name: "warn-soft", className: "bg-warn-soft", note: "caution tint" },
  { name: "opinion", className: "bg-opinion", note: "labeled judgment" },
  { name: "opinion-soft", className: "bg-opinion-soft", note: "judgment tint" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-rule pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="font-display mb-6 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  return (
    <PageShell>
      <div className="mb-10">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Styleguide
        </h1>
        <p className="mt-2 text-muted">
          Every primitive in the design system, in both themes. Use the toggle
          in the header.
        </p>
      </div>

      <Section title="Color tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {swatches.map((s) => (
            <div key={s.name} className="rounded-md border border-rule p-3">
              <div
                className={`h-10 rounded ${s.className} border border-rule`}
              />
              <p className="mt-2 text-sm font-medium">{s.name}</p>
              <p className="text-xs text-muted">{s.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div className="space-y-5">
          <p className="font-display text-5xl font-semibold tracking-tight">
            Display — Fraunces
          </p>
          <p className="font-display text-3xl font-semibold tracking-tight">
            Heading two sits at thirty pixels
          </p>
          <p className="font-display text-xl font-semibold">
            Heading three at twenty
          </p>
          <p className="text-[1.0625rem] leading-relaxed">
            Body — Inter at seventeen pixels with relaxed leading, sized for
            long-form reading on a phone held at arm&apos;s length.
          </p>
          <p className="text-sm text-muted">
            Small muted text for secondary information.
          </p>
          <p className="text-xs text-faint">
            Caption and metadata text, the quietest voice on the page.
          </p>
        </div>
      </Section>

      <Section title="Prose container">
        <Prose>
          <h2>What a guide page reads like</h2>
          <p>
            Texas caps non-resident enrollment at its public medical schools at
            10 percent of each entering class. If you are a Texas resident, this
            is the single highest-leverage fact in your application. If you are
            not, it changes which schools are realistic.
          </p>
          <p>
            Every claim like that one links to <a href="#">its source</a>, and
            every figure shows when a human last verified it.
          </p>
          <ul>
            <li>What matters right now</li>
            <li>What can safely wait</li>
            <li>The mistakes people make at this stage</li>
          </ul>
          <blockquote>
            Position, never verdict: the site shows where you stand, not whether
            you should continue.
          </blockquote>
        </Prose>
      </Section>

      <Section title="Callouts">
        <Callout variant="note">
          JAMP applications are only open during your freshman or sophomore year
          of college. Junior year is too late.
        </Callout>
        <Callout variant="warning">
          Deadlines shown here were verified on 2026-08-01. TMDSAS can change
          them mid-cycle — confirm on the official site before planning around
          one.
        </Callout>
        <Callout variant="opinion">
          If you are choosing between an MCAT course and rent, pay rent. The
          free resources listed on the money page cover the same material.
        </Callout>
      </Section>

      <Section title="Data table">
        <DataTable caption="TMDSAS medical applicant funnel, recent entry years (sample data for layout only)">
          <thead>
            <tr>
              <th scope="col">Entry year</th>
              <th scope="col">Applicants</th>
              <th scope="col">Interviewed</th>
              <th scope="col">Accepted</th>
              <th scope="col">Matriculated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2023</td>
              <td>8,875</td>
              <td>4,973</td>
              <td>3,338</td>
              <td>2,863</td>
            </tr>
            <tr>
              <td>2024</td>
              <td>9,005</td>
              <td>5,543</td>
              <td>3,300</td>
              <td>2,871</td>
            </tr>
            <tr>
              <td>2025</td>
              <td>9,518</td>
              <td>5,568</td>
              <td>3,295</td>
              <td>2,900</td>
            </tr>
          </tbody>
        </DataTable>
      </Section>

      <Section title="Source chip">
        <p className="mb-3 text-sm text-muted">
          Attached to every displayed figure:
        </p>
        <SourceChip
          source="TMDSAS stats dashboard"
          href="https://www.tmdsas.com/stats-dashboard/medical-report.html"
          verifiedOn="2026-08-01"
        />
      </Section>

      <Section title="Staleness notice">
        <StalenessNotice
          lastVerified="2025-06-15"
          sourceHref="https://www.tmdsas.com/stats-dashboard/medical-report.html"
        />
      </Section>
    </PageShell>
  );
}
