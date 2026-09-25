import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Helper to check if valid config exists
const isConfigValid = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes("your_") &&
    !firebaseConfig.projectId.includes("your_")
);

// Initialize Firebase App safely
const getFirebaseApp = () => {
  if (!isConfigValid) {
    return null;
  }
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
};

export const getFirebaseMessaging = (): Messaging | null => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    const app = getFirebaseApp();
    if (!app) {
      console.warn(
        "⚠️ Firebase environment variables are missing or unconfigured. Please add NEXT_PUBLIC_FIREBASE_... to Vercel Environment Variables and redeploy."
      );
      return null;
    }
    try {
      return getMessaging(app);
    } catch (err) {
      console.error("FCM Messaging initialization error:", err);
      return null;
    }
  }
  return null;
};

// Request FCM Token from browser
export const requestFCMToken = async (): Promise<string | null> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("Notifications not supported in this browser environment.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied by user.");
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    // Register service worker if needed
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token successfully acquired:", token);
      return token;
    } else {
      console.warn("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving FCM Token:", error);
    return null;
  }
};

// Listen for foreground notification messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = getFirebaseMessaging();
  if (messaging) {
    return onMessage(messaging, (payload) => {
      console.log("Received foreground FCM message:", payload);
      callback(payload);
    });
  }
  return () => {};
};
