# AudioVintage Product Scope

## Purpose

This document defines the first production scope for AudioVintage. It is the
product boundary for the future NestJS API, PostgreSQL data model, Sanity
content workflow, and GitHub Pages storefront. New features should be checked
against this scope before implementation.

## Product definition

AudioVintage is a single-market, direct-to-consumer ecommerce business selling
carefully selected vintage audio equipment and physical music media. The
storefront should communicate trust as strongly as it communicates discovery:
customers need to understand what an item is, what condition it is in, what
has been tested or restored, what it costs to receive, and what happens after
purchase.

The first production release is intentionally a modular commerce platform, not
a marketplace or a social network.

## Initial decisions

| Decision | Initial rule |
| --- | --- |
| Market | One explicitly configured market and currency |
| Customer model | Direct-to-consumer |
| Checkout | Guest-first; accounts are optional |
| Inventory | Physical goods, including one-of-a-kind items |
| Editorial | Sanity owns Listening Room articles and editorial media |
| Transactions | PostgreSQL owns catalog, inventory, customers, carts, orders, payments, and fulfillment |
| Web deployment | Next.js static export on GitHub Pages |
| API deployment | NestJS on Render |
| ORM | Prisma with PostgreSQL |
| Search | PostgreSQL-backed initially; dedicated search service only when justified |
| Async work | Redis/Valkey queues initially; no Kafka or microservices by default |

## Users and responsibilities

### Shopper

- Browse and search the collection.
- Understand product condition and availability.
- Add products to a guest cart or wishlist.
- Complete checkout without creating an account.
- Receive and securely retrieve order information.
- Request support, cancellation, return, or refund according to policy.

### Returning customer

- Sign in through the configured identity provider.
- Manage profile and addresses.
- View owned orders.
- Merge an existing guest cart after authentication.
- Submit a review only for an eligible purchased item.

### Operations administrator

- Manage products, inventory, condition details, shipping configuration, orders,
  refunds, returns, coupons, and customer support access.
- Move orders through fulfillment states.
- Record operational actions in an audit trail.

### Editorial contributor

- Manage authors and article categories in Sanity.
- Create, edit, preview in a future release, publish, and unpublish Listening
  Room articles.
- Use editorial images without changing transactional product data.

## In scope for the first backend release

### Catalog

- Product identity, stable slug, title, description, category, tags, media,
  price, currency, condition, test/restoration notes, specifications, and
  availability.
- Product detail URLs that work after refresh and can be shared directly.
- Search, category filtering, price filtering, sorting, and pagination.
- Explicit handling for unique items whose purchasable quantity is one.

### Cart and wishlist

- Persistent anonymous carts identified by a secure client token.
- Optional authenticated cart ownership.
- Cart line merging and quantity validation.
- Guest-cart merge after sign-in.
- Wishlist ownership for authenticated customers, with an optional anonymous
  local wishlist policy defined before implementation.

### Checkout and orders

- Guest-first checkout.
- Email, phone, billing address, shipping address, shipping method, payment
  method, and optional order notes.
- Server-generated quote and final total.
- Coupon validation where configured.
- Immutable order line snapshots.
- Separate payment, fulfillment, return, and refund states.

### Inventory

- Inventory quantity and availability.
- Short-lived checkout reservations.
- Atomic reservation for one-of-a-kind products.
- Reservation expiry and release.
- Prevention of overselling under concurrent checkout attempts.

### Identity and customer accounts

- OIDC-based authentication through a managed or self-hosted identity
  provider.
- Optional account creation after guest checkout.
- Profile and address management.
- Customer-owned order access.
- Administrative role checks.

### Post-purchase operations

- Order confirmation.
- Payment status.
- Fulfillment status and tracking reference.
- Cancellation, return, refund, and damaged-item workflows.
- Transactional notifications through a production email provider.

### Editorial content

- Sanity-managed authors, categories, and articles.
- Public published articles rendered in the Listening Room.
- Static rebuild after publication while GitHub Pages remains the deployment
  target.

## Explicitly out of scope for the first backend release

- Multi-vendor or marketplace seller accounts.
- Multi-market tax, currency, and shipping complexity.
- Subscription commerce.
- Product rentals or trade-in workflows.
- Real-time inventory guarantees across physical retail locations.
- Full warehouse management or carrier optimization.
- A custom identity and password system when an OIDC provider is available.
- AI-generated content that publishes without human review.
- Kafka, Kubernetes, microservices, or event sourcing without measured need.
- Replacing Sanity with PostgreSQL for editorial content.
- Storing payment card data in AudioVintage systems.

Out-of-scope items may be added through an ADR and a scope revision. They must
not be introduced indirectly through a schema or endpoint that creates an
unowned responsibility.

## Source-of-truth boundaries

| Data | System of record | Reason |
| --- | --- | --- |
| Articles, authors, article categories, editorial images | Sanity | Editorial authoring and Portable Text |
| Products and product condition | PostgreSQL | Transactional catalog and stable commerce identity |
| Prices and currency | PostgreSQL | Checkout and order integrity |
| Inventory and reservations | PostgreSQL | Atomic concurrency control |
| Customer identity | OIDC provider plus PostgreSQL profile | Identity security plus application ownership |
| Carts and wishlists | PostgreSQL | Durable ownership and merge behavior |
| Orders and line snapshots | PostgreSQL | Financial and operational record |
| Payment status | Payment provider webhook plus PostgreSQL record | Provider-confirmed state |
| Product images | Object storage/CDN or defined catalog media system | Delivery and asset lifecycle |

No feature may silently make two systems authoritative for the same mutable
transactional field. If synchronization is necessary, define the direction,
failure behavior, replay strategy, and reconciliation process first.

## Domain vocabulary

- **Product:** A sellable catalog identity, such as a specific amplifier model
  or a named physical-media edition.
- **Inventory item:** The physical unit or quantity attached to a product.
  Unique vintage equipment normally has one available unit.
- **Condition:** A structured grade plus evidence, defects, cosmetic notes, and
  test/restoration history.
- **Quote:** A server-calculated, time-bounded estimate of merchandise,
  discount, shipping, tax, and total.
- **Reservation:** A short-lived claim on inventory while checkout is in
  progress.
- **Order:** The durable commercial record created from a validated quote.
- **Order snapshot:** The product title, condition summary, price, currency,
  quantity, and discount captured at purchase time.
- **Payment state:** The status of authorization, capture, failure, refund, or
  related provider activity.
- **Fulfillment state:** The operational status from processing through
  delivery, cancellation, or return.
- **Public article:** A Sanity article that is published and has
  `visibility: public`.

## Product quality principles

1. Trust before persuasion: condition, testing, defects, and delivery
   expectations must be visible before checkout.
2. The server owns commerce truth: the browser may request a quote, but it
   cannot decide price, stock, discount, payment, or order state.
3. Every important action is recoverable: refresh, retry, decline, timeout, and
   duplicate submission must have a defined outcome.
4. Unique inventory is treated as a concurrency problem, not just a UI rule.
5. Editorial storytelling and transactional data remain separate but
   complementary experiences.
6. Accessibility, mobile usability, and performance are product requirements.

## Definition of ready for implementation

A backend feature is ready only when:

- Its owner and source of truth are identified.
- User and administrator workflows are written.
- Valid states and forbidden transitions are defined.
- Input, output, authorization, and failure behavior are documented.
- Money, inventory, idempotency, and audit implications are addressed.
- UX loading, empty, error, and recovery states are specified.
- Unit, integration, contract, and E2E coverage are mapped to risk.
- Deployment, observability, rollback, and data migration concerns are known.

