import { SourceChip } from "../SourceChip";

/*
 * Chart accessibility contract (SRD §10): the SVG is presentation; the
 * data table is the accessible equivalent and the no-JavaScript path.
 * Screen readers get the figure label and the real table; the SVG is
 * hidden from the accessibility tree.
 *
 * Because the visual is aria-hidden, nothing inside it may be focusable —
 * a keyboard user must never land on a control that assistive technology
 * cannot see. Charts rendered here therefore expose hover affordances
 * only, and the table (reachable by keyboard) carries every value.
 */
export function ChartFigure({
  title,
  description,
  source,
  tableCaption,
  tableHead,
  tableRows,
  children,
}: {
  title: string;
  description?: string;
  source?: { name: string; href: string; verifiedOn: string };
  tableCaption: string;
  tableHead: string[];
  tableRows: Array<Array<string | number>>;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-8">
      <figcaption>
        <p className="font-display text-lg font-semibold">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </figcaption>

      <div aria-hidden="true" className="mt-4">
        {children}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-muted hover:text-accent">
          View as table
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-sm [&_caption]:mb-2 [&_caption]:text-left [&_caption]:text-xs [&_caption]:text-muted [&_th]:border-b [&_th]:border-ink/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border-b [&_td]:border-rule [&_td]:px-3 [&_td]:py-2">
            <caption>{tableCaption}</caption>
            <thead>
              <tr>
                {tableHead.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {source ? (
        <div className="mt-3">
          <SourceChip
            source={source.name}
            href={source.href}
            verifiedOn={source.verifiedOn}
          />
        </div>
      ) : null}
    </figure>
  );
}
