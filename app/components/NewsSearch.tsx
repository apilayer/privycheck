"use client";

import { useState } from "react";
import type { INewsResult } from "@/interfaces/investigation.interface";
import { ApiBannerCompact } from "./ApiBanner";
import { EmptyHint, Panel, TraceList } from "./Primitives";

export function NewsSearch() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<INewsResult | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setResult(json as INewsResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  const notice = result?.traces.find((t) => t.notice)?.notice;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-bg-elev p-4">
        <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`A name, a company, a phrase — try "Marc Lou"`}
            className="min-w-0 flex-1 rounded-lg border border-border bg-bg-elev-2 px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !q.trim()}
            className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Searching…" : "Search news"}
          </button>
        </form>
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </div>

      {!result && !busy && !error && (
        <EmptyHint>
          Search what the press has published about a name. This is the public
          record — the part of someone&apos;s footprint they have least control over.
        </EmptyHint>
      )}

      {result && (
        <Panel
          eyebrow="zenserp"
          title={`News mentioning “${result.query}”`}
          right={<span className="mono text-xs text-fg-dim">{result.items.length} result(s)</span>}
        >
          {notice && <p className="mb-3 text-xs text-warn">{notice}</p>}

          {result.items.length === 0 ? (
            <EmptyHint>{notice ? "No results to show." : "Nothing in the news for that query."}</EmptyHint>
          ) : (
            <ul className="space-y-3">
              {result.items.map((n, i) => (
                <li key={i} className="flex gap-3 border-b border-border/60 pb-3 last:border-0">
                  {n.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={n.thumbnail}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded border border-border object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <a
                      href={n.link}
                      target="_blank"
                      rel="noreferrer noopener nofollow"
                      className="text-sm font-medium text-accent transition hover:underline"
                    >
                      {n.title}
                    </a>
                    <p className="mono mt-0.5 text-[10px] text-fg-dim">
                      {[n.source, n.date].filter(Boolean).join(" · ")}
                    </p>
                    {n.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-fg-muted">{n.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <ApiBannerCompact product="zenserp" label="News search API" />
          </div>
          <TraceList traces={result.traces} />
        </Panel>
      )}
    </div>
  );
}
