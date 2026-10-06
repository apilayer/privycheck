import type { IPstackResponse } from "./ipstack";

export type RiskSignal = {
  label: string;
  verdict: "clear" | "caution" | "flag" | "unknown";
  detail: string;
};

export type FraudReport = {
  score: number; // 0 (clean) – 100 (high risk)
  band: "low" | "moderate" | "elevated" | "high";
  signals: RiskSignal[];
  /** True when ipstack's security module isn't on this plan. */
  heuristicOnly: boolean;
};

const HOSTING = /(amazon|aws|google|cloud|microsoft|azure|digitalocean|linode|ovh|hetzner|vultr|contabo|oracle|alibaba|tencent|cloudflare|fastly|akamai|datacamp|m247|leaseweb|choopa|quadranet|gcore|cogent|colo|server|host)/i;

const band = (n: number): FraudReport["band"] =>
  n >= 70 ? "high" : n >= 45 ? "elevated" : n >= 20 ? "moderate" : "low";

/**
 * Turn an ipstack lookup into a readable risk picture. Every point is tied to a
 * named signal with its evidence, so the verdict can be argued with rather than
 * taken on faith — an unexplained "fraud score" is not much use to an analyst.
 */
export function assessFraud(geo: IPstackResponse, securityModule: boolean): FraudReport {
  const signals: RiskSignal[] = [];
  let score = 0;

  const sec = geo.security;
  const isp = geo.connection?.isp ?? geo.hostname ?? null;

  // 1 — Proxy / VPN
  if (sec?.is_proxy != null) {
    if (sec.is_proxy) {
      score += 35;
      signals.push({
        label: "Proxy or VPN",
        verdict: "flag",
        detail: `ipstack reports a proxy${sec.proxy_type ? ` (${sec.proxy_type})` : ""}${sec.vpn_service ? ` via ${sec.vpn_service}` : ""}.`,
      });
    } else {
      signals.push({ label: "Proxy or VPN", verdict: "clear", detail: "No proxy or VPN detected." });
    }
  } else {
    signals.push({
      label: "Proxy or VPN",
      verdict: "unknown",
      detail: "This ipstack plan has no security module, so proxy status is unavailable.",
    });
  }

  // 2 — Tor
  if (sec?.is_tor) {
    score += 30;
    signals.push({ label: "Tor exit node", verdict: "flag", detail: "Traffic is exiting the Tor network." });
  } else if (sec?.is_tor === false) {
    signals.push({ label: "Tor exit node", verdict: "clear", detail: "Not a known Tor exit." });
  }

  // 3 — Hosting / datacenter. Falls back to an ISP-name heuristic without the
  //     security module, because a datacenter IP is rarely a residential user.
  const hostingFlag = sec?.hosting_facility;
  const hostingGuess = isp ? HOSTING.test(isp) : false;
  if (hostingFlag || (hostingFlag == null && hostingGuess)) {
    score += 20;
    signals.push({
      label: "Datacenter connection",
      verdict: "caution",
      detail: hostingFlag
        ? `ipstack flags this as a hosting facility${isp ? ` — ${isp}` : ""}.`
        : `ISP name matches a hosting provider — ${isp}. Location may not reflect a real person.`,
    });
  } else if (isp) {
    signals.push({
      label: "Datacenter connection",
      verdict: "clear",
      detail: `Looks like a consumer network — ${isp}.`,
    });
  }

  // 4 — Crawler
  if (sec?.is_crawler) {
    score += 10;
    signals.push({
      label: "Known crawler",
      verdict: "caution",
      detail: `Fingerprint matches ${sec.crawler_name ?? "a known crawler"}.`,
    });
  }

  // 5 — ipstack's own threat rating
  if (sec?.threat_level) {
    const high = sec.threat_level !== "low";
    if (high) score += 25;
    signals.push({
      label: "Threat level",
      verdict: high ? "flag" : "clear",
      detail: `ipstack rates this address "${sec.threat_level}"${sec.threat_types?.length ? ` — ${sec.threat_types.join(", ")}` : ""}.`,
    });
  }

  // 6 — Location precision. A country-only fix tells you little about who this is.
  const precise = geo.city && geo.zip;
  signals.push({
    label: "Location precision",
    verdict: precise ? "clear" : "caution",
    detail: precise
      ? `Resolves to ${geo.city}, ${geo.region_name ?? ""} ${geo.zip}`.trim()
      : `Only resolves to ${geo.country_name ?? "an unknown country"} — no city-level fix.`,
  });

  return {
    score: Math.max(0, Math.min(100, score)),
    band: band(score),
    signals,
    heuristicOnly: !securityModule,
  };
}
