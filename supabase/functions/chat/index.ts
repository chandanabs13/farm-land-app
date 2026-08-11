import { STORE_SUPPORT_SYSTEM_PROMPT } from '../../../lib/chatPrompt.js';
import { STORE_TOOLS, executeStoreTool } from '../../../lib/chatTools.js';

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-flash-latest';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_TOOL_ROUNDS = 4;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

function validateMessages(messages: unknown): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return 'messages array is required';
  if (messages.length > MAX_MESSAGES) return `Too many messages (max ${MAX_MESSAGES})`;
  for (const message of messages) {
    if (!message || typeof message !== 'object') return 'Each message is invalid';
    const { role, content } = message as { role?: string; content?: string };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim() || content.length > MAX_MESSAGE_LENGTH) {
      return `Each message must have a valid role and 1–${MAX_MESSAGE_LENGTH} characters of content`;
    }
  }
  return (messages.at(-1) as { role: string }).role === 'user' ? null : 'Last message must be from the user';
}

async function loadProducts() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('Supabase catalog credentials are not configured');
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/products?select=*&order=created_at.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error('Could not load the live product catalog');
  const rows = await response.json();
  return rows.map((row: Record<string, unknown>) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    origin: row.origin,
    pricePerKg: Number(row.price_per_kg),
    originalPrice: row.original_price == null ? null : Number(row.original_price),
    unit: row.unit,
    description: row.description || '',
    available: Boolean(row.available),
  }));
}

async function callGemini(apiKey: string, contents: unknown[]) {
  const response = await fetch(`${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: STORE_SUPPORT_SYSTEM_PROMPT }] },
      contents,
      tools: STORE_TOOLS,
      toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
      generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Gemini API error (${response.status})`);
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return new Response(JSON.stringify({ error: 'GEMINI_API_KEY secret not configured' }), { status: 503, headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const validationError = validateMessages(messages);
    if (validationError) return new Response(JSON.stringify({ error: validationError }), { status: 400, headers: corsHeaders });

    const contents = messages.map(({ role, content }: { role: string; content: string }) => ({
      role: role === 'assistant' ? 'model' : 'user', parts: [{ text: content }],
    }));

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const data = await callGemini(apiKey, contents);
      const modelContent = data?.candidates?.[0]?.content;
      const parts = modelContent?.parts || [];
      if (!modelContent || !parts.length) throw new Error('No response from Gemini');
      const calls = parts.map((part: { functionCall?: { name: string; args?: object; id?: string } }) => part.functionCall).filter(Boolean);
      if (!calls.length) {
        const reply = parts.map((part: { text?: string }) => part.text || '').join('').trim();
        if (!reply) throw new Error('No response text from Gemini');
        return new Response(JSON.stringify({ reply }), { headers: corsHeaders });
      }

      contents.push(modelContent);
      const responses = await Promise.all(calls.map(async (call: { name: string; args?: object; id?: string }) => {
        let result;
        try {
          result = await executeStoreTool(call.name, call.args || {}, loadProducts);
        } catch {
          result = { error: 'Live catalog lookup failed. Do not guess; ask the customer to browse the Shop page.' };
        }
        return {
          functionResponse: {
            name: call.name,
            response: { result },
            ...(call.id ? { id: call.id } : {}),
          },
        };
      }));
      contents.push({ role: 'user', parts: responses });
    }
    throw new Error('The assistant exceeded the maximum number of catalog lookups');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Supabase chat function:', message);
    return new Response(JSON.stringify({ error: 'Could not get a reply. Please try again.' }), { status: 500, headers: corsHeaders });
  }
});
