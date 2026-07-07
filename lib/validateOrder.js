export function validateOrderPayload(body) {
  const { customer, items, total } = body || {};

  if (!customer?.name?.trim()) {
    return 'Name is required';
  }
  if (!customer?.phone) {
    return 'Phone is required';
  }
  if (!customer?.tower) {
    return 'Tower is required';
  }
  if (!customer?.flat) {
    return 'Flat is required';
  }
  if (!items?.length) {
    return 'Cart is empty';
  }
  if (total == null) {
    return 'Total is missing';
  }
  return null;
}
