import Image from "next/image";
import Link from "next/link";
import { Mark } from "./Mark";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-fg transition hover:opacity-80">
            <Mark />
            <span className="mono text-sm font-semibold tracking-tight">PrivyCheck</span>
          </Link>
          <span className="text-xs text-fg-dim">by</span>
          <a
            href="https://apilayer.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center transition hover:opacity-80"
          >
            <Image
              src="/apilayer-logo.png"
              alt="APILayer"
              width={100}
              height={20}
              priority
              className="h-5 w-auto dark:brightness-0 dark:invert"
            />
          </a>
        </div>
        <div className="flex items-center gap-4 text-xs text-fg-muted">
          <a
            href="https://zenserp.com/documentation/"
            target="_blank"
            rel="noreferrer noopener"
            className="mono hidden text-fg-muted transition hover:text-fg sm:inline"
          >
            docs ↗
          </a>
          <a
            href="https://apilayer.com/"
            target="_blank"
            rel="noreferrer noopener"
            className="mono hidden items-center gap-2 rounded-md border border-border bg-bg-elev-2 px-3 py-1.5 text-xs text-fg-muted transition hover:bg-bg-elev hover:text-fg sm:flex"
          >
            Get an API key
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
