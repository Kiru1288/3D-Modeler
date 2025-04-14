import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Hardcoded Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAq_ly5reUXTpa8QvPae_EU9XVbiJNSkPU",
  authDomain: "artreum-innovators.firebaseapp.com",
  projectId: "artreum-innovators",
  storageBucket: "artreum-innovators.appspot.com",
  messagingSenderId: "646774120375",
  appId: "1:646774120375:web:ed0e10bf26442e34de5232"
};

// ✅ Ensure Firebase is only initialized once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Initialize Firebase Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const yahooProvider = new OAuthProvider("yahoo.com"); // ✅ Yahoo Authentication
export const db = getFirestore(app);
