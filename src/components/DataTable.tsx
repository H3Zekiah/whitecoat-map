/*
 * Editorial table styling with horizontal scroll containment: wide tables
 * scroll inside this wrapper, never the page (SRD §10).
 */
export function DataTable({
  caption,
  children,
}: {
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm [&_caption]:mb-2 [&_caption]:text-left [&_caption]:text-xs [&_caption]:text-muted [&_th]:border-b [&_th]:border-ink/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border-b [&_td]:border-rule [&_td]:px-3 [&_td]:py-2">
        {caption ? <caption>{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}
