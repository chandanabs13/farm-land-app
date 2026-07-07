# Coorg Farms Store

## Quick Start (local)
```bash
npm install
cp .env.example .env   # add your Supabase keys
npm run dev
```
Open http://localhost:5173

## Deploy to Vercel

1. Push code to GitHub
2. Import project at [vercel.com](https://vercel.com) → connect repo
3. Vercel auto-detects Vite — no extra build settings needed
4. Add **Environment Variables** in Vercel → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` (no `/rest/v1/`) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from Supabase |
| `ADMIN_PASSWORD` | your admin password |
| `ADMIN_SECRET` | random secret string |

5. Deploy → your site is live at `https://your-app.vercel.app`
6. Update `public/sitemap.xml` and `public/robots.txt` with your real Vercel URL
7. Submit sitemap in [Google Search Console](https://search.google.com/search-console)

Orders API runs as Vercel serverless functions in `/api` — no separate server needed.

## Supabase setup (one-time)

1. Create project at [supabase.com](https://supabase.com)
2. Create `orders` table with columns:

| Column | Type |
|--------|------|
| `id` | text (primary key) |
| `customer` | jsonb |
| `items` | jsonb |
| `subtotal` | numeric |
| `shipping` | numeric |
| `total` | numeric |
| `status` | text |
| `created_at` | timestamptz |
| `updated_at` | timestamptz (optional) |

Run `supabase/schema.sql` in SQL Editor if needed.

**`customer` JSON** (stored automatically on each order):
```json
{
  "name": "Ravi",
  "phone": "9876543210",
  "tower": "1",
  "flat": "601",
  "deliveryType": "pickup",
  "notes": ""
}
```

Use `supabase/view-orders.sql` in SQL Editor to see tower/flat as columns. No table migration needed when checkout fields change — JSONB holds any shape.

## Admin Panel
Go to `/admin` → log in → manage orders and products.

**Order workflow:** Pending → Confirmed → Delivered → Delete (trash icon)

## SEO included
- Meta title & description per page
- Open Graph + Twitter cards
- `robots.txt` + `sitemap.xml`
- JSON-LD store schema on homepage
- Admin/cart/checkout hidden from search engines (`noindex`)

## Folder Structure
```
api/               # Vercel serverless (orders API)
server/            # Local dev Express server
supabase/          # schema.sql
public/            # robots.txt, sitemap.xml, favicon
src/
  hooks/           # usePageMeta (SEO)
  api/             # frontend API client
  pages/           # storefront + admin
```
