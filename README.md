# Multitenant E-Commerce Platform

![Screenshot 1](public/demoPictures/Screenshot%202026-03-05%20102359.png)
![Screenshot 2](public/demoPictures/Screenshot%202026-03-05%20102419.png)

A full-stack, multi-tenant e-commerce platform where individual sellers can run their own storefronts under unique subdomains. Built with Next.js, PayloadCMS, and tRPC.

---

## Features

- **Multi-tenant architecture** — each tenant gets a unique subdomain
- **Product catalog** — browse, search, and filter products by hierarchical categories and tags
- **Infinite scroll** product listing with server-side prefetching
- **Tenant storefronts** — sellers manage their own products and store profiles
- **Role-based access control** — `super-admin` and `user` roles
- **Secure cookie-based auth** — httpOnly JWT set server-side, protected against XSS
- **Product library** — authenticated users can save and revisit purchased products
- **PayloadCMS admin panel** — full CMS backend for content and data management
- **Rich text editor** — Lexical-powered product descriptions

---

## Tech Stack

| Layer         | Technology                                                                  |
| ------------- | --------------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org) (App Router)                               |
| CMS / Backend | [PayloadCMS 3](https://payloadcms.com)                                      |
| Database      | MongoDB (via Mongoose adapter)                                              |
| API           | [tRPC 11](https://trpc.io) + [TanStack Query 5](https://tanstack.com/query) |
| Auth          | PayloadCMS built-in authentication                                          |
| Multi-tenancy | `@payloadcms/plugin-multi-tenant`                                           |
| UI            | Tailwind CSS, Radix UI, shadcn/ui, Lucide Icons                             |
| Forms         | React Hook Form + Zod                                                       |
| Runtime       | [Bun](https://bun.sh)                                                       |

---

## Technical Decisions

- **PayloadCMS** was chosen as the backend to avoid building a CMS and admin panel from scratch while still having full control over the data model. It ships a fully-featured admin UI from collection definitions alone.
- **tRPC** gives end-to-end type safety between the server procedures and the React client without needing to maintain a separate API schema. Errors, inputs, and outputs are all typed automatically.
- **Multi-tenancy via subdomain** rather than path-based routing keeps tenant stores fully isolated and gives each seller a professional-feeling storefront URL.
- **httpOnly cookies** store the auth token server-side only, preventing token theft via XSS — a deliberate security decision over `localStorage`.
- **TanStack Query** handles server state (caching, invalidation, infinite scroll) while React Hook Form + Zod handles local form state and validation, keeping each concern separate.

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Public-facing storefront routes
│   │   ├── (home)/         # Homepage, categories, product listing
│   │   ├── (auth)/         # Sign-in / Sign-up pages
│   │   └── (tenants)/      # Per-tenant storefront pages
│   └── (payload)/          # PayloadCMS admin panel
├── collections/            # Payload collection configs
│   ├── Users.ts
│   ├── Tenants.ts
│   ├── Products.ts
│   ├── Categories.ts
│   ├── Tags.ts
│   └── Media.ts
├── modules/                # Feature modules (tRPC routers + UI)
│   ├── auth/
│   ├── categories/
│   ├── home/
│   ├── product/
│   ├── tags/
│   └── tenants/
├── trpc/                   # tRPC client/server setup
├── components/ui/          # Shared UI components (shadcn/ui)
└── payload.config.ts       # PayloadCMS configuration
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended runtime)
- [MongoDB](https://www.mongodb.com) instance (local or Atlas)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URI=mongodb://localhost:27017/multitenant-ecommerce
PAYLOAD_SECRET=your-payload-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: force Google DNS for Payload Cloud environments
PAYLOAD_FORCE_GOOGLE_DNS=false
```

### Development

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS admin panel.

---

## Available Scripts

| Script                   | Description                            |
| ------------------------ | -------------------------------------- |
| `bun run dev`            | Start the Next.js development server   |
| `bun run build`          | Build for production                   |
| `bun run start`          | Start the production server            |
| `bun run lint`           | Run ESLint                             |
| `bun run generate:types` | Regenerate PayloadCMS TypeScript types |
| `bun run db:fresh`       | Run a fresh database migration         |
| `bun run db:seed`        | Seed the database with initial data    |
| `bun run db:reset`       | Fresh migrate + seed (full reset)      |

---

## Data Model

### Users

- `username`, `email`, `password` (auth)
- `roles`: `super-admin` | `user`
- `tenants`: array linking the user to one or more tenant stores

### Tenants (Stores)

- `name`, `slug` (used as subdomain)
- `image`

### Products

- `name`, `description`, `price`
- `category`, `tags` (relationships)
- `image` (media upload)
- `refundPolicy`: No Refunds / 1 / 3 / 7 / 14 / 30 day options

### Categories

- Support **parent/subcategory hierarchy** — a category can have a `parent` relationship back to itself, and a `subcategories` join field that auto-populates children
- Used to build nested navigation menus and filtered product listings

### Tags

- Flat labels attached to products for additional filtering

---

## Authentication Flow

1. User submits credentials via the sign-in form
2. tRPC `login` mutation calls Payload's local auth API on the server
3. Payload validates credentials and returns a JWT
4. The JWT is written into an **httpOnly cookie** server-side — the browser never exposes it to JavaScript
5. Subsequent requests automatically include the cookie; the `session` query reads it via Payload's `auth({ headers })` call
6. On the client, `queryClient.invalidateQueries` refreshes the session state after login/logout

---

## Multi-Tenancy

Each tenant store is accessed via a unique slug-based subdomain. The `@payloadcms/plugin-multi-tenant` plugin enforces data isolation so tenant users can only manage their own products. Super-admins have cross-tenant access to all data.

---

## License

Private — all rights reserved.
