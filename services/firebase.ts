import { initializeApp, getApps, getApp, setLogLevel } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { initializeFirestore, getFirestore, persistentLocalCache } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Suppress internal Firebase verbose logging during offline transitions
setLogLevel('error');

const firebaseConfig = {
  apiKey: "AIzaSyDmS8B89bHV-V3y7_IgjEw1j4Aq3ubY3Ns",
  authDomain: "turfmate-b7d1d.firebaseapp.com",
  projectId: "turfmate-b7d1d",
  storageBucket: "turfmate-b7d1d.firebasestorage.app",
  messagingSenderId: "122831017806",
  appId: "1:122831017806:web:720608e7fe79b04d73301f"
};

// Singleton App initialization to prevent duplicate app creation on Fast Refresh
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Safe Auth initialization with AsyncStorage persistence and Fast Refresh protection
let auth: ReturnType<typeof getAuth>;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch {
  auth = getAuth(app);
}

// Safe Firestore initialization with persistent local cache
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({})
  });
} catch {
  db = getFirestore(app);
}

const storage = getStorage(app);

export { app, auth, db, storage };
export default app;