import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyApiKeyForDevPreview123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "level-up-academic.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "level-up-academic",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "level-up-academic.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Retrieves the current user's Firebase ID token or cached JWT.
 * Returns null if no active session is found.
 */
export async function getAuthToken() {
  try {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(false);
    }
  } catch (error) {
    console.warn("Failed to retrieve Firebase ID token:", error);
  }
  return localStorage.getItem('auth_token') || null;
}

export default app;
