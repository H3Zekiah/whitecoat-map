/*
 * Client for the public Power BI "querydata" API behind the TMDSAS stats
 * dashboard (https://www.tmdsas.com/stats-dashboard/medical-report.html).
 *
 * The dashboard is a "publish to web" embed: its backing dataset accepts
 * unauthenticated queries carrying the public resource key from the embed
 * URL. We request pre-aggregated counts only — never row-level data.
 *
 * Protocol knowledge (endpoint shape, model coordinates, dsr encoding)
 * follows the open methodology of 7hacker/tmdsas-admissions-data (MIT),
 * which this project credits in docs/SOURCES.md and cross-checks against.
 */

export const POWERBI_HOST =
  "https://wabi-us-north-central-h-primary-api.analysis.windows.net";
export const QUERY_URL = `${POWERBI_HOST}/public/reports/querydata?synchronous=true`;

/* Verified model coordinates for the TMDSAS medical report. */
export const TMDSAS_MODEL = {
  /* Last known public resource key; the extractor tries to refresh this
     from the live embed page and falls back to this value. */
  resourceKey: "4912d801-7866-42c4-b99d-f5a08c3593ef",
  datasetId: "35ace578-cc42-4994-8718-91c2ad896b8f",
  reportId: "821982",
  modelId: 821982,
  entity: "Sheet1",
  countMeasure: "Count of Total Number of Applicants",
} as const;

/* Column property names on the model's single table. */
export const COLS = {
  entryYear: "EntryYear",
  isInterviewed: "IsInterviewed",
  isAccepted: "IsAccepted",
  isMatriculated: "IsMatriculated",
  residency: "Residency",
  gpaBins: "Overall GPA (bins)",
  mcatBins: "MCAT B (MATRIX bins)",
} as const;

/* Dictionary labels that mean an outcome flag is true. Everything else
   (typically "no") means false. */
export const TRUE_LABELS: Record<string, string[]> = {
  [COLS.isInterviewed]: ["Interviewed"],
  [COLS.isAccepted]: ["Accepted", "Yes"],
  [COLS.isMatriculated]: ["Matriculated"],
};

interface ColumnRef {
  Expression: { SourceRef: { Source: string } };
  Property: string;
}

function col(prop: string): ColumnRef {
  return { Expression: { SourceRef: { Source: "s" } }, Property: prop };
}

export function buildGroupedCountQuery(groupProps: string[]): object {
  const select: object[] = groupProps.map((prop) => ({
    Column: col(prop),
    Name: prop,
  }));
  select.push({ Measure: col(TMDSAS_MODEL.countMeasure), Name: "Cnt" });

  return {
    version: "1.0.0",
    queries: [
      {
        Query: {
          Commands: [
            {
              SemanticQueryDataShapeCommand: {
                Query: {
                  Version: 2,
                  From: [{ Name: "s", Entity: TMDSAS_MODEL.entity, Type: 0 }],
                  Select: select,
                  OrderBy: [
                    {
                      Direction: 1,
                      Expression: { Column: col(groupProps[0]) },
                    },
                  ],
                },
                Binding: {
                  Primary: {
                    Groupings: [{ Projections: select.map((_, i) => i) }],
                  },
                  DataReduction: {
                    DataVolume: 3,
                    Primary: { Window: { Count: 30000 } },
                  },
                  Version: 1,
                },
              },
            },
          ],
        },
        QueryId: "",
        ApplicationContext: {
          DatasetId: TMDSAS_MODEL.datasetId,
          Sources: [{ ReportId: TMDSAS_MODEL.reportId }],
        },
      },
    ],
    cancelQueries: [],
    modelId: TMDSAS_MODEL.modelId,
  };
}

/* ---------- dsr decoding ---------- */

interface DsrResponse {
  results: Array<{
    result: {
      data: {
        descriptor: { Select: Array<{ Name: string }> };
        dsr: {
          DS: Array<{
            ValueDicts?: Record<string, string[]>;
            PH: Array<{ DM0: Array<Record<string, unknown>> }>;
          }>;
        };
      };
    };
  }>;
}

export type Cell = string | number | null;

/*
 * Decode Power BI's compact "data shape result" into full, column-aligned
 * rows. Three layers of compression are undone:
 *  - type header `S` on the first row (carries per-column dictionary names
 *    as `DN`);
 *  - run-length bitmask `R`: bit n set means column n repeats the previous
 *    row's value and is omitted from `C`;
 *  - null bitmask `Ø`: bit n set means column n is null (also omitted).
 * Dictionary-encoded string cells (integer indices) are resolved through
 * ValueDicts.
 */
export function decodeDsr(response: DsrResponse): {
  rows: Cell[][];
  columns: string[];
} {
  const data = response.results[0].result.data;
  const columns = data.descriptor.Select.map((c) => c.Name);
  const ds = data.dsr.DS[0];
  const valueDicts = ds.ValueDicts ?? {};
  const dm0 = ds.PH[0].DM0;
  const nCols = columns.length;

  const colDictName: (string | null)[] = new Array(nCols).fill(null);
  const rows: Cell[][] = [];
  let prev: Cell[] = new Array(nCols).fill(null);

  for (const raw of dm0) {
    if ("S" in raw) {
      const header = raw.S as Array<{ DN?: string }>;
      header.forEach((entry, i) => {
        if (i < nCols && entry.DN) colDictName[i] = entry.DN;
      });
    }

    const repeatMask = (raw.R as number | undefined) ?? 0;
    const nullMask = (raw["Ø"] as number | undefined) ?? 0;
    const cells = (raw.C as Cell[] | undefined) ?? [];

    const row: Cell[] = new Array(nCols).fill(null);
    let cellIdx = 0;
    for (let c = 0; c < nCols; c++) {
      if (repeatMask & (1 << c)) {
        row[c] = prev[c];
      } else if (nullMask & (1 << c)) {
        row[c] = null;
      } else {
        row[c] = cells[cellIdx++];
      }
    }
    rows.push(row);
    prev = row;
  }

  for (let c = 0; c < nCols; c++) {
    const dn = colDictName[c];
    if (dn && valueDicts[dn]) {
      const mapping = valueDicts[dn];
      for (const row of rows) {
        const v = row[c];
        if (
          typeof v === "number" &&
          Number.isInteger(v) &&
          v >= 0 &&
          v < mapping.length
        ) {
          row[c] = mapping[v];
        }
      }
    }
  }

  return { rows, columns };
}

/* ---------- aggregation helpers (pure, tested) ---------- */

/*
 * From decoded [year, flagLabel, count] rows: total applicants per year and
 * the subset where the flag is true.
 */
export function flagCountsByYear(
  rows: Cell[][],
  trueLabels: string[],
): { total: Map<number, number>; inGroup: Map<number, number> } {
  const total = new Map<number, number>();
  const inGroup = new Map<number, number>();
  for (const [year, label, count] of rows) {
    const y = Number(year);
    const n = Number(count);
    total.set(y, (total.get(y) ?? 0) + n);
    if (typeof label === "string" && trueLabels.includes(label)) {
      inGroup.set(y, (inGroup.get(y) ?? 0) + n);
    }
  }
  return { total, inGroup };
}
