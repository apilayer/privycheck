import Image from "next/image";

const SIGNUP = (product: string) =>
  `https://app.apilayer.com/signup/${product}/?utm_source=privycheck_devtools&utm_medium=internal&utm_campaign=featured_section`;

/**
 * Promo banner for the three APILayer APIs behind the tool. Follows the app's
 * theme toggle — light card with coloured logos in light mode, dark with white
 * logos in dark.
 */
export function ApiBanner() {
  return (
    <a
      href={SIGNUP("zenserp")}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full overflow-hidden rounded-lg border border-[#ED661D]/30 bg-bg-elev transition select-none hover:border-[#ED661D]/70 dark:shadow-2xl"
    >
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#fff4ea] via-white/40 to-[#ED661D]/10 dark:from-[#1a0d04]/90 dark:via-[#0a0a0b]/85 dark:to-[#ED661D]/20" />
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#ED661D]/15 blur-3xl transition-opacity group-hover:bg-[#ED661D]/25" />

      <div className="relative z-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center gap-4">
          <Image
            src="/brand/ipstack-icon.png"
            alt=""
            width={44}
            height={44}
            className="hidden h-11 w-11 shrink-0 rounded-md sm:block"
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="mono text-sm font-bold tracking-tight text-fg">zenserp</span>
              <span className="h-3.5 w-px bg-black/15 dark:bg-white/25" />
              <Image
                src="/brand/ipstack-white.png"
                alt="ipstack"
                width={92}
                height={24}
                className="h-4 w-auto invert dark:invert-0"
              />
              <span className="h-3.5 w-px bg-black/15 dark:bg-white/25" />
              <span className="mono text-sm font-bold tracking-tight text-fg">positionstack</span>
              <span className="h-3.5 w-px bg-black/15 dark:bg-white/25" />
              <Image
                src="/apilayer-logo.png"
                alt="APILayer"
                width={80}
                height={16}
                className="h-3 w-auto dark:brightness-0 dark:invert"
              />
            </div>
            <p className="mono text-[10px] font-semibold tracking-widest text-[#ED661D] uppercase dark:text-[#FD9950]">
              Search · IP intelligence · Geocoding
            </p>
            <p className="max-w-md text-sm leading-snug font-medium text-fg/80">
              Every result on this page comes from three APILayer APIs — the same
              ones you can call from your own code.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ED661D] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#ED661D]/20 transition group-hover:bg-[#FF7917]">
            Get your free API key
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
          <span className="mono text-[9px] tracking-widest text-fg-dim uppercase">
            Powered by APILayer
          </span>
        </div>
      </div>
    </a>
  );
}

/** Single-row variant for tight columns beside a result panel. */
export function ApiBannerCompact({ product, label }: { product: string; label: string }) {
  return (
    <a
      href={SIGNUP(product)}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-[#ED661D]/30 bg-bg-elev px-3 py-2.5 transition select-none hover:border-[#ED661D]/70"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#ED661D]/10 dark:to-[#ED661D]/15" />
      <div className="relative z-10 flex min-w-0 items-center gap-2">
        <span className="mono shrink-0 text-xs font-bold text-fg">{product}</span>
        <span className="mono truncate text-[10px] tracking-widest text-[#ED661D] uppercase dark:text-[#FD9950]">
          {label}
        </span>
      </div>
      <span className="relative z-10 inline-flex shrink-0 items-center gap-1 rounded-md bg-[#ED661D] px-2.5 py-1.5 text-[11px] font-bold text-white transition group-hover:bg-[#FF7917]">
        Get API key
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </a>
  );
}
