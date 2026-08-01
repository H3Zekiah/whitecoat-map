import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/method", label: "How this site works" },
  {
    href: "https://github.com/H3Zekiah/whitecoat-map",
    label: "Source and data",
    external: true,
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule">
      <div className="mx-auto max-w-5xl space-y-4 px-6 py-8 text-sm text-muted">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            {FOOTER_LINKS.map((l) =>
              l.external ? (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent"
                  >
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
        <p>
          Whitecoat Map is an independent, free resource. It is not affiliated
          with, endorsed by, or connected to the AAMC, AACOM, TMDSAS, or any
          school. It is informational only, not admissions advising — always
          verify requirements with the school directly.
        </p>
        <p className="text-faint">
          Every figure on this site carries a source and a verified-on date.
        </p>
      </div>
    </footer>
  );
}
