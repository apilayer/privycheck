"use client";

import { useState } from "react";
import { AddressLookup } from "./AddressLookup";
import { ImageInvestigator } from "./ImageInvestigator";
import { IpFraudCheck } from "./IpFraudCheck";
import { NewsSearch } from "./NewsSearch";

type Tab = { id: string; label: string; blurb: string; apis: string; render: () => React.ReactNode };

const TABS: Tab[] = [
  {
    id: "image",
    label: "Image",
    blurb: "Read a photo's metadata, place it on a map, and find where else it's published.",
    apis: "zenserp · positionstack",
    render: () => <ImageInvestigator />,
  },
  {
    id: "ip",
    label: "IP address",
    blurb: "Location, network, and VPN, proxy or datacenter signals behind an address.",
    apis: "ipstack · positionstack",
    render: () => <IpFraudCheck />,
  },
  {
    id: "news",
    label: "Name",
    blurb: "What the press has published about a person or company.",
    apis: "zenserp",
    render: () => <NewsSearch />,
  },
  {
    id: "address",
    label: "Address",
    blurb: "Resolve a property listing to coordinates and a normalised record.",
    apis: "positionstack",
    render: () => <AddressLookup />,
  },
];

export function Workbench() {
  const [active, setActive] = useState("image");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section id="workbench" className="scroll-mt-20">
      <div
        role="tablist"
        aria-label="What to investigate"
        className="flex flex-wrap gap-1 rounded-xl border border-border bg-bg-elev p-1"
      >
        {TABS.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={`mono flex-1 rounded-lg px-3 py-2 text-xs tracking-wide whitespace-nowrap transition ${
                isActive
                  ? "bg-bg-elev-2 font-semibold text-fg"
                  : "text-fg-dim hover:text-fg"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
        <p className="text-xs text-fg-muted">{tab.blurb}</p>
        <span className="mono text-[10px] tracking-wider text-fg-dim uppercase">{tab.apis}</span>
      </div>

      <div role="tabpanel">{tab.render()}</div>
    </section>
  );
}
