// TeamSpace 브라우저 푸시 — 서버(app/services/push.py)가 알림 JSON 을 그대로 보낸다
// { kind, title, message, href, ... }
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: event.data ? event.data.text() : "" };
  }
  const title = data.title || "TeamSpace";
  const href = typeof data.href === "string" && data.href.startsWith("/inhouse/") ? data.href : "/inhouse/notifications";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.message && data.message !== title ? data.message : data.kind || "",
      icon: "/native-logo.png",
      tag: data.href || undefined,
      data: { href },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = (event.notification.data && event.notification.data.href) || "/inhouse/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (new URL(client.url).origin === self.location.origin && "focus" in client) {
          client.navigate(href);
          return client.focus();
        }
      }
      return self.clients.openWindow(href);
    }),
  );
});
