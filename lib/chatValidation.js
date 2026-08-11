export const MAX_CHAT_MESSAGES = 20;
export const MAX_CHAT_MESSAGE_LENGTH = 2000;

export function validateChatMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages array is required';
  }
  if (messages.length > MAX_CHAT_MESSAGES) {
    return `Too many messages (max ${MAX_CHAT_MESSAGES})`;
  }
  for (const message of messages) {
    if (!message || (message.role !== 'user' && message.role !== 'assistant')) {
      return 'Each message must have role "user" or "assistant"';
    }
    if (typeof message.content !== 'string' || !message.content.trim() || message.content.length > MAX_CHAT_MESSAGE_LENGTH) {
      return `Each message content must be 1–${MAX_CHAT_MESSAGE_LENGTH} characters`;
    }
  }
  if (messages.at(-1).role !== 'user') {
    return 'Last message must be from the user';
  }
  return null;
}
