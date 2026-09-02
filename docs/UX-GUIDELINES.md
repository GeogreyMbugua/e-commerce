# AudioVintage UX Guidelines

These guidelines define the experience bar for AudioVintage across the
storefront, future account surfaces, checkout, admin tools, and Listening Room.
They preserve the established brand while preventing the common failure mode
of treating ecommerce UX as a collection of isolated screens.

## Experience principles

1. **Trust before conversion.** Customers should understand condition, testing,
   defects, price, shipping, and returns before being asked to buy.
2. **One clear next action.** Each state should make the primary action and
   recovery action obvious.
3. **Progressive disclosure.** Show essential decision-making information first;
   reveal deeper specifications and history without hiding important warnings.
4. **Mobile is a primary context.** Do not shrink a desktop composition and
   call it responsive. Recompose hierarchy, imagery, controls, and spacing for
   touch screens.
5. **Consistency reduces cognitive load.** The same product, price, status,
   cart, and action patterns must behave the same across homepage, search,
   listing, quick view, detail, and checkout.
6. **Feedback is part of the action.** Every asynchronous action communicates
   progress, success, failure, and what can be done next.
7. **Accessible by default.** Keyboard, screen-reader, touch, contrast, and
   reduced-motion behavior are requirements, not a later polish pass.

## AudioVintage visual foundation

### Color roles

Use the existing design tokens rather than arbitrary page-specific colors:

- `brand-cream`: page and warm neutral surfaces.
- `brand-ink`: primary text, navigation, and strong contrast surfaces.
- `brand-rust`: primary action, active state, links, and editorial accent.
- `brand-gold`: small highlights, badges, and secondary emphasis.
- `brand-teal`: supporting accent used sparingly.

Color is a role, not decoration. Do not use color alone to communicate stock,
condition, payment, or fulfillment state. Every status needs text or an icon
with an accessible label.

### Typography and spacing

- Use the established typography scale and line-height tokens.
- Keep body text readable at mobile widths.
- Use comfortable line length for editorial copy and product descriptions.
- Use spacing to establish hierarchy; do not compensate for weak hierarchy by
  making every heading large.
- Keep buttons and inputs visually aligned within a section.
- Do not introduce one-off sizes when an existing token communicates the same
  intent.

### Imagery

- Product images should show the actual item, not a generic substitute.
- Preserve natural equipment colors and avoid applying a uniform muddy tint.
- Use consistent aspect ratios for card media.
- Provide meaningful alternative text; decorative images use empty alt text.
- Use object positioning to preserve the important part of an item on mobile.
- Editorial hero images may be atmospheric, but product evidence must remain
  clear and honest.

## Responsive rules

### Breakpoint behavior

Design and test at minimum:

- Small phone: 320–374px.
- Large phone: 375–639px.
- Tablet: 640–1023px.
- Desktop: 1024–1439px.
- Large desktop: 1440px and above.

At each breakpoint verify:

- No horizontal overflow.
- No clipped labels or controls.
- Primary content appears before secondary content.
- Touch targets remain usable.
- Images do not disconnect from the text that explains them.
- Header and navigation do not consume disproportionate viewport height.

### Mobile composition

- Mobile hero sections should be immersive, readable, and vertically
  intentional.
- Keep copy, CTA, and supporting imagery within one clear visual narrative.
- Use full-width sections when cards would create unnecessary fragmentation.
- Avoid placing critical actions behind hover states.
- Keep the mobile menu closed after a destination is selected.
- Preserve scroll position or provide an intentional return path after navigation.

## Navigation and discovery

- Primary navigation should expose the small set of destinations that matter:
  Home, Shop, Listening Room, and Contact.
- Secondary destinations belong in account, footer, or contextual navigation.
- The current location must be visible through active state, title, or
  breadcrumb.
- Navigation links must have meaningful accessible names.
- Search should accept natural input, show the submitted query, and preserve
  filters/sort state in the URL.
- Empty search results should provide recovery suggestions, not a dead end.
- Category pages must expose useful descriptions and product counts only when
  counts are accurate.

## Product listing and detail

### Product cards

Every product card should maintain a consistent structure:

1. Image and availability state.
2. Product title.
3. Condition or key trust signal.
4. Price and currency.
5. Primary action.
6. Secondary actions such as wishlist or quick view.

Rules:

- Do not imply availability when stock is unknown.
- Make card actions keyboard and touch accessible.
- Ensure the title and image lead to the same durable product URL.
- Do not show stale prices from cached client state as authoritative.
- For unique items, communicate quantity limits clearly.

### Product detail trust

The detail view must provide:

