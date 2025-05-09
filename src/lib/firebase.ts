
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { 
  getAuth as getFirebaseAuth, 
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword, 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile,
  type User as FirebaseUserType // Renamed to avoid conflict with local User interface
} from 'firebase/auth';
import { 
  getFirestore as getDbInstance, 
  doc, 
  setDoc as fbSetDoc, 
  getDoc as fbGetDoc,
  collection,
  getDocs as fbGetDocs,
  query as fbQuery,
  where as fbWhere,
  type DocumentData,
  type QueryConstraint
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

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const firebaseAuth = getFirebaseAuth(app);
const firestoreDb = getDbInstance(app);

export const auth = {
  createUserWithEmailAndPassword: async (email?: string, password?: string): Promise<{ user: FirebaseUserType } | null> => {
    if (!email || !password) {
      throw new Error('Firebase Auth: Email and password are required for signup.');
    }
    return await fbCreateUserWithEmailAndPassword(firebaseAuth, email, password);
  },
  signInWithEmailAndPassword: async (email?: string, password?: string): Promise<{ user: FirebaseUserType } | null> => {
    if (!email || !password) {
      throw new Error('Firebase Auth: Email and password are required for signin.');
    }
    return await fbSignInWithEmailAndPassword(firebaseAuth, email, password);
  },
  signOut: async (): Promise<void> => {
    return await fbSignOut(firebaseAuth);
  },
  onAuthStateChanged: (callback: (user: FirebaseUserType | null) => void): (() => void) => {
    return fbOnAuthStateChanged(firebaseAuth, callback);
  },
  updateProfile: async (user: FirebaseUserType, profile: { displayName?: string | null, photoURL?: string | null }): Promise<void> => {
    if (!user) throw new Error("User must be authenticated to update profile.");
    return await fbUpdateProfile(user, profile);
  },
  getCurrentUser: (): FirebaseUserType | null => {
    return firebaseAuth.currentUser;
  }
};

export const db = {
  setDoc: async (path: string, data: DocumentData): Promise<void> => {
    const [collectionName, docId] = path.split('/');
    if (!collectionName || !docId) throw new Error("Invalid path for setDoc. Must be 'collectionName/docId'.");
    const docRef = doc(firestoreDb, collectionName, docId);
    await fbSetDoc(docRef, data, { merge: true }); // Using merge: true by default for updates
  },
  getDoc: async (path: string): Promise<{ exists: () => boolean; data: () => DocumentData | undefined, id: string }> => {
    const [collectionName, docId] = path.split('/');
    if (!collectionName || !docId) throw new Error("Invalid path for getDoc. Must be 'collectionName/docId'.");
    const docRef = doc(firestoreDb, collectionName, docId);
    const docSnap = await fbGetDoc(docRef);
    return {
      exists: () => docSnap.exists(),
      data: () => docSnap.data(),
      id: docSnap.id,
    };
  },
  getDocs: async (collectionName: string): Promise<DocumentData[]> => {
    const collectionRef = collection(firestoreDb, collectionName);
    const querySnapshot = await fbGetDocs(collectionRef);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  },
  queryDocs: async (collectionName: string, conditions: {field: string, operator: any, value: any}[]): Promise<DocumentData[]> => {
    let q = fbQuery(collection(firestoreDb, collectionName));
    conditions.forEach(condition => {
      q = fbQuery(q, fbWhere(condition.field, condition.operator, condition.value));
    });
    const querySnapshot = await fbGetDocs(q);
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  }
};

export { type FirebaseUserType }; // Exporting for use in auth-context
