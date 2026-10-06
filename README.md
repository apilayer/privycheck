# PrivyCheck

An OSINT workbench for publicly available information. Drop in a photo and it
reads the metadata the file is carrying — often the exact coordinates where it
was taken, the moment, and the camera's serial number — turns those coordinates
into a street address, and finds where else on the web the image has been
published.

The uncomfortable part is not that any single field is secret. It is how much
can be assembled from things that were already public.

Built with **Zenserp**, **ipstack** and **Positionstack**, all
[APILayer](https://apilayer.com/) products.

## What it does

| Tab | What you give it | What comes back | APIs |
| --- | --- | --- | --- |
| **Image** | A photo, or an image URL | EXIF metadata, the address its GPS resolves to, and every public page the image appears on | Zenserp · Positionstack |
| **IP address** | An IPv4/IPv6 address | Location, network, ASN, and VPN / proxy / Tor / datacenter risk signals | ipstack · Positionstack |
| **Name** | A person or company | What the press has published about them | Zenserp |
| **Address** | A property listing address | Coordinates and a normalised address record | Positionstack |

### The chain that matters

The Image tab is the point of the tool. One upload runs:

1. **EXIF extraction** — GPS, timestamp, camera make/model/lens, and serial number.
2. **Reverse geocoding** — those raw coordinates become a street address via Positionstack.
3. **Reverse image search** — Zenserp finds where else that image is published.
4. **Exposure score** — how much all of it together gives away, out of 100.

Every point of the exposure score is attributed to a named finding with the
evidence behind it, so the verdict can be argued with rather than taken on
faith. A device serial number scores highest after location: it is a stable
identifier that links every photo from the same camera, across accounts.

## Running it

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`:

```bash
ZENSERP_API_KEY=        # https://app.zenserp.com/register
IPSTACK_ACCESS_KEY=     # https://ipstack.com
POSITIONSTACK_API_KEY=  # https://positionstack.com

# Optional. Only needed to reverse-image-search *uploads* from a dev machine —
# the URL a search engine should fetch the upload from, e.g. an ngrok tunnel.
PUBLIC_ORIGIN=
```

Any missing or exhausted key degrades gracefully: the affected panel shows the
API's own message and the rest of the case file still renders. Every result
carries an expandable list of the calls behind it, with keys masked.

## Notes on the APIs

- **Reverse image search works for uploads too.** Zenserp fetches the image
  itself, so an upload is parked in a short-lived in-memory store and served
  from `/api/image/blob/<id>` for the length of one search: unguessable id, ten
  minute expiry, `noindex`, never written to disk. This needs the app to be
  reachable from the internet — on `localhost` the panel says so instead of
  sending an unreachable URL. Set `PUBLIC_ORIGIN` to a tunnel URL to test it
  locally.
- **ipstack's security module is not on every plan.** Without it, proxy, Tor and
  threat fields are unavailable; the datacenter signal falls back to matching the
  ISP name, and the UI labels the verdict as heuristic.
- **Nothing private is queried.** PrivyCheck reads a file you supply and calls
  public search and geolocation APIs. No breach data, no private records,
  nothing behind a login.
