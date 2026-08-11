/**
 * Build a compact product catalog string for Gemini grounding.
 * @param {import('./products.js').Product[]} products
 */
export function buildProductGrounding(products) {
  if (!products?.length) {
    return '## Current product catalog\nNo products listed right now. Ask the customer to check the Shop page or contact us directly.';
  }

  const available = products.filter((p) => p.available);
  const unavailable = products.filter((p) => !p.available);

  const formatProduct = (p) => {
    const price = `₹${p.pricePerKg}/${p.unit}`;
    const sale =
      p.originalPrice && p.originalPrice > p.pricePerKg
        ? ` (was ₹${p.originalPrice}/${p.unit})`
        : '';
    const origin = p.origin ? ` · ${p.origin}` : '';
    const desc = p.description ? ` — ${p.description}` : '';
    return `- ${p.name} (${p.category})${origin}: ${price}${sale}${desc}`;
  };

  const lines = ['## Current product catalog (live from our store)', ''];

  if (available.length) {
    lines.push('### Available now');
    available.forEach((p) => lines.push(formatProduct(p)));
    lines.push('');
  }

  if (unavailable.length) {
    lines.push('### Currently unavailable');
    unavailable.forEach((p) => lines.push(`- ${p.name} (${p.category}) — out of stock`));
    lines.push('');
  }

  lines.push(
    'Use ONLY the prices and availability above when answering product questions. If a product is not listed, say you are not sure and suggest browsing the Shop page.',
  );

  return lines.join('\n');
}
