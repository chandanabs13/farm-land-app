import { useEffect } from 'react';

export const SITE_NAME = 'Coorg Farms';
export const DEFAULT_DESCRIPTION =
  'Buy farm-fresh coffee, pepper, ghee, honey and fruits from our Coorg and Bangalore farms. Grown by us, delivered to your home in Karnataka.';

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function usePageMeta({ title, description = DEFAULT_DESCRIPTION, noIndex = false } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Farm Fresh, Delivered`;
    setMeta('description', description);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, noIndex]);
}
