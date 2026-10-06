const BASE = "http://api.positionstack.com/v1";

export type PositionstackPlace = {
  latitude?: number;
  longitude?: number;
  label?: string;
  name?: string;
  number?: string | null;
  street?: string | null;
  postal_code?: string | null;
  locality?: string | null;
  neighbourhood?: string | null;
  county?: string | null;
  region?: string | null;
  region_code?: string | null;
  country?: string | null;
  country_code?: string | null;
  continent?: string | null;
  type?: string | null;
  confidence?: number | null;
  distance?: number | null;
};

export type GeocodeOutcome = {
  places: PositionstackPlace[];
  elapsedMs: number;
  notice: string | null;
  maskedUrl: string;
};

const mask = (url: string) => url.replace(/access_key=[^&]+/i, "access_key=••••••••");

async function geocode(path: string, query: string, limit: number): Promise<GeocodeOutcome> {
  const key = process.env.POSITIONSTACK_API_KEY;
  const url = `${BASE}/${path}?access_key=${key ?? ""}&query=${encodeURIComponent(query)}&limit=${limit}`;
  const base = { places: [] as PositionstackPlace[], elapsedMs: 0, maskedUrl: mask(url) };

  if (!key) {
    return { ...base, notice: "POSITIONSTACK_API_KEY is not set — add it to .env.local and restart." };
  }

  const started = Date.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    const elapsedMs = Date.now() - started;
    const json = (await res.json()) as {
      data?: PositionstackPlace[];
      error?: { message?: string; type?: string };
    };
    if (json.error) {
      return { ...base, elapsedMs, notice: `Positionstack: ${json.error.message ?? json.error.type}` };
    }
    // A single result comes back as an object rather than an array.
    const data = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
    return { ...base, places: data, elapsedMs, notice: null };
  } catch (e) {
    return {
      ...base,
      notice: `Couldn't reach Positionstack: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

/** Coordinates pulled out of a photo's EXIF → a human-readable address. */
export const reverseGeocode = (lat: number, lon: number, limit = 3) =>
  geocode("reverse", `${lat},${lon}`, limit);

export const forwardGeocode = (address: string, limit = 5) =>
  geocode("forward", address, limit);
