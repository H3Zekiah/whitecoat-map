import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPageBody } from "@/components/ContentPageBody";
import { PageShell } from "@/components/PageShell";
import { getPage, listPages } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return listPages("guides").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage("guides", slug);
  if (!page) return {};
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPage("guides", slug);
  if (!page) notFound();

  return (
    <PageShell>
      <ContentPageBody page={page} eyebrow="Guides" />
    </PageShell>
  );
}
