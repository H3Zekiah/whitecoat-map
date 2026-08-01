import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/*
 * Data layer schemas and provenance model (SRD §7).
 *
 * The rule that matters most: an unverified figure is structurally
 * incapable of rendering. Extraction may populate a field, but until a
 * human has recorded verifiedBy + verifiedOn against the source, the
 * only way to read it — verifiedValue() — returns null, and components
 * render the absence honestly.
 *
 * No JSX here: scripts run this under Node type stripping.
 */

export const DATA_ROOT = path.join(process.cwd(), "data");

/* ---------- source manifest ---------- */

const retrievalSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("http") }),
  z.object({ method: z.literal("powerbi-api") }),
]);

export const sourceEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url(),
  provides: z.string().min(10),
  cadence: z.string().min(1),
  retrieval: retrievalSchema,
});

export type SourceEntry = z.infer<typeof sourceEntrySchema>;

const manifestSchema = z
  .array(sourceEntrySchema)
  .superRefine((entries, ctx) => {
    const seen = new Set<string>();
    for (const e of entries) {
      if (seen.has(e.id)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate source id: ${e.id}`,
        });
      }
      seen.add(e.id);
    }
  });

export function loadManifest(): SourceEntry[] {
  const filePath = path.join(DATA_ROOT, "sources.json");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const parsed = manifestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid source manifest ${filePath}:\n${formatIssues(parsed.error)}`,
    );
  }
  return parsed.data;
}

/* ---------- provenanced fields ---------- */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)");

/*
 * A field is one of:
 *  - present: value + where it came from (+ verification, once a human
 *    has checked it against the source document);
 *  - unavailable: the source was checked and does not publish it. This
 *    is recorded, not left blank, so absence is a statement (SRD policy:
 *    never let a missing range read as a median).
 */
const presentField = <T extends z.ZodTypeAny>(value: T) =>
  z.object({
    value,
    sourceId: z.string().min(1),
    retrieved: isoDate,
    verifiedBy: z.string().min(1).optional(),
    verifiedOn: isoDate.optional(),
  });

const unavailableField = z.object({
  unavailable: z.literal(true),
  reason: z.string().min(3),
  checkedOn: isoDate,
});

export const provenancedNumber = z.union([
  presentField(z.number()),
  unavailableField,
]);

export const provenancedRange = z.union([
  presentField(z.object({ low: z.number(), high: z.number() })),
  unavailableField,
]);

export type ProvenancedField<T> =
  | {
      value: T;
      sourceId: string;
      retrieved: string;
      verifiedBy?: string;
      verifiedOn?: string;
    }
  | { unavailable: true; reason: string; checkedOn: string };

/*
 * The only sanctioned read path. Returns the value only when a human
 * verification is recorded; otherwise null. Rendering code that uses
 * this cannot leak an unverified number by construction.
 */
export function verifiedValue<T>(field: ProvenancedField<T>): T | null {
  if ("unavailable" in field) return null;
  if (!field.verifiedBy || !field.verifiedOn) return null;
  return field.value;
}

export function isUnavailable<T>(field: ProvenancedField<T>): boolean {
  return "unavailable" in field;
}

/* ---------- school profiles (filled in Step 2.4) ---------- */

export const schoolSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortName: z.string().min(1),
  degree: z.enum(["MD", "DO"]),
  applicationService: z.enum(["TMDSAS", "AACOMAS"]),
  city: z.string().min(1),
  website: z.string().url(),
  classSize: provenancedNumber,
  gpaMedian: provenancedNumber,
  gpaRange: provenancedRange,
  mcatMedian: provenancedNumber,
  mcatRange: provenancedRange,
  inStatePercent: provenancedNumber,
});

export type School = z.infer<typeof schoolSchema>;

/* ---------- aggregate datasets (filled in Step 2.3) ---------- */

const datasetProvenance = z.object({
  sourceId: z.string().min(1),
  retrieved: isoDate,
  /* sha256 of the archived snapshot the figures were extracted from */
  snapshotHash: z.string().regex(/^[0-9a-f]{64}$/),
  extractedBy: z.string().min(1),
  verifiedBy: z.string().min(1).optional(),
  verifiedOn: isoDate.optional(),
});

export const funnelDatasetSchema = z.object({
  kind: z.literal("funnel"),
  provenance: datasetProvenance,
  rows: z.array(
    z.object({
      entryYear: z.number().int().min(2000).max(2100),
      applicants: z.number().int().nonnegative(),
      interviewed: z.number().int().nonnegative(),
      accepted: z.number().int().nonnegative(),
      matriculated: z.number().int().nonnegative(),
    }),
  ),
});

export type FunnelDataset = z.infer<typeof funnelDatasetSchema>;

/* A dataset renders only when its provenance carries human verification. */
export function isDatasetVerified(d: {
  provenance: { verifiedBy?: string; verifiedOn?: string } & Record<
    string,
    unknown
  >;
}): boolean {
  return Boolean(d.provenance.verifiedBy && d.provenance.verifiedOn);
}

/* ---------- shared ---------- */

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
}

export function loadSchools(): School[] {
  const dir = path.join(DATA_ROOT, "schools");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const filePath = path.join(dir, f);
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const parsed = schoolSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `Invalid school file ${filePath}:\n${formatIssues(parsed.error)}`,
        );
      }
      return parsed.data;
    });
}
