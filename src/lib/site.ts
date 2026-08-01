/*
 * Single source of truth for site-level identity used by metadata,
 * sitemap, robots, and structured data. When the custom domain is
 * registered (plan step 5.7), change SITE_URL here and everything
 * downstream follows.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://whitecoat-map.vercel.app";

export const SITE_NAME = "Whitecoat Map";

export const SITE_TAGLINE =
  "The hidden curriculum of getting into medical school in Texas, written down.";

export const SITE_DESCRIPTION =
  "Free, Texas-specific guidance on getting into medical school: verified admissions data, every Texas medical school, and stage-by-stage guides. No accounts, no upsell.";
