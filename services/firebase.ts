import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmS8B89bHV-V3y7_IgjEw1j4Aq3ubY3Ns",
  authDomain: "turfmate-b7d1d.firebaseapp.com",
  projectId: "turfmate-b7d1d",
  storageBucket: "turfmate-b7d1d.firebasestorage.app",
  messagingSenderId: "122831017806",
  appId: "1:122831017806:web:720608e7fe79b04d73301f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;