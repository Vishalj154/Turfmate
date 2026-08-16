import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User as TurfMateUser } from '../database/schema';

// A type helper to allow Firestore's FieldValue for createdAt while inserting
export type UserProfileCreateData = Omit<TurfMateUser, 'createdAt'> & {
  createdAt?: any;
};

export async function createUserProfile(uid: string, data: Partial<UserProfileCreateData>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const userData = {
    ...data,
    createdAt: serverTimestamp(),
  };
  
  await setDoc(userRef, userData, { merge: true });
}

export async function getUserProfile(uid: string): Promise<TurfMateUser | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as TurfMateUser;
  }
  
  return null;
}

export async function updateUserProfile(uid: string, data: Partial<TurfMateUser>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}
