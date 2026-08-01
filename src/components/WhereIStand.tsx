"use client";

import { useState } from "react";
import {
  AcceptanceGrid,
  type GridPosition,
} from "@/components/charts/AcceptanceGrid";
import { gpaBandFor, mcatBandFor, type GridCell } from "@/lib/transforms";

/*
 * Where I Stand (SRD §4) — stateless position marking.
 *
 * Hard constraints, enforced here and asserted in tests:
 *   - no probability, no acceptance rate for the student's own band,
 *     no score, no verdict, no school recommendation;
 *   - nothing persisted (no storage, no cookies) and nothing sent
 *     anywhere: values live in component state and die on refresh.
 *
 * The rate/position exclusion is structural, not a matter of care:
 * passing a position to AcceptanceGrid switches it to the applicant
 * distribution, so there is no code path that renders a rate for the
 * marked cell.
 */

export function WhereIStand({ cells }: { cells: GridCell[] }) {
  const [gpa, setGpa] = useState("");
  const [mcat, setMcat] = useState("");

  const gpaBand = gpa.trim() === "" ? null : gpaBandFor(Number(gpa));
  const mcatBand = mcat.trim() === "" ? null : mcatBandFor(Number(mcat));
  const position: GridPosition | null =
    gpaBand && mcatBand ? { gpaBand, mcatBand } : null;

  const gpaInvalid = gpa.trim() !== "" && gpaBand === null;
  const mcatInvalid = mcat.trim() !== "" && mcatBand === null;

  return (
    <section className="rounded-lg border border-rule p-5">
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Where I stand
      </h2>
      <p className="mt-2 max-w-prose text-muted">
        Enter your numbers to see where you sit among Texas applicants. This
        marks your position on the map. It is not a prediction, and it is not a
        judgment about whether to apply — no tool can tell you that, and anyone
        who says otherwise is guessing.
      </p>

      <form
        className="mt-4 flex flex-wrap items-end gap-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <label htmlFor="wis-gpa" className="block text-sm font-medium">
            Overall GPA
          </label>
          <input
            id="wis-gpa"
            name="gpa"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="3.60"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            aria-invalid={gpaInvalid}
            aria-describedby={gpaInvalid ? "wis-gpa-error" : undefined}
            className="mt-1 w-28 rounded-md border border-rule bg-surface px-3 py-2 text-sm"
          />
          {gpaInvalid ? (
            <p id="wis-gpa-error" className="mt-1 text-xs text-warn">
              Enter a GPA between 0 and 4.
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="wis-mcat" className="block text-sm font-medium">
            MCAT total
          </label>
          <input
            id="wis-mcat"
            name="mcat"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="508"
            value={mcat}
            onChange={(e) => setMcat(e.target.value)}
            aria-invalid={mcatInvalid}
            aria-describedby={mcatInvalid ? "wis-mcat-error" : undefined}
            className="mt-1 w-28 rounded-md border border-rule bg-surface px-3 py-2 text-sm"
          />
          {mcatInvalid ? (
            <p id="wis-mcat-error" className="mt-1 text-xs text-warn">
              Enter an MCAT total between 472 and 528.
            </p>
          ) : null}
        </div>

        {position ? (
          <button
            type="button"
            onClick={() => {
              setGpa("");
              setMcat("");
            }}
            className="rounded-md border border-rule px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Clear
          </button>
        ) : null}
      </form>

      <p className="mt-3 text-xs text-faint">
        Nothing you type here is saved or sent anywhere. It disappears when you
        reload the page.
      </p>

      <div className="mt-6">
        <AcceptanceGrid
          cells={cells}
          position={position}
          caption={
            position
              ? "Where Texas applicants land, entry years 2020–2025 pooled. Your position is outlined."
              : "Acceptance rate by GPA and MCAT, entry years 2020–2025 pooled."
          }
        />
      </div>

      {position ? (
        <p className="mt-4 max-w-prose text-sm text-muted">
          Your square is outlined above. While a position is marked, this grid
          shows <strong>how many people applied</strong> in each square rather
          than acceptance rates — because a rate attached to your own square
          would read like a prediction about you, and it is not one. Clear your
          numbers to see the rate view again.
        </p>
      ) : null}
    </section>
  );
}
