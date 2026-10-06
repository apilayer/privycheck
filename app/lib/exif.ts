import exifr from "exifr";

export type ExifReport = {
  /** Coordinates the photo is carrying, if any — the biggest single leak. */
  gps: { lat: number; lon: number; altitude: number | null } | null;
  takenAt: string | null;
  camera: { make: string | null; model: string | null; lens: string | null; serial: string | null };
  software: string | null;
  dimensions: { width: number | null; height: number | null };
  /** Everything else worth showing, flattened for display. */
  fields: { key: string; value: string }[];
  hasAnyMetadata: boolean;
};

const str = (v: unknown): string | null => {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  const s = String(v).trim();
  return s.length && s !== "undefined" ? s : null;
};

/** Keys already surfaced in their own field, so the generic list skips them. */
const PROMOTED = new Set([
  "latitude", "longitude", "GPSAltitude", "GPSLatitude", "GPSLongitude",
  "GPSLatitudeRef", "GPSLongitudeRef", "GPSAltitudeRef",
  "Make", "Model", "LensModel", "SerialNumber", "BodySerialNumber",
  "Software", "ExifImageWidth", "ExifImageHeight", "ImageWidth", "ImageHeight",
  "DateTimeOriginal", "CreateDate", "ModifyDate",
]);

/**
 * Pull everything a photo is carrying. Cameras and phones embed far more than
 * people expect — the exact spot a picture was taken, the moment, and often a
 * serial number that ties every photo from one device together.
 */
export async function readExif(buffer: Buffer): Promise<ExifReport> {
  let raw: Record<string, unknown> = {};
  try {
    raw = ((await exifr.parse(buffer, { gps: true, translateValues: true })) ?? {}) as Record<string, unknown>;
  } catch {
    // A stripped or unsupported file simply has nothing to report.
    raw = {};
  }

  const lat = typeof raw.latitude === "number" ? raw.latitude : null;
  const lon = typeof raw.longitude === "number" ? raw.longitude : null;

  const fields = Object.entries(raw)
    .filter(([k, v]) => !PROMOTED.has(k) && v != null && typeof v !== "object")
    .map(([key, v]) => ({ key, value: String(v).slice(0, 120) }))
    .filter((f) => f.value.trim().length > 0)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(0, 60);

  const report: ExifReport = {
    gps:
      lat != null && lon != null
        ? { lat, lon, altitude: typeof raw.GPSAltitude === "number" ? raw.GPSAltitude : null }
        : null,
    takenAt: str(raw.DateTimeOriginal) ?? str(raw.CreateDate) ?? str(raw.ModifyDate),
    camera: {
      make: str(raw.Make),
      model: str(raw.Model),
      lens: str(raw.LensModel),
      serial: str(raw.SerialNumber) ?? str(raw.BodySerialNumber),
    },
    software: str(raw.Software),
    dimensions: {
      width: (raw.ExifImageWidth as number) ?? (raw.ImageWidth as number) ?? null,
      height: (raw.ExifImageHeight as number) ?? (raw.ImageHeight as number) ?? null,
    },
    fields,
    hasAnyMetadata: Object.keys(raw).length > 0,
  };
  return report;
}
