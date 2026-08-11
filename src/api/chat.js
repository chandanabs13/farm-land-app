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

/**
 * Send chat messages and get an assistant reply.
 * @param {{ role: 'user' | 'assistant', content: string }[]} messages
 */
export function sendChatMessage(messages) {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
}
