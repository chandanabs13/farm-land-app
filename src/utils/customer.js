export function customerName(c) {
  if (!c) return "—";
  if (c.name?.trim()) return c.name.trim();
  const legacy = `${c.firstName || ""} ${c.lastName || ""}`.trim();
  return legacy || "—";
}

export function customerLocation(c) {
  if (!c) return "—";
  if (c.tower && c.flat) {
    const mode = c.deliveryType === "home" ? "Home delivery (+₹10)" : "Pickup at Tower-1, 601";
    return `Tower ${c.tower}, Flat ${c.flat} · ${mode}`;
  }
  const parts = [c.address, c.city, c.state, c.pincode].filter(Boolean);
  return parts.join(", ") || "—";
}
