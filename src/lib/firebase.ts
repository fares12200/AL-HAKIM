
// This is a mock Firebase service.
// In a real application, you would use the Firebase SDK here.
// e.g., import { initializeApp } from 'firebase/app';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
// import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  role?: 'patient' | 'doctor'; // Add role to user
}

// Mock user data store
const mockUsers: { [uid: string]: User & { password?: string } } = {};
const mockUserDetails: { [uid: string]: { role: 'patient' | 'doctor', name: string, medicalRecordId?: string, doctorProfileId?: string } } = {};

let currentUser: User | null = null;
let authStateListeners: Array<(user: User | null) => void> = [];

export const auth = {
  // Mock createUserWithEmailAndPassword
  createUserWithEmailAndPassword: async (email?: string, password?: string, name?: string, role?: 'patient' | 'doctor'): Promise<{ user: User } | null> => {
    if (!email || !password || !name || !role) {
      throw new Error('Mock Auth: Email, password, name, and role are required for signup.');
    }
    if (Object.values(mockUsers).find(u => u.email === email)) {
      throw new Error('Mock Auth: Email already in use.');
    }
    const uid = `mock-uid-${Date.now()}`;
    const newUser: User & { password?: string } = { uid, email, displayName: name, role, password };
    mockUsers[uid] = newUser;
    mockUserDetails[uid] = { role, name };
    console.log('[Mock Auth] User created:', newUser);
    // For simplicity, automatically sign in the new user.
    currentUser = { uid, email, displayName: name, role };
    notifyAuthStateChanged();
    return { user: { uid, email, displayName: name, role } };
  },

  // Mock signInWithEmailAndPassword
  signInWithEmailAndPassword: async (email?: string, password?: string): Promise<{ user: User } | null> => {
    if (!email || !password) {
      throw new Error('Mock Auth: Email and password are required for signin.');
    }
    const foundUser = Object.values(mockUsers).find(u => u.email === email && u.password === password);
    if (foundUser) {
      currentUser = { uid: foundUser.uid, email: foundUser.email, displayName: foundUser.displayName, role: foundUser.role };
      console.log('[Mock Auth] User signed in:', currentUser);
      notifyAuthStateChanged();
      return { user: currentUser };
    }
    throw new Error('Mock Auth: Invalid credentials.');
  },

  // Mock signOut
  signOut: async (): Promise<void> => {
    console.log('[Mock Auth] User signed out:', currentUser);
    currentUser = null;
    notifyAuthStateChanged();
  },

  // Mock onAuthStateChanged
  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    authStateListeners.push(callback);
    // Immediately call with current state
    callback(currentUser);
    return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== callback);
    };
  },

  // Helper to get current user synchronously (for mock purposes)
  getCurrentUser: (): User | null => {
    return currentUser;
  }
};

const notifyAuthStateChanged = () => {
  authStateListeners.forEach(listener => listener(currentUser));
};


// Mock Firestore
export const db = {
  // Mock setDoc
  setDoc: async (path: string, data: any): Promise<void> => {
    // path would be something like `users/${uid}`
    const [collection, id] = path.split('/');
    if (collection === 'users' && id) {
      // Merge data with existing, if any
      mockUserDetails[id] = { ...mockUserDetails[id], ...data };
      // If the user exists in auth, update their role there too
      if (mockUsers[id] && data.role) {
        mockUsers[id].role = data.role;
        if (currentUser?.uid === id) {
          currentUser.role = data.role;
          notifyAuthStateChanged();
        }
      }
      console.log(`[Mock Firestore] Document set at ${path}:`, mockUserDetails[id]);
    } else {
      console.warn(`[Mock Firestore] Path format not fully supported for setDoc mock: ${path}`);
    }
  },
  // Mock getDoc
  getDoc: async (path: string): Promise<{ exists: () => boolean; data: () => any | undefined }> => {
    const [collection, id] = path.split('/');
    if (collection === 'users' && id && mockUserDetails[id]) {
      const data = mockUserDetails[id];
      console.log(`[Mock Firestore] Document fetched from ${path}:`, data);
      return {
        exists: () => true,
        data: () => data,
      };
    }
    console.log(`[Mock Firestore] Document not found at ${path}`);
    return {
      exists: () => false,
      data: () => undefined,
    };
  },
};

// Helper functions to simulate real Firebase interactions
export const initializeFirebaseApp = () => {
  // In a real app, this would be: initializeApp(firebaseConfig);
  console.log("Mock Firebase Initialized");
};

initializeFirebaseApp();
