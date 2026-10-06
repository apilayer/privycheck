import type { ExifReport } from "@/app/lib/exif";
import type { FraudReport } from "@/app/lib/fraud";
import type { PositionstackPlace } from "@/app/lib/positionstack";
import type { ZenserpNewsItem, ZenserpOrganic } from "@/app/lib/zenserp";
import type { IPstackResponse } from "@/app/lib/ipstack";

/** Every API call made for a result, surfaced so the tool shows its working. */
export interface ITrace {
  api: "zenserp" | "ipstack" | "positionstack";
  label: string;
  url: string;
  elapsedMs: number | null;
  status: number | null;
  notice: string | null;
}

export interface IExposureFinding {
  label: string;
  severity: "none" | "low" | "high";
  detail: string;
}

/** How much a single artifact gives away about the person behind it. */
export interface IExposureReport {
  score: number;
  band: "minimal" | "moderate" | "significant" | "severe";
  findings: IExposureFinding[];
  summary: string;
}

export interface IImageResult {
  source: { kind: "upload" | "url"; name: string };
  exif: ExifReport;
  place: PositionstackPlace | null;
  nearby: PositionstackPlace[];
  matches: ZenserpOrganic[];
  exposure: IExposureReport;
  traces: ITrace[];
}

export interface INewsResult {
  query: string;
  items: ZenserpNewsItem[];
  traces: ITrace[];
}

export interface IIpResult {
  ip: string;
  geo: IPstackResponse;
  fraud: FraudReport;
  place: PositionstackPlace | null;
  traces: ITrace[];
}

export interface IApiError {
  error: string;
}
