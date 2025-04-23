import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAq_ly5reUXTpa8QvPae_EU9XVbiJNSkPU",
  authDomain: "artreum-innovators.firebaseapp.com",
  projectId: "artreum-innovators",
  storageBucket: "artreum-innovators.firebasestorage.app",
  messagingSenderId: "646774120375",
  appId: "1:646774120375:web:ed0e10bf26442e34de5232"
};

const app = initializeApp(firebaseConfig); // ✅ initialize app
const db = getFirestore(app);              // ✅ connect Firestore

export { app, db }; // ✅ Export both for usage in auth and database
