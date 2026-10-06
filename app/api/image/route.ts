import { NextRequest } from "next/server";
import { putBlob } from "@/app/lib/blobStore";
import { readExif } from "@/app/lib/exif";
import { assessExposure } from "@/app/lib/exposure";
import { reverseGeocode } from "@/app/lib/positionstack";
import { resolveOrigin } from "@/app/lib/origin";
import { reverseImageSearch } from "@/app/lib/zenserp";
import type { IImageResult, ITrace } from "@/interfaces/investigation.interface";

export const dynamic = "force-dynamic";

/** Refuse anything large enough to be a denial-of-service rather than a photo. */
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * The chained investigation: read what the file is carrying, turn any embedded
 * coordinates into a street address, and find where else the image has been
 * published — then score how much all of that together gives away.
 */
export async function POST(request: NextRequest) {
  let buffer: Buffer | null = null;
  let source: IImageResult["source"];
  let imageUrl: string | null = null;
  let uploadType = "image/jpeg";
  let uploadNotice: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "No file was uploaded." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: `That file is ${(file.size / 1e6).toFixed(1)} MB; the limit is 12 MB.` },
        { status: 413 }
      );
    }
    buffer = Buffer.from(await file.arrayBuffer());
    source = { kind: "upload", name: file.name || "upload" };
    uploadType = file.type || "image/jpeg";
  } else {
    let body: { url?: string };
    try {
      body = (await request.json()) as { url?: string };
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const raw = body.url?.trim();
    if (!raw) return Response.json({ error: "Provide an image URL." }, { status: 400 });

    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      return Response.json({ error: `"${raw}" is not a valid URL.` }, { status: 400 });
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return Response.json({ error: "Only http and https URLs are supported." }, { status: 400 });
    }
    imageUrl = parsed.toString();
    source = { kind: "url", name: imageUrl };

    // Fetch it ourselves so EXIF works on a remote image too, but don't fail
    // the whole request if the host blocks us — the reverse search still works.
    try {
      const res = await fetch(imageUrl, { cache: "no-store" });
      const len = Number(res.headers.get("content-length") ?? 0);
      if (res.ok && len <= MAX_BYTES) {
        buffer = Buffer.from(await res.arrayBuffer());
      }
    } catch {
      buffer = null;
    }
  }

  const traces: ITrace[] = [];
  const exif = buffer
    ? await readExif(buffer)
    : {
        gps: null,
        takenAt: null,
        camera: { make: null, model: null, lens: null, serial: null },
        software: null,
        dimensions: { width: null, height: null },
        fields: [],
        hasAnyMetadata: false,
      };

  // GPS in the file → a real address, via Positionstack.
  let place = null;
  let nearby: IImageResult["nearby"] = [];
  if (exif.gps) {
    const geo = await reverseGeocode(exif.gps.lat, exif.gps.lon, 4);
    traces.push({
      api: "positionstack",
      label: "Reverse geocode EXIF coordinates",
      url: geo.maskedUrl,
      elapsedMs: geo.elapsedMs,
      status: geo.notice ? 0 : 200,
      notice: geo.notice,
    });
    place = geo.places[0] ?? null;
    nearby = geo.places.slice(1);
  }

  // Zenserp fetches the image itself, so an upload has to be served from
  // somewhere reachable. Park it in the short-lived blob store and hand over
  // that URL — provided this app is actually on the public internet.
  if (!imageUrl && buffer) {
    const origin = resolveOrigin(request);
    if (origin.publiclyReachable) {
      imageUrl = `${origin.origin}/api/image/blob/${putBlob(buffer, uploadType)}`;
    } else {
      uploadNotice = origin.reason;
    }
  }

  let matches: IImageResult["matches"] = [];
  if (imageUrl) {
    const rev = await reverseImageSearch(imageUrl);
    traces.push({
      api: "zenserp",
      label: "Reverse image search",
      url: rev.maskedUrl,
      elapsedMs: rev.elapsedMs,
      status: rev.status,
      notice: rev.notice,
    });
    matches = rev.data ?? [];
  }

  if (uploadNotice) {
    traces.push({
      api: "zenserp",
      label: "Reverse image search",
      url: "—",
      elapsedMs: null,
      status: null,
      notice: uploadNotice,
    });
  }

  const result: IImageResult = {
    source,
    exif,
    place,
    nearby,
    matches,
    exposure: assessExposure(exif, place?.label ?? null, matches.length),
    traces,
  };
  return Response.json(result);
}
