import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { api, tokenStorage } from '../services/api.ts';
import {
  auth,
  db as firestoreDb,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../services/firebase.ts';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  quickLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(firestoreDb, 'users', fbUser.uid);
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
          }

          let role: UserRole = 'AGENT_OPERATOR';
          if (
            fbUser.email?.includes('admin') ||
            fbUser.email === 'sayantanudas271@gmail.com'
          ) {
            role = 'ADMIN';
          } else if (fbUser.email?.includes('manager')) {
            role = 'MANAGER';
          }

          const userData: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Enterprise Operator',
            email: fbUser.email || 'user@enterprise.com',
            role: userDoc?.exists() ? (userDoc.data()?.role as UserRole) || role : role,
            createdAt: userDoc?.exists() ? userDoc.data()?.createdAt || new Date().toISOString() : new Date().toISOString(),
          };

          if (!userDoc?.exists()) {
            try {
              await setDoc(userDocRef, {
                uid: fbUser.uid,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                createdAt: userData.createdAt,
                updatedAt: new Date().toISOString(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
            }
          }

          setUser(userData);
          // Set a JWT or session identifier
          tokenStorage.set(`fb_${fbUser.uid}`);
          setToken(`fb_${fbUser.uid}`);
        } catch (err) {
          console.error('[Firebase Auth Sync Error]:', err);
        }
      } else {
        // Check if there is an active local JWT session
        const storedToken = tokenStorage.get();
        if (storedToken && !storedToken.startsWith('fb_')) {
          try {
            const res = await api.auth.me();
            setUser(res.user);
          } catch {
            tokenStorage.remove();
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('[Google Sign-In Error]:', err);
      setError(err.message || 'Google Sign-In failed');
      throw err;
    }
  };

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      const res = await api.auth.login(email, pass);
      tokenStorage.set(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, pass: string, role: UserRole) => {
    setError(null);
    try {
      const res = await api.auth.register(name, email, pass, role);
      tokenStorage.set(res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const quickLogin = async (role: UserRole) => {
    setError(null);
    let email = 'operator@autoops.ai';
    let pass = 'OperatorPass123!';

    if (role === 'ADMIN') {
      email = 'admin@autoops.ai';
      pass = 'AdminPass123!';
    } else if (role === 'MANAGER') {
      email = 'manager@autoops.ai';
      pass = 'ManagerPass123!';
    }

    await login(email, pass);
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {}
    tokenStorage.remove();
    setToken(null);
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        quickLogin,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
