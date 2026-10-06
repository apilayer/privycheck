import type { ExifReport } from "./exif";
import type { IExposureFinding, IExposureReport } from "@/interfaces/investigation.interface";

const band = (n: number): IExposureReport["band"] =>
  n >= 70 ? "severe" : n >= 45 ? "significant" : n >= 20 ? "moderate" : "minimal";

/**
 * How much a single photo gives away. This is the point of the tool: not that
 * any one field is alarming, but that a stranger can stack them — a precise
 * location, the moment it was taken, and a device serial that links every other
 * photo from the same camera — from a file someone posted without thinking.
 */
export function assessExposure(
  exif: ExifReport,
  address: string | null,
  matchCount: number
): IExposureReport {
  const findings: IExposureFinding[] = [];
  let score = 0;

  if (exif.gps) {
    score += 40;
    findings.push({
      label: "Precise location embedded",
      severity: "high",
      detail: address
        ? `The file carries GPS coordinates that resolve to ${address}.`
        : `The file carries GPS coordinates (${exif.gps.lat.toFixed(5)}, ${exif.gps.lon.toFixed(5)}).`,
    });
  } else {
    findings.push({
      label: "Precise location embedded",
      severity: "none",
      detail: "No GPS coordinates in the file.",
    });
  }

  if (exif.takenAt) {
    score += 15;
    findings.push({
      label: "Capture timestamp",
      severity: "low",
      detail: `Taken ${exif.takenAt}. Combined with a location this places someone at a spot at a moment.`,
    });
  }

  if (exif.camera.serial) {
    score += 25;
    findings.push({
      label: "Device serial number",
      severity: "high",
      detail: `Serial ${exif.camera.serial} is a stable identifier — it links every photo taken on this device, across accounts.`,
    });
  } else if (exif.camera.make || exif.camera.model) {
    score += 5;
    findings.push({
      label: "Device fingerprint",
      severity: "low",
      detail: `Identifies the camera as ${[exif.camera.make, exif.camera.model].filter(Boolean).join(" ")}${exif.camera.lens ? ` with a ${exif.camera.lens}` : ""}.`,
    });
  }

  if (matchCount > 0) {
    score += Math.min(20, 4 + matchCount);
    findings.push({
      label: "Published elsewhere",
      severity: matchCount > 5 ? "high" : "low",
      detail: `This image already appears on ${matchCount} public page${matchCount === 1 ? "" : "s"}, so it can be traced to whatever those pages say about it.`,
    });
  }

  if (!exif.hasAnyMetadata) {
    findings.push({
      label: "Metadata stripped",
      severity: "none",
      detail: "No EXIF survived — the file was re-encoded, or the platform it came from strips metadata on upload.",
    });
  }

  const score_ = Math.max(0, Math.min(100, score));
  const summary =
    score_ >= 70
      ? "This file gives away a great deal. Strip its metadata before sharing."
      : score_ >= 45
        ? "This file carries more than most people would intend to share."
        : score_ >= 20
          ? "Some identifying detail is present, but nothing pinpointing."
          : "Little to nothing identifying is attached to this file.";

  return { score: score_, band: band(score_), findings, summary };
}
