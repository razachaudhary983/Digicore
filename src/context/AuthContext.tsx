import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  resetAdminPasswordWithMasterKey: (masterKey: string, newPassword: string) => { success: boolean; error?: string };
  addUser: (name: string, email: string, password: string, role: Role) => { success: boolean; error?: string };
  updateUser: (id: string, updates: Partial<User>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
  adminResetPassword: (userId: string, newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_KEY = 'aliraza983';
const DEFAULT_ADMIN_EMAIL = 'digicorepak@gmail.com';

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
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('digicore_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure default admin exists
        if (!parsed.some((u: User) => u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase())) {
          return [...initialUsers, ...parsed];
        }
        return parsed;
      } catch (e) {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('digicore_active_user');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('digicore_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('digicore_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('digicore_active_user');
    }
  }, [currentUser]);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'User account not found for this email address.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid password. Please verify your credentials.' };
    }

    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const resetAdminPasswordWithMasterKey = (masterKey: string, newPassword: string): { success: boolean; error?: string } => {
    if (masterKey !== MASTER_KEY) {
      return { success: false, error: 'Invalid Master Security Key. Authorization failed.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    setUsers(prev =>
      prev.map(u => {
        if (u.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
          return { ...u, password: newPassword };
        }
        return u;
      })
    );

    // If currently logged in as admin, update session
    if (currentUser?.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
    }

    return { success: true };
  };

  const addUser = (name: string, email: string, password: string, role: Role): { success: boolean; error?: string } => {
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

    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const updateUser = (id: string, updates: Partial<User>): { success: boolean; error?: string } => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Access denied. Only Admins can modify accounts.' };
    }

    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    return { success: true };
  };

  const deleteUser = (id: string): { success: boolean; error?: string } => {
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

    setUsers(prev => prev.filter(u => u.id !== id));
    return { success: true };
  };

  const adminResetPassword = (userId: string, newPassword: string): { success: boolean; error?: string } => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Access denied. Only Admins can reset user passwords.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
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
        isAuthenticated: !!currentUser,
        users,
        login,
        logout,
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
