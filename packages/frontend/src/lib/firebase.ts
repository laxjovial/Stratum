// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// The getAnalytics function is not available in all environments, so we need to
// check if the window object exists.
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if we have a valid configuration (not placeholders)
export const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key_here";

// Initialize Firebase only if configured
const app = isConfigured ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : null;
const auth = isConfigured && app ? getAuth(app) : null;

export { app, auth };
