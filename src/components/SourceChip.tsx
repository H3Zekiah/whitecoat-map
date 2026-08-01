/*
 * Per-fact provenance, visible to the reader (SRD §6, §7). Every displayed
 * figure gets one of these: where the number came from and when a human
 * last verified it.
 */
export function SourceChip({
  source,
  href,
  verifiedOn,
}: {
  source: string;
  href: string;
  verifiedOn: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-rule px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <span className="font-medium">{source}</span>
      <span aria-hidden="true">·</span>
      <span>
        verified <time dateTime={verifiedOn}>{verifiedOn}</time>
      </span>
    </a>
  );
}
