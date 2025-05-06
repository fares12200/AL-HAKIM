
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, type User as FirebaseUser, db } from '@/lib/firebase'; // Using aliased User
import { useRouter, usePathname } from 'next/navigation';

export interface User extends FirebaseUser {
  // Extend with any app-specific user properties if needed in context
  // For now, FirebaseUser is sufficient, especially with the added 'role'
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email?: string, password?: string, name?: string, role?: 'patient' | 'doctor') => Promise<void>;
  logIn: (email?: string, password?: string) => Promise<void>;
  logOut: () => Promise<void>;
  fetchUserRole: (uid: string) => Promise<'patient' | 'doctor' | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return; // Ensure this runs only on client
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
};

// Helper function to clear a cookie
const clearCookie = (name: string) => {
  if (typeof document === 'undefined') return; // Ensure this runs only on client
  document.cookie = name + '=; Max-Age=-99999999; path=/';
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await db.getDoc(`users/${firebaseUser.uid}`);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fullUser: User = { 
            ...firebaseUser, 
            role: userData.role, 
            displayName: userData.name || firebaseUser.displayName 
          };
          setUser(fullUser);
          setCookie('mockAuthToken', 'true');
          setCookie('mockUserRole', userData.role || 'patient'); // default to patient if role somehow missing
        } else {
          // Fallback if no Firestore doc (e.g., admin-created user without profile yet)
          setUser(firebaseUser as User); // User might not have role yet
          setCookie('mockAuthToken', 'true');
          clearCookie('mockUserRole'); // No specific role known
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
      const userCredential = await auth.createUserWithEmailAndPassword(email, password, name, role);
      if (userCredential && userCredential.user) {
        const newUser = {
          email: userCredential.user.email,
          name: name,
          role: role,
          createdAt: new Date().toISOString(),
        };
        await db.setDoc(`users/${userCredential.user.uid}`, newUser);
        
        const fullUser: User = { uid: userCredential.user.uid, email, displayName: name, role };
        setUser(fullUser);
        setCookie('mockAuthToken', 'true');
        setCookie('mockUserRole', role);

        router.push(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (error) {
      console.error("Sign up error:", error);
      clearCookie('mockAuthToken');
      clearCookie('mockUserRole');
      throw error;
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
        const userDoc = await db.getDoc(`users/${userCredential.user.uid}`);
        let role: 'patient' | 'doctor' = 'patient'; 
        let displayName = userCredential.user.displayName;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          role = userData.role || 'patient';
          displayName = userData.name || userCredential.user.displayName;
        }
         const fullUser: User = { ...userCredential.user, role, displayName };
         setUser(fullUser);
         setCookie('mockAuthToken', 'true');
         setCookie('mockUserRole', role);
         router.push(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
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
      // Cookies might still be there if signOut fails, attempt to clear
      clearCookie('mockAuthToken');
      clearCookie('mockUserRole');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (uid: string): Promise<'patient' | 'doctor' | undefined> => {
    const userDoc = await db.getDoc(`users/${uid}`);
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return undefined;
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

