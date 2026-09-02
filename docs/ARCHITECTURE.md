# AudioVintage Application Architecture

This document describes the current structure of the AudioVintage storefront and the boundaries to preserve when adding search, filtering, intelligence features, authentication, or payments.

## 1. Runtime Shape

The application is a Next.js App Router project using React, TypeScript,
Tailwind CSS, Redux Toolkit, Swiper, and static assets under `public/images`.

The main request flow is:

```text
URL
  -> src/app/(site) route entry
  -> shared src/app/(site)/layout.tsx
  -> Header
  -> route component from src/components
  -> shared modals / ScrollToTop / Footer
```

The current storefront is primarily client-rendered after the site layout's
one-second preloader. Most commerce feature components still use local React
state and static TypeScript data rather than a server or API layer. The
Listening Room is the first Sanity-backed surface and is statically generated
at build time.

The target production architecture keeps the web and API independently
deployable:

```text
GitHub Pages static Next.js web
              |
              v
       Render NestJS API
          |          |
          v          v
    PostgreSQL   Redis/Valkey
```

Sanity remains the editorial source of truth for Listening Room content. The
API and PostgreSQL become the source of truth for transactional commerce.

## 2. App Router and URL Map

`src/app/(site)` is the site route group. The `(site)` directory is organizational and does not appear in a URL.

`src/app/(site)/(pages)` is another route group. `(pages)` also does not appear in a URL. Therefore:

| File location | URL | Component |
| --- | --- | --- |
| `(site)/page.tsx` | `/` | `Home` |
| `(site)/(pages)/shop-with-sidebar/page.tsx` | `/shop-with-sidebar` | `ShopWithSidebar` |
| `(site)/(pages)/shop-without-sidebar/page.tsx` | `/shop-without-sidebar` | `ShopWithoutSidebar` |
| `(site)/(pages)/shop-details/page.tsx` | `/shop-details` | `ShopDetails` |
| `(site)/(pages)/cart/page.tsx` | `/cart` | `Cart` |
| `(site)/(pages)/checkout/page.tsx` | `/checkout` | `Checkout` |
| `(site)/(pages)/wishlist/page.tsx` | `/wishlist` | `Wishlist` |
| `(site)/(pages)/my-account/page.tsx` | `/my-account` | `MyAccount` |
| `(site)/(pages)/signin/page.tsx` | `/signin` | `Signin` |
| `(site)/(pages)/signup/page.tsx` | `/signup` | `Signup` |
| `(site)/(pages)/contact/page.tsx` | `/contact` | `Contact` |
| `(site)/(pages)/error/page.tsx` | `/error` | `Error` |
| `(site)/(pages)/mail-success/page.tsx` | `/mail-success` | `MailSuccess` |
| `(site)/blogs/blog-grid/page.tsx` | `/blogs/blog-grid` | `BlogGrid` |
| `(site)/blogs/blog-grid-with-sidebar/page.tsx` | `/blogs/blog-grid-with-sidebar` | `BlogGridWithSidebar` |
| `(site)/blogs/blog-details/page.tsx` | `/blogs/blog-details` | `BlogDetails` |
| `(site)/blogs/blog-details-with-sidebar/page.tsx` | `/blogs/blog-details-with-sidebar` | `BlogDetailsWithSidebar` |

The route files should stay thin: define metadata, compose a page-level component, and avoid business logic.

## 3. Shared Site Layout

`src/app/(site)/layout.tsx` is the shared shell for every route in this group. It currently owns:

- Global font and stylesheet imports.
- Favicon and base-path-aware asset URL setup.
- The loading screen state and one-second preloader.
- The shared `Header` and `Footer`.
- Redux state through `ReduxProvider`.
- Quick-view, cart-sidebar, and preview-slider context providers.
- Global modal instances.
- The floating `ScrollToTop` control.

Provider order matters because consumers must remain below their matching provider:

```text
ReduxProvider
  CartModalProvider
    ModalProvider
      PreviewSliderProvider
        Header + route children + modal instances
```

The layout is marked `use client` because it owns loading state and client providers. A future server-backed implementation should keep the route/layout composition server-friendly where possible and isolate client providers into a dedicated providers component.

## 4. Home Page Composition

`src/app/(site)/page.tsx` renders `src/components/Home/index.tsx`. The home component is a section orchestrator, not a data service:

