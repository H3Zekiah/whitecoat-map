/*
 * Long-form reading container. MDX content renders inside this in Step 1.3.
 * Measure, line height, and heading rhythm live here so article pages
 * inherit them for free.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        "max-w-prose text-[1.0625rem] leading-relaxed",
        "[&_h1]:font-display [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:mt-0 [&_h1]:mb-6",
        "[&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4",
        "[&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3",
        "[&_p]:my-4",
        "[&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-2 hover:[&_a]:decoration-accent",
        "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
        "[&_strong]:font-semibold",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:text-muted",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
