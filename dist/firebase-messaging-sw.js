importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Hardcoded Firebase configuration for Service Worker
// NOTE: These values are public and do not include the VAPID key
firebase.initializeApp({
  apiKey: "AIzaSyAG_5k_sZJw6_u__O5eqRJpachKek8ELXU",
  authDomain: "Alabasta-ceea5.firebaseapp.com",
  projectId: "Alabasta-ceea5",
  storageBucket: "Alabasta-ceea5.firebasestorage.app",
  messagingSenderId: "806904402130",
  appId: "1:806904402130:web:fc8b6a99645930e3d61d0b",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 🔔 Background Message Received:', payload);

  const notificationTitle = payload.notification.title || "Alabasta";
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://ik.imagekit.io/h3qzmviwv/Barvido/favicon%20logo%20(1).png',
    badge: 'https://ik.imagekit.io/h3qzmviwv/Barvido/favicon%20logo%20(1).png',
    vibrate: [200, 100, 200],
    tag: payload.data?.tag || 'default-tag',
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open and focus it, or open a new one
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Offline Support Protocol
self.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match("/offline.html") || 
      new Response("You are offline. Please check your connection.")
    );
  }
});
