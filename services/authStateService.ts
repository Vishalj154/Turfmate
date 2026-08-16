import { onAuthStateChanged, User, Unsubscribe } from 'firebase/auth';
import { auth } from './firebase';

export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
