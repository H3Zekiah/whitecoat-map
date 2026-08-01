/*
 * Shown when a figure is past its staleness threshold (SRD §6): stale data
 * is flagged loudly rather than silently displayed.
 */
export function StalenessNotice({
  lastVerified,
  sourceHref,
}: {
  lastVerified: string;
  sourceHref: string;
}) {
  return (
    <div
      role="status"
      className="my-4 rounded-r-md border-l-2 border-warn bg-warn-soft p-3 text-sm"
    >
      <span className="font-semibold text-warn">May be out of date. </span>
      This was last verified on{" "}
      <time dateTime={lastVerified}>{lastVerified}</time> and the source may
      have changed since.{" "}
      <a
        href={sourceHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline decoration-accent/40 underline-offset-2"
      >
        Verify at the source
      </a>
      .
    </div>
  );
}
