// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Replace this config with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCHhYcJe5aIqMrjW8JPi3da5hYHUtLorAo",
  authDomain: "agrichain-62566.firebaseapp.com",
  projectId: "agrichain-62566",
  storageBucket: "agrichain-62566.appspot.com", // ✅ CORRECTED
  messagingSenderId: "780554579510",
  appId: "1:780554579510:web:d546e3f7773b1db681f297"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;