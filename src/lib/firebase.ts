
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
  type DocumentSnapshot,
  type Unsubscribe,
  type UserCredential,
} from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role?: 'patient' | 'doctor';
  photoURL?: string | null;
}

// User-provided API key and Project ID as fallbacks
const FALLBACK_API_KEY = "AIzaSyBctoFJW1hKPLZPgN18aOM96qRgp3N-rpc";
const FALLBACK_PROJECT_ID = "al-hakim-41a51";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let authInstance: FirebaseAuth | undefined;
let dbInstance: Firestore | undefined;

try {
  let configValid = true;

  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID" || firebaseConfig.projectId === "") {
    console.error(
      `Firebase Project ID is not configured correctly. It's either missing in .env.local (NEXT_PUBLIC_FIREBASE_PROJECT_ID), set to the placeholder "YOUR_PROJECT_ID", empty, or using the fallback "${FALLBACK_PROJECT_ID}". For a functional app, please provide a valid Project ID.`
    );
    if (firebaseConfig.projectId === "YOUR_PROJECT_ID" || firebaseConfig.projectId === "") {
        configValid = false;
    } else if (firebaseConfig.projectId === FALLBACK_PROJECT_ID && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.warn(`Using fallback Project ID: ${FALLBACK_PROJECT_ID}. Ensure this is the correct and intended project for your application.`);
    }
  }

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.apiKey === "") {
    console.error(
      `Firebase API Key is not configured correctly. It's either missing in .env.local (NEXT_PUBLIC_FIREBASE_API_KEY), set to the placeholder "YOUR_API_KEY", empty, or using the fallback. For a functional app, please provide a valid API Key.`
    );
    if (firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.apiKey === "") {
        configValid = false;
    } else if (firebaseConfig.apiKey === FALLBACK_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.warn(
            `Using placeholder API key: ${FALLBACK_API_KEY}. This key is likely to result in 'PERMISSION_DENIED' or connection errors. For a functional app, please provide a valid Firebase API Key in your .env.local file as NEXT_PUBLIC_FIREBASE_API_KEY.`
        );
    }
  }
  
  if (!firebaseConfig.authDomain) {
    console.warn("Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is not configured in .env.local. This may be required for authentication in some environments.");
    // configValid = false; // Not strictly critical for all Firestore operations but good for auth
  }
  
  if (!firebaseConfig.appId) {
    console.warn("Firebase App ID (NEXT_PUBLIC_FIREBASE_APP_ID) is not configured in .env.local. This may be required for some Firebase services.");
    // configValid = false; // Not strictly critical
  }


  if (configValid) {
    app = initializeApp(firebaseConfig);
    authInstance = getFirebaseAuthInstance(app);
    dbInstance = getFirestoreInstance(app);
  } else {
    console.error("Firebase initialization skipped due to invalid or missing critical configuration. Please check your .env.local file and console logs.");
  }

} catch (e: any) {
  if (e.code === "app/duplicate-app" && typeof window !== 'undefined') {
    app = getApp(); 
    authInstance = getFirebaseAuthInstance(app);
    dbInstance = getFirestoreInstance(app);
  } else {
    console.error("Firebase initialization error:", e.message, e.stack);
  }
}

export const auth = {
  createUserWithEmailAndPassword: async (email?: string, password?: string): Promise<UserCredential> => {
    if (!authInstance) throw new Error("Firebase Auth is not initialized. Check configuration and console logs.");
    if (!email || !password) throw new Error('Email and password are required.');
    return fbCreateUserWithEmailAndPassword(authInstance, email, password);
  },
  signInWithEmailAndPassword: async (email?: string, password?: string): Promise<UserCredential> => {
    if (!authInstance) throw new Error("Firebase Auth is not initialized. Check configuration and console logs.");
    if (!email || !password) throw new Error('Email and password are required.');
    return fbSignInWithEmailAndPassword(authInstance, email, password);
  },
  signOut: async (): Promise<void> => {
    if (!authInstance) throw new Error("Firebase Auth is not initialized. Check configuration and console logs.");
    return fbSignOut(authInstance);
  },
  onAuthStateChanged: (callback: (user: FirebaseUserType | null) => void): Unsubscribe => {
    if (!authInstance) {
      console.warn("Firebase Auth is not initialized. onAuthStateChanged will not be effective.");
      return () => {}; 
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
      return null;
    }
    return authInstance.currentUser;
  }
};

export const db = {
  setDoc: async (path: string, data: DocumentData): Promise<void> => {
    if (!dbInstance) throw new Error("Firestore is not initialized. Check configuration and console logs.");
    const [collectionName, docId] = path.split('/');
    if (!collectionName || !docId) throw new Error("Invalid path for setDoc. Must be 'collectionName/docId'.");
    const docRef = doc(dbInstance, collectionName, docId);
    await fbSetDoc(docRef, data, { merge: true });
  },
  getDoc: async (path: string): Promise<{ exists: () => boolean; data: () => DocumentData | undefined; id: string }> => {
    if (!dbInstance) throw new Error("Firestore is not initialized. Check configuration and console logs.");
    const [collectionName, docId] = path.split('/');
    if (!collectionName || !docId) throw new Error("Invalid path for getDoc. Must be 'collectionName/docId'.");
    const docRef = doc(dbInstance, collectionName, docId);
    const docSnap: DocumentSnapshot<DocumentData> = await fbGetDoc(docRef);
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

// Export the raw Firestore instance for direct SDK use if needed
export const firestore: Firestore | undefined = dbInstance;

export type { FirebaseUserType };
