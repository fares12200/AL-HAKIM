
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, type User as FirebaseUser, db } from '@/lib/firebase'; // Using aliased User
import { useRouter } from 'next/navigation';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch additional user details (like role) from Firestore
        const userDoc = await db.getDoc(`users/${firebaseUser.uid}`);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({ ...firebaseUser, role: userData.role, displayName: userData.name || firebaseUser.displayName });
        } else {
          // Fallback if no Firestore doc, though signup should create one
          setUser(firebaseUser as User);
        }
      } else {
        setUser(null);
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
        // Store additional user info in Firestore
        await db.setDoc(`users/${userCredential.user.uid}`, {
          email: userCredential.user.email,
          name: name,
          role: role,
          createdAt: new Date().toISOString(), // Mock timestamp
        });
        // The onAuthStateChanged listener will update the user state
        // Forcing a refresh or relying on onAuthStateChanged can be tricky with mocks.
        // Manually setting user state here after signup for immediate feedback in mock.
        setUser({ uid: userCredential.user.uid, email, displayName: name, role });
        router.push(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (error) {
      console.error("Sign up error:", error);
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
        let role: 'patient' | 'doctor' = 'patient'; // Default role
        let displayName = userCredential.user.displayName;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          role = userData.role || 'patient';
          displayName = userData.name || userCredential.user.displayName;
        }
         setUser({ ...userCredential.user, role, displayName });
         router.push(role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      }
    } catch (error) {
      console.error("Log in error:", error);
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
      router.push('/');
    } catch (error) {
      console.error("Log out error:", error);
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
