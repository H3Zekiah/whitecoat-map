"use client";

import { useMemo, useState } from "react";
import {
  GPA_BANDS,
  MCAT_BANDS,
  rampIndex,
  type GridCell,
  type GpaBandId,
  type McatBandId,
} from "@/lib/transforms";

/*
 * The acceptance landscape grid, and the place where this project's
 * central constraint lives (SRD §4).
 *
 * The grid may show acceptance rates for the applicant pool at large —
 * that is public aggregate data and the reason the page exists. What it
 * must never do is hand a student a number attached to their own
 * profile. So position marking and rate display are mutually exclusive
 * by construction: setting a position switches the grid to the applicant
 * *distribution* ("where people land"), and no code path renders a rate
 * for the marked cell. That is enforced by the `measure` prop being
 * derived, not chosen, and asserted in tests.
 */

const SEQ = [
  "var(--seq-1)",
  "var(--seq-2)",
  "var(--seq-3)",
  "var(--seq-4)",
  "var(--seq-5)",
  "var(--seq-6)",
];

export interface GridPosition {
  gpaBand: GpaBandId;
  mcatBand: McatBandId;
}

/*
 * Cells carry no printed number. Two reasons: a value on every mark is
 * noise (project visualization standards), and the midtone step of each
 * ramp cannot hold a label at 4.5:1 against either ink — measured, not
 * guessed. Magnitude reads from colour; exact values come from the
 * hover/focus readout, the per-cell accessible label, and the table
 * view below, which is also what a visitor without JavaScript gets.
 */

export function AcceptanceGrid({
  cells,
  position = null,
  caption,
}: {
  cells: GridCell[];
  position?: GridPosition | null;
  caption?: string;
}) {
  const [hover, setHover] = useState<GridCell | null>(null);

  /* Derived, never chosen: a marked position forces the distribution view. */
  const measure: "rate" | "applicants" = position ? "applicants" : "rate";

  const byKey = useMemo(() => {
    const m = new Map<string, GridCell>();
    for (const c of cells) m.set(`${c.gpaBand}|${c.mcatBand}`, c);
    return m;
  }, [cells]);

  const maxApplicants = useMemo(
    () => Math.max(...cells.map((c) => c.applicants), 0),
    [cells],
  );

  const mcatRows = [...MCAT_BANDS].reverse();

  function fillFor(cell: GridCell | undefined): string {
    if (!cell || cell.applicants === 0) return "var(--rule)";
    if (measure === "applicants") {
      return SEQ[rampIndex(cell.applicants, maxApplicants, "sqrt")];
    }
    if (cell.rate === null) return "var(--rule)";
    return SEQ[rampIndex(cell.rate, 1)];
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-[2px] text-xs">
          {caption ? (
            <caption className="mb-2 text-left text-xs text-muted">
              {caption}
            </caption>
          ) : null}
          <thead>
            <tr>
              <th className="p-1 text-left font-normal text-faint">
                MCAT \ GPA
              </th>
              {GPA_BANDS.map((g) => (
                <th
                  key={g.id}
                  scope="col"
                  className="p-1 text-center font-medium text-muted"
                >
                  {g.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mcatRows.map((m) => (
              <tr key={m.id}>
                <th
                  scope="row"
                  className="p-1 text-right font-medium whitespace-nowrap text-muted"
                >
                  {m.label}
                </th>
                {GPA_BANDS.map((g) => {
                  const cell = byKey.get(`${g.id}|${m.id}`);
                  const marked =
                    position?.gpaBand === g.id && position?.mcatBand === m.id;
                  const label = cell
                    ? measure === "applicants"
                      ? `${cell.applicants.toLocaleString("en-US")} applicants`
                      : cell.rate === null
                        ? "too few applicants to show a rate"
                        : `${Math.round(cell.rate * 100)}% accepted`
                    : "no applicants recorded";
                  return (
                    <td key={g.id} className="p-0">
                      <div
                        tabIndex={cell ? 0 : -1}
                        role="img"
                        aria-label={`GPA ${g.label}, MCAT ${m.label}: ${label}`}
                        onMouseEnter={() => cell && setHover(cell)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => cell && setHover(cell)}
                        onBlur={() => setHover(null)}
                        className="relative flex h-9 items-center justify-center rounded-[3px]"
                        style={{ background: fillFor(cell) }}
                      >
                        {marked ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-[3px] ring-2 ring-ink"
                          />
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="text-faint">
            {measure === "rate" ? "Lower rate" : "Fewer applicants"}
          </span>
          {SEQ.map((c) => (
            <span
              key={c}
              className="h-3 w-5 rounded-[2px]"
              style={{ background: c }}
            />
          ))}
          <span className="text-faint">
            {measure === "rate" ? "Higher rate" : "More applicants"}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-3 w-5 rounded-[2px]"
            style={{ background: "var(--rule)" }}
          />
          <span className="text-faint">
            too few applicants to show a rate, or none recorded
          </span>
        </span>
      </div>

      <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-sm">
        {hover ? (
          <span>
            <span className="font-medium">
              GPA {GPA_BANDS.find((g) => g.id === hover.gpaBand)?.label}, MCAT{" "}
              {MCAT_BANDS.find((m) => m.id === hover.mcatBand)?.label}
            </span>
            <span className="text-muted">
              {" — "}
              {hover.applicants.toLocaleString("en-US")} applicants
              {measure === "rate"
                ? hover.rate === null
                  ? ", too few to show a rate"
                  : `, ${Math.round(hover.rate * 100)}% accepted`
                : ""}
            </span>
          </span>
        ) : null}
      </p>

      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-muted hover:text-accent">
          View as table
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-sm [&_td]:border-b [&_td]:border-rule [&_td]:px-3 [&_td]:py-1.5 [&_th]:border-b [&_th]:border-ink/30 [&_th]:px-3 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold">
            <thead>
              <tr>
                <th scope="col">GPA</th>
                <th scope="col">MCAT</th>
                <th scope="col">Applicants</th>
                {measure === "rate" ? <th scope="col">Accepted</th> : null}
              </tr>
            </thead>
            <tbody>
              {cells
                .slice()
                .sort(
                  (a, b) =>
                    GPA_BANDS.findIndex((g) => g.id === a.gpaBand) -
                      GPA_BANDS.findIndex((g) => g.id === b.gpaBand) ||
                    MCAT_BANDS.findIndex((m) => m.id === a.mcatBand) -
                      MCAT_BANDS.findIndex((m) => m.id === b.mcatBand),
                )
                .map((c) => (
                  <tr key={`${c.gpaBand}|${c.mcatBand}`}>
                    <td>{GPA_BANDS.find((g) => g.id === c.gpaBand)?.label}</td>
                    <td>
                      {MCAT_BANDS.find((m) => m.id === c.mcatBand)?.label}
                    </td>
                    <td className="tabular-nums">
                      {c.applicants.toLocaleString("en-US")}
                    </td>
                    {measure === "rate" ? (
                      <td className="tabular-nums">
                        {c.rate === null
                          ? "too few to show"
                          : `${Math.round(c.rate * 100)}%`}
                      </td>
                    ) : null}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
