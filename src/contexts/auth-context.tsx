
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, type User as AppUser, type FirebaseUserType } from '@/lib/firebase'; // Using aliased User
import { useRouter } from 'next/navigation';

// The AppUser interface (potentially with role) is now defined in firebase.ts
// We use FirebaseUserType for the raw Firebase auth user object

interface AuthContextType {
  user: AppUser | null; // This will be our app-specific user object with role
  loading: boolean;
  signUp: (email?: string, password?: string, name?: string, role?: 'patient' | 'doctor') => Promise<void>;
  logIn: (email?: string, password?: string) => Promise<void>;
  logOut: () => Promise<void>;
  fetchUserRole: (uid: string) => Promise<'patient' | 'doctor' | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

const clearCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999; path=/';
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUserType | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await db.getDoc(`users/${firebaseUser.uid}`);
          if (userDoc.exists()) {
            const userData = userDoc.data() as AppUser; // Assuming Firestore data matches AppUser structure
            const fullUser: AppUser = { 
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: userData.name || firebaseUser.displayName, // Prefer Firestore name
              role: userData.role, 
              photoURL: userData.photoURL || firebaseUser.photoURL, // Prefer Firestore photoURL
            };
            setUser(fullUser);
            setCookie('mockAuthToken', 'true'); // Keep mock cookie for middleware simulation
            setCookie('mockUserRole', userData.role || 'patient');
          } else {
            // User exists in Auth but not in Firestore (e.g., during signup process or if doc deleted)
             // For a newly signed up user, role might not be set yet in Firestore.
             // We might want to set a default or wait for Firestore doc creation.
             // For now, treat as partial user.
            console.warn(`User document for UID ${firebaseUser.uid} not found in Firestore. Setting partial user object.`);
            setUser({ 
                uid: firebaseUser.uid, 
                email: firebaseUser.email, 
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                // role will be undefined here until Firestore doc is created/fetched
            });
            setCookie('mockAuthToken', 'true');
            clearCookie('mockUserRole');
          }
        } catch (error) {
            console.error("Error fetching user document from Firestore during onAuthStateChanged:", error);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName, photoURL: firebaseUser.photoURL }); // Fallback to auth data
            setCookie('mockAuthToken', 'true');
            clearCookie('mockUserRole');
        }
      } else {
        setUser(null);
        clearCookie('mockAuthToken');
        clearCookie('mockUserRole');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email?: string, password?: string, name?: string, role?: 'patient' | 'doctor') => {
    if (!email || !password || !name || !role) {
      throw new Error('Email, password, name, and role are required for signup.');
    }
    setLoading(true);
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      if (userCredential && userCredential.user) {
        const firebaseUser = userCredential.user;
        // Update Firebase Auth profile (displayName)
        await auth.updateProfile(firebaseUser, { displayName: name });

        // Create user document in Firestore
        const newUserDoc: AppUser & { createdAt: string } = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: name, // Store name in Firestore as well
          role: role,
          photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid.substring(0,10)}/200/200`,
          createdAt: new Date().toISOString(),
        };
        await db.setDoc(`users/${firebaseUser.uid}`, newUserDoc);
        
        setUser({ ...newUserDoc }); // Set context user from Firestore data
        setCookie('mockAuthToken', 'true');
        setCookie('mockUserRole', role);

        router.push(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (error) {
      console.error("Sign up error:", error);
      clearCookie('mockAuthToken');
      clearCookie('mockUserRole');
      throw error; // Re-throw to be caught by the form
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email?: string, password?: string) => {
     if (!email || !password) {
      throw new Error('Email and password are required for login.');
    }
    setLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
       if (userCredential && userCredential.user) {
        const firebaseUser = userCredential.user;
        let userDoc = await db.getDoc(`users/${firebaseUser.uid}`);
        let userData: AppUser;
        let userRoleToSet: 'patient' | 'doctor' = 'patient'; // Default role

        if (userDoc.exists()) {
            userData = userDoc.data() as AppUser;
            userRoleToSet = userData.role || 'patient';
        } else {
            console.warn(`User document for UID ${firebaseUser.uid} not found in Firestore. Creating a default one.`);
            // Create a default user document in Firestore
            const defaultUserData: AppUser & { createdAt: string } = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'New User', // Use displayName from Auth or a default
                role: 'patient', // Default role
                photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid.substring(0,10)}/200/200`,
                createdAt: new Date().toISOString(),
            };
            await db.setDoc(`users/${firebaseUser.uid}`, defaultUserData);
            userData = defaultUserData; // Use the newly created data
            userRoleToSet = defaultUserData.role;
        }
        
        const fullUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: userData.name || firebaseUser.displayName,
          role: userRoleToSet,
          photoURL: userData.photoURL || firebaseUser.photoURL,
        };
        setUser(fullUser);
        setCookie('mockAuthToken', 'true');
        setCookie('mockUserRole', userRoleToSet);
        router.push(userRoleToSet === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (error) {
      console.error("Log in error:", error);
      clearCookie('mockAuthToken');
      clearCookie('mockUserRole');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      setUser(null);
      clearCookie('mockAuthToken');
      clearCookie('mockUserRole');
      router.push('/');
    } catch (error) {
      console.error("Log out error:", error);
      clearCookie('mockAuthToken');
      clearCookie('mockUserRole');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (uid: string): Promise<'patient' | 'doctor' | undefined> => {
    try {
        const userDoc = await db.getDoc(`users/${uid}`);
        if (userDoc.exists()) {
          return userDoc.data()?.role;
        }
        return undefined;
    } catch(error) {
        console.error("Error fetching user role:", error);
        return undefined;
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut, fetchUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

