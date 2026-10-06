import { NextRequest } from "next/server";
import { forwardGeocode } from "@/app/lib/positionstack";
import type { ITrace } from "@/interfaces/investigation.interface";

export const dynamic = "force-dynamic";

/** Property-listing lookup: an address in, coordinates and a normalised record out. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return Response.json({ error: "Provide an address or place name." }, { status: 400 });
  }

  const res = await forwardGeocode(query, 5);
  const traces: ITrace[] = [
    {
      api: "positionstack",
      label: "Forward geocode address",
      url: res.maskedUrl,
      elapsedMs: res.elapsedMs,
      status: res.notice ? 0 : 200,
      notice: res.notice,
    },
  ];
  return Response.json({ query, places: res.places, traces });
}
