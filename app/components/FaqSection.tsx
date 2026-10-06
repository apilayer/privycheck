"use client";

import { useState } from "react";
import { FAQ_DATA } from "@/app/lib/faq";

export function FaqSection({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({ "faq-1": true });
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  return (
    <section
      id="faq-section"
      className={`scroll-mt-20 rounded-xl border border-border bg-bg-elev p-5 md:p-7 ${className}`}
      aria-labelledby="faq-heading"
    >
      <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono text-[10px] font-medium tracking-wider text-accent uppercase">
              FAQ
            </span>
            <span className="text-fg-dim">·</span>
            <span className="mono text-xs text-fg-dim">Frequently asked questions</span>
          </div>
          <h2 id="faq-heading" className="mt-1 text-xl font-bold tracking-tight text-fg md:text-2xl">
            PrivyCheck
          </h2>
        </div>
      </div>

      <div className="mt-4 divide-y divide-border">
        {FAQ_DATA.map((item, index) => {
          const isOpen = Boolean(open[item.id]);
          return (
            <div key={item.id} className="py-4 first:pt-2 last:pb-0">
              <button
                type="button"
                id={`faq-btn-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex w-full items-start justify-between gap-4 rounded-sm text-left font-medium text-fg transition hover:text-accent"
              >
                <div className="flex items-start gap-3">
                  <span className="mono mt-0.5 text-xs font-semibold text-fg-dim select-none">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-fg md:text-base">{item.question}</span>
                </div>
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border bg-bg-elev-2 transition-transform duration-200 ${
                    isOpen ? "rotate-180 border-accent/40 text-accent" : "border-border text-fg-dim"
                  }`}
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${item.id}`}
                  className="mt-3 pr-4 pl-8 text-sm leading-relaxed text-fg-muted"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
