# Changelog

All notable changes to the AudioVintage storefront are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and releases follow semantic-versioning conventions where practical.

## [Unreleased]

### Fixed

- Isolated the Sanity Studio from the storefront TypeScript project so the
  GitHub Pages build no longer resolves Studio dependencies against the
  storefront’s Sanity version.
- Added a dedicated `studio/pnpm-lock.yaml` and approved only the required
  `esbuild` install script for reproducible Studio CI builds.
- Added a Studio validation job to the GitHub Pages workflow.

### Planned

- Add Sanity preview mode so editors can review unpublished articles.
- Connect the remaining sidebar blog routes to the Sanity article model.
- Add automated content rebuilds when a Sanity article is published.
- Introduce the server-side AI content workflow described in the architecture
  roadmap.

## [2.0.0] - 2026-09-01

Version 2 establishes the AudioVintage brand direction, replaces the generic
template presentation across the primary storefront experience, and connects
the Listening Room to Sanity while preserving the GitHub Pages static-export
deployment model.

### Release metadata

- **Repository:** [GeogreyMbugua/e-commerce](https://github.com/GeogreyMbugua/e-commerce)
- **Branch:** `main`
- **Release commits:** `6f13bbe`, `a54df1a`
- **Deployment target:** GitHub Pages
- **Sanity project:** `lfv6li8u`
- **Sanity dataset:** `production`

### Added

#### Sanity content platform

- Added an independent Sanity Studio under `studio/`.
- Connected the Studio to the AudioVintage Sanity project and `production`
  dataset.
- Added schema types for:
  - `article` — Listening Room articles
  - `author` — article authors and contributor details
  - `articleCategory` — article taxonomy and slugs
  - `seo` — metadata title, description, and keywords
- Added Portable Text support for article bodies, including:
  - Paragraphs
  - Heading levels
  - Bulleted and numbered lists
  - Quotes
  - Inline images with hotspot support
- Added required-field validation for article titles, excerpts, hero images,
  body content, authors, categories, publication dates, and visibility.
- Added generated Sanity schema artifacts:
  - `studio/schema.json`
  - `studio/sanity.types.ts`
- Deployed the schema to the Sanity Content Lake.

#### Sanity-backed Listening Room

- Added a shared read-only Sanity client in `src/lib/sanity.ts`.
- Added published article queries filtered by:
  - `_type == "article"`
  - `visibility == "public"`
  - A defined article slug
  - A defined hero image
- Added Sanity CDN image URL generation for hero and body images.
- Replaced the primary Listening Room grid’s generic static content with
  published Sanity articles.
- Added slug-based article routes at:

  ```text
  /blogs/blog-details/[slug]
  ```

- Added static generation for every published article using
  `generateStaticParams`.
- Added article-level metadata using Sanity SEO fields with title and excerpt
  fallbacks.
- Added Portable Text rendering for the article detail experience.
- Added author, category, publication date, excerpt, and tag presentation.

#### GitHub Pages content configuration

- Added public Sanity project and dataset configuration to
  `.github/workflows/deploy-pages.yml`.
- Documented the build-time Sanity workflow in `README.md`.
- Preserved the `NEXT_PUBLIC_BASE_PATH=/e-commerce` configuration required by
  the repository’s GitHub Pages URL.

### Changed

#### Brand and information architecture

- Rebranded route metadata and page descriptions for AudioVintage.
- Replaced generic template terminology with vintage-audio language.
- Updated primary navigation to:
  - Home
  - Shop
  - Listening Room
  - Contact
- Removed unused generic template submenu entries from the primary navigation.
- Updated breadcrumbs to use the AudioVintage cream, ink, and rust palette.

#### Homepage composition

- Compressed the large-screen header to reduce unused vertical space.
- Improved desktop horizontal utilization with wider responsive containers.
- Improved alignment between the logo, search bar, support controls, account,
  and cart.
- Preserved the existing hero concept and desktop imagery.
- Added a dedicated immersive mobile hero treatment.
- Added darker, more editorial mobile and tablet hero background assets:
  - `public/images/hero/canva2.webp`
  - `public/images/hero/canvabg.webp`
- Improved mobile hero text contrast, product-image integration, spacing, and
  CTA hierarchy.
- Refined the mobile Categories carousel spacing, tile treatment, and
  responsive slide behavior.

#### Catalog experience

- Repositioned the shop around vintage audio equipment and physical media.
- Removed irrelevant template filters for gender, size, and colors.
- Updated shop page titles and product counts.
- Made product-card actions accessible without hover on touch devices.
- Improved mobile grid and list product layouts.
- Added product-detail state updates before navigating from product cards.
- Corrected malformed Tailwind utility classes.
- Hid non-functional pagination controls until real pagination is implemented.
- Updated product-card and shop controls to use AudioVintage brand colors.

#### Supporting storefront pages

- Updated auth, cart, wishlist, checkout, account, contact, error, and
  mail-success surfaces with the AudioVintage palette.
- Replaced generic checkout placeholder product names with vintage audio and
  physical-media examples.
- Improved form focus states and action-button hierarchy.
- Corrected visible copy and button labels, including `Place Order` and
  `Clear Wishlist`.

### Fixed

- Fixed the mobile navigation menu remaining open after selecting a route.
- Added `aria-expanded` and `aria-controls` state to the mobile navigation
  toggle.
- Fixed the mobile navbar logo being rendered as a square crop. The wide
  wordmark now preserves its aspect ratio and uses responsive sizing similar to
  the footer logo.
- Fixed stale shop effect dependencies.
- Fixed product cards not reliably setting the selected product before opening
  the detail route.
- Fixed excessive breadcrumb top spacing.
- Fixed inconsistent generic blue states across branded pages.

### Deployment and runtime behavior

The storefront remains a static export:

```text
Sanity production dataset
        ↓ build-time GROQ query
Next.js static generation
        ↓
GitHub Pages /e-commerce
```

- The browser performs no Sanity write operations.
- No Sanity write token is included in the storefront or GitHub Pages build.
- Sanity’s public project ID and dataset are safe build configuration values.
- Only published Sanity documents with `visibility: public` are included.
- New or edited articles require a new static build before appearing on the
  deployed storefront.
- The GitHub Pages workflow runs automatically on pushes to `main` and can
  also be started manually with `workflow_dispatch`.
- GitHub Pages must use **GitHub Actions** as its Pages source.

### Content publishing runbook

1. Start the Studio locally:

   ```bash
   cd studio
   pnpm dev
   ```

2. Open [http://localhost:3333](http://localhost:3333).
3. Create or update the Author and Article Category records.
4. Create the Listening Room article.
5. Set the article visibility to `Public`.
6. Publish the article in Sanity.
7. Open the repository’s **Actions** tab.
8. Run **Deploy to GitHub Pages** manually, or push a normal code change to
   `main`.
9. Verify the article at:

   ```text
   https://geogreymbugua.github.io/e-commerce/blogs/blog-grid
   ```

### Development and verification

The following checks passed for this release:

```bash
pnpm sanity schemas validate       # from studio/
pnpm sanity schemas deploy         # from studio/
pnpm run build                     # from studio/
pnpm build                         # from repository root
```

The production build generated static pages for all three published articles
at release time:

- `the-turntable-ritual-why-vinyl-makes-us-slow-down`
- `building-your-first-vintage-hi-fi-system`
- `why-vintage-audio-still-sounds-so-good`

### Known limitations and follow-up work

- The GitHub Pages deployment is not ISR-enabled; Sanity changes are not live
  until the static site is rebuilt.
- There is no Sanity preview mode in the storefront yet.
- The primary Listening Room grid and slug-based article pages are Sanity
  backed. The legacy sidebar blog routes still contain template-era static
  content and are not part of this migration.
- Article view counts are not stored or displayed from Sanity.
- The AI content agent has not yet been implemented. The current workflow is
  editor-driven through Sanity Studio.
- The existing lint script uses the deprecated `next lint` flow and remains a
  separate tooling task for the Next.js 16 / ESLint configuration.
- Product catalog, authentication, checkout, payment, and cart persistence
  remain frontend/static concerns and were not converted into backend systems
  in Version 2.

### Rollback guidance

- To roll back the storefront code, revert the Version 2 commits and allow the
  GitHub Pages workflow to publish the resulting `out` directory.
- Do not delete Sanity schemas as part of a storefront rollback. Keep the
  schema and Content Lake data available so a later compatible deployment can
  restore the Listening Room integration.
- If a content change causes a build failure, unpublish or correct the affected
  article in Sanity, then rerun the GitHub Pages workflow.

[Unreleased]: https://github.com/GeogreyMbugua/e-commerce/compare/a54df1a...HEAD
[2.0.0]: https://github.com/GeogreyMbugua/e-commerce/compare/868b9b2...a54df1a
