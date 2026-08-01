import { verifiedValue, type ProvenancedField } from "@/lib/data";

/*
 * Per-school figures (SRD §4, Module A.3). Three outcomes, all honest:
 * a verified value renders; an explicitly unavailable field says so and
 * why; anything unverified renders as not-yet-checked. A blank is never
 * shown, because a blank invites the reader to assume.
 */

function Fact({
  label,
  field,
  format = (v) => String(v),
}: {
  label: string;
  field: ProvenancedField<number>;
  format?: (v: number) => string;
}) {
  const value = verifiedValue(field);
  const unavailable = "unavailable" in field;

  return (
    <div className="border-b border-rule py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5">
        {value !== null ? (
          <span className="font-display text-2xl font-semibold tabular-nums">
            {format(value)}
          </span>
        ) : (
          <span className="text-sm text-faint">
            {unavailable
              ? `Not published — ${(field as { reason: string }).reason}`
              : "Recorded but not yet verified, so it is not shown."}
          </span>
        )}
      </dd>
    </div>
  );
}

export function SchoolFacts({
  classSize,
  gpaAverage,
  mcatAverage,
  gpaRange,
  mcatRange,
  inStatePercent,
}: {
  classSize: ProvenancedField<number>;
  gpaAverage: ProvenancedField<number>;
  mcatAverage: ProvenancedField<number>;
  gpaRange: ProvenancedField<{ low: number; high: number }>;
  mcatRange: ProvenancedField<{ low: number; high: number }>;
  inStatePercent: ProvenancedField<number>;
}) {
  const ranges: Array<
    [string, ProvenancedField<{ low: number; high: number }>]
  > = [
    ["GPA range", gpaRange],
    ["MCAT range", mcatRange],
  ];

  return (
    <dl className="mt-6">
      <Fact
        label="Entering class size"
        field={classSize}
        format={(v) => v.toLocaleString("en-US")}
      />
      <Fact
        label="Average GPA"
        field={gpaAverage}
        format={(v) => v.toFixed(2)}
      />
      <Fact
        label="Average MCAT"
        field={mcatAverage}
        format={(v) => String(Math.round(v))}
      />
      {ranges.map(([label, field]) => {
        const value = verifiedValue(field);
        const unavailable = "unavailable" in field;
        return (
          <div key={label} className="border-b border-rule py-3">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="mt-0.5">
              {value ? (
                <span className="font-display text-2xl font-semibold tabular-nums">
                  {value.low}–{value.high}
                </span>
              ) : (
                <span className="text-sm text-faint">
                  {unavailable
                    ? `Not published — ${(field as { reason: string }).reason}`
                    : "Recorded but not yet verified, so it is not shown."}
                </span>
              )}
            </dd>
          </div>
        );
      })}
      <Fact
        label="Share of class from Texas"
        field={inStatePercent}
        format={(v) => `${Math.round(v)}%`}
      />
    </dl>
  );
}
