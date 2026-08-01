import { Prose } from "@/components/Prose";
import { SourceChip } from "@/components/SourceChip";
import { StalenessNotice } from "@/components/StalenessNotice";
import type { ContentPage } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { isStale } from "@/lib/staleness";

/*
 * Shared article shell for every MDX page, so the provenance furniture —
 * verification line, staleness banner, sources footer — is identical
 * across sections rather than reimplemented per route.
 */
export async function ContentPageBody({
  page,
  eyebrow,
}: {
  page: ContentPage;
  eyebrow: string;
}) {
  const { frontmatter } = page;
  const rendered = await renderMDX(page.body, frontmatter);
  const stale = isStale(frontmatter.lastVerified);

  return (
    <article className="mx-auto max-w-prose">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          {frontmatter.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{frontmatter.description}</p>
        {frontmatter.lastVerified && frontmatter.verifiedBy ? (
          <p className="mt-3 text-xs text-faint">
            Every fact on this page was checked against its source on{" "}
            <time dateTime={frontmatter.lastVerified}>
              {frontmatter.lastVerified}
            </time>{" "}
            by {frontmatter.verifiedBy}.
          </p>
        ) : null}
      </header>

      {stale && frontmatter.lastVerified ? (
        <StalenessNotice
          lastVerified={frontmatter.lastVerified}
          sourceHref={frontmatter.sources[0]?.url ?? "#sources"}
        />
      ) : null}

      <Prose>{rendered}</Prose>

      {frontmatter.sources.length > 0 ? (
        <footer id="sources" className="mt-12 border-t border-rule pt-6">
          <h2 className="font-display mb-3 text-lg font-semibold">
            Sources and verification
          </h2>
          <div className="flex flex-wrap gap-2">
            {frontmatter.sources.map((s) => (
              <SourceChip
                key={s.id}
                source={s.name}
                href={s.url}
                verifiedOn={frontmatter.lastVerified ?? ""}
              />
            ))}
          </div>
        </footer>
      ) : null}
    </article>
  );
}
