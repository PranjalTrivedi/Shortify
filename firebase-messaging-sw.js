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
