# Production Cost Estimate — Single-Client Commerce

This document approximates the infrastructure cost to operate the AudioVintage
commerce platform for **one direct-to-consumer client** when moving from the
current **free/staging** setup to a **production** environment.

Figures are in **USD**, rounded for planning. Verify current pricing on each
vendor’s site before budgeting — cloud list prices change.

**Last reviewed:** March 2026  
**Scope:** Single market, single currency, guest-first checkout, PostgreSQL +
NestJS API, static Next.js storefront, Sanity for editorial content.

---

## Executive summary

| Phase | Monthly fixed infra | Variable (usage) | Best for |
| --- | --- | --- | --- |
| **Current staging** | **$0–$23** | Stripe fees on test/live charges | Development, demos, QA |
| **Production launch** | **$35–$55** | Stripe + email + bandwidth | First real customers |
| **Production + staging** | **$55–$85** | Same | Safe releases with isolated data |
| **Growth** | **$90–$170** | Same + higher bandwidth | Steady traffic, no cold starts |

**Key takeaway:** Fixed infrastructure for a single-client launch is modest
(**~$35–55/month** for production alone). The largest variable cost is
**payment processing (Stripe)**, not hosting. Staging can remain cheap or free;
production should not rely on free-tier cold starts or expiring databases.

---

## Current staging topology (today)

What you are running now:

```text
Shopper
  → GitHub Pages (static Next.js, /e-commerce base path)
  → Render API (audiovintage-api)
  → Render PostgreSQL
  → Render Redis (Key Value)
  → Sanity (Listening Room articles, build-time fetch)
  → Stripe (test mode)
```

| Component | Provider | Current tier | Est. monthly cost |
| --- | --- | --- | --- |
| Storefront | GitHub Pages | Free | **$0** |
| CI/CD | GitHub Actions | Free (public repo limits) | **$0** |
| API | Render Web Service | Free or Starter | **$0–$7** |
| PostgreSQL | Render Postgres | Free or Basic-256MB | **$0–$6** |
| Redis | Render Key Value | Free or Starter | **$0–$10** |
| CMS | Sanity | Free | **$0** |
| Payments | Stripe | Test keys | **$0** fixed |
| Email | Not configured / Mailpit (local) | — | **$0** |
| Custom domain | `*.github.io` subdomain | — | **$0** |
| **Staging total** | | | **$0–$23** |

### Staging limitations (why this is not production)

| Risk | Free / hobby tier behavior |
| --- | --- |
| API cold starts | Free web services spin down; first request after idle can take 30–60s |
| Postgres free | **30-day limit** on free databases; not suitable for long-lived staging |
| Redis free | 25 MB, no persistence guarantee; fine for dev, risky for queues |
| GitHub Pages | No server secrets; subpath URL (`/e-commerce`); fine for demo, weak for brand |
| No isolated prod data | Staging and production must not share orders, inventory, or live Stripe keys |
| Email | Order confirmations do not send without SMTP configuration |

**Recommendation:** Treat the current stack as **staging/QA**. Keep it for
integration testing and pre-release checks. Clone the same architecture for
production with paid, always-on tiers and separate secrets.

---

## Production target topology

```text
                    CUSTOM DOMAIN (e.g. shop.audiovintage.com)
                              |
              +---------------+---------------+
              |                               |
        GitHub Pages                   (optional later:
        or Cloudflare Pages             Vercel / Netlify)
        static Next.js export
              |
              | HTTPS + CORS
              v
        Render Web Service
        NestJS API (always on)
              |
      +-------+-------+
      |               |
  PostgreSQL      Redis / Key Value
  (managed)       (cache / future queues)
              |
              v
        Stripe (live mode)
        Email provider (order notifications)
        Sanity (production dataset)
```

No separate worker is required at launch — the API processes the transactional
outbox inline today. Add a **background worker** only when email volume,
webhook backlog, or reservation expiry work justifies it.

---

## Production infrastructure line items

### 1. Storefront (static web)

| Option | Monthly | Notes |
| --- | --- | --- |
| **GitHub Pages** (recommended at launch) | **$0** | Already integrated; supports custom domain + HTTPS |
| Cloudflare Pages | **$0** | Alternative if you want CDN at the edge without GitHub |
| Vercel / Netlify Pro | **$20+** | Only if you need preview deploys, analytics, or SSR later |

**Launch assumption:** Stay on **GitHub Pages** with a custom domain.  
**One-time / annual:** Domain ~**$12–15/year** (~$1/month).

Remove `NEXT_PUBLIC_BASE_PATH=/e-commerce` when moving to a dedicated domain
(root-hosted shop).

---

### 2. API (NestJS on Render)

| Tier | RAM / CPU | Monthly | Production fit |
| --- | --- | --- | --- |
| Free | 512 MB / 0.1 CPU | $0 | **No** — cold starts break checkout |
| **Starter** | 512 MB / 0.5 CPU | **$7** | **Yes** — minimum for always-on API |
| Standard | 2 GB / 1 CPU | $25 | Upgrade if p95 latency or memory spikes |
| Pro | 4 GB / 2 CPU | $85 | Unlikely needed for single client at launch |

