import { NextRequest } from "next/server";
import { assessFraud } from "@/app/lib/fraud";
import { lookupIp, moduleStatus } from "@/app/lib/ipstackLookup";
import { reverseGeocode } from "@/app/lib/positionstack";
import type { IIpResult, ITrace } from "@/interfaces/investigation.interface";

export const dynamic = "force-dynamic";

const isValidIp = (ip: string) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || (ip.includes(":") && /^[0-9a-fA-F:]+$/.test(ip));

/**
 * Risk picture for an address: ipstack for who and where it is, Positionstack
 * to turn its coordinates into somewhere you can actually place on a map.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ip")?.trim();

  // No address given: fall back to the caller's own, which is the useful default.
  let target = raw || "";
  if (!target) {
    const xff = request.headers.get("x-forwarded-for");
    target = xff?.split(",")[0]?.trim() ?? "";
  } else if (!isValidIp(target)) {
    return Response.json(
      { error: `"${target}" is not a valid IPv4 or IPv6 address.` },
      { status: 400 }
    );
  }

  const outcome = await lookupIp(target || null);
  const traces: ITrace[] = [
    {
      api: "ipstack",
      label: outcome.cached ? "IP lookup (cached)" : "IP lookup",
      url: outcome.maskedUrl,
      elapsedMs: outcome.elapsedMs,
      status: outcome.status,
      notice: outcome.notice,
    },
  ];

  if (outcome.notice && !outcome.body.latitude) {
    return Response.json({ error: outcome.notice, traces }, { status: 502 });
  }

  const geo = outcome.body;
  let place = null;
  if (geo.latitude != null && geo.longitude != null) {
    const rev = await reverseGeocode(geo.latitude, geo.longitude, 1);
    traces.push({
      api: "positionstack",
      label: "Reverse geocode IP coordinates",
      url: rev.maskedUrl,
      elapsedMs: rev.elapsedMs,
      status: rev.notice ? 0 : 200,
      notice: rev.notice,
    });
    place = rev.places[0] ?? null;
  }

  const payload: IIpResult = {
    ip: geo.ip ?? target,
    geo,
    fraud: assessFraud(geo, moduleStatus().security),
    place,
    traces,
  };
  return Response.json(payload, { headers: { "cache-control": "no-store" } });
}
