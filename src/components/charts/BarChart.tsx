"use client";

import { max } from "d3-array";
import { scaleBand, scaleLinear } from "d3-scale";
import { useId, useState } from "react";

/*
 * Reference bar chart (Step 3.1): d3 scales, bespoke SVG. Mark spec per
 * project visualization standards — thin marks with 4px rounded data-ends
 * anchored to the baseline, recessive grid, muted text tokens for labels,
 * tooltip on hover and keyboard focus. Colors come from the theme's
 * validated chart tokens.
 */

const W = 640;
const H = 300;
const MARGIN = { top: 16, right: 8, bottom: 28, left: 44 };
const MAX_BAR = 48;

function roundedTopBar(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  const rr = Math.min(r, w / 2, h);
  return [
    `M ${x} ${y + h}`,
    `V ${y + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x + w} ${y + rr}`,
    `V ${y + h}`,
    "Z",
  ].join(" ");
}

export interface BarDatum {
  label: string;
  value: number;
}

export function BarChart({
  data,
  formatValue = (v) => v.toLocaleString("en-US"),
  color = "var(--chart-1)",
}: {
  data: BarDatum[];
  formatValue?: (v: number) => string;
  color?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const id = useId();

  const innerW = W - MARGIN.left - MARGIN.right;
  const innerH = H - MARGIN.top - MARGIN.bottom;

  const x = scaleBand<string>()
    .domain(data.map((d) => d.label))
    .range([0, innerW])
    .paddingInner(0.25)
    .paddingOuter(0.1);
  const y = scaleLinear()
    .domain([0, (max(data, (d) => d.value) ?? 0) * 1.05])
    .nice()
    .range([innerH, 0]);

  const band = Math.min(x.bandwidth(), MAX_BAR);
  const ticks = y.ticks(4);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="presentation"
        focusable="false"
      >
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {ticks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`}>
              <line
                x1={0}
                x2={innerW}
                stroke="var(--rule)"
                strokeWidth={t === 0 ? 0 : 1}
              />
              <text
                x={-8}
                dy="0.32em"
                textAnchor="end"
                fontSize={11}
                fill="var(--faint-ink)"
              >
                {formatValue(t)}
              </text>
            </g>
          ))}
          <line
            y1={innerH}
            y2={innerH}
            x1={0}
            x2={innerW}
            stroke="var(--muted-ink)"
            strokeWidth={1}
          />

          {data.map((d, i) => {
            const bx = (x(d.label) ?? 0) + (x.bandwidth() - band) / 2;
            const by = y(d.value);
            const isActive = active === i;
            return (
              <g key={d.label}>
                <path
                  d={roundedTopBar(bx, by, band, innerH - by, 4)}
                  fill={color}
                  opacity={active === null || isActive ? 1 : 0.45}
                />
                {/* Oversized hover target. Deliberately not focusable: the
                    chart sits inside an aria-hidden figure whose accessible
                    equivalent is the table, and a focusable control inside
                    aria-hidden content is a trap for keyboard users. */}
                <rect
                  x={(x(d.label) ?? 0) - (x.step() - x.bandwidth()) / 2}
                  y={0}
                  width={x.step()}
                  height={innerH}
                  fill="transparent"
                  aria-hidden="true"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                />
                <text
                  x={bx + band / 2}
                  y={innerH + 18}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--muted-ink)"
                >
                  {d.label}
                </text>
                {isActive ? (
                  <text
                    x={bx + band / 2}
                    y={by - 8}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill="var(--ink)"
                  >
                    {formatValue(d.value)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>

      {active !== null ? (
        <div
          id={`${id}-tip`}
          role="status"
          className="pointer-events-none absolute rounded-md border border-rule bg-surface px-3 py-1.5 text-xs shadow-sm"
          style={{
            left: `${(((x(data[active].label) ?? 0) + x.bandwidth() / 2 + MARGIN.left) / W) * 100}%`,
            top: 0,
            transform: "translateX(-50%)",
          }}
        >
          <span className="font-medium">{data[active].label}</span>
          <span className="text-muted">
            {" "}
            · {formatValue(data[active].value)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
