import type { Metadata } from "next";
import { Callout } from "@/components/Callout";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { PageShell } from "@/components/PageShell";
import { WhereIStand } from "@/components/WhereIStand";
import {
  TMDSAS_DASHBOARD,
  loadFunnel,
  loadGrid,
  loadResidencyFunnel,
} from "@/lib/aggregates";
import {
  buildFunnel,
  buildGrid,
  buildTrend,
  latestCompleteYear,
} from "@/lib/transforms";

export const metadata: Metadata = {
  title: "The Texas numbers",
  description:
    "How many people apply to Texas medical schools, how many get in, and where applicants actually land — drawn from the official TMDSAS statistics, with every figure sourced.",
};

function Unavailable({ what }: { what: string }) {
  return (
    <Callout variant="warning" title="Not shown yet">
      The {what} is not displayed because its figures have not been verified
      against the source document yet. This site does not publish unverified
      numbers.
    </Callout>
  );
}

export default function DataPage() {
  const funnel = loadFunnel();
  const residency = loadResidencyFunnel();
  const grid = loadGrid();

  const latest = funnel ? latestCompleteYear(funnel.rows) : null;
  const stages = latest ? buildFunnel(latest) : null;
  const trend = funnel ? buildTrend(funnel.rows) : null;
  const cells = grid ? buildGrid(grid.rows) : null;
  const verifiedOn = funnel?.provenance.verifiedOn ?? "";

  const residencyLatest = residency
    ? residency.rows.filter(
        (r) => r.entryYear === latest?.entryYear && r.residency !== "Exception",
      )
    : [];

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10">
          <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">
            The Data
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            The Texas numbers
          </h1>
          <p className="mt-3 text-lg text-muted">
            Everything here comes from the official TMDSAS statistics dashboard.
            It is public data that is genuinely hard to read, so this page draws
            it out.
          </p>
        </header>

        {stages && latest ? (
          <ChartFigure
            title={`What happens to a year of Texas applicants (entry year ${latest.entryYear})`}
            description="Every person who applied through TMDSAS for this entry year, and how far each stage carried them."
            source={{ ...TMDSAS_DASHBOARD, verifiedOn }}
            tableCaption={`TMDSAS applicant funnel, entry year ${latest.entryYear}`}
            tableHead={["Stage", "People", "Share of applicants"]}
            tableRows={stages.map((s) => [
              s.stage,
              s.count.toLocaleString("en-US"),
              `${Math.round(s.shareOfApplicants * 100)}%`,
            ])}
          >
            <FunnelChart stages={stages} />
          </ChartFigure>
        ) : (
          <Unavailable what="applicant funnel" />
        )}

        <Callout variant="note" title="What this actually means">
          Roughly a third of Texas applicants are accepted somewhere in a given
          year. That is not a verdict on anyone — it is the shape of the
          process. Most people who eventually become doctors were somewhere in
          the wider part of this funnel at some point, and many applied more
          than once.
        </Callout>

        {residencyLatest.length > 0 && latest ? (
          <ChartFigure
            title={`Texas residents and everyone else (entry year ${latest.entryYear})`}
            description="State law reserves at least 90 percent of seats at public Texas medical schools for Texas residents. This is what that looks like in practice."
            source={{ ...TMDSAS_DASHBOARD, verifiedOn }}
            tableCaption={`TMDSAS outcomes by residency, entry year ${latest.entryYear}`}
            tableHead={[
              "Residency",
              "Applied",
              "Interviewed",
              "Accepted",
              "Started school",
            ]}
            tableRows={residencyLatest.map((r) => [
              r.residency,
              r.applicants.toLocaleString("en-US"),
              r.interviewed.toLocaleString("en-US"),
              r.accepted.toLocaleString("en-US"),
              r.matriculated.toLocaleString("en-US"),
            ])}
          >
            <div className="space-y-6">
              {residencyLatest.map((r) => (
                <div key={r.residency}>
                  <p className="mb-2 text-sm font-medium">{r.residency}</p>
                  <FunnelChart
                    stages={buildFunnel({
                      entryYear: r.entryYear,
                      applicants: r.applicants,
                      interviewed: r.interviewed,
                      accepted: r.accepted,
                      matriculated: r.matriculated,
                    })}
                  />
                </div>
              ))}
            </div>
          </ChartFigure>
        ) : null}

        {trend && trend.length > 1 ? (
          <ChartFigure
            title="Ten years of Texas applications"
            description="How many people applied each year, and how many started medical school."
            source={{ ...TMDSAS_DASHBOARD, verifiedOn }}
            tableCaption="TMDSAS applicants and matriculants by entry year"
            tableHead={["Entry year", "Applied", "Started school"]}
            tableRows={trend.map((p) => [
              p.entryYear,
              p.applicants.toLocaleString("en-US"),
              p.matriculated.toLocaleString("en-US"),
            ])}
          >
            <TrendChart points={trend} />
          </ChartFigure>
        ) : (
          <Unavailable what="ten-year trend" />
        )}

        <div className="mt-12">
          {cells ? (
            <WhereIStand cells={cells} />
          ) : (
            <Unavailable what="acceptance landscape" />
          )}
        </div>

        <section className="mt-12 border-t border-rule pt-6">
          <h2 className="font-display mb-3 text-xl font-semibold">
            How these numbers were made
          </h2>
          <div className="max-w-prose space-y-3 text-sm text-muted">
            <p>
              Figures are extracted directly from the TMDSAS statistics
              dashboard, which publishes them inside an interactive report that
              search engines cannot read and visitors cannot download. Each
              extraction is archived with a timestamp and a content hash, so any
              number here can be traced back to the exact document it came from.
            </p>
            <p>
              The grid pools entry years 2020 through 2025 — six completed
              cycles — so that individual squares hold enough people to mean
              something. Entry year 2026 is still in progress and is excluded
              from every rate. Squares with fewer than ten applicants show their
              count but no rate, because a rate built on three people is noise
              that reads like fact.
            </p>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
