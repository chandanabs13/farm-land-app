import { STORE_SUPPORT_SYSTEM_PROMPT } from './chatPrompt.js';
import { STORE_TOOLS } from './chatTools.js';

const DEFAULT_MODEL = 'gemini-flash-latest';
const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models';

function getModel() {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key?.trim()) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return key.trim();
}

function toGeminiContents(messages) {
  return messages.map(({ role, content }) => ({
    role: role === 'assistant' ? 'model' : 'user',
    parts: [{ text: content }],
  }));
}

const MAX_TOOL_ROUNDS = 4;

function readModelParts(data) {
  return data?.candidates?.[0]?.content?.parts || [];
}

function readText(parts) {
  return parts.map((part) => part.text || '').join('').trim();
}

async function generateContent(body) {
  const res = await fetch(
    `${GEMINI_API_BASE}/${getModel()}:generateContent?key=${getApiKey()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
  }
  return data;
}

/**
 * Send a customer support chat message to Gemini.
 * @param {{ role: 'user' | 'assistant', content: string }[]} messages - Conversation history
 * @param {{ executeTool?: (name: string, args: object) => Promise<object> }} [options]
 * A controlled, read-only tool executor for live store grounding.
 * @returns {Promise<string>} Assistant reply text
 */
export async function chatWithGemini(messages, options = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('At least one message is required');
  }

  const last = messages[messages.length - 1];
  if (last.role !== 'user' || !last.content?.trim()) {
    throw new Error('Last message must be from the user');
  }

  const contents = toGeminiContents(messages);
  const request = {
    systemInstruction: {
      parts: [{ text: STORE_SUPPORT_SYSTEM_PROMPT }],
    },
    contents,
    tools: STORE_TOOLS,
    toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const data = await generateContent({ ...request, contents });
    const modelContent = data?.candidates?.[0]?.content;
    const parts = readModelParts(data);
    if (!modelContent || !parts.length) throw new Error('No response from Gemini');

    const calls = parts.map((part) => part.functionCall).filter(Boolean);
    if (!calls.length) {
      const text = readText(parts);
      if (!text) throw new Error('No response text from Gemini');
      return text;
    }
    if (!options.executeTool) {
      throw new Error('Gemini requested a tool but no tool executor is configured');
    }

    // Keep the full model content: Gemini 3 may include thought signatures that
    // must be sent back verbatim with the function result.
    contents.push(modelContent);
    const responses = await Promise.all(
      calls.map(async (call) => {
        let result;
        try {
          result = await options.executeTool(call.name, call.args || {});
        } catch (error) {
          result = { error: 'Live catalog lookup failed. Do not guess; ask the customer to browse the Shop page.' };
        }
        return {
          functionResponse: {
            name: call.name,
            response: { result },
            ...(call.id ? { id: call.id } : {}),
          },
        };
      }),
    );
    contents.push({ role: 'user', parts: responses });
  }

  throw new Error('The assistant exceeded the maximum number of catalog lookups');
}
