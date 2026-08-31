# Vintage Audio

A vintage audio storefront for collectors and listeners looking for carefully selected classic hi-fi equipment, turntables, speakers, receivers, and physical media.

The storefront is built with Next.js, React, TypeScript, Tailwind CSS, and Redux Toolkit. Its visual identity uses a warm cream, rust, gold, teal, and ink palette inspired by the Vintage Audio logo.

## Live Review

[Open the GitHub Pages site](https://geogreymbugua.github.io/e-commerce/)

Source repository: [github.com/GeogreyMbugua/e-commerce](https://github.com/GeogreyMbugua/e-commerce)

## Features

- Responsive homepage designed for desktop, tablet, and mobile screens
- Vintage audio product catalogue with product detail views
- New arrivals, best sellers, promotional banners, countdown offer, and testimonials
- Quick view, cart, wishlist, and checkout interfaces
- Branded newsletter, navigation, loading screen, and footer
- Static export configured for GitHub Pages

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create the static production export |
| `pnpm start` | Serve a production build locally |
| `pnpm lint` | Run the configured lint command |

## GitHub Pages Deployment

Deployment is automated by [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). A push to `main` builds the static site and publishes the `out` directory through GitHub Pages.

The repository deployment uses `/e-commerce` as its base path. GitHub repository settings must have Pages configured to use **GitHub Actions** as the source.

To test the Pages build locally:

```bash
NEXT_PUBLIC_BASE_PATH=/e-commerce pnpm build
```

### Sanity content

The storefront reads published AudioVintage articles from Sanity during the
static build. The public project ID and dataset are configured in the GitHub
Pages workflow; no Sanity write token is exposed to the storefront.

After publishing an article in Sanity, push a change to `main` or manually run
the **Deploy to GitHub Pages** workflow to rebuild the site and publish the
updated Listening Room content. The Sanity Studio lives in `studio/` and can be
run locally with `cd studio && pnpm dev`.

## Project Structure

- `src/app` contains the Next.js routes, layout, styles, and providers
- `src/components/Home` contains the modular homepage sections
- `src/components/Shop` contains catalogue data and shop views
- `src/components/Common` contains shared UI such as the newsletter, loader, and product cards
- `public/images` contains the storefront, product, logo, and promotional assets

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the route map, shared layout, navigation model, state boundaries, current integration gaps, and guidance for search, filtering, AI, and payments.

See [CHANGELOG.md](CHANGELOG.md) for the Version 2 release record, Sanity
content workflow, deployment behavior, verification results, and rollback
guidance.