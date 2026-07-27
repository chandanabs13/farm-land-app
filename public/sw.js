/* global self, clients */
/* Coorg Farms — admin order push notifications */

self.addEventListener('push', (event) => {
  let data = { title: 'Coorg Farms', body: 'New order received', url: '/admin/orders' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title || 'Coorg Farms', {
      body: data.body || 'New order received',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'coorg-new-order',
      renotify: true,
      data: { url: data.url || '/admin/orders' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/orders';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
                    for (const client of list) {
                      if (client.url.includes('/admin') && 'focus' in client) {
                        if ('navigate' in client) client.navigate(url);
                        return client.focus();
                      }
                    }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
