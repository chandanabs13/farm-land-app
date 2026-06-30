import { supabase } from "./supabase.js";

function rowToOrder(row) {
  return {
    id: row.id,
    customer: row.customer,
    items: row.items,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
  };
}

export async function readOrders() {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

export async function insertOrder(order) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      id: order.id,
      customer: order.customer,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      created_at: order.createdAt,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToOrder(data);
}

export async function updateOrderStatus(id, status) {
  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase.from("orders").update({ status, updated_at: updatedAt }).eq("id", id).select().single();

  if (error) throw error;
  if (!data) return null;
  return rowToOrder(data);
}

export async function deleteOrder(id) {
  const { data, error } = await supabase.from("orders").delete().eq("id", id).select().single();

  if (error) throw error;
  if (!data) return null;
  return rowToOrder(data);
}
