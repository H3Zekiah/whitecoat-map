import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      /* Internal design reference, not content. */
      disallow: "/styleguide",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
