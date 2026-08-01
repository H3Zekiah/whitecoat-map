import { visit, SKIP } from "unist-util-visit";
import type { GlossaryTerm } from "./glossary";

/*
 * Remark plugin: links the first occurrence of each glossary term in a
 * page body to /glossary#slug. All-caps aliases (acronyms like "MCAT")
 * match case-sensitively so "DO" never matches the word "do"; other
 * aliases match case-insensitively at word boundaries. Text inside
 * headings, links, and code is left alone.
 */

interface TextNode {
  type: "text";
  value: string;
}

interface ParentNode {
  type: string;
  children: Array<Record<string, unknown>>;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SKIP_PARENTS = new Set(["link", "linkReference", "heading"]);

export function remarkGlossary({ terms }: { terms: GlossaryTerm[] }) {
  const matchers = terms.map((t) => ({
    term: t,
    patterns: [t.term, ...t.aka].map((alias) => {
      const caseSensitive =
        alias === alias.toUpperCase() && /[A-Z]/.test(alias);
      return new RegExp(
        `(?<![\\w-])${escapeRegExp(alias)}(?![\\w-])`,
        caseSensitive ? "" : "i",
      );
    }),
  }));

  return (tree: ParentNode) => {
    const linked = new Set<string>();

    visit(
      tree as never,
      "text",
      (
        node: TextNode,
        index: number | undefined,
        parent: ParentNode | undefined,
      ) => {
        if (!parent || index === undefined || SKIP_PARENTS.has(parent.type)) {
          return SKIP;
        }

        /* Earliest match of any not-yet-linked term in this text node. */
        let best: {
          start: number;
          length: number;
          slug: string;
          title: string;
        } | null = null;
        for (const { term, patterns } of matchers) {
          if (linked.has(term.slug)) continue;
          for (const re of patterns) {
            const m = re.exec(node.value);
            if (m && (best === null || m.index < best.start)) {
              best = {
                start: m.index,
                length: m[0].length,
                slug: term.slug,
                title: term.short,
              };
            }
          }
        }
        if (best === null) return;

        linked.add(best.slug);
        const before = node.value.slice(0, best.start);
        const matched = node.value.slice(best.start, best.start + best.length);
        const after = node.value.slice(best.start + best.length);

        const replacement: Array<Record<string, unknown>> = [];
        if (before) replacement.push({ type: "text", value: before });
        replacement.push({
          type: "link",
          url: `/glossary#${best.slug}`,
          title: best.title,
          children: [{ type: "text", value: matched }],
        });
        if (after) replacement.push({ type: "text", value: after });

        parent.children.splice(index, 1, ...replacement);
        /* Continue after the inserted link so `after` is scanned too. */
        return index + replacement.length - (after ? 1 : 0);
      },
    );
  };
}
