import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildGroupedCountQuery,
  decodeDsr,
  flagCountsByYear,
} from "../src/lib/powerbi.ts";

/*
 * Golden-output test for the dsr decoder: a synthetic response exercising
 * every compression layer — type header with dictionary name, run-length
 * repeat mask, null mask, and dictionary-encoded strings.
 */

const syntheticResponse = {
  results: [
    {
      result: {
        data: {
          descriptor: {
            Select: [{ Name: "EntryYear" }, { Name: "Flag" }, { Name: "Cnt" }],
          },
          dsr: {
            DS: [
              {
                ValueDicts: { D0: ["no", "Interviewed"] },
                PH: [
                  {
                    DM0: [
                      /* full row; S header maps column 1 to dict D0 */
                      {
                        S: [{}, { DN: "D0" }, {}],
                        C: [2020, 0, 3566],
                      },
                      /* R=1: EntryYear repeats; C has flag idx + count */
                      { R: 1, C: [1, 4217] },
                      /* new year, flag null (Ø=2), C has year + count */
                      { Ø: 2, C: [2021, 4516] },
                      /* R=1 repeats year 2021; C has flag + count */
                      { R: 1, C: [1, 4966] },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  ],
};

test("decodeDsr undoes repeat masks, null masks, and dictionaries (golden)", () => {
  const { rows, columns } = decodeDsr(syntheticResponse);
  assert.deepEqual(columns, ["EntryYear", "Flag", "Cnt"]);
  assert.deepEqual(rows, [
    [2020, "no", 3566],
    [2020, "Interviewed", 4217],
    [2021, null, 4516],
    [2021, "Interviewed", 4966],
  ]);
});

test("flagCountsByYear totals all labels and isolates true labels", () => {
  const { rows } = decodeDsr(syntheticResponse);
  const { total, inGroup } = flagCountsByYear(rows, ["Interviewed"]);
  assert.equal(total.get(2020), 3566 + 4217);
  assert.equal(inGroup.get(2020), 4217);
  assert.equal(total.get(2021), 4516 + 4966);
  assert.equal(inGroup.get(2021), 4966);
});

test("grouped-count query shape carries model coordinates and projections", () => {
  const q = buildGroupedCountQuery(["EntryYear", "IsAccepted"]) as {
    modelId: number;
    queries: Array<{
      ApplicationContext: { DatasetId: string };
      Query: {
        Commands: Array<{
          SemanticQueryDataShapeCommand: {
            Query: { Select: Array<{ Name: string }> };
            Binding: {
              Primary: { Groupings: Array<{ Projections: number[] }> };
            };
          };
        }>;
      };
    }>;
  };
  assert.equal(q.modelId, 821982);
  const cmd = q.queries[0].Query.Commands[0].SemanticQueryDataShapeCommand;
  assert.deepEqual(
    cmd.Query.Select.map((s) => s.Name),
    ["EntryYear", "IsAccepted", "Cnt"],
  );
  assert.deepEqual(cmd.Binding.Primary.Groupings[0].Projections, [0, 1, 2]);
});
