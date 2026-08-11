import { chatWithGemini } from '../lib/gemini.js';
import { parseBody } from '../lib/parseBody.js';
import { readProducts } from '../lib/products.js';
import { executeStoreTool } from '../lib/chatTools.js';
import { validateChatMessages } from '../lib/chatValidation.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req);
  const validationError = validateChatMessages(body.messages);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const reply = await chatWithGemini(body.messages, {
      executeTool: (name, args) => executeStoreTool(name, args, readProducts),
    });
    return res.status(200).json({ reply });
  } catch (err) {
    console.error('POST /api/chat:', err.message);
    const isConfig = err.message?.includes('GEMINI_API_KEY');
    return res.status(isConfig ? 503 : 500).json({
      error: isConfig
        ? 'Chat is not configured yet. Add GEMINI_API_KEY to your environment.'
        : 'Could not get a reply. Please try again.',
      details: err.message,
    });
  }
}
