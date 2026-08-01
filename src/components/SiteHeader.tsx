import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Whitecoat Map
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Reserved account slot (SRD §8): stays empty until v2. */}
          <span data-slot="account" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