```text
Home
  Hero
    HeroCarousel
    HeroFeature
  Categories
  NewArrivals
  PromoBanner
  BestSeller
  Countdown
  Testimonials
  Newsletter
```

Home content is currently assembled from local components and static data. The hero uses Swiper autoplay and pagination. Product sections should eventually consume the same catalog query/data contract as the shop pages so home merchandising and search results cannot drift apart.

## 5. Navigation Model

`src/components/Header/menuData.ts` is the source of truth for the current primary navigation. `Menu` is recursive:

```ts
type Menu = {
  id: number;
  title: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
};
```

Current top-level destinations are:

- `Home` -> `/`
- `Shop` -> `/shop-with-sidebar`
- `Listening Room` -> `/blogs/blog-grid`
- `Contact` -> `/contact`

`Header/index.tsx` renders the direct links and owns search input state, cart
opening, responsive navigation state, and sticky-header state. The header
search form currently captures text but does not submit or query a catalog.

Recommended navigation extensions:

- Keep `menuData` focused on navigation presentation and route destinations.
- Add `slug`, `kind`, or `resource` only when the UI needs semantic navigation metadata.
- Keep search suggestions, analytics, authorization checks, and feature flags outside the menu data structure.
- Use stable unique IDs. The current submenu contains duplicate IDs (`62`), which should be corrected before menu analytics or keyed operations depend on them.

## 6. Catalog and Product Data

The storefront catalog is served by the NestJS API (`GET /api/v1/products`,
`GET /api/v1/products/:slug`) and consumed through:

- `src/lib/catalog.ts` — fetch client
- `src/lib/catalog-adapter.ts` — maps API DTOs to the legacy `Product` card shape
- `src/hooks/useCatalogProducts.ts` — client-side listing for home/blog widgets
- `src/hooks/useShopCatalog.ts` — URL-synced shop filters

Shop, product detail, home sections, and blog sidebars all read from this API.
Do not reintroduce a parallel static product list.

### Product images

Product photos are **transactional catalog media**, not Sanity editorial assets.

| Layer | Responsibility |
| --- | --- |
| `ProductMedia` (Postgres) | Stores `url`, `altText`, `sortOrder`, `isPrimary` per product |
| `public/images/products/` | **Interim** static asset host bundled with the GitHub Pages export |
| Object storage + CDN | **Target** production delivery (S3/R2 + public HTTPS URLs) |
| Sanity | Editorial images only (Listening Room, hero, Portable Text) |

**Interim (current):** seed data stores site-relative paths such as
`/images/products/sony-ta.webp`. The API returns those paths unchanged. The
storefront resolves them in one place:

```text
API ProductMedia.url
  -> catalog-adapter (preserve altText)
  -> BrandedImage via src/lib/product-images.ts (basePath + CDN pass-through)
  -> next/image (unoptimized static export)
```

**Production target:** upload product photos to object storage, persist absolute
CDN URLs in `ProductMedia`, optionally pre-generate thumb/card/detail variants,
and add `remotePatterns` in `next.config.js` for the CDN host. Do not store
product inventory images in Sanity unless an explicit sync contract is added.

Rules:

- Postgres owns product media references; Sanity owns editorial image refs.
- All product `<Image>` rendering goes through `BrandedImage`.
- Meaningful `altText` flows from the API through `Product.imageAlt` /
  `Product.imgs.alts`.
- Static export cannot run Next.js image optimization; optimize at upload time
  or ship pre-compressed assets (prefer `.webp`).

This is sufficient for a visual prototype but not for reliable commerce logic. Before adding search or AI, introduce a canonical catalog model and repository boundary, for example:

```text
components -> catalog hooks/query functions -> catalog repository -> API/CMS/database
```

The canonical model should eventually include `slug`, category/tags, searchable text, inventory/availability, currency, tax class, media, variants, and stable external IDs. Keep display formatting in components and filtering/sorting in query logic.

## 7. State and Interaction Boundaries

### Redux Toolkit

`src/redux/store.ts` registers:

- `cartReducer`: cart lines and total-price selector.
- `wishlistReducer`: wishlist lines.
- `quickViewReducer`: quick-view product state.
- `productDetailsReducer`: selected product for the detail page.

`src/redux/provider.tsx` exposes the store to the shared layout.

The cart and wishlist actions are local client state. They are not persisted, authenticated, or synchronized with a backend yet.

### React Context

- `CartSidebarModalContext`: open/close state for the cart drawer.
- `QuickViewModalContext`: open/close state for the quick-view modal.
- `PreviewSliderContext`: open/close state for image preview.

