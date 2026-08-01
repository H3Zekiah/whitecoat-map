import type { MetadataRoute } from "next";
import { listPages } from "@/lib/content";
import { loadSchools } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

/*
 * Search is the primary discovery channel for this site (SRD §10), so
 * every page is enumerated rather than relying on crawling. Priorities
 * reflect what a lost student most needs to find, not what we most want
 * to promote.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: Array<[string, number]> = [
    ["", 1.0],
    ["/data", 0.9],
    ["/guides", 0.9],
    ["/texas", 0.9],
    ["/schools", 0.8],
    ["/glossary", 0.5],
    ["/about", 0.4],
    ["/method", 0.4],
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map(
    ([path, priority]) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority,
    }),
  );

  for (const section of ["texas", "guides"] as const) {
    for (const page of listPages(section)) {
      entries.push({
        url: `${SITE_URL}/${section}/${page.slug}`,
        lastModified: page.frontmatter.lastVerified
          ? new Date(page.frontmatter.lastVerified)
          : now,
        changeFrequency: "yearly",
        priority: section === "texas" ? 0.8 : 0.7,
      });
    }
  }

  for (const school of loadSchools()) {
    entries.push({
      url: `${SITE_URL}/schools/${school.slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  return entries;
}
