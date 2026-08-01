import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Prose } from "@/components/Prose";
import { loadManifest } from "@/lib/data";

export const metadata: Metadata = {
  title: "How this site works",
  description:
    "The sourcing standard behind every figure on Whitecoat Map: where data comes from, how it is verified, what gets withheld, and why the site never predicts your chances.",
  alternates: { canonical: "/method" },
};

export default function MethodPage() {
  const sources = loadManifest();

  return (
    <PageShell>
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          How this site works
        </h1>
        <p className="mt-3 text-lg text-muted">
          Published openly so anyone can check our work — including the parts
          where we chose to show less.
        </p>

        <Prose>
          <h2>The sourcing rule</h2>
          <p>
            No factual claim about requirements, deadlines, costs, or statistics
            appears here without a source link and a date on which a human
            checked it. Where you see a source chip, that is what it means.
          </p>
          <p>
            Sources are primary: the school&apos;s own pages, TMDSAS, AAMC,
            AACOM, JAMP, or state statute. Secondary sources may be read for
            leads but are never cited as authority. This is not pedantry — while
            building these pages, several confident third-party claims turned
            out to be absent from the official page they cited, and were dropped
            rather than published.
          </p>

          <h2>Archived snapshots</h2>
          <p>
            Every source document is downloaded and stored in the public
            repository with its retrieval date and a content hash. If a school
            silently changes its class profile page next year, the figure shown
            here remains traceable to the exact document it came from, and our
            tooling reports that the source changed.
          </p>

          <h2>What gets withheld</h2>
          <ul>
            <li>
              <strong>Unverified figures do not render.</strong> A number that
              has been extracted but not checked by a person is structurally
              incapable of displaying. Pages show an honest placeholder instead.
            </li>
            <li>
              <strong>Unpublished figures say so.</strong> When a school does
              not publish something, the page says that and why, rather than
              leaving a blank or substituting someone else&apos;s estimate.
            </li>
            <li>
              <strong>Small samples show no rate.</strong> Any square of the
              acceptance grid with fewer than ten applicants shows its count but
              no percentage. A rate built on three people reads like fact and is
              noise.
            </li>
          </ul>

          <h2>Why there is no chance calculator</h2>
          <p>
            The site marks where you stand in the data and stops there. It
            displays no probability, no acceptance rate for your own band, no
            score, and no verdict about whether to apply.
          </p>
          <p>
            The reason is specific to who this site is for. A student with an
            advisor can put a predicted number in context. A student without one
            cannot tell a shallow model from a good one, and a number attached
            to their own profile reads as a judgment on whether they should
            continue. That is a harm this project will not risk for the sake of
            an engaging feature. In the <Link href="/data">Where I stand</Link>{" "}
            tool, marking your position switches the grid to showing where
            applicants land rather than acceptance rates, and that behaviour is
            enforced by automated tests.
          </p>

          <h2>No AI-written content</h2>
          <p>
            Nothing on this site is model-generated text presented to you as
            fact. AI assists with drafting and with extracting figures from
            source documents; a human checks every figure against the source
            before it publishes. A hallucinated deadline would harm exactly the
            reader who cannot catch the error.
          </p>

          <h2>Freshness</h2>
          <p>
            Admissions data is annual. Every page carries the date its facts
            were verified, and a page whose verification is more than a year old
            displays a visible warning rather than quietly showing stale
            numbers.
          </p>

          <h2>Every source, listed</h2>
          <p>
            These {sources.length} documents are the complete basis for the
            figures on this site.
          </p>
        </Prose>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm [&_td]:border-b [&_td]:border-rule [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:border-b [&_th]:border-ink/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold">
            <thead>
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Publisher</th>
                <th scope="col">What it provides</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline decoration-accent/40 underline-offset-2"
                    >
                      {s.name}
                    </a>
                  </td>
                  <td className="text-muted">{s.publisher}</td>
                  <td className="text-muted">{s.provides}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}