**Launch assumption:** **Starter ($7/month)** per environment.

---

### 3. PostgreSQL (Render)

| Tier | RAM | Storage | Monthly | Production fit |
| --- | --- | --- | --- | --- |
| Free | 256 MB | 1 GB | $0 | **No** — 30-day expiry |
| Basic-256MB | 256 MB | 15 GB | $6 | Tight; OK for very small catalog |
| **Basic-1GB** | 1 GB | 15 GB | **$19** | **Recommended** for launch headroom |
| Basic-4GB | 4 GB | 48 GB | $75 | Growth / large catalog + audit history |

**Launch assumption:** **Basic-1GB ($19/month)** for production.  
**Staging:** Basic-256MB ($6) or shared ephemeral DB for CI only.

Extra storage beyond included: ~**$0.30/GB/month** (Render).

---

### 4. Redis / Key Value (Render)

| Tier | Memory | Monthly | Production fit |
| --- | --- | --- | --- |
| Free | 25 MB | $0 | Dev only |
| **Starter** | 256 MB | **$10** | **Yes** — matches `render.yaml` |
| Standard | 1 GB | $32 | If queue depth or cache grows |

**Launch assumption:** **Starter ($10/month)**.  
**Note:** Health check currently reports Redis as `skipped`; you may defer Redis
until async jobs are active, but the blueprint provisions it for future outbox /
queue work.

---

### 5. Background worker (optional at launch)

| Tier | Monthly | When to add |
| --- | --- | --- |
| Starter web/worker | $7 | Email backlog, webhook retries, or reservation expiry at scale |

**Launch assumption:** **$0** — not required day one.

---

### 6. Sanity CMS (Listening Room)

| Plan | Monthly | Fits single client? |
| --- | --- | --- |
| **Free** | **$0** | **Yes** — 2 datasets, build-time fetch, low API volume |
| Growth | $15/seat | 3+ editors, scheduled publishing, AI assist |

**Launch assumption:** **Free ($0)**.  
Upgrade to Growth if the client needs more than two non-admin editors or
scheduled publishing.

---

### 7. Payments (Stripe)

| Cost type | Rate | Notes |
| --- | --- | --- |
| Card payments (US) | **2.9% + $0.30** per successful charge | Dominant variable cost |
| International cards | +1% typically | Depends on card origin |
| Disputes | $15 per dispute | Operational risk, not infra |
| Payouts | Free to bank (standard) | — |

**Example (illustrative):**

| Monthly orders | Avg order value | Gross GMV | Est. Stripe fees (~3%) |
| --- | --- | --- | --- |
| 30 | $200 | $6,000 | ~$180 |
| 75 | $250 | $18,750 | ~$560 |
| 150 | $300 | $45,000 | ~$1,350 |

Stripe has **no monthly platform fee** for standard Checkout / Elements.

---

### 8. Transactional email

| Provider | Free tier | Paid (typical) |
| --- | --- | --- |
| Resend | 3,000 emails/month | $20/month for 50k |
| SendGrid | 100 emails/day | ~$15–20/month |
| Postmark | 100 emails/month | ~$15/month |

**Launch assumption:** **Resend free tier ($0)** if &lt;3k emails/month, else
**~$20/month**.

---

### 9. Observability (optional at launch)

| Tool | Free tier | Paid |
| --- | --- | --- |
| Render logs | Included | — |
| Sentry | 5k errors/month | ~$26/month Team |
| Uptime monitoring | Better Stack / UptimeRobot free | ~$0–10 |

**Launch assumption:** **$0** (Render logs + manual smoke tests). Add Sentry when
accepting real money at volume.

---

### 10. Object storage / CDN (future)

Product images currently use static paths under `public/`. For production media
at scale:

| Service | Est. monthly |
| --- | --- |
| Cloudflare R2 | ~$0–5 (low traffic) |
| AWS S3 + CloudFront | ~$5–20 |

**Launch assumption:** **$0** — keep images in repo or Sanity until catalog grows.

---

## Recommended deployment tiers

### Tier A — Production launch (minimum viable)

Single client, low traffic, always-on checkout.

| Item | Monthly |
| --- | --- |
| GitHub Pages + custom domain | $0 (+ ~$1 domain amortized) |
| Render API Starter | $7 |
| Render Postgres Basic-1GB | $19 |
| Render Redis Starter | $10 |
| Sanity Free | $0 |
| Email (Resend free) | $0 |
| **Fixed subtotal** | **~$36/month** |
| Stripe processing | Variable (% of GMV) |

---

### Tier B — Production + isolated staging (recommended)

Mirrors your current workflow: test on staging, release to production.

| Environment | Components | Monthly |
| --- | --- | --- |
| **Staging** | API Starter + DB 256MB + Redis free or Starter | **$13–23** |
| **Production** | Tier A stack | **~$36** |
| **Combined fixed** | | **~$49–59/month** |

