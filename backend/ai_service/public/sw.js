// sw.js - Money Guard Push Notification
self.addEventListener('push', (event) => {
  console.log('[SW] Nhận được push event');

  let payload;
  try {
    payload = event.data.json();
  } catch (err) {
    console.error('[SW] Lỗi parse payload:', err);
    payload = {
      title: '🏦 Money Guard',
      body: 'Có giao dịch mới',
    };
  }

  const options = {
    body: payload.body || 'Bạn có một giao dịch mới',
    icon: payload.icon || 'https://cdn-icons-png.flaticon.com/512/5968/5968890.png',
    badge: payload.badge || 'https://cdn-icons-png.flaticon.com/512/5968/5968890.png',
    tag: 'money-guard',
    renotify: true,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: payload.data?.url || '/' },
  };

  event.waitUntil(
    self.registration
      .showNotification(payload.title, options)
      .then(() => console.log('[SW] Đã hiển thị notification'))
      .catch((err) => console.error('[SW] Lỗi showNotification:', err)),
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification được click');
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(clients.openWindow(url));
});
