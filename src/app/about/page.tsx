import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who made Whitecoat Map and why, what it is not, and the disclaimers that matter before you rely on anything here.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          About
        </h1>
        <Prose>
          <h2>Why this exists</h2>
          <p>
            Getting into medical school runs on information that never reaches
            most people. Some students have a parent, an advisor, or a friend
            who explains how it works. Others have good grades, real
            determination, and no idea that JAMP applications close in your
            sophomore year or that Texas has its own application on its own
            timeline.
          </p>
          <p>
            The gap is measurable. A 2024 study of California&apos;s public
            universities found pre-health advisor-to-graduate ratios of roughly
            one advisor per 24,620 students at public campuses, against one per
            1,794 at private institutions — and the authors name
            first-generation and underrepresented students as the most affected,
            precisely because they lack the informal networks that substitute
            for formal advising.
          </p>
          <p>
            This site is one attempt to write that missing information down, for
            Texas, and give it away.
          </p>

          <h2>Who made it</h2>
          <p>
            Whitecoat Map is a personal project by Hezekiah Lasater, a medical
            student at the Texas College of Osteopathic Medicine. It is not
            funded by anyone, sells nothing, and has no relationship with any
            school or admissions consultant.
          </p>

          <h2>What this is not</h2>
          <ul>
            <li>
              <strong>Not admissions advising.</strong> Nothing here is personal
              advice about your application. If you have access to a pre-health
              advisor, they know things this site cannot.
            </li>
            <li>
              <strong>Not official.</strong> Whitecoat Map is independent and is
              not affiliated with, endorsed by, or connected to the AAMC, AACOM,
              TMDSAS, the Texas Higher Education Coordinating Board, JAMP, or
              any medical school. Where those organisations are named, it is to
              identify the source of a fact.
            </li>
            <li>
              <strong>Not a prediction engine.</strong> The site shows where you
              stand in published data. It does not estimate anyone&apos;s
              likelihood of admission, and it never will — see{" "}
              <Link href="/method">how this site works</Link>.
            </li>
            <li>
              <strong>Not a substitute for the source.</strong> Requirements and
              deadlines change, sometimes mid-cycle. Always confirm with the
              school or program before you plan around anything.
            </li>
          </ul>

          <h2>Corrections</h2>
          <p>
            If you find something wrong, it matters — a bad deadline on this
            site could cost someone a year. Corrections are welcome through the{" "}
            <a
              href="https://github.com/H3Zekiah/whitecoat-map/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              project repository
            </a>
            , where the entire site, its data, and its sources are public.
          </p>

          <h2>Privacy</h2>
          <p>
            There are no accounts, no cookies, no advertising trackers, and
            nothing to sign up for. Anything you type into the &ldquo;Where I
            stand&rdquo; tool stays in your browser — it is never stored and
            never transmitted.
          </p>
        </Prose>
      </div>
    </PageShell>
  );
}
