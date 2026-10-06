/** PrivyCheck mark — a magnifier over a shield, for looking into what's exposed. */
export function Mark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M16 2.5 27 6.5v9.2c0 6.9-4.6 12.6-11 14.3-6.4-1.7-11-7.4-11-14.3V6.5L16 2.5z"
        fill="currentColor"
      />
      <circle cx="14.2" cy="14.2" r="4.6" stroke="var(--bg)" strokeWidth="2.1" fill="none" />
      <path
        d="m17.8 17.8 4 4"
        stroke="var(--bg)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
