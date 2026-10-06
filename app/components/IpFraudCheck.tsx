"use client";

import { useState } from "react";
import type { IIpResult } from "@/interfaces/investigation.interface";
import { ApiBannerCompact } from "./ApiBanner";
import { EmptyHint, Panel, Row, ScoreMeter, SeverityChip, TraceList } from "./Primitives";

export function IpFraudCheck() {
  const [ip, setIp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IIpResult | null>(null);

  async function check(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ip-check?ip=${encodeURIComponent(ip.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setResult(json as IIpResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  const geo = result?.geo;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-bg-elev p-4">
        <form onSubmit={check} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="8.8.8.8 — or leave blank for your own address"
            className="mono min-w-0 flex-1 rounded-lg border border-border bg-bg-elev-2 px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Check address"}
          </button>
        </form>
        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </div>

      {!result && !busy && !error && (
        <EmptyHint>
          Check any IPv4 or IPv6 address for its location, network, and whether it
          is hiding behind a VPN, proxy or datacenter.
        </EmptyHint>
      )}

      {result && geo && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel eyebrow="Verdict" title="Risk signals" right={<SeverityChip level={result.fraud.band} />}>
            <ScoreMeter score={result.fraud.score} band={result.fraud.band} />
            {result.fraud.heuristicOnly && (
              <p className="mt-2.5 rounded border border-warn/40 bg-warn/5 px-2.5 py-2 text-[11px] leading-snug text-fg-muted">
                This ipstack plan has no security module, so proxy, Tor and threat
                fields are unavailable. The datacenter signal falls back to matching
                the ISP name.
              </p>
            )}
            <ul className="mt-3 space-y-2.5">
              {result.fraud.signals.map((s) => (
                <li key={s.label}>
                  <div className="flex items-center gap-2">
                    <SeverityChip level={s.verdict} />
                    <span className="text-xs font-medium text-fg">{s.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-fg-muted">{s.detail}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel eyebrow="ipstack" title="Where and who">
            <Row label="IP" value={result.ip} />
            <Row label="Type" value={geo.type} />
            <Row label="Hostname" value={geo.hostname} />
            <Row label="City" value={geo.city} />
            <Row label="Region" value={geo.region_name} />
            <Row
              label="Country"
              value={geo.country_name ? `${geo.location?.country_flag_emoji ?? ""} ${geo.country_name}`.trim() : null}
            />
            <Row label="Postal" value={geo.zip} />
            <Row
              label="Coordinates"
              value={geo.latitude != null ? `${geo.latitude.toFixed(4)}, ${geo.longitude?.toFixed(4)}` : null}
            />
            <Row label="ASN" value={geo.connection?.asn ? `AS${geo.connection.asn}` : null} />
            <Row label="ISP" value={geo.connection?.isp} />
            <Row label="Timezone" value={geo.time_zone?.id} />
            <Row
              label="Currency"
              value={geo.currency?.code ? `${geo.currency.code} ${geo.currency.symbol ?? ""}`.trim() : null}
            />
            <div className="mt-3">
              <ApiBannerCompact product="ipstack" label="IP geolocation API" />
            </div>
          </Panel>

          <Panel eyebrow="positionstack" title="Nearest address to those coordinates">
            {result.place ? (
              <>
                <p className="text-sm font-semibold text-fg">{result.place.label}</p>
                <div className="mt-2">
                  <Row label="Street" value={result.place.street} />
                  <Row label="Neighbourhood" value={result.place.neighbourhood} />
                  <Row label="Locality" value={result.place.locality} />
                  <Row label="Region" value={result.place.region} />
                  <Row label="Country" value={result.place.country} />
                </div>
                <p className="mt-2.5 text-[11px] leading-snug text-fg-dim">
                  An IP resolves to where the network routes, not to a doorstep.
                  Treat this as the neighbourhood, never an address.
                </p>
              </>
            ) : (
              <EmptyHint>No address matched these coordinates.</EmptyHint>
            )}
          </Panel>

          <div className="lg:col-span-2">
            <TraceList traces={result.traces} />
          </div>
        </div>
      )}
    </div>
  );
}
