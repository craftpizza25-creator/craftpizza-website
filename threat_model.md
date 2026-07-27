# Threat Model

## Project Overview

Craft Pizza (craftpizza.pl) is a restaurant web application for a Polish pizza restaurant. It consists of:
- **Frontend** (`artifacts/pizza-restaurant`): React/Vite SPA — menu browsing, cart, order placement, contact form, gallery
- **API Server** (`artifacts/api-server`): Express 5 + Drizzle ORM + PostgreSQL — REST API serving menu, orders, gallery, and contact submissions
- **Deployment**: Public autoscale deployment on Replit (craftpizza.pl / pizza-place-portal--craftpizza25.replit.app)

Tech stack: Node.js 24, TypeScript 5.9, Express 5, PostgreSQL, Drizzle ORM, Zod validation, pino logging, nodemailer (Gmail SMTP), pnpm workspaces.

There is **no authentication system** — the application is intentionally public-facing with no user accounts.

## Assets

- **Customer PII** — name, email, phone, delivery address, and order history stored in the `ordersTable`. Exposure constitutes a privacy/GDPR violation.
- **Contact submissions** — name, email, phone, message stored in `contactSubmissionsTable`. Contains personal data of visitors who reached out.
- **Order integrity** — order records and computed totals. Fraudulent orders cost the restaurant real money.
- **Gmail App Password** (`GMAIL_APP_PASSWORD`) — stored as an environment variable, used for SMTP. Compromise allows sending email from the restaurant's account.
- **Database URL** (`DATABASE_URL`) — Postgres connection string. Full database access if leaked.
- **Restaurant email account** — craftpizza25@gmail.com; receives contact form notifications and potentially manipulated HTML email content.

## Trust Boundaries

- **Browser → API (public internet)**: All API endpoints are publicly accessible with no authentication. Every caller is untrusted. CORS is wide-open (`cors()` with no origin restriction).
- **API → PostgreSQL**: The server has full database access via `DATABASE_URL`. SQL injection at the API layer would grant full database access; Drizzle ORM with parameterized queries mitigates this.
- **API → Gmail SMTP**: Server calls Gmail with `GMAIL_APP_PASSWORD`. User-controlled input reaches the email body without HTML escaping.
- **Client-supplied business data**: Item prices and quantities are submitted by the client and trusted for total calculation — no server-side price lookup.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/routes/` — all routes mounted under `/api`
- **Highest-risk areas**: `routes/orders.ts` (price manipulation, PII exposure), `routes/contact.ts` (HTML injection in email)
- **Public surface**: All endpoints are unauthenticated — no `/api/admin` or role-based access control exists
- **Dev-only areas**: `artifacts/mockup-sandbox/` is the design sandbox, not production-reachable

## Threat Categories

### Tampering

The order total is calculated from client-supplied item prices rather than server-side database lookups. An attacker can submit `price: 0` for any menu item and receive a legitimate-looking order record with a `0.00` total. This is the most critical business-logic flaw. The server must look up item prices from `menuItemsTable` using the supplied `menuItemId`.

### Information Disclosure

`GET /api/orders/:id` requires no authentication and returns full customer PII (name, email, phone, delivery address). Order IDs are sequential integers, making enumeration trivial. All orders ever placed can be harvested without authentication.

Additionally, verbose Zod validation error messages are returned to clients on bad requests — these reveal internal schema structure but are not high severity.

### Injection

The HTML email body in `routes/contact.ts` interpolates user-supplied `name`, `email`, `phone`, and `message` fields without HTML escaping. Injected HTML reaches the restaurant owner's inbox and can be used for phishing or tracking pixel attacks.

### Denial of Service

No rate limiting is applied to any endpoint. `POST /api/contact` sends a Gmail notification per request, allowing quota exhaustion. `POST /api/orders` and `GET /api/orders/:id` can be flooded to exhaust the database or enumerate customer data.

### Spoofing

No authentication system exists, which is intentional for this restaurant use case. However, the wide-open CORS policy (`app.use(cors())`) allows any web origin to make credentialed requests to the API, increasing the CSRF and data exfiltration surface.

### Elevation of Privilege

No admin or privileged functionality exists in the current codebase. The application is flat — all callers are treated as anonymous public users.
