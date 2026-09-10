# AudioVintage — Internal Presentation Write-Up

## One-liner

**AudioVintage** is a direct-to-consumer storefront for carefully selected
vintage hi-fi gear and physical media — built as a real commerce platform (not
just a UI template), with a branded Next.js front end, a NestJS API, Sanity for
editorial content, and Stripe-ready checkout.

**Live preview:** [geogreymbugua.github.io/e-commerce](https://geogreymbugua.github.io/e-commerce/)

---

## Why this project exists

Vintage audio buyers need more than a generic product grid. They need trust:
condition, testing notes, restoration history, availability of one-of-a-kind
items, and a clear path from discovery to delivery.

AudioVintage is scoped as a **single-market DTC shop**, not a marketplace or
social network. The product goal is simple: help collectors and listeners find
the right piece, understand what they’re buying, and complete checkout with
confidence.

---

## What we’re building (product surface)

| Area | What shoppers see |
| --- | --- |
| **Home** | Branded hero, categories, new arrivals, best sellers, promos, testimonials, newsletter |
| **Shop** | Filterable vintage catalogue (equipment + media), product cards, detail pages |
| **Listening Room** | Editorial articles from Sanity (guides, culture, collecting) |
| **Cart / Wishlist / Checkout** | Guest-first commerce flows |
| **Account / Auth** | Sign-in, sign-up, and account surfaces (identity wiring still maturing) |
| **Contact / support** | Branded contact and post-purchase confirmation/status pages |

**Primary nav today:** Home → Shop → Listening Room → Contact

---

## Architecture at a glance

```text
GitHub Pages (Next.js static export)
        │
        ├── Sanity (Listening Room editorial)  — build-time reads
        │
        └── Render NestJS API
                ├── PostgreSQL  (catalog, carts, orders, payments…)
                └── Redis/Valkey (queues / cache)
```

**Source-of-truth split (important design choice):**

- **Sanity** owns Listening Room articles and editorial media
- **PostgreSQL** owns transactional commerce (products, inventory, carts,
  orders, payments)
- The **browser is untrusted** — prices, stock, and payment outcomes are
  revalidated on the server

---

## Tech stack

| Layer | Choices |
| --- | --- |
| Storefront | Next.js (App Router), React, TypeScript, Tailwind, Redux Toolkit |
| CMS | Sanity Studio (`studio/`) + Portable Text |
| API | NestJS modular monolith (`apps/api`) |
| Data | Prisma + PostgreSQL |
| Async | Redis/Valkey (BullMQ) |
| Payments | Stripe (Payment Elements / webhooks) |
| Deploy | Storefront → GitHub Pages; API + DB + Redis → Render (`render.yaml`) |
| Tooling | pnpm workspace, Docker Compose for local infra |

---

## What’s in place today

### Storefront & brand (v2)

- Full AudioVintage visual identity (cream / rust / gold / teal / ink)
- Responsive homepage and shop experience tuned for desktop and mobile
- Cart sidebar, quick view, wishlist, checkout UI
- Static export deployed automatically from `main` to GitHub Pages

### Listening Room (Sanity)

- Independent Studio with article, author, category, and SEO schemas
- Published articles statically generated into `/blogs/...`
- No Sanity write tokens in the public site — content is pulled at build time

### Commerce backend (in progress / wired)

API modules already exist for:

- **Catalog** — products & categories
- **Cart** — guest cart persistence via secure tokens
- **Checkout** — server-generated quotes / reservations
- **Orders & Payments** — Stripe webhook path
- **Customers** — authenticated customer surface
- **Notifications** — email/order messaging foundation

Local/dev scripts cover API migrate/seed, Stripe webhook forwarding, and infra
via Docker Compose.

---

## How a purchase is meant to work

1. **Discover** — browse home/shop, filter, open a shareable product URL
2. **Decide** — see condition, availability, media, and specs (trust-first PDP)
3. **Cart** — guest cart survives refresh; unique items typically qty = 1
4. **Checkout** — server builds the quote; inventory can be reserved
5. **Pay** — Stripe confirms; **webhooks** (not the browser) mark the order paid
6. **After** — confirmation / status pages; optional account later

Guest-first is intentional: accounts are optional; cart merge happens after
sign-in.

---

## How we protect one-of-a-kind stock (client talking points)

Vintage audio is often **unique**: one Technics turntable, one Pioneer receiver.
A fair question from any stakeholder is:

> What happens if two customers want the same item at the same time?

### The simple answer

**Putting something in a cart does not take it off the shelf.**  
**Starting checkout does.**

That matches how serious online shops work: the cart is interest; checkout is
commitment.

### What the customer experiences

| Moment | What happens |
| --- | --- |
| **Browsing the shop** | They see items that are currently available to buy |
| **Add to cart** | We check availability, then save the item to *their* cart. Someone else can still add the same piece |
| **Still in cart** | The product usually stays visible in the shop. A cart is not a purchase |
| **Begin checkout** | We **briefly hold** the item for that customer (a reservation) |
| **Someone else tries to buy it** | They are told stock has changed — they cannot complete a second sale of the same unit |
| **Payment succeeds** | The hold becomes a real sale; the item is no longer available |
| **Checkout abandoned** | The hold expires after a short window; the item returns to the shop |

### Why this is the right model for AudioVintage

- **Fair for shoppers** — browsing or “window shopping” in a cart does not
  lock inventory forever and block everyone else.
- **Safe for the business** — two people cannot successfully pay for the same
  one-of-one unit. The server decides at checkout, not the browser.
- **Honest about vintage stock** — unique pieces are limited to quantity one
  where marked; the system refuses overselling under concurrent checkout.

### One slide you can show

```text
Browse / Add to cart     →  Interest (no permanent lock)
Start checkout           →  Short hold for this buyer
Payment confirmed        →  Item sold; removed from available stock
Checkout abandoned       →  Hold expires; item returns to the shop
```

### Lines you can say in the room

- “**Cart means interest. Checkout means commitment.**”
- “We don’t hide a vintage piece just because it’s sitting in someone’s cart —
  that would punish window shopping and inflate abandoned carts.”
- “When two people race to buy the same unit, **only one checkout can win**.
  The other sees a clear ‘no longer available’ outcome — we never sell the
  same physical item twice.”
- “Holds are **temporary**. If someone walks away from payment, the piece
  comes back for the next serious buyer.”

### What this is *not* (yet)

- We are not running a full warehouse / multi-location inventory system.
- We are not locking stock on every “Add to cart” click.
- Order ops and returns remain separate from this catalogue-protection rule.

This behaviour is already implemented in the commerce API (availability checks
on cart; atomic inventory reservation at checkout; reservation expiry; stock
reduction after successful payment).

---

## Engineering posture (how we work)

The repo isn’t just code — it has a deliberate doc set under `docs/`:

- Product scope & user workflows
- Architecture & API/data standards
- UX, testing, deployment/ops, cost estimates

Rules the team can cite in a review:

- Thin App Router pages; business logic behind clear boundaries
- URL as source of truth for shop filters
- Secrets and payment/order decisions stay on the server
- Web and API deploy independently
- Editorial vs transactional data stay separate

---

## Demo script (5–7 minutes)

1. **Open the live site** — brand, hero, mobile feel
2. **Shop** — show catalogue filters and a product detail page
3. **Cart drawer** — add item, open sidebar, show guest flow toward checkout
4. **Listening Room** — open a Sanity-backed article (editorial + commerce together)
5. **Architecture slide** — Pages + Sanity + Render API + Postgres/Redis
6. **Stock honesty slide** — cart vs checkout hold for one-of-one vintage items
7. **Close on roadmap** — what “production-ready for real orders” still means

---

## Status & honest next steps

| Done / solid | Still maturing |
| --- | --- |
| Branded static storefront on GitHub Pages | Full end-to-end production order ops |
| Sanity Listening Room at build time | Live content rebuilds / Sanity preview |
| NestJS domains for catalog → cart → checkout → payments | Hardening auth (OIDC), admin ops, audit |
| Render blueprint for API + DB + Redis | Object storage/CDN for product media |
| Docs-driven scope and workflows | Search polish, AI assistant (planned behind API tools) |

**Near-term story for leadership:** we’ve moved from a template UI to a branded,
documented commerce platform with clear ownership boundaries and a path to take
real payments safely.

---

## Talking points

- “We’re not selling a theme — we’re building a **trust-first vintage audio shop**.”
- “**Sanity for stories, Postgres for money** — that split keeps editorial agile
  without risking inventory or payments.”
- “**Guest checkout first**, accounts when they add value.”
- “**Cart means interest; checkout means commitment** — we protect one-of-one
  stock with a short hold at checkout, not by locking every cart.”
- “Payments are a **state machine with webhooks**, not a client-side button.”
- “Static storefront + separately deployable API keeps cost and blast radius low
  while we grow.”
