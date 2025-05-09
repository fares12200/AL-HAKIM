
import { initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth as getFirebaseAuthInstance,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile,
  type User as FirebaseUserType,
} from 'firebase/auth';
import {
  getFirestore as getFirestoreInstance,
  doc,
  setDoc as fbSetDoc,
  getDoc as fbGetDoc,
  collection as fbCollection,
  getDocs as fbGetDocs,
  query as fbQuery,
  where as fbWhere,
  type DocumentData,
  type Firestore,
  type Auth as FirebaseAuth,
} from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role?: 'patient' | 'doctor';
  photoURL?: string | null;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let authInstance: FirebaseAuth | undefined;
let dbInstance: Firestore | undefined;

try {
  let configValid = true;
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error(
        "Firebase Project ID is not configured correctly. Please check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set to your actual Firebase Project ID."
    );
    configValid = false;
  }
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.apiKey === "AIzaSyBctoFJW1hKPLZPgN18aOM96qRgp3N-rpc_PLACEHOLDER") { // Added check for specific placeholder
    console.error(
        "Firebase API Key is not configured correctly. Please check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set to your actual Firebase API Key."
    );
    configValid = false;
  }
  // Add checks for other critical config fields if necessary

  if (configValid) {
    app = initializeApp(firebaseConfig);
    authInstance = getFirebaseAuthInstance(app);
    dbInstance = getFirestoreInstance(app);
  } else {
    console.error("Firebase initialization skipped due to invalid configuration.");
  }

} catch (e: any) {
  // Check if running in a browser environment before calling getApp() for duplicate app
  if (e.code === "app/duplicate-app" && typeof window !== 'undefined') {
    app = getApp();
    authInstance = getFirebaseAuthInstance(app);
    dbInstance = getFirestoreInstance(app);
  } else {
    console.error("Firebase initialization error:", e.message, e.stack);
    // app, authInstance, dbInstance will remain undefined
  }
}

// Exported auth object
export const auth = {
  createUserWithEmailAndPassword: async (email?: string, password?: string): Promise<{ user: FirebaseUserType }> => {
    if (!authInstance) throw new Error("Firebase Auth is not initialized. Check configuration and console logs.");
    if (!email || !password) throw new Error('Email and password are required.');
    return fbCreateUserWithEmailAndPassword(authInstance, email, password);
  },
  signInWithEmailAndPassword: async (email?: string, password?: string): Promise<{ user: FirebaseUserType }> => {
    if (!authInstance) throw new Error("Firebase Auth is not initialized. Check configuration and console logs.");
    if (!email || !password) throw new Error('Email and password are required.');
    return fbSignInWithEmailAndPassword(authInstance, email, password);
  },
  signOut: async (): Promise<void> => {
    if (!authInstance) throw new Error("Firebase Auth is not initialized. Check configuration and console logs.");
    return fbSignOut(authInstance);
  },
  onAuthStateChanged: (callback: (user: FirebaseUserType | null) => void): (() => void) => {
    if (!authInstance) {
      console.warn("Firebase Auth is not initialized. onAuthStateChanged will not be effective.");
      return () => {}; // Return a no-op unsubscribe function
    }
    return fbOnAuthStateChanged(authInstance, callback);
  },
  updateProfile: async (user: FirebaseUserType, profile: { displayName?: string | null, photoURL?: string | null }): Promise<void> => {
    if (!authInstance) throw new Error("Firebase Auth is not initialized. Check configuration and console logs.");
    if (!user) throw new Error("User must be authenticated to update profile.");
    return fbUpdateProfile(user, profile);
  },
  getCurrentUser: (): FirebaseUserType | null => {
    if (!authInstance) {
      // console.warn("Firebase Auth is not initialized. getCurrentUser will return null.");
      return null;
    }
    return authInstance.currentUser;
  }
};

// Exported db object
export const db = {
  setDoc: async (path: string, data: DocumentData): Promise<void> => {
    if (!dbInstance) throw new Error("Firestore is not initialized. Check configuration and console logs.");
    const [collectionName, docId] = path.split('/');
    if (!collectionName || !docId) throw new Error("Invalid path for setDoc. Must be 'collectionName/docId'.");
    const docRef = doc(dbInstance, collectionName, docId);
    await fbSetDoc(docRef, data, { merge: true });
  },
  getDoc: async (path: string): Promise<{ exists: () => boolean; data: () => DocumentData | undefined, id: string }> => {
    if (!dbInstance) throw new Error("Firestore is not initialized. Check configuration and console logs.");
    const [collectionName, docId] = path.split('/');
    if (!collectionName || !docId) throw new Error("Invalid path for getDoc. Must be 'collectionName/docId'.");
    const docRef = doc(dbInstance, collectionName, docId);
    const docSnap = await fbGetDoc(docRef);
    return {
      exists: () => docSnap.exists(),
      data: () => docSnap.data(),
      id: docSnap.id,
    };
  },
  getDocs: async (collectionName: string): Promise<DocumentData[]> => {
    if (!dbInstance) throw new Error("Firestore is not initialized. Check configuration and console logs.");
    const collectionRef = fbCollection(dbInstance, collectionName);
    const querySnapshot = await fbGetDocs(collectionRef);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },
  queryDocs: async (collectionName: string, conditions: {field: string, operator: any, value: any}[]): Promise<DocumentData[]> => {
    if (!dbInstance) throw new Error("Firestore is not initialized. Check configuration and console logs.");
    let q = fbQuery(fbCollection(dbInstance, collectionName));
    conditions.forEach(condition => {
      q = fbQuery(q, fbWhere(condition.field, condition.operator, condition.value));
    });
    const querySnapshot = await fbGetDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  }
};

export type { FirebaseUserType };
