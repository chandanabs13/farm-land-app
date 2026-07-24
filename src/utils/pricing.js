/** Sale price is pricePerKg; originalPrice is optional MRP. */
export function getDiscountPercent(salePrice, originalPrice) {
  const sale = Number(salePrice);
  const original = Number(originalPrice);
  if (!original || !sale || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

export function hasDiscount(product) {
  return getDiscountPercent(product?.pricePerKg, product?.originalPrice) > 0;
}