These contexts should remain UI state. Cart contents, customer identity, checkout state, and payment status belong in domain/application state rather than modal contexts.

### Product detail handoff

Product cards dispatch `productDetailsReducer` and the detail page also reads/writes `localStorage` under `productDetails`. This creates a refresh-dependent fallback and couples navigation to client state. A route such as `/shop-details/[slug]` or `/products/[id]` should become the durable product identity once a real catalog exists.

## 8. Current Gaps to Know Before Integrating Logic

- Wishlist state is client-only; cart and checkout quotes persist via guest tokens + API.
- Checkout collects a server quote; inventory reservations are created when placing an order (payment arrives in Slice 4).
- Checkout components collect/display checkout information but there is no order API or payment provider boundary.
- Authentication pages are presentational; no session boundary is wired.
- The primary Listening Room grid and slug-based article pages query Sanity at
  build time; legacy sidebar blog routes still use local template data.
- Legacy `ShopDetails` template remains in the tree but `/shop-details` redirects to the shop; use `/shop/[slug]` for product detail.

These are architectural boundaries, not reasons to rewrite the current UI. Add one domain boundary at a time behind the existing components.

## 9. Integration Roadmap

### Search

1. Define a canonical `CatalogProduct` and a catalog repository/query function
   in the API.
2. Make the header search submit to a route such as `/search?q=...`.
3. Parse and validate query parameters in the route/page layer.
4. Apply search, category, price, availability, and sort criteria in one query
   pipeline.
5. Reuse the same result contract for grid/list views and AI suggestions.

### Backend foundation

1. Create the NestJS API as a modular monolith under the future monorepo
   `apps/api` boundary.
2. Establish PostgreSQL/Prisma migrations, typed configuration, health checks,
   structured logging, and test infrastructure.
3. Implement catalog and inventory ownership before exposing cart or checkout
   commands.
4. Add guest carts, server-generated quotes, reservations, orders, and payment
   webhooks in that order.
5. Add OIDC identity, customer ownership, admin authorization, audit logs, and
   operational workflows.
6. Generate the web client from the reviewed OpenAPI contract rather than
   coupling frontend components to Prisma types.

The first implementation should remain a modular monolith on Render. Split
services only when independent scaling, deployment isolation, or ownership
requirements are demonstrated.

### Filtering

Represent filters as serializable URL state, for example:

```text
/shop-with-sidebar?category=turntables&minPrice=50&maxPrice=500&sort=latest
```

The URL should be the shareable source of truth. Local component state can control temporary UI interaction, but the applied filter state should be derived from URL parameters and reflected in the result count.

### AI or intelligence layer

Place AI behind a server-side application service, never directly in browser components with secret credentials:

```text
UI -> /api/assistant or server action -> catalog/search/order tools -> model provider
```

Useful first capabilities are natural-language catalog search, product comparison, compatibility questions, and assisted discovery. The intelligence layer should call constrained, typed tools and return product IDs or query criteria that the normal catalog pipeline resolves. It should not invent price, stock, shipping, or payment state.

### Payments

Treat checkout as a state machine rather than a button-to-provider call:

```text
cart -> checkout session -> payment intent/session -> provider confirmation
     -> server webhook -> paid order -> confirmation page
```

Add a server-owned order/payment module with idempotency keys, provider webhooks, currency handling, amount calculation, and a durable order record. The browser may start checkout and display status, but the server must calculate totals and decide whether an order is paid.

## 10. Development Rules

- Keep App Router route files thin and colocate route-specific metadata there.
- Keep reusable UI in `src/components` and domain types in `src/types` or a future domain module.
- Do not import static catalog arrays directly from many UI components once an API exists.
- Keep UI modal visibility in context and business state in Redux/server state.
- Use URL parameters for shareable search/filter/sort state.
- Use server-side code for secrets, payment calls, order creation, webhooks, and AI provider calls.
- Preserve `NEXT_PUBLIC_BASE_PATH` compatibility for GitHub Pages assets and links.
- Keep GitHub Pages and Render deployments independently buildable and
  deployable.
- Keep Sanity editorial reads separate from PostgreSQL transactional writes.
- Require an API contract, migration plan, workflow specification, and tests
  before implementing a new backend domain.
- Add focused tests around catalog queries, cart totals, order totals, payment webhook handling, and navigation URL generation as those capabilities are introduced.
