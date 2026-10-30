# A-J Wears It — Implementation Plan

## Product scope

A mobile-first affiliate storefront for A-J (@aj.wears.it) that presents a curated catalog of streetwear and old-money essentials. Public visitors do not log in. The catalog is filterable by the five requested categories and outbound product clicks open tracked affiliate destinations in a new tab. A discreet `/admin` route provides a password gate and an overlay dashboard for product CRUD. Catalog records persist in the managed MySQL database.

## Design direction

Three possible directions considered:

- **Swiss editorial grid** — 0.07: restrained typography, strict columns, and gallery-like product labels.
- **Neo-luxury utility** — 0.05: black-on-bone palette, tactile controls, and fashion workwear cues.
- **Soft minimal commerce** — 0.04: airy whitespace, light neutrals, and quieter shopping affordances.

### Chosen direction: Neo-luxury utility

- **Design Movement:** High-end editorial commerce with neo-luxury utility details.
- **Core Principles:** monochrome confidence, information density without clutter, mobile-first tap targets, and premium restraint.
- **Color Philosophy:** pure black carries authority and contrast; warm bone keeps the catalog tactile rather than clinical; slate surfaces provide depth for admin controls; one muted green signal color marks verified/featured moments.
- **Layout Paradigm:** an offset editorial rhythm: the hero is wide and asymmetric, category controls read like a rail of utility tags, and product cards alternate between dense metadata and quiet negative space.
- **Signature Elements:** a compact circular A-J mascot monogram, uppercase micro-labels with generous tracking, and soft grain / hairline rules that make the interface feel like a printed lookbook.
- **Interaction Philosophy:** every control should feel direct and intentional; product cards lift a few pixels and reveal a clear “shop the fit” action, while admin actions are compact and reversible.
- **Animation:** use quick 180–240ms ease-out transitions, subtle card lift, fade/slide entrance for the hero and overlay, and respect reduced-motion preferences.
- **Typography System:** geometric sans-serif headings using Space Grotesk; compact metadata using IBM Plex Mono; body copy in a neutral sans-serif stack. Headlines are uppercase and tight, with small labels carrying most of the navigation language.
- **Brand Essence:** A-J’s considered shortcut to pieces that make a fit feel finished; selective, assured, and quietly playful.
- **Brand Voice:** concise, observational, and never over-sold. Example lines: “THE PIECES THAT DO THE WORK.” and “LESS NOISE. BETTER LAYERS.”
- **Wordmark & Logo:** a two-line A-J lockup with the hyphen treated as a long hairline, paired with a circular “A·J” stamp.
- **Signature Brand Color:** oxidized olive (#9BAA87), used sparingly for featured badges and verified admin status.

## Implementation approach

- React + Vite frontend with Wouter routes, Tailwind utility classes, Framer Motion for motion, Lucide for icons, and the existing tRPC client.
- Drizzle MySQL `products` table with integer cents for money, a category string for flexible filtering, and nullable badge/image fields. Seed six curated records on first read when the table is empty.
- Server-side admin session cookie signed with HMAC. The password is read from `ADMIN_PASSWORD` when configured and defaults to the requested `ajwears2026` for the initial project. Cookies are `HttpOnly`; public HTTPS preview uses `SameSite=None; Secure`, while plain HTTP local development uses a separate lax/non-secure mode.
- tRPC procedures: public product list, public admin login/status/logout, and admin-only create/update/delete procedures guarded by the signed session cookie.
- Public UI: header, hero, category pills, filterable 2/4-column product grid, outbound affiliate click tracking parameters, and footer.
- Admin UI: `/admin` renders the storefront in the background with a fixed dashboard overlay containing login, summary, table/list management, and a shared add/edit modal.

## Project structure

- `client/src/pages/Storefront.tsx`: public catalog shell plus optional admin overlay.
- `client/src/pages/Home.tsx`: route wrapper for the public storefront.
- `client/src/pages/Admin.tsx`: route wrapper that enables the admin overlay.
- `client/src/index.css`: brand tokens, typography, texture, and responsive styling.
- `drizzle/schema.ts`: users plus persistent products table.
- `server/db.ts`: product queries and seed behavior.
- `server/routers.ts`: product and admin procedures.
- `server/_core/context.ts`: attaches verified admin-session state to each request.
- `client/public/manus-routes.json`: route manifest for `/` and `/admin`.
- `public/assets/*`: curated editorial catalog imagery.
