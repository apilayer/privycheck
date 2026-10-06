"use client";

import { useRef, useState } from "react";
import type { IImageResult } from "@/interfaces/investigation.interface";
import { ApiBannerCompact } from "./ApiBanner";
import { EmptyHint, Panel, Row, ScoreMeter, SeverityChip, TraceList } from "./Primitives";

export function ImageInvestigator() {
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IImageResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function run(init: RequestInit, previewUrl: string | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/image", init);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      setResult(json as IImageResult);
      setPreview(previewUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  function submitFile(file: File) {
    const body = new FormData();
    body.append("file", file);
    run({ method: "POST", body }, URL.createObjectURL(file));
  }

  function submitUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    run(
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      },
      url.trim()
    );
  }

  const searchNotice =
    result?.traces.find((t) => t.label === "Reverse image search")?.notice ?? null;

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="rounded-xl border border-border bg-bg-elev p-4">
        <form onSubmit={submitUrl} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="mono min-w-0 flex-1 rounded-lg border border-border bg-bg-elev-2 px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !url.trim()}
            className="shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Investigating…" : "Investigate URL"}
          </button>
        </form>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) submitFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={`mt-3 cursor-pointer rounded-lg border border-dashed border-border px-3 py-6 text-center transition hover:border-accent/60 ${dragging ? "dropzone-active" : ""}`}
        >
          <p className="text-xs text-fg-muted">
            …or drop a photo here to read its metadata
          </p>
          <p className="mono mt-1 text-[10px] text-fg-dim">
            The file is read on the server and never stored. 12 MB max.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) submitFile(f);
            }}
          />
        </div>

        {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      </div>

      {!result && !busy && (
        <EmptyHint>
          Give it a photo. Most cameras and phones write the exact spot and moment
          a picture was taken straight into the file.
        </EmptyHint>
      )}

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Exposure verdict */}
          <Panel eyebrow="Verdict" title="Exposure" right={<SeverityChip level={result.exposure.band} />}>
            <ScoreMeter score={result.exposure.score} band={result.exposure.band} />
            <p className="mt-2.5 text-xs leading-relaxed text-fg">{result.exposure.summary}</p>
            <ul className="mt-3 space-y-2.5">
              {result.exposure.findings.map((f) => (
                <li key={f.label}>
                  <div className="flex items-center gap-2">
                    <SeverityChip level={f.severity} />
                    <span className="text-xs font-medium text-fg">{f.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-fg-muted">{f.detail}</p>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Where it was taken */}
          <Panel eyebrow="positionstack" title="Where it was taken">
            {result.exif.gps ? (
              <>
                <p className="text-sm font-semibold text-fg">
                  {result.place?.label ?? "Coordinates found, no address matched"}
                </p>
                <div className="mt-2">
                  <Row
                    label="Coordinates"
                    value={`${result.exif.gps.lat.toFixed(6)}, ${result.exif.gps.lon.toFixed(6)}`}
                  />
                  {result.exif.gps.altitude != null && (
                    <Row label="Altitude" value={`${Math.round(result.exif.gps.altitude)} m`} />
                  )}
                  <Row label="Locality" value={result.place?.locality} />
                  <Row label="Region" value={result.place?.region} />
                  <Row label="Country" value={result.place?.country} />
                  <Row label="Postal code" value={result.place?.postal_code} />
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${result.exif.gps.lat}&mlon=${result.exif.gps.lon}#map=16/${result.exif.gps.lat}/${result.exif.gps.lon}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mono mt-3 inline-block text-[11px] text-accent transition hover:underline"
                >
                  open on a map ↗
                </a>
                {result.nearby.length > 0 && (
                  <div className="mt-3 border-t border-border pt-2">
                    <p className="mono mb-1.5 text-[10px] tracking-wider text-fg-dim uppercase">
                      Also matched nearby
                    </p>
                    <ul className="space-y-1">
                      {result.nearby.map((p, i) => (
                        <li key={i} className="text-[11px] text-fg-muted">
                          {p.label}
                          {p.distance != null && (
                            <span className="mono text-fg-dim"> · {p.distance.toFixed(2)} km</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <EmptyHint>
                No GPS coordinates in this file — either the camera had location off,
                or the platform it came from stripped them on upload.
              </EmptyHint>
            )}
          </Panel>

          {/* The file's own account of itself */}
          <Panel eyebrow="EXIF" title="What the file says">
            <Row label="Source" value={result.source.name} />
            <Row label="Taken" value={result.exif.takenAt} />
            <Row
              label="Camera"
              value={[result.exif.camera.make, result.exif.camera.model].filter(Boolean).join(" ") || null}
            />
            <Row label="Lens" value={result.exif.camera.lens} />
            <Row
              label="Serial"
              value={
                result.exif.camera.serial ? (
                  <span className="text-danger">{result.exif.camera.serial}</span>
                ) : null
              }
            />
            <Row label="Software" value={result.exif.software} />
            <Row
              label="Dimensions"
              value={
                result.exif.dimensions.width
                  ? `${result.exif.dimensions.width} × ${result.exif.dimensions.height}`
                  : null
              }
            />
            {result.exif.fields.length > 0 && (
              <details className="mt-3">
                <summary className="mono cursor-pointer text-[10px] tracking-wider text-fg-dim uppercase transition hover:text-fg">
                  all {result.exif.fields.length} remaining fields
                </summary>
                <div className="scrollbar-thin mt-2 max-h-56 overflow-y-auto">
                  {result.exif.fields.map((f) => (
                    <Row key={f.key} label={f.key} value={f.value} />
                  ))}
                </div>
              </details>
            )}
          </Panel>

          {/* Where else it appears */}
          <Panel
            eyebrow="zenserp"
            title="Published elsewhere"
            right={
              <span className="mono text-xs text-fg-dim">{result.matches.length} page(s)</span>
            }
          >
            {searchNotice ? (
              <EmptyHint>{searchNotice}</EmptyHint>
            ) : result.matches.length === 0 ? (
              <EmptyHint>No public pages matched this image.</EmptyHint>
            ) : (
              <ul className="scrollbar-thin max-h-72 space-y-2.5 overflow-y-auto">
                {result.matches.map((m, i) => (
                  <li key={i} className="border-b border-border/60 pb-2.5 last:border-0">
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer noopener nofollow"
                      className="text-xs font-medium text-accent transition hover:underline"
                    >
                      {m.title || m.url}
                    </a>
                    <p className="mono mt-0.5 truncate text-[10px] text-fg-dim">{m.destination || m.url}</p>
                    {m.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-fg-muted">{m.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <ApiBannerCompact product="zenserp" label="Reverse image search API" />
            </div>
          </Panel>

          {preview && (
            <div className="lg:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="The image under investigation"
                className="max-h-64 rounded-lg border border-border object-contain"
              />
            </div>
          )}

          <div className="lg:col-span-2">
            <TraceList traces={result.traces} />
          </div>
        </div>
      )}
    </div>
  );
}
