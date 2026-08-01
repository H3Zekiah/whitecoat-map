const variants = {
  note: {
    label: "Note",
    box: "border-accent bg-accent-soft",
    labelColor: "text-accent",
  },
  warning: {
    label: "Check before you rely on this",
    box: "border-warn bg-warn-soft",
    labelColor: "text-warn",
  },
  /*
   * Opinion is visually distinct by requirement (SRD §6): personal judgment
   * never masquerades as sourced fact.
   */
  opinion: {
    label: "Judgment call",
    box: "border-opinion bg-opinion-soft",
    labelColor: "text-opinion",
  },
} as const;

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
}) {
  const v = variants[variant];
  return (
    <aside className={`my-6 rounded-r-md border-l-2 p-4 ${v.box}`}>
      <p
        className={`mb-1 text-xs font-semibold tracking-wide uppercase ${v.labelColor}`}
      >
        {title ?? v.label}
      </p>
      <div className="text-[0.9375rem] leading-relaxed">{children}</div>
    </aside>
  );
}
