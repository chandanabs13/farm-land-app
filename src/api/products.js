const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const { headers = {}, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function fetchProducts() {
  return request('/api/products');
}

export function createProduct(product, token) {
  return request('/api/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  });
}

export function updateProduct(product, token) {
  return request(`/api/products/${product.id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(product),
  });
}

export function toggleProductAvailability(id, token) {
  return request(`/api/products/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ toggleAvailability: true }),
  });
}

export function deleteProduct(id, token) {
  return request(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
