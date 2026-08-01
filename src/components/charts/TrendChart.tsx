"use client";

import { max } from "d3-array";
import { scaleLinear, scalePoint } from "d3-scale";
import { useId, useState } from "react";
import type { TrendPoint } from "@/lib/transforms";

/*
 * Two series over entry year on one shared axis (both are counts of
 * people, so a single scale is honest — never a second y-axis).
 * Legend plus direct end-labels, so identity is never colour alone.
 */

const W = 660;
const H = 300;
const M = { top: 16, right: 96, bottom: 30, left: 52 };

const SERIES = [
  { key: "applicants" as const, label: "Applied", color: "var(--chart-1)" },
  {
    key: "matriculated" as const,
    label: "Started school",
    color: "var(--chart-2)",
  },
];

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const id = useId();

  const innerW = W - M.left - M.right;
  const innerH = H - M.top - M.bottom;

  const x = scalePoint<number>()
    .domain(points.map((p) => p.entryYear))
    .range([0, innerW]);
  const y = scaleLinear()
    .domain([0, (max(points, (p) => p.applicants) ?? 0) * 1.08])
    .nice()
    .range([innerH, 0]);

  const hovered = points.find((p) => p.entryYear === hoverYear) ?? null;

  return (
    <div>
      <div className="mb-2 flex gap-4 text-sm">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-muted">{s.label}</span>
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="presentation"
        focusable="false"
      >
        <g transform={`translate(${M.left},${M.top})`}>
          {y.ticks(4).map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line x1={0} x2={innerW} stroke="var(--rule)" />
              <text
                x={-8}
                dy="0.32em"
                textAnchor="end"
                fontSize={11}
                fill="var(--faint-ink)"
              >
                {t.toLocaleString("en-US")}
              </text>
            </g>
          ))}

          {SERIES.map((s) => {
            const d = points
              .map(
                (p, i) =>
                  `${i === 0 ? "M" : "L"} ${x(p.entryYear)} ${y(p[s.key])}`,
              )
              .join(" ");
            const last = points.at(-1);
            return (
              <g key={s.key}>
                <path d={d} fill="none" stroke={s.color} strokeWidth={2} />
                {points.map((p) => (
                  <circle
                    key={p.entryYear}
                    cx={x(p.entryYear)}
                    cy={y(p[s.key])}
                    r={hoverYear === p.entryYear ? 5 : 3.5}
                    fill={s.color}
                    stroke="var(--paper)"
                    strokeWidth={2}
                  />
                ))}
                {last ? (
                  <text
                    x={(x(last.entryYear) ?? 0) + 10}
                    y={y(last[s.key])}
                    dy="0.32em"
                    fontSize={11}
                    fill="var(--muted-ink)"
                  >
                    {s.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {points.map((p) => (
            <g key={p.entryYear}>
              <text
                x={x(p.entryYear)}
                y={innerH + 18}
                textAnchor="middle"
                fontSize={11}
                fill="var(--muted-ink)"
              >
                {p.entryYear}
              </text>
              <rect
                x={(x(p.entryYear) ?? 0) - innerW / (points.length * 2)}
                y={0}
                width={innerW / points.length}
                height={innerH}
                fill="transparent"
                aria-hidden="true"
                onMouseEnter={() => setHoverYear(p.entryYear)}
                onMouseLeave={() => setHoverYear(null)}
              />
            </g>
          ))}
        </g>
      </svg>

      <p id={id} aria-live="polite" className="min-h-[1.25rem] text-sm">
        {hovered ? (
          <>
            <span className="font-medium">Entry year {hovered.entryYear}</span>
            <span className="text-muted">
              {" — "}
              {hovered.applicants.toLocaleString("en-US")} applied,{" "}
              {hovered.matriculated.toLocaleString("en-US")} started school
            </span>
          </>
        ) : null}
      </p>
    </div>
  );
}
