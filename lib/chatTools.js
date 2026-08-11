const MAX_RESULTS = 12;

export const STORE_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_store_products',
        description:
          'Searches the live Coorg Farm catalog. Use this before answering any question about product price, stock, origin, unit, or product details.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'Product name, category, or customer need to search for.',
            },
            availableOnly: {
              type: 'BOOLEAN',
              description: 'Set true when the customer asks what can be ordered now.',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_store_catalog',
        description:
          'Gets the live catalog summary and availability. Use for broad questions such as what products are available, what is in stock, or to compare the catalog.',
        parameters: {
          type: 'OBJECT',
          properties: {
            availableOnly: {
              type: 'BOOLEAN',
              description: 'Set true when the customer only wants products currently available to order.',
            },
          },
        },
      },
    ],
  },
];

function productForModel(product) {
  return {
    id: String(product.id),
    name: product.name,
    category: product.category,
    origin: product.origin || null,
    price: `₹${product.pricePerKg}/${product.unit}`,
    salePrice: product.originalPrice && product.originalPrice > product.pricePerKg
      ? `₹${product.pricePerKg}/${product.unit}`
      : null,
    originalPrice: product.originalPrice && product.originalPrice > product.pricePerKg
      ? `₹${product.originalPrice}/${product.unit}`
      : null,
    available: Boolean(product.available),
    description: product.description || '',
  };
}

function normalizeQuery(value) {
  return typeof value === 'string' ? value.trim().toLocaleLowerCase() : '';
}

function matchesProduct(product, query) {
  if (!query) return true;
  const terms = query.split(/\s+/).filter(Boolean);
  const haystack = [product.name, product.category, product.origin, product.description]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/**
 * Executes only read-only catalog tools. Product data is loaded for each call so
 * prices and availability remain grounded in the current database state.
 */
export async function executeStoreTool(name, args, loadProducts) {
  if (typeof loadProducts !== 'function') {
    throw new Error('A product loader is required for store tools');
  }

  const products = await loadProducts();
  const availableOnly = args?.availableOnly === true;

  if (name === 'get_store_catalog') {
    const results = products
      .filter((product) => !availableOnly || product.available)
      .map(productForModel);
    return {
      source: 'live_store_catalog',
      refreshedAt: new Date().toISOString(),
      products: results,
    };
  }

  if (name === 'search_store_products') {
    const query = normalizeQuery(args?.query);
    if (!query) {
      return { error: 'A product search query is required.', products: [] };
    }
    const results = products
      .filter((product) => (!availableOnly || product.available) && matchesProduct(product, query))
      .slice(0, MAX_RESULTS)
      .map(productForModel);
    return {
      source: 'live_store_catalog',
      query,
      refreshedAt: new Date().toISOString(),
      products: results,
      message: results.length ? undefined : 'No matching product was found in the current catalog.',
    };
  }

  return { error: `Unsupported store tool: ${name}` };
}