- Clear title, model/edition, and product identity.
- Price, currency, and availability.
- Condition grade with plain-language explanation.
- Cosmetic defects and known limitations.
- Testing, restoration, service, or provenance notes.
- Specifications and compatibility.
- Complete image set with useful captions or alt text.
- Shipping cost/eligibility and return summary.
- Add-to-cart state, unavailable state, and recovery behavior.

Never bury defects below persuasive copy or represent restored equipment as
new. The customer’s expectation at purchase must match the order snapshot.

## Cart and checkout

### Cart

- Show line-level price and quantity.
- Provide clear remove, update, and clear-cart actions.
- Show subtotal, shipping/tax estimate, discount, and total separately.
- Identify when a quote must be refreshed.
- Preserve the cart across refresh according to the documented policy.
- Explain unavailable or changed lines rather than silently removing them.

### Checkout

- Guest checkout is the default path.
- Account creation should be optional and never interrupt a purchase.
- Group fields by purpose: contact, billing, shipping, delivery, and payment.
- Mark required fields and provide field-level errors.
- Preserve valid input when a request fails.
- Show a persistent order summary on desktop and an accessible expandable
  summary on mobile.
- Display the final currency and total before payment confirmation.
- Make shipping method eligibility and delivery expectations explicit.
- A payment decline must return the customer to a recoverable state.
- A refresh or back navigation must not create a duplicate order.

Do not use vague labels such as “Process to Checkout.” Use an action that
describes the outcome, such as “Place order” or “Continue to payment.”

## Feedback and state design

Every data-backed surface defines:

- Loading state that preserves layout and communicates progress.
- Empty state that explains why it is empty and offers a next action.
- Error state that is human-readable, safe, and retryable where possible.
- Success state that confirms the durable result.
- Disabled state that explains why an action cannot run.
- Offline/provider-unavailable state where the behavior differs.

Do not hide failures in console logs or show a success toast before the server
has committed the action.

## Forms and controls

- Use native semantic controls where they meet the need.
- Associate labels, descriptions, and errors programmatically.
- Do not use placeholder text as the only label.
- Keep focus visible and predictable after validation or modal closure.
- Use radio groups for mutually exclusive choices.
- Use checkboxes only for independent choices.
- Prevent accidental double submission while a command is in progress.
- Provide explicit confirmation for destructive or irreversible actions.
- Keep touch targets at least 44 by 44 CSS pixels where practical.
- Use clear focus, hover, pressed, selected, and disabled states.

## Dialogs, drawers, and menus

- Give each dialog an accessible name and appropriate role.
- Trap focus while a modal dialog is open.
- Close with Escape when safe.
- Restore focus to the triggering control on close.
- Do not allow an off-screen or invisible modal to trap focus.
- Cart drawers must expose a close control, item count, total, and checkout
  action.
- Mobile navigation must close after route selection and when dismissed.
- Avoid nested dialogs for ordinary product discovery.

## Accessibility requirements

Automated checks are necessary but insufficient. Verify manually:

- Complete keyboard navigation of catalog, cart, checkout, account, dialogs,
  and menus.
- Logical focus order and visible focus indicators.
- Screen-reader names for icon-only actions.
- Announcements for form errors, cart updates, and async results.
- `fieldset` and `legend` for shipping and payment groups.
- Heading hierarchy and landmark structure.
- Contrast for text, controls, focus, and status indicators.
- No information conveyed by color, hover, or motion alone.
- Reduced-motion behavior for carousels, loaders, and transitions.
- Zoom/reflow at 200% and narrow viewport widths.

## Content and editorial experience

- Listening Room articles should have a clear title, excerpt, author,
  publication date, category, hero image, and readable body hierarchy.
- Article content should link naturally to relevant products without turning
  editorial copy into undisclosed advertising.
- Draft or internal Sanity content must never appear publicly.
- Broken, missing, or unpublished article media must have a controlled fallback.
- SEO metadata should be descriptive, unique, and consistent with the article.

## Privacy-safe analytics

Track user intent and system health without collecting unnecessary personal
data. Event names should describe business actions, for example:

- `catalog_search_submitted`
- `product_viewed`
- `cart_line_added`
- `checkout_started`
- `quote_recalculated`
- `payment_failed`
- `order_confirmed`
- `article_viewed`

Events must not include payment credentials, order access tokens, full
addresses, or unnecessary contact details. Analytics must never be a dependency
for completing checkout.

## UX review checklist

Before release, review the complete journey rather than isolated components:

- Can a new shopper understand the offer within one viewport?
- Can a shopper identify condition and defects before adding to cart?
- Does every primary action work with keyboard and touch?
- Are loading, empty, error, and recovery states present?
- Can a guest complete checkout without signing in?
- Can a customer recover from price, stock, provider, and payment changes?
- Does refresh preserve or safely reset the correct state?
- Is the result understandable without color, hover, or animation?
- Does the experience remain coherent at 320px and large desktop widths?

