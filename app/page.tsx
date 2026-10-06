import { ApiBanner } from "./components/ApiBanner";
import { FaqSection } from "./components/FaqSection";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Workbench } from "./components/Workbench";
import { FAQ_DATA } from "./lib/faq";

/** Rendered server-side, so the FAQ is indexed whether or not anyone expands it. */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="mb-8">
          <span className="mono text-[10px] tracking-wider text-accent uppercase">
            OSINT workbench
          </span>
          <h1 className="mt-1.5 max-w-2xl text-2xl font-bold tracking-tight text-fg md:text-3xl">
            See what a photo, an IP address or an address gives away.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">
            Everything here queries publicly available sources. Drop in a photo and
            PrivyCheck reads the metadata the file is carrying — often the exact spot
            and moment it was taken — turns those coordinates into a street address,
            and finds where else the image has been published. The uncomfortable part
            is not that any single field is secret; it is how much can be assembled
            from things that were already public.
          </p>
        </div>

        <Workbench />

        <div className="mt-8">
          <ApiBanner />
        </div>

        <div className="mt-8">
          <FaqSection />
        </div>

        <Footer />
      </main>
    </>
  );
}
