# Coorg Farms Store

## Quick Start
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Deploy to Vercel
1. Push to GitHub
2. Import in vercel.com → auto-detected as Vite
3. Done!

## Admin Panel
Go to `/admin` — no login required (add auth when ready).

## Features
- Product catalog with category filter
- Add/Edit/Delete products (admin only)
- Toggle seasonal availability (product hidden when unavailable)
- Upload product images (stored as base64)
- Cart with quantity control
- Checkout with customer details
- Order management with status tracking (Pending → Confirmed → Delivered)
- Fully responsive (mobile + desktop)
- All data in localStorage (swap to Firebase/Supabase for production)

## Folder Structure
```
src/
  components/
    admin/         # ProductFormModal
    shared/        # Navbar, Footer, ToastContainer
    storefront/    # ProductCard
  context/         # StoreContext (products, cart, orders)
  data/            # initialProducts seed data
  pages/
    admin/         # Dashboard, Products, Orders
    storefront/    # Home, Shop, Product, Cart, Checkout
```
