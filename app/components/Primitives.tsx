import type { ITrace } from "@/interfaces/investigation.interface";

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="shrink-0 text-xs text-fg-muted">{label}</span>
      <span className="mono min-w-0 truncate text-right text-xs text-fg">
        {value ?? <span className="text-fg-dim">—</span>}
      </span>
    </div>
  );
}

export function Panel({
  title,
  eyebrow,
  children,
  right,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-bg-elev p-4">
      <div className="mb-3 flex items-start justify-between gap-3 border-b border-border pb-2.5">
        <div>
          {eyebrow && (
            <p className="mono text-[10px] tracking-wider text-fg-dim uppercase">{eyebrow}</p>
          )}
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

const SEV: Record<string, string> = {
  high: "sev-high",
  low: "sev-low",
  none: "sev-none",
  flag: "sev-high",
  caution: "sev-low",
  clear: "sev-none",
  unknown: "sev-none",
};

export function SeverityChip({ level }: { level: string }) {
  return (
    <span
      className={`mono inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[9px] tracking-widest uppercase ${SEV[level] ?? "sev-none"}`}
    >
      {level}
    </span>
  );
}

/** A meter that reads the same whether it's exposure or fraud risk. */
export function ScoreMeter({ score, band }: { score: number; band: string }) {
  const colour =
    score >= 70 ? "var(--danger)" : score >= 45 ? "var(--warn)" : score >= 20 ? "var(--info)" : "var(--fg-muted)";
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elev-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: colour }} />
      </div>
      <span className="mono shrink-0 text-sm font-semibold" style={{ color: colour }}>
        {score}
      </span>
      <span className="mono shrink-0 text-[10px] tracking-widest uppercase" style={{ color: colour }}>
        {band}
      </span>
    </div>
  );
}

/** Shows the calls behind a result, so the tool never looks like a black box. */
export function TraceList({ traces }: { traces: ITrace[] }) {
  if (traces.length === 0) return null;
  return (
    <details className="mt-3 rounded-lg border border-border bg-bg-elev-2">
      <summary className="mono cursor-pointer px-3 py-2 text-[10px] tracking-wider text-fg-dim uppercase transition hover:text-fg">
        {traces.length} API call{traces.length === 1 ? "" : "s"} behind this result
      </summary>
      <ul className="space-y-2 border-t border-border px-3 py-2.5">
        {traces.map((t, i) => (
          <li key={i} className="text-[11px]">
            <div className="flex items-center gap-2">
              <span className="mono rounded bg-bg-elev px-1.5 py-0.5 text-[9px] tracking-wider text-accent uppercase">
                {t.api}
              </span>
              <span className="text-fg-muted">{t.label}</span>
              {t.elapsedMs != null && t.elapsedMs > 0 && (
                <span className="mono ml-auto text-fg-dim">{t.elapsedMs}ms</span>
              )}
            </div>
            <p className="mono mt-1 break-all text-[10px] text-fg-dim">{t.url}</p>
            {t.notice && <p className="mt-1 text-[11px] text-warn">{t.notice}</p>}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-fg-dim">
      {children}
    </p>
  );
}
