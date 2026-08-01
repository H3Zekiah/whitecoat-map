"use client";

import { useState } from "react";
import type { FunnelStage } from "@/lib/transforms";

/*
 * Stage-by-stage cohort flow. The interpretive job matters as much as
 * the geometry (SRD §4): this exists to show what the process is, not to
 * intimidate. Bars are anchored left and labelled with counts, so the
 * dropoff reads as structure rather than as a verdict.
 */
export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = (s.count / max) * 100;
        return (
          <div
            key={s.stage}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3"
          >
            <span className="text-sm font-medium">{s.stage}</span>
            <span className="h-7 overflow-hidden rounded-r-[4px] bg-rule/40">
              <span
                className="block h-full rounded-r-[4px] transition-[opacity]"
                style={{
                  width: `${pct}%`,
                  background: "var(--chart-1)",
                  opacity: active === null || active === i ? 1 : 0.5,
                }}
              />
            </span>
            <span className="text-right text-sm tabular-nums">
              <span className="font-medium">
                {s.count.toLocaleString("en-US")}
              </span>
              <span className="ml-2 text-muted">
                {Math.round(s.shareOfApplicants * 100)}%
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
