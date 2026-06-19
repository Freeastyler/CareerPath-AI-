/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "buildathorn-south-africa",
  appId: "1:1090719585509:web:dc011c0a8f0bf083cef00c",
  apiKey: "AIzaSyBOt0aRjWVW7YkXgg5v30feIGNXiYiHrWM",
  authDomain: "buildathorn-south-africa.firebaseapp.com",
  storageBucket: "buildathorn-south-africa.firebasestorage.app",
  messagingSenderId: "1090719585509",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with local persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Failed to set auth persistence status:", err);
});

// Initialize Firestore with the custom databaseId provided in config
const db = getFirestore(app, "ai-studio-d31b1a33-0f9d-42d3-8ea6-cc07e4566dc7");

export { app, auth, db };
