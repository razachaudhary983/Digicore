import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, Role } from '../types/auth';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isLocked: boolean;
  rememberMe: boolean;
  users: User[];
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  lockSession: () => void;
  unlockSession: (password: string) => Promise<{ success: boolean; error?: string }>;
  resetAdminPasswordWithMasterKey: (masterKey: string, newPassword: string) => { success: boolean; error?: string };
  addUser: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  adminResetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_KEY = 'aliraza983';
const DEFAULT_ADMIN_EMAIL = 'digicorepak@gmail.com';
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes inactivity timer

const initialUsers: User[] = [
  {
    id: 'user-admin-1',
    name: 'DigiCore Executive Admin',
    email: 'digicorepak@gmail.com',
    password: 'Digicore@983',
    role: 'admin',
    createdAt: '2025-01-01',
  },
  {
    id: 'user-staff-1',
    name: 'Outreach Manager',
    email: 'staff@digicorepak.com',
    password: 'Digicore@123',
    role: 'staff',
    createdAt: '2025-02-01',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('digicore_remember_me') === 'true';
  });

  const [users, setUsers] = useState<User[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const isRemembered = localStorage.getItem('digicore_remember_me') === 'true';
    if (isRemembered) {
      const local = localStorage.getItem('digicore_active_user');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (e) {
          return null;
        }
      }
    } else {
      const session = sessionStorage.getItem('digicore_active_user');
      if (session) {
        try {
          return JSON.parse(session);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return sessionStorage.getItem('digicore_session_locked') === 'true';
  });

  const lastActivityRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync users collection from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteUsers: User[] = [];
          snapshot.forEach((docSnap) => {
            remoteUsers.push({ ...(docSnap.data() as User), id: docSnap.id });
          });
          setUsers(remoteUsers);
        } else {
          // Initialize initial users into Firestore if collection is empty
          initialUsers.forEach(async (u) => {
            try {
              await setDoc(doc(db, 'users', u.id), u);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, 'users');
            }
          });
          setUsers(initialUsers);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    return () => unsubscribe();
  }, []);

  // Firebase Auth State Listener configured with selected persistence
  useEffect(() => {
    const isRemembered = localStorage.getItem('digicore_remember_me') === 'true';
    const persistenceMode = isRemembered ? browserLocalPersistence : browserSessionPersistence;
    setPersistence(auth, persistenceMode).catch(console.warn);

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        const matchingUser = users.find(
          u => u.email.toLowerCase() === fbUser.email?.toLowerCase()
        );
        if (matchingUser) {
          setCurrentUser(matchingUser);
          if (isRemembered) {
            localStorage.setItem('digicore_active_user', JSON.stringify(matchingUser));
          } else {
            sessionStorage.setItem('digicore_active_user', JSON.stringify(matchingUser));
          }
        } else {
          const fallbackUser: User = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            role: fbUser.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'staff',
            createdAt: new Date().toISOString().split('T')[0],
          };
          setCurrentUser(fallbackUser);
          if (isRemembered) {
            localStorage.setItem('digicore_active_user', JSON.stringify(fallbackUser));
          } else {
            sessionStorage.setItem('digicore_active_user', JSON.stringify(fallbackUser));
          }
        }
      } else {
        // Check active session storage if not remembered
        if (!isRemembered) {
          const activeSession = sessionStorage.getItem('digicore_active_user');
          if (activeSession) {
            try {
              setCurrentUser(JSON.parse(activeSession));
            } catch (e) {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        } else {
          const activeLocal = localStorage.getItem('digicore_active_user');
          if (activeLocal) {
            try {
              setCurrentUser(JSON.parse(activeLocal));
            } catch (e) {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [users]);

  // Keep storage in sync with currentUser
  useEffect(() => {
    const isRemembered = localStorage.getItem('digicore_remember_me') === 'true';
    if (currentUser) {
      if (isRemembered) {
        localStorage.setItem('digicore_active_user', JSON.stringify(currentUser));
        sessionStorage.setItem('digicore_active_user', JSON.stringify(currentUser));
      } else {
        sessionStorage.setItem('digicore_active_user', JSON.stringify(currentUser));
        localStorage.removeItem('digicore_active_user');
      }
    } else {
      sessionStorage.removeItem('digicore_active_user');
      localStorage.removeItem('digicore_active_user');
    }
  }, [currentUser]);

  // Keep lock state synchronized with sessionStorage
  useEffect(() => {
    if (isLocked) {
      sessionStorage.setItem('digicore_session_locked', 'true');
    } else {
      sessionStorage.removeItem('digicore_session_locked');
    }
  }, [isLocked]);

  // Lock session manually
  const lockSession = useCallback(() => {
    if (currentUser) {
      setIsLocked(true);
      sessionStorage.setItem('digicore_session_locked', 'true');
    }
  }, [currentUser]);

  // Idle Inactivity Tracker (10 Minutes Auto-Lock)
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!currentUser || isLocked) {
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
      return;
    }

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'pointerdown'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    // Check inactivity every 10 seconds
    idleTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= IDLE_TIMEOUT_MS) {
        setIsLocked(true);
        sessionStorage.setItem('digicore_session_locked', 'true');
      }
    }, 10000);

    return () => {
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
      if (idleTimerRef.current) clearInterval(idleTimerRef.current);
    };
  }, [currentUser, isLocked, resetInactivityTimer]);

  // Unlock session with active user password
  const unlockSession = async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'No active session found. Please log in.' };
    }

    const inputClean = password.trim();

    // 1. Direct password match from in-memory / Firestore user
    if (currentUser.password && currentUser.password === inputClean) {
      setIsLocked(false);
      sessionStorage.removeItem('digicore_session_locked');
      lastActivityRef.current = Date.now();
      return { success: true };
    }

    // 2. Also check against latest users array in case password was updated
    const liveUser = users.find(u => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (liveUser && liveUser.password === inputClean) {
      setCurrentUser(liveUser);
      setIsLocked(false);
      sessionStorage.removeItem('digicore_session_locked');
      lastActivityRef.current = Date.now();
      return { success: true };
    }

    // 3. Fallback: Try Firebase Auth re-verification
    try {
      await signInWithEmailAndPassword(auth, currentUser.email, inputClean);
      setIsLocked(false);
      sessionStorage.removeItem('digicore_session_locked');
      lastActivityRef.current = Date.now();
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }
  };

  const login = async (
    email: string,
    password: string,
    remember: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    setRememberMe(remember);

    if (remember) {
      localStorage.setItem('digicore_remember_me', 'true');
      localStorage.setItem('digicore_saved_email', cleanEmail);
    } else {
      localStorage.removeItem('digicore_remember_me');
      localStorage.removeItem('digicore_active_user');
    }

    const persistenceType = remember ? browserLocalPersistence : browserSessionPersistence;

    try {
      // 1. Apply persistence mode
      await setPersistence(auth, persistenceType);

      // 2. Try Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      const matchingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (matchingUser) {
        setCurrentUser(matchingUser);
        if (remember) {
          localStorage.setItem('digicore_active_user', JSON.stringify(matchingUser));
        }
        sessionStorage.setItem('digicore_active_user', JSON.stringify(matchingUser));
      } else {
        const newUserObj: User = {
          id: fbUser.uid,
          name: fbUser.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'staff',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setCurrentUser(newUserObj);
        if (remember) {
          localStorage.setItem('digicore_active_user', JSON.stringify(newUserObj));
        }
        sessionStorage.setItem('digicore_active_user', JSON.stringify(newUserObj));
        try {
          await setDoc(doc(db, 'users', fbUser.uid), newUserObj);
        } catch (e) {
          // Ignore
        }
      }
      setIsLocked(false);
      sessionStorage.removeItem('digicore_session_locked');
      lastActivityRef.current = Date.now();
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase signIn attempt note:', err.code, err.message);

      // If user is not yet created in Firebase Auth, attempt auto-registration for valid CRM accounts
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-disabled'
      ) {
        const localMatch = users.find(u => u.email.toLowerCase() === cleanEmail) || initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
        if (localMatch && (localMatch.password === password || cleanEmail === DEFAULT_ADMIN_EMAIL)) {
          try {
            await setPersistence(auth, persistenceType);
            const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            setFirebaseUser(newCred.user);
            setCurrentUser(localMatch);
            if (remember) {
              localStorage.setItem('digicore_active_user', JSON.stringify(localMatch));
            }
            sessionStorage.setItem('digicore_active_user', JSON.stringify(localMatch));
            await setDoc(doc(db, 'users', localMatch.id), localMatch);
            setIsLocked(false);
            sessionStorage.removeItem('digicore_session_locked');
            lastActivityRef.current = Date.now();
            return { success: true };
          } catch (createErr: any) {
            if (localMatch.password === password) {
              setCurrentUser(localMatch);
              if (remember) {
                localStorage.setItem('digicore_active_user', JSON.stringify(localMatch));
              }
              sessionStorage.setItem('digicore_active_user', JSON.stringify(localMatch));
              setIsLocked(false);
              sessionStorage.removeItem('digicore_session_locked');
              lastActivityRef.current = Date.now();
              return { success: true };
            }
          }
        }
      }

      // Check if credentials match in-memory users
      const localUser = users.find(u => u.email.toLowerCase() === cleanEmail) || initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (localUser && localUser.password === password) {
        setCurrentUser(localUser);
        if (remember) {
          localStorage.setItem('digicore_active_user', JSON.stringify(localUser));
        }
        sessionStorage.setItem('digicore_active_user', JSON.stringify(localUser));
        setIsLocked(false);
        sessionStorage.removeItem('digicore_session_locked');
        lastActivityRef.current = Date.now();
        return { success: true };
      }

      let errorMsg = 'Invalid email or password. Please verify your credentials.';
      if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Access temporarily disabled due to many failed attempts. Try again later.';
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('SignOut error:', e);
    }
    setCurrentUser(null);
    setFirebaseUser(null);
    setIsLocked(false);
    sessionStorage.removeItem('digicore_active_user');
    sessionStorage.removeItem('digicore_session_locked');
    localStorage.removeItem('digicore_active_user');
  };

  const resetAdminPasswordWithMasterKey = (masterKey: string, newPassword: string): { success: boolean; error?: string } => {
    if (masterKey !== MASTER_KEY) {
      return { success: false, error: 'Invalid Master Security Key. Authorization failed.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
        const updated = { ...u, password: newPassword };
        setDoc(doc(db, 'users', u.id), updated).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `users/${u.id}`);
        });
        return updated;
      }
      return u;
    });

    setUsers(updatedUsers);

    if (currentUser?.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      const updatedCurr = { ...currentUser, password: newPassword };
      setCurrentUser(updatedCurr);
      sessionStorage.setItem('digicore_active_user', JSON.stringify(updatedCurr));
      if (localStorage.getItem('digicore_remember_me') === 'true') {
        localStorage.setItem('digicore_active_user', JSON.stringify(updatedCurr));
      }
    }

    return { success: true };
  };

  const addUser = async (name: string, email: string, password: string, role: Role): Promise<{ success: boolean; error?: string }> => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Access denied. Only Admins can add staff accounts.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      role,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${newUser.id}`);
    }

    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Access denied. Only Admins can modify accounts.' };
    }

    try {
      await updateDoc(doc(db, 'users', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
    }

    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
            sessionStorage.setItem('digicore_active_user', JSON.stringify(updated));
            if (localStorage.getItem('digicore_remember_me') === 'true') {
              localStorage.setItem('digicore_active_user', JSON.stringify(updated));
            }
          }
          return updated;
        }
        return u;
      })
    );

    return { success: true };
  };

  const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Access denied. Only Admins can remove accounts.' };
    }

    const targetUser = users.find(u => u.id === id);
    if (targetUser?.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, error: 'The primary Admin account cannot be deleted.' };
    }

    if (currentUser?.id === id) {
      return { success: false, error: 'You cannot delete your own active account.' };
    }

    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${id}`);
    }

    setUsers(prev => prev.filter(u => u.id !== id));
    return { success: true };
  };

  const adminResetPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Access denied. Only Admins can reset user passwords.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      await updateDoc(doc(db, 'users', userId), { password: newPassword });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }

    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, password: newPassword } : u))
    );

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAuthenticated: !!currentUser,
        isAuthLoading,
        isLocked,
        rememberMe,
        users,
        login,
        logout,
        lockSession,
        unlockSession,
        resetAdminPasswordWithMasterKey,
        addUser,
        updateUser,
        deleteUser,
        adminResetPassword,
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
