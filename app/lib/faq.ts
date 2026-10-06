import type { IFaqItem } from "@/interfaces/faq.interface";

export const FAQ_DATA: IFaqItem[] = [
  {
    id: "faq-1",
    question: "What is PrivyCheck?",
    answer:
      "PrivyCheck is a workbench for investigating publicly available information attached to an image, an IP address, or an address. Drop in a photo and it reads the metadata the file is carrying — often the exact coordinates where it was taken, the moment, and the camera's serial number — turns those coordinates into a street address, and finds where else on the web that image has been published. Give it an IP and it reports the location, network, and VPN or proxy signals behind it. Give it a name and it searches the news. Everything it queries is already public; the point is showing how much of it one file gives away.",
  },
  {
    id: "faq-2",
    question: "Which APIs power PrivyCheck?",
    answer:
      "Three APIs from APILayer. Zenserp runs the reverse image search and the news search. ipstack resolves an IP address into its location, network and security signals. Positionstack turns coordinates into a readable address and addresses into coordinates. Nothing is scraped and no private database is consulted — each result is a call you can make yourself.",
  },
  {
    id: "faq-3",
    question: "What is EXIF metadata, and why does it matter?",
    answer:
      "EXIF is the block of data a camera or phone writes into an image file. It commonly records the exact GPS coordinates where the shot was taken, the date and time to the second, the camera make and model, lens, exposure settings, and sometimes the device's serial number. None of that is visible when you look at the picture. A serial number is the one people underestimate most: it is a stable identifier that links every photo from the same device, across accounts and platforms.",
  },
  {
    id: "faq-4",
    question: "What is reverse image search?",
    answer:
      "Reverse image search takes an image and finds pages where that image — or a close match — already appears, rather than searching by keywords. It is how you find the original source of a photo, spot a profile picture reused across several accounts, or check whether a property listing photo has been lifted from somewhere else. Zenserp exposes Google's reverse image results through its API; the image has to be at a publicly reachable URL for the search engine to fetch it.",
  },
  {
    id: "faq-5",
    question: "What is reverse geocoding?",
    answer:
      "Reverse geocoding converts geographic coordinates into a readable address or place. PrivyCheck uses it on the GPS coordinates pulled out of a photo's EXIF, so the raw latitude and longitude become somewhere you can actually recognise. Positionstack supports reverse geocoding along with forward geocoding, which does the opposite — an address in, coordinates out.",
  },
  {
    id: "faq-6",
    question: "How does the IP fraud check work?",
    answer:
      "ipstack is asked what it knows about the address, and PrivyCheck turns that into a risk picture: whether the address is a known proxy or VPN, whether it is a Tor exit node, whether it belongs to a datacenter rather than a consumer network, whether it matches a known crawler, and ipstack's own threat rating. Each signal is listed with the evidence behind it and what it contributed to the score, so you can disagree with the verdict rather than take it on faith. If your ipstack plan has no security module, PrivyCheck says so and falls back to judging the ISP name.",
  },
  {
    id: "faq-7",
    question: "Is any of this private data?",
    answer:
      "No. PrivyCheck reads metadata out of a file you supply and queries public search and geolocation APIs. It does not access private records, breach data, or anything behind a login. The uncomfortable part is not that any single field is secret — it is how much can be assembled from things that were already public.",
  },
  {
    id: "faq-8",
    question: "What can I build with these APIs?",
    answer:
      "Zenserp supports brand monitoring, rank tracking, content verification and image provenance work. ipstack is used for fraud prevention, geo-restriction, content localisation and risk scoring. Positionstack handles address validation, store locators, delivery and logistics routing, and mapping. Together they cover the common ground of any tool that has to answer where something is, who is behind it, and where else it appears.",
  },
];
