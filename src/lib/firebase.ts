
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

  // Validate Project ID
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error(
      `Firebase Project ID is not configured correctly. It's either missing in .env.local (NEXT_PUBLIC_FIREBASE_PROJECT_ID), set to the placeholder "YOUR_PROJECT_ID", or using the fallback "${FALLBACK_PROJECT_ID}". For a functional app, please provide a valid Project ID.`
    );
    // Only mark as invalid if it's the generic "YOUR_PROJECT_ID" placeholder
    if (firebaseConfig.projectId === "YOUR_PROJECT_ID") {
        configValid = false;
    } else if (firebaseConfig.projectId === FALLBACK_PROJECT_ID && !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.warn(`Using fallback Project ID: ${FALLBACK_PROJECT_ID}. Ensure this is the correct and intended project for your application.`);
    }
  }

  // Validate API Key
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.error(
      `Firebase API Key is not configured correctly. It's either missing in .env.local (NEXT_PUBLIC_FIREBASE_API_KEY), set to the placeholder "YOUR_API_KEY", or using the fallback "${FALLBACK_API_KEY}". For a functional app, please provide a valid API Key.`
    );
    // Only mark as invalid if it's the generic "YOUR_API_KEY" placeholder
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        configValid = false;
    } else if (firebaseConfig.apiKey === FALLBACK_API_KEY && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        // This case means the user is relying on the hardcoded fallback API key.
        // This specific fallback key is known to be a placeholder and will likely cause permission errors.
        console.warn(
            `Attempting to use the placeholder API key: ${FALLBACK_API_KEY}. This key is highly likely to result in 'PERMISSION_DENIED' or connection errors. For a functional app, please provide a valid Firebase API Key in your .env.local file as NEXT_PUBLIC_FIREBASE_API_KEY.`
        );
        // We allow configValid to remain true here, so initialization is attempted as per user's explicit request.
        // The responsibility for using a working key lies with the user.
    }
  }
  
  // Validate Auth Domain
  if (!firebaseConfig.authDomain) {
    console.error("Firebase Auth Domain (NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) is not configured in .env.local. This is required for authentication.");
    configValid = false;
  }
  
  // Validate App ID
  if (!firebaseConfig.appId) {
    console.error("Firebase App ID (NEXT_PUBLIC_FIREBASE_APP_ID) is not configured in .env.local. This is required for some Firebase services.");
    configValid = false;
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
    app = getApp(); // Get existing app instance if already initialized
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
