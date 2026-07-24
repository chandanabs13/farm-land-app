import { getSupabase } from './supabase.js';

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    origin: row.origin,
    pricePerKg: Number(row.price_per_kg),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    unit: row.unit,
    description: row.description || '',
    image: row.image || null,
    emoji: row.emoji || '🌿',
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
  };
}

function productToRow(p) {
  const original =
    p.originalPrice != null && p.originalPrice !== ''
      ? Number(p.originalPrice)
      : null;
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    origin: p.origin,
    price_per_kg: p.pricePerKg,
    original_price: original && original > Number(p.pricePerKg) ? original : null,
    unit: p.unit,
    description: p.description || '',
    image: p.image || null,
    emoji: p.emoji || '🌿',
    available: p.available !== false,
    featured: Boolean(p.featured),
    created_at: p.createdAt || new Date().toISOString(),
  };
}

export async function readProducts() {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function seedProductsIfEmpty(seedProducts) {
  const existing = await readProducts();
  if (existing.length > 0) return existing;

  const rows = seedProducts.map(productToRow);
  const { data, error } = await getSupabase()
    .from('products')
    .insert(rows)
    .select();
  if (error) throw error;
  return (data ?? []).map(rowToProduct);
}

export async function insertProduct(product) {
  const row = productToRow({
    ...product,
    id: product.id || Date.now().toString(),
    createdAt: product.createdAt || new Date().toISOString(),
  });
  const { data, error } = await getSupabase()
    .from('products')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

export async function updateProduct(product) {
  const { data, error } = await getSupabase()
    .from('products')
    .update({
      name: product.name,
      category: product.category,
      origin: product.origin,
      price_per_kg: product.pricePerKg,
      original_price: (() => {
        const original =
          product.originalPrice != null && product.originalPrice !== ''
            ? Number(product.originalPrice)
            : null;
        return original && original > Number(product.pricePerKg) ? original : null;
      })(),
      unit: product.unit,
      description: product.description || '',
      image: product.image || null,
      emoji: product.emoji || '🌿',
      available: product.available !== false,
      featured: Boolean(product.featured),
      updated_at: new Date().toISOString(),
    })
    .eq('id', product.id)
    .select()
    .single();
  if (error) throw error;
  if (!data) return null;
  return rowToProduct(data);
}

export async function deleteProduct(id) {
  const { data, error } = await getSupabase()
    .from('products')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  if (!data) return null;
  return rowToProduct(data);
}

export async function toggleProductAvailability(id) {
  const { data: current, error: readErr } = await getSupabase()
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (readErr) throw readErr;
  if (!current) return null;

  const { data, error } = await getSupabase()
    .from('products')
    .update({
      available: !current.available,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToProduct(data);
}
