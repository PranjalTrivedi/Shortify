// firebase-messaging-sw.js - Optimized Firebase Messaging Service Worker
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-sw.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTCAYvkaKFAsRdnQewEqd8gexgU-O89h0",
    authDomain: "info-6134-pos-shortify.firebaseapp.com",
    projectId: "info-6134-pos-shortify",
    storageBucket: "info-6134-pos-shortify.appspot.com",
    messagingSenderId: "702241263195",
    appId: "1:702241263195:web:c8263d2aac4fdc69a9f97e",
    measurementId: "G-W8FZD2RG9V"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle background notifications
onBackgroundMessage(messaging, (payload) => {
    console.log("Received background message:", payload);
    const { title, body, icon } = payload.notification;
    self.registration.showNotification(title, {
        body: body || "No content available",
        icon: icon || "/default-icon.png"
    });
});

// Listen for messages from the main script
self.addEventListener('message', (event) => {
    console.log('[SW] Received message from main script:', event.data);
    const { title, body, icon } = event.data;
    
    if (!self.registration) {
        console.error('[SW] Service worker registration not available');
        return;
    }

    console.log('[SW] Attempting to show notification:', title);
    const options = {
        body: body || "No content available",
        icon: '/assets/icon-192x192.png',
        badge: '/assets/badge.png',
        vibrate: [200, 100, 200],
        image: event.data.image,
        actions: event.data.actions || [],
        data: {
            url: event.data.url || '/savedArticles.html'
        }
    };

    // Setup notification click handler once (not inside message listener)
    self.addEventListener('notificationclick', (event) => {
        event.notification.close();
        const url = event.notification.data?.url || '/savedArticles.html';
        event.waitUntil(
            clients.matchAll({type: 'window'}).then(windowClients => {
                // Check if there's already a window/tab open with the target URL
                for (const client of windowClients) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window/tab
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
        );
    });
    
    self.registration.showNotification(title, options)
    .then(() => {
        console.log('[SW] PWA notification shown successfully');
    }).catch(err => {
        console.error('[SW] Failed to show PWA notification:', err);
        // Fallback to regular notification if PWA notification fails
        new Notification(title, options);
    });
});
