import { PageShell } from "@/components/PageShell";

export default function Home() {
  return (
    <PageShell>
      <div className="flex flex-col items-start justify-center gap-6 py-24">
        <h1 className="font-display max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl">
          The hidden curriculum, written down.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Everything you need to know to get into medical school in Texas — the
          data drawn out where you can see it, and guides that say what it
          means. Free. No accounts, no upsell.
        </p>
        <p className="text-sm tracking-widest text-faint uppercase">
          In development
        </p>
      </div>
    </PageShell>
  );
}
