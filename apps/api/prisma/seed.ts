import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    slug: 'speakers',
    name: 'Speakers',
    description: 'Vintage and reference speakers for listening rooms and setups.',
  },
  {
    slug: 'turntables',
    name: 'Turntables',
    description: 'Classic turntables serviced for stable playback.',
  },
  {
    slug: 'amplifiers-receivers',
    name: 'Amplifiers & Receivers',
    description: 'Integrated amps and stereo receivers tested for everyday listening.',
  },
  {
    slug: 'vinyl-records',
    name: 'Vinyl Records',
    description: 'Curated records across jazz, soul, rock, and soundtracks.',
  },
  {
    slug: 'cds',
    name: 'CDs',
    description: 'Pre-owned CDs inspected for playback quality.',
  },
  {
    slug: 'cassettes',
    name: 'Cassettes',
    description: 'Vintage cassette decks and curated tape media.',
  },
  {
    slug: 'dvds',
    name: 'DVDs',
    description: 'Film, music, and collector physical media on DVD.',
  },
  {
    slug: 'vhs-tapes',
    name: 'VHS Tapes',
    description: 'Classic film and music collections on VHS.',
  },
] as const;

const products = [
  {
    slug: 'sony-ta-stereo-amplifier',
    title: 'Sony TA Stereo Amplifier',
    description:
      'Warm vintage integrated amplifier suited for bookshelf speakers and turntable-led setups.',
    categorySlug: 'amplifiers-receivers',
    priceMinor: 2900,
    compareAtMinor: 5900,
    conditionGrade: 'VERY_GOOD' as const,
    conditionNotes: 'Cosmetic wear on the faceplate with clean terminals and quiet operation.',
    testingNotes: 'Power-on, input switching, and volume sweep tested.',
    defects: 'Light scratch on top panel.',
    tags: ['amplifier', 'integrated', 'vintage'],
    isUniqueItem: false,
    quantityAvailable: 2,
    media: {
      url: '/images/products/sony-ta.webp',
      altText: 'Sony TA stereo amplifier',
    },
  },
  {
    slug: 'technics-sl-1200mk2-turntable',
    title: 'Technics SL-1200MK2 Turntable',
    description:
      'Legendary direct-drive turntable with stable speed and a serviced tonearm assembly.',
    categorySlug: 'turntables',
    priceMinor: 89900,
    compareAtMinor: 109900,
    conditionGrade: 'EXCELLENT' as const,
    conditionNotes: 'Serviced platter bearing and cleaned speed selector.',
    testingNotes: '33/45 RPM calibration checked and wow/flutter verified.',
    restorationNotes: 'New stylus recommended on purchase.',
    tags: ['turntable', 'technics', 'direct-drive'],
    isUniqueItem: true,
    quantityAvailable: 1,
    media: {
      url: '/images/products/technics.webp',
      altText: 'Technics SL-1200MK2 turntable',
    },
  },
  {
    slug: 'vintage-integrated-stereo-amplifier',
    title: 'Vintage Integrated Stereo Amplifier',
    description:
      'Compact integrated amp with phono input and balanced presentation for small rooms.',
    categorySlug: 'amplifiers-receivers',
    priceMinor: 2900,
    compareAtMinor: 5900,
    conditionGrade: 'GOOD' as const,
    conditionNotes: 'Original knobs present with minor oxidation on rear panel.',
    testingNotes: 'Left/right channel balance verified at low and moderate volume.',
    defects: 'Small paint chip on rear corner.',
    tags: ['amplifier', 'integrated', 'phono'],
    isUniqueItem: false,
    quantityAvailable: 1,
    media: {
      url: '/images/products/integratedamp.webp',
      altText: 'Vintage integrated stereo amplifier',
    },
  },
  {
    slug: 'classic-stereo-receiver',
    title: 'Classic Stereo Receiver',
    description:
      'All-in-one receiver with AM/FM tuning and speaker outputs for a simple vintage stack.',
    categorySlug: 'amplifiers-receivers',
    priceMinor: 2900,
    compareAtMinor: 5900,
    conditionGrade: 'VERY_GOOD' as const,
    conditionNotes: 'Tuner dial illumination works and speaker terminals are clean.',
    testingNotes: 'FM tuning, tone controls, and headphone output tested.',
    tags: ['receiver', 'fm', 'vintage'],
    isUniqueItem: false,
    quantityAvailable: 1,
    media: {
      url: '/images/products/receiver.webp',
      altText: 'Classic stereo receiver',
    },
  },
  {
    slug: 'curated-vinyl-records',
    title: 'Curated Vinyl Records',
    description:
      'Hand-selected jazz, soul, and classic rock pressings ready for immediate listening.',
    categorySlug: 'vinyl-records',
    priceMinor: 2900,
    compareAtMinor: 9900,
    conditionGrade: 'GOOD' as const,
    conditionNotes: 'Sleeves vary from VG to VG+ with playable vinyl throughout.',
    testingNotes: 'Each record visually inspected for warping and heavy scuffs.',
    tags: ['vinyl', 'records', 'curated'],
    isUniqueItem: false,
    quantityAvailable: 12,
    media: {
      url: '/images/products/curated.webp',
      altText: 'Curated vinyl records',
    },
  },
  {
    slug: 'vintage-cassette-deck',
    title: 'Vintage Cassette Deck',
    description:
      'Two-head cassette deck with clean transport and warm playback for tape collectors.',
    categorySlug: 'cassettes',
    priceMinor: 2900,
    compareAtMinor: 5900,
    conditionGrade: 'GOOD' as const,
    conditionNotes: 'Door latch firm and head cover clear.',
    testingNotes: 'Playback, fast-forward, and rewind tested with a reference tape.',
    defects: 'Minor label wear on front panel.',
    tags: ['cassette', 'deck', 'analog'],
    isUniqueItem: true,
    quantityAvailable: 1,
    media: {
      url: '/images/products/cassets.webp',
      altText: 'Vintage cassette deck',
    },
  },
  {
    slug: 'pre-owned-music-cds',
    title: 'Pre-owned Music CDs',
    description:
      'Pre-owned CDs across soul, jazz, and classic rock with verified playback surfaces.',
    categorySlug: 'cds',
    priceMinor: 2900,
    compareAtMinor: 5900,
    conditionGrade: 'VERY_GOOD' as const,
    conditionNotes: 'Disc surfaces cleaned and jewel cases checked for cracks.',
    testingNotes: 'Spot-checked for read errors on a reference player.',
    tags: ['cd', 'physical-media', 'pre-owned'],
    isUniqueItem: false,
    quantityAvailable: 18,
    media: {
      url: '/images/products/preowned.webp',
      altText: 'Pre-owned music CDs',
    },
  },
  {
    slug: 'classic-film-and-music-collection',
    title: 'Classic Film and Music Collection',
    description:
      'Mixed media collection spanning soundtrack LPs, film scores, and companion CDs.',
    categorySlug: 'dvds',
    priceMinor: 2900,
    compareAtMinor: 5900,
    conditionGrade: 'GOOD' as const,
    conditionNotes: 'Mixed sleeve condition with strong playback copies included.',
    testingNotes: 'Collection grouped and checked for missing inserts.',
    tags: ['collection', 'soundtrack', 'physical-media'],
    isUniqueItem: false,
    quantityAvailable: 4,
    media: {
      url: '/images/products/films.webp',
      altText: 'Classic film and music collection',
    },
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }

  const categoryMap = Object.fromEntries(
    (
      await prisma.category.findMany({
        select: { id: true, slug: true },
      })
    ).map((category) => [category.slug, category.id]),
  );

  for (const product of products) {
    const categoryId = categoryMap[product.categorySlug];

    if (!categoryId) {
      throw new Error(`Missing category for product ${product.slug}`);
    }

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        description: product.description,
        status: 'ACTIVE',
        categoryId,
        priceMinor: product.priceMinor,
        compareAtMinor: product.compareAtMinor,
        currency: 'USD',
        conditionGrade: product.conditionGrade,
        conditionNotes: product.conditionNotes,
        testingNotes: product.testingNotes,
        restorationNotes: product.restorationNotes,
        defects: product.defects,
        tags: [...product.tags],
        isUniqueItem: product.isUniqueItem,
      },
      create: {
        slug: product.slug,
        title: product.title,
        description: product.description,
        status: 'ACTIVE',
        categoryId,
        priceMinor: product.priceMinor,
        compareAtMinor: product.compareAtMinor,
        currency: 'USD',
        conditionGrade: product.conditionGrade,
        conditionNotes: product.conditionNotes,
        testingNotes: product.testingNotes,
        restorationNotes: product.restorationNotes,
        defects: product.defects,
        tags: [...product.tags],
        isUniqueItem: product.isUniqueItem,
      },
    });

    await prisma.productMedia.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productMedia.create({
      data: {
        productId: savedProduct.id,
        url: product.media.url,
        altText: product.media.altText,
        sortOrder: 0,
        isPrimary: true,
      },
    });

    await prisma.inventoryItem.upsert({
      where: { productId: savedProduct.id },
      update: {
        quantityAvailable: product.quantityAvailable,
        quantityReserved: 0,
        status: product.quantityAvailable > 0 ? 'AVAILABLE' : 'ARCHIVED',
      },
      create: {
        productId: savedProduct.id,
        quantityAvailable: product.quantityAvailable,
        quantityReserved: 0,
        status: product.quantityAvailable > 0 ? 'AVAILABLE' : 'ARCHIVED',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