Rules (from [DEPLOYMENT-OPERATIONS.md](DEPLOYMENT-OPERATIONS.md)):

- Separate Postgres instances — never share order/payment data.
- Staging uses Stripe **test** keys; production uses **live** keys.
- Staging may keep GitHub Pages preview URL or a `staging.` subdomain.

---

### Tier C — Growth (6–12 months post-launch)

More traffic, faster API, room for worker and monitoring.

| Item | Monthly |
| --- | --- |
| Production API Standard | $25 |
| Postgres Basic-1GB or 4GB | $19–75 |
| Redis Starter or Standard | $10–32 |
| Background worker Starter | $7 |
| Sentry Team | $26 |
| Email paid tier | $20 |
| **Fixed subtotal** | **~$90–170/month** |

---

## Annual budget summary (planning ranges)

| Scenario | Monthly | Annual (fixed only) |
| --- | --- | --- |
| Staging only (today) | $0–23 | $0–276 |
| Production launch | $36–55 | $432–660 |
| Production + staging | $55–85 | $660–1,020 |
| Growth | $90–170 | $1,080–2,040 |

Add **Stripe fees** and **domain renewal** on top of fixed infra.

---

## One-time and operational costs (non-infra)

| Item | Est. cost | Notes |
| --- | --- | --- |
| Custom domain | $12–15/year | e.g. Namecheap, Cloudflare Registrar |
| SSL certificates | $0 | Auto via GitHub Pages / Render |
| Stripe account setup | $0 | KYC / business verification time only |
| Legal (privacy, terms, returns) | $0–500+ | Template vs lawyer — client responsibility |
| Backup / restore drill | Time | Quarterly restore test per ops docs |

---

## What changes when going from staging → production

| Setting | Staging (today) | Production |
| --- | --- | --- |
| Storefront URL | `geogreymbugua.github.io/e-commerce` | `shop.clientdomain.com` |
| `NEXT_PUBLIC_BASE_PATH` | `/e-commerce` | `` (empty) |
| `CORS_ORIGIN` / `STOREFRONT_URL` | GitHub Pages origin | Custom domain |
| Stripe keys | `pk_test_` / `sk_test_` | `pk_live_` / `sk_live_` |
| `DATABASE_URL` | Staging Postgres | Production Postgres |
| Render plans | Free / lowest | Starter+ always-on |
| Email | Unconfigured | Resend / SendGrid live |
| Sanity dataset | `production` or `staging` | `production` only for live site |

---

## Cost optimization notes

1. **Defer Redis** until queue/outbox volume needs it — saves **$10/month** if
   you remove the dependency (requires a small code/config change).
2. **Keep GitHub Pages** for the storefront — no need for Vercel at launch.
3. **Stay on Sanity Free** until editorial team grows past two editors.
4. **Use Stripe test mode** on staging indefinitely — no processing fees on test
   charges.
5. **Avoid Render Pro workspace ($25/month)** until you need preview
   environments, team seats, or &gt;5 GB bandwidth included.
6. **Monitor bandwidth** — Hobby workspace includes ~5 GB/month; overage ~$0.15/GB.

---

## Assumptions and exclusions

### Assumptions

- Single storefront, single currency (USD), one Render region (Oregon).
- Catalog &lt;500 SKUs, &lt;10k orders/year at launch.
- Build-time Sanity fetch (no runtime Sanity API from the browser).
- No multi-vendor marketplace, no separate admin SaaS.
- Client provides domain and Stripe business account.

### Excluded from this estimate

- Developer time (build, deploy, support).
- Marketing, ads, photography, packaging, shipping labels.
- Sales tax / VAT compliance tools (e.g. Stripe Tax add-on).
- PCI compliance beyond Stripe-hosted checkout (Stripe handles most PCI scope).
- Mobile apps, ERP, or accounting integrations.

---

## Suggested next steps before production go-live

1. **Register production domain** and point DNS to GitHub Pages.
2. **Provision production Render stack** (duplicate Blueprint with paid tiers).
3. **Keep current stack as staging** with test Stripe keys.
4. **Configure SMTP** (Resend) and verify order confirmation emails.
5. **Switch Stripe to live mode** only after end-to-end staging checkout passes.
6. **Set monthly budget alert** in Render and Stripe dashboards.
7. **Document actual spend** after 30 days and revise this estimate.

---

## Related documents

- [DEPLOYMENT-OPERATIONS.md](DEPLOYMENT-OPERATIONS.md) — topology, environments, rollback
- [PRODUCT-SCOPE.md](PRODUCT-SCOPE.md) — single-market product boundary
- [ARCHITECTURE.md](ARCHITECTURE.md) — system components
- [render.yaml](../render.yaml) — current Render Blueprint

---

## Revision history

| Date | Change |
| --- | --- |
| 2026-03-02 | Initial estimate for single-client staging → production |
