import { evaluate } from "@mdx-js/mdx";
import * as devRuntime from "react/jsx-dev-runtime";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import { Callout } from "@/components/Callout";
import { SourceChip } from "@/components/SourceChip";
import type { Frontmatter, PageSource } from "./content";
import { loadGlossary } from "./glossary";
import { remarkGlossary } from "./remark-glossary";

/*
 * Compiles an MDX page body to React at static-generation time.
 * The components map is built per page so <Source id="..."/> resolves
 * against that page's declared sources — citing an undeclared source
 * is a build error, not a silent omission.
 */

const tableClassName =
  "w-full border-collapse text-sm [&_th]:border-b [&_th]:border-ink/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border-b [&_td]:border-rule [&_td]:px-3 [&_td]:py-2";

function makeComponents(frontmatter: Frontmatter) {
  const bySourceId = new Map<string, PageSource>(
    frontmatter.sources.map((s) => [s.id, s]),
  );

  return {
    Callout,
    Source({ id }: { id: string }) {
      const source = bySourceId.get(id);
      if (!source) {
        throw new Error(
          `<Source id="${id}"> does not match any source declared in the frontmatter of "${frontmatter.title}"`,
        );
      }
      if (!frontmatter.lastVerified) {
        throw new Error(
          `<Source id="${id}"> used on a page without lastVerified: "${frontmatter.title}"`,
        );
      }
      return (
        <SourceChip
          source={source.name}
          href={source.url}
          verifiedOn={frontmatter.lastVerified}
        />
      );
    },
    table(props: React.ComponentProps<"table">) {
      return (
        <div className="my-6 overflow-x-auto">
          <table className={tableClassName} {...props} />
        </div>
      );
    },
  };
}

export async function renderMDX(body: string, frontmatter: Frontmatter) {
  const dev = process.env.NODE_ENV === "development";
  const { default: MDXContent } = await evaluate(body, {
    ...(dev ? { ...devRuntime, development: true } : { ...runtime }),
    remarkPlugins: [remarkGfm, [remarkGlossary, { terms: loadGlossary() }]],
  });
  return <MDXContent components={makeComponents(frontmatter)} />;
}
