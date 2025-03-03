import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-sw.js";

const firebaseConfig = {
    apiKey: "AIzaSyBTCAYvkaKFAsRdnQewEqd8gexgU-O89h0",
    authDomain: "info-6134-pos-shortify.firebaseapp.com",
    databaseURL: "https://info-6134-pos-shortify-default-rtdb.firebaseio.com",
    projectId: "info-6134-pos-shortify",
    storageBucket: "info-6134-pos-shortify.appspot.com",
    messagingSenderId: "702241263195",
    appId: "1:702241263195:web:c8263d2aac4fdc69a9f97e",
    measurementId: "G-W8FZD2RG9V"
};


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon
    });
});
