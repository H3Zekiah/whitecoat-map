import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/data", label: "The numbers" },
  { href: "/schools", label: "Schools" },
  { href: "/texas", label: "Texas rules" },
  { href: "/guides", label: "Guides" },
  { href: "/glossary", label: "Glossary" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Whitecoat Map
        </Link>
        <nav
          aria-label="Main"
          className="order-3 w-full sm:order-none sm:w-auto"
        >
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Reserved account slot (SRD §8): stays empty until v2. */}
          <span data-slot="account" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
}
