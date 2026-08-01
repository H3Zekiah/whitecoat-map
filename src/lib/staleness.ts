/*
 * Staleness policy (SRD §6): admissions data is annual, so a reference
 * page whose verification is older than a year gets a visible warning
 * rather than silently showing old numbers. Evaluated at build time for
 * static pages; the Step 5.4 freshness machinery adds rebuild cadence.
 */

export const STALE_AFTER_DAYS = 365;

export function isStale(
  lastVerified: string | undefined,
  now: number = Date.now(),
): boolean {
  if (!lastVerified) return false;
  return (
    now - Date.parse(lastVerified) > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000
  );
}
