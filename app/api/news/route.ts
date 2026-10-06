import { NextRequest } from "next/server";
import { newsSearch } from "@/app/lib/zenserp";
import type { INewsResult, ITrace } from "@/interfaces/investigation.interface";

export const dynamic = "force-dynamic";

/** What the public record says about a name. */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return Response.json({ error: "Provide a name or phrase to search for." }, { status: 400 });
  }
  if (query.length > 120) {
    return Response.json({ error: "Query is too long (120 characters max)." }, { status: 400 });
  }

  const res = await newsSearch(query);
  const traces: ITrace[] = [
    {
      api: "zenserp",
      label: "News search",
      url: res.maskedUrl,
      elapsedMs: res.elapsedMs,
      status: res.status,
      notice: res.notice,
    },
  ];

  const payload: INewsResult = { query, items: res.data ?? [], traces };
  return Response.json(payload, { headers: { "cache-control": "no-store" } });
}
