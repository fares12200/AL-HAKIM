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
  photoURL?: string | null; // Add photoURL
}

// Mock user data store
const mockUsers: { [uid: string]: User & { password?: string } } = {};
const mockUserDetails: { [uid: string]: any } = {}; // Store any user details, role, name, medicalRecordId, etc.

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
    const uid = `mock-uid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const photoURL = `https://picsum.photos/seed/${uid.substring(0,10)}/200/200`;
    const newUser: User & { password?: string } = { uid, email, displayName: name, role, password, photoURL };
    mockUsers[uid] = newUser;
    // Store initial details in mockUserDetails as well, as this is what db.getDoc uses
    mockUserDetails[uid] = { 
        uid, 
        email, 
        name, 
        role, 
        photoURL, 
        createdAt: new Date().toISOString() 
    }; 
    console.log('[Mock Auth] User created:', newUser);
    // For simplicity, automatically sign in the new user.
    currentUser = { uid, email, displayName: name, role, photoURL };
    notifyAuthStateChanged();
    return { user: { uid, email, displayName: name, role, photoURL } };
  },

  // Mock signInWithEmailAndPassword
  signInWithEmailAndPassword: async (email?: string, password?: string): Promise<{ user: User } | null> => {
    if (!email || !password) {
      throw new Error('Mock Auth: Email and password are required for signin.');
    }
    const foundUserInAuth = Object.values(mockUsers).find(u => u.email === email && u.password === password);
    if (foundUserInAuth) {
      // Fetch more details from mockUserDetails (which simulates Firestore)
      const userDetails = mockUserDetails[foundUserInAuth.uid] || {};
      currentUser = { 
        uid: foundUserInAuth.uid, 
        email: foundUserInAuth.email, 
        displayName: userDetails.name || foundUserInAuth.displayName, // Prefer name from DB
        role: userDetails.role || foundUserInAuth.role, // Prefer role from DB
        photoURL: userDetails.photoURL || foundUserInAuth.photoURL, // Prefer photoURL from DB
      };
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
    let userToReturn = null;
    if (currentUser) {
        // Ensure the user object returned by onAuthStateChanged reflects DB potentially more than initial auth creation
        const userDetails = mockUserDetails[currentUser.uid] || {};
        userToReturn = {
            ...currentUser,
            displayName: userDetails.name || currentUser.displayName,
            role: userDetails.role || currentUser.role,
            photoURL: userDetails.photoURL || currentUser.photoURL,
        };
    }
    callback(userToReturn);
    
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
  let userToBroadcast = null;
  if (currentUser) {
      const userDetails = mockUserDetails[currentUser.uid] || {};
      userToBroadcast = {
          ...currentUser,
          displayName: userDetails.name || currentUser.displayName,
          role: userDetails.role || currentUser.role,
          photoURL: userDetails.photoURL || currentUser.photoURL,
      };
  }
  authStateListeners.forEach(listener => listener(userToBroadcast));
};


// Mock Firestore
export const db = {
  // Mock setDoc
  setDoc: async (path: string, data: any): Promise<void> => {
    const [collection, id] = path.split('/');
    if (!id) {
        console.warn(`[Mock Firestore] Invalid path for setDoc (missing ID): ${path}`);
        return;
    }
    if (!mockUserDetails[id]) {
        mockUserDetails[id] = {}; // Initialize if new
    }
    // Merge data with existing, if any
    mockUserDetails[id] = { ...mockUserDetails[id], ...data, uid: id }; // Ensure uid is part of the stored data

    // If the user exists in auth, update their relevant details (like role, displayName, photoURL) there too for consistency
    // This is to simulate that Firestore is the source of truth for these details after initial creation
    if (mockUsers[id]) {
      if (data.role) mockUsers[id].role = data.role;
      if (data.name) mockUsers[id].displayName = data.name; // Assuming 'name' from DB maps to 'displayName' in User
      if (data.photoURL) mockUsers[id].photoURL = data.photoURL;
      
      if (currentUser?.uid === id) { // If the modified user is the currently logged-in user
        if (data.role) currentUser.role = data.role;
        if (data.name) currentUser.displayName = data.name;
        if (data.photoURL) currentUser.photoURL = data.photoURL;
        notifyAuthStateChanged(); // Notify if current user's data changed
      }
    }
    console.log(`[Mock Firestore] Document set at ${path}:`, mockUserDetails[id]);
  },
  // Mock getDoc
  getDoc: async (path: string): Promise<{ exists: () => boolean; data: () => any | undefined }> => {
    const [collection, id] = path.split('/');
     if (!id) {
        console.log(`[Mock Firestore] Document not found (invalid path - missing ID): ${path}`);
        return { exists: () => false, data: () => undefined };
    }
    if (mockUserDetails[id]) { // Check if document exists in our mock DB
      const data = mockUserDetails[id];
      console.log(`[Mock Firestore] Document fetched from ${path}:`, data);
      return {
        exists: () => true,
        data: () => ({ ...data, uid: id }), // Ensure uid is returned
      };
    }
    console.log(`[Mock Firestore] Document not found at ${path}`);
    return {
      exists: () => false,
      data: () => undefined,
    };
  },
  // Helper for getDoctors mock to iterate over "users"
  getAllUsersForMock: async (): Promise<{ [uid: string]: any }> => {
    return { ...mockUserDetails }; // Return a copy
  }
};

// Helper functions to simulate real Firebase interactions
export const initializeFirebaseApp = () => {
  // In a real app, this would be: initializeApp(firebaseConfig);
  console.log("Mock Firebase Initialized");
};

initializeFirebaseApp();