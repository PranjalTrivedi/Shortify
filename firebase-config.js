// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTCAYvkaKFAsRdnQewEqd8gexgU-O89h0",
  authDomain: "info-6134-pos-shortify.firebaseapp.com",
  databaseURL: "https://info-6134-pos-shortify-default-rtdb.firebaseio.com",
  projectId: "info-6134-pos-shortify",
  storageBucket: "info-6134-pos-shortify.firebasestorage.app",
  messagingSenderId: "702241263195",
  appId: "1:702241263195:web:c8263d2aac4fdc69a9f97e",
  measurementId: "G-W8FZD2RG9V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
