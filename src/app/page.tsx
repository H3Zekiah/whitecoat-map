import Link from "next/link";
import { PageShell } from "@/components/PageShell";

const ENTRY_POINTS = [
  {
    href: "/data",
    title: "The Texas numbers",
    body: "How many people apply, how many get in, and where applicants actually land. Public data that is genuinely hard to read, drawn out.",
  },
  {
    href: "/schools",
    title: "Every Texas medical school",
    body: "MD and DO, which application each takes, and exactly what each school publishes about its entering class.",
  },
  {
    href: "/texas/residency",
    title: "Texas residency",
    body: "At least nine of every ten seats at public Texas medical schools go to Texas residents. Here is how residency actually works.",
  },
];

export default function Home() {
  return (
    <PageShell>
      <div className="py-16">
        <h1 className="font-display max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
          The hidden curriculum, written down.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">
          Getting into medical school runs on information that never reaches
          most people — deadlines, programs, and rules that everyone seems to
          know except you. This is that information, for Texas, in one place,
          free, with a source on every number.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ENTRY_POINTS.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group rounded-lg border border-rule p-5 transition-colors hover:border-accent"
            >
              <h2 className="font-display text-xl font-semibold group-hover:text-accent">
                {e.title}
              </h2>
              <p className="mt-2 text-sm text-muted">{e.body}</p>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-sm tracking-widest text-faint uppercase">
          In development
        </p>
      </div>
    </PageShell>
  );
}
