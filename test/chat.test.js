import assert from 'node:assert/strict';
import test from 'node:test';
import { executeStoreTool } from '../lib/chatTools.js';
import { chatWithGemini } from '../lib/gemini.js';
import { validateChatMessages } from '../lib/chatValidation.js';

const products = [
  {
    id: 'coffee', name: 'Coffee Beans', category: 'Coffee', origin: 'Coorg Farm',
    pricePerKg: 980, originalPrice: null, unit: 'kg', available: true,
    description: 'Fresh roasted beans',
  },
  {
    id: 'pepper', name: 'Black Pepper', category: 'Pepper', origin: 'Coorg Farm',
    pricePerKg: 650, originalPrice: null, unit: 'kg', available: false,
    description: 'Whole peppercorns',
  },
];

test('search_store_products returns only live matching products', async () => {
  const result = await executeStoreTool(
    'search_store_products', { query: 'coffee', availableOnly: true }, async () => products,
  );
  assert.equal(result.source, 'live_store_catalog');
  assert.equal(result.products.length, 1);
  assert.equal(result.products[0].name, 'Coffee Beans');
  assert.equal(result.products[0].price, '₹980/kg');
});

test('get_store_catalog respects availability filter', async () => {
  const result = await executeStoreTool(
    'get_store_catalog', { availableOnly: true }, async () => products,
  );
  assert.deepEqual(result.products.map((product) => product.name), ['Coffee Beans']);
});

test('chat validation rejects malformed and oversized input', () => {
  assert.equal(validateChatMessages([{ role: 'user', content: '  ' }]), 'Each message content must be 1–2000 characters');
  assert.equal(validateChatMessages([{ role: 'assistant', content: 'Hello' }]), 'Last message must be from the user');
  assert.equal(validateChatMessages([{ role: 'user', content: 'x'.repeat(2001) }]), 'Each message content must be 1–2000 characters');
});

test('chatWithGemini executes a function call and returns the final response', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key';
  const bodies = [];
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    bodies.push(body);
    const isFirstCall = bodies.length === 1;
    return {
      ok: true,
      json: async () => isFirstCall
        ? {
          candidates: [{ content: { role: 'model', parts: [{ functionCall: {
            id: 'catalog-1', name: 'search_store_products', args: { query: 'coffee' },
          } }] } }],
        }
        : { candidates: [{ content: { role: 'model', parts: [{ text: 'Coffee is ₹980/kg.' }] } }] },
    };
  };

  try {
    const reply = await chatWithGemini([{ role: 'user', content: 'How much is coffee?' }], {
      executeTool: (name, args) => executeStoreTool(name, args, async () => products),
    });
    assert.equal(reply, 'Coffee is ₹980/kg.');
    assert.equal(bodies.length, 2);
    assert.equal(bodies[0].tools[0].functionDeclarations[0].name, 'search_store_products');
    const response = bodies[1].contents.at(-1).parts[0].functionResponse;
    assert.equal(response.name, 'search_store_products');
    assert.equal(response.id, 'catalog-1');
    assert.equal(response.response.result.products[0].name, 'Coffee Beans');
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  }
});
