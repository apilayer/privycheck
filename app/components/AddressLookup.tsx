"use client";

import { useState } from "react";
import type { PositionstackPlace } from "@/app/lib/positionstack";
import type { ITrace } from "@/interfaces/investigation.interface";
import { ApiBannerCompact } from "./ApiBanner";
import { EmptyHint, Panel, Row, TraceList } from "./Primitives";

type Result = { query: string; places: PositionstackPlace[]; traces: ITrace[] };

export function AddressLookup() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setResult(json as Result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-bg-elev p-4">
        <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="A property listing address, e.g. 1600 Amphitheatre Parkway, Mountain View"
            className="min-w-0 flex-1 rounded-lg border border-border bg-bg-elev-2 px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !q.trim()}
            className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Locating…" : "Locate"}
          </button>
        </form>
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </div>

      {!result && !busy && !error && (
        <EmptyHint>
          Resolve a listing address to coordinates and a normalised record — useful
          for checking that a property is where the listing claims it is.
        </EmptyHint>
      )}

      {result && (
        <Panel
          eyebrow="positionstack"
          title={`Matches for “${result.query}”`}
          right={<span className="mono text-xs text-fg-dim">{result.places.length} match(es)</span>}
        >
          {result.places.length === 0 ? (
            <EmptyHint>No match for that address.</EmptyHint>
          ) : (
            <ul className="space-y-3">
              {result.places.map((p, i) => (
                <li key={i} className="rounded-lg border border-border bg-bg-elev-2 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-fg">{p.label}</p>
                    {p.confidence != null && (
                      <span className="mono shrink-0 text-[10px] text-fg-dim">
                        {Math.round(p.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <Row
                      label="Coordinates"
                      value={p.latitude != null ? `${p.latitude.toFixed(6)}, ${p.longitude?.toFixed(6)}` : null}
                    />
                    <Row label="Type" value={p.type} />
                    <Row label="Street" value={[p.number, p.street].filter(Boolean).join(" ") || null} />
                    <Row label="Locality" value={p.locality} />
                    <Row label="Region" value={p.region} />
                    <Row label="Postal code" value={p.postal_code} />
                    <Row label="Country" value={p.country} />
                  </div>
                  {p.latitude != null && (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${p.latitude}&mlon=${p.longitude}#map=17/${p.latitude}/${p.longitude}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mono mt-2 inline-block text-[11px] text-accent transition hover:underline"
                    >
                      open on a map ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <ApiBannerCompact product="positionstack" label="Geocoding API" />
          </div>
          <TraceList traces={result.traces} />
        </Panel>
      )}
    </div>
  );
}
