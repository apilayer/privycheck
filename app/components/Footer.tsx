import Image from "next/image";
import Link from "next/link";
import { Mark } from "./Mark";

const YEAR = new Date().getFullYear();

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Investigate",
    links: [
      { label: "Image", href: "/#workbench" },
      { label: "IP address", href: "/#workbench" },
      { label: "Name in the news", href: "/#workbench" },
      { label: "Property address", href: "/#workbench" },
    ],
  },
  {
    title: "APIs used",
    links: [
      { label: "Zenserp — SERP API", href: "https://zenserp.com", external: true },
      { label: "ipstack — IP geolocation", href: "https://ipstack.com", external: true },
      { label: "Positionstack — geocoding", href: "https://positionstack.com", external: true },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "APILayer", href: "https://apilayer.com/", external: true },
      { label: "Zenserp docs", href: "https://zenserp.com/documentation/", external: true },
      { label: "FAQ", href: "/#faq-section" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-4 border-t border-border pt-8">
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 text-fg transition hover:opacity-80">
            <Mark />
            <span className="mono text-sm font-semibold tracking-tight">PrivyCheck</span>
          </Link>
          <p className="max-w-xs text-xs leading-relaxed text-fg-muted">
            An OSINT workbench for publicly available information — what a photo,
            an IP address or an address gives away about the person behind it.
          </p>
          <a
            href="https://apilayer.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-flex w-fit items-center gap-2 text-fg-dim transition hover:opacity-80"
          >
            <span className="mono text-[10px] tracking-wider uppercase">Powered by</span>
            <Image
              src="/apilayer-logo.png"
              alt="APILayer"
              width={80}
              height={16}
              className="h-3.5 w-auto dark:brightness-0 dark:invert"
            />
          </a>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="mono text-[10px] tracking-wider text-fg-dim uppercase">{col.title}</h3>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-fg-muted transition hover:text-fg"
                    >
                      {link.label} <span className="text-fg-dim">↗</span>
                    </a>
                  ) : (
                    <Link href={link.href} className="text-xs text-fg-muted transition hover:text-fg">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-border py-5 text-xs text-fg-dim sm:flex-row sm:items-center sm:justify-between">
        <span className="mono">© {YEAR} PrivyCheck · Zenserp, ipstack &amp; Positionstack by APILayer</span>
        <span className="mono">Only ever queries publicly available sources.</span>
      </div>
    </footer>
  );
}
