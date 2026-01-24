self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Freshlaa Admin", {
      body: data.body,
      icon: "/logo192.png",
      image: data.image,
      badge: "/badge.png",
      vibrate: [200, 100, 200],
      data: data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/orders")
  );
});
