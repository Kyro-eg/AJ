# A-J Wears It — Delivery TODO

## Public storefront browsing
- [x] Visitors land on the homepage without login or password.
- [x] Header shows “A-J WEARS IT” on the left and a “Hosted by A-J” mascot badge on the right.
- [x] Hero shows “CURATED BY A-J — STREETWEAR & OLD MONEY ESSENTIALS” with quick category filter pills.
- [x] Catalog supports the categories “Outerwear & Sweaters”, “Pleated Trousers & Bottoms”, “Footwear”, “Essentials & Layering”, and “A-J Featured Fits”.
- [x] Product grid uses two columns on mobile and four columns on desktop, showing imagery, title, category, price, and optional badges.
- [x] Clicking a product opens its destination affiliate URL in a new browser tab with safe outbound-link behavior and tracking parameters.
- [x] Footer includes copyright, social links to @aj.wears.it, and a discreet Admin Portal link.

## Admin access and catalog CRUD
- [x] `/admin` and the footer Admin Portal link open the admin surface.
- [x] Admin login requires the configured master password and defaults to “ajwears2026” for the initialized project.
- [x] Successful authentication displays an intuitive dashboard overlay on top of the storefront.
- [x] Admin can add, edit, and delete products without touching code.
- [x] Product editing supports title, category, price in dollars, image URL or upload placeholder, destination affiliate URL, and an optional badge.
- [x] Product changes persist across sessions in the managed database.
- [x] Admin can sign out and unauthenticated users cannot use mutation procedures.

## Delivery quality
- [x] Interface is responsive, mobile-first, monochrome, fast to scan, and uses smooth micro-interactions.
- [x] `/manus-routes.json` declares `/` and `/admin`.
- [x] TypeScript diagnostics and production build complete without actionable errors.
- [x] Project is checkpointed to the canonical remote after validation.
