export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string[];
  description: string;
  cta: string;
  ctaHref: string;
  productImage: string;
  productAlt: string;
  productWidth: number;
  productHeight: number;
  desktopProductClassName: string;
  mobileProductClassName: string;
  /** Per-slide mobile poster background */
  mobileBackground: string;
  mobileBackgroundPosition: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "vintage-hifi",
    eyebrow: "VINTAGE HI-FI",
    title: ["Old Sound.", "Real Character."],
    description:
      "Discover carefully selected vintage speakers, turntables and classic hi-fi equipment for listeners who appreciate sound with history.",
    cta: "Explore the Collection",
    ctaHref: "/shop-with-sidebar",
    productImage: "/images/hero/3way.png",
    productAlt: "Vintage turntable and speakers setup in a boutique audio store",
    productWidth: 674,
    productHeight: 370,
    desktopProductClassName: "xl:translate-x-4 xl:scale-[1.02]",
    mobileProductClassName: "",
    mobileBackground: "/images/hero/canva2.webp",
    mobileBackgroundPosition: "62% center",
  },
  {
    id: "classic-equipment",
    eyebrow: "CLASSIC EQUIPMENT",
    title: ["Built to Be Heard."],
    description:
      "Explore vintage amplifiers, receivers, speakers and turntables selected for their character, craftsmanship and lasting appeal.",
    cta: "Shop Audio",
    ctaHref: "/shop-with-sidebar?category=amplifiers-receivers",
    productImage: "/images/hero/hero6.png",
    productAlt: "Classic vintage amplifier and receiver with a warm walnut finish",
    productWidth: 612,
    productHeight: 394,
    desktopProductClassName: "xl:-translate-x-2 xl:scale-[1.04]",
    mobileProductClassName: "",
    mobileBackground: "/images/hero/hero-background.jpg",
    mobileBackgroundPosition: "48% 38%",
  },
  {
    id: "physical-media",
    eyebrow: "PHYSICAL MEDIA",
    title: ["Own the Music.", "Keep the Format."],
    description:
      "Browse vinyl, CDs, cassettes and other physical media for collectors, enthusiasts and anyone who enjoys owning what they listen to.",
    cta: "Browse Media",
    ctaHref: "/shop-with-sidebar?category=vinyl-records",
    productImage: "/images/hero/vinyleplayerandspeakers.png",
    productAlt: "Vintage record collection and media shelf in a curated vinyl shop",
    productWidth: 500,
    productHeight: 500,
    desktopProductClassName: "xl:translate-x-3 xl:scale-105",
    mobileProductClassName: "",
    mobileBackground: "/images/hero/herobg3.webp",
    mobileBackgroundPosition: "center 42%",
  },
];

export const heroCollectionRail = [
  {
    label: "Turntables",
    href: "/shop-with-sidebar?category=turntables",
  },
  {
    label: "Speakers",
    href: "/shop-with-sidebar?category=speakers",
  },
  {
    label: "Amplifiers",
    href: "/shop-with-sidebar?category=amplifiers-receivers",
  },
  {
    label: "Vinyl",
    href: "/shop-with-sidebar?category=vinyl-records",
  },
] as const;
