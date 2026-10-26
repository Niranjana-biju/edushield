import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/insurance';
import { SEED_USERS } from '../services/mockSeedData';
import { auth, isLiveFirebaseConfigured } from '../config/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUserRole: (role: UserRole) => void;
  setUser: (user: UserProfile) => void;
  login: (email: string, role?: UserRole) => Promise<void>;
  register: (name: string, email: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLiveFirebase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Parent Rajesh Sharma
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('edushield_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return SEED_USERS[0];
  });

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(SEED_USERS);

  useEffect(() => {
    localStorage.setItem('edushield_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (isLiveFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          // Sync with profile
          const matched = availableUsers.find(u => u.email === fbUser.email);
          if (matched) {
            setCurrentUser(matched);
          } else {
            const newUser: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email || 'user@example.com',
              displayName: fbUser.displayName || 'EduShield User',
              role: 'parent',
              kycStatus: 'unverified',
              createdAt: new Date().toISOString(),
            };
            setCurrentUser(newUser);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [availableUsers]);

  const switchUserRole = (targetRole: UserRole) => {
    const found = availableUsers.find(u => u.role === targetRole);
    if (found) {
      setCurrentUser(found);
    } else {
      const fallbackUser: UserProfile = {
        id: `user_${targetRole}_demo`,
        email: `${targetRole}@edushield.demo`,
        displayName: `Demo ${targetRole.replace('_', ' ').toUpperCase()}`,
        role: targetRole,
        kycStatus: 'verified',
        createdAt: new Date().toISOString(),
      };
      setAvailableUsers(prev => [...prev, fallbackUser]);
      setCurrentUser(fallbackUser);
    }
  };

  const login = async (email: string, role?: UserRole) => {
    const matched = availableUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      return;
    }
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      role: role || 'parent',
      kycStatus: 'pending',
      createdAt: new Date().toISOString(),
    };
    setAvailableUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
  };

  const register = async (name: string, email: string, role: UserRole) => {
    // Normal registration defaults to parent or student. Administrative/officer roles require admin delegation.
    const sanitizedRole: UserRole = ['claims_officer', 'admin'].includes(role) ? 'parent' : role;
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      email,
      displayName: name,
      role: sanitizedRole,
      kycStatus: 'unverified',
      createdAt: new Date().toISOString(),
    };
    setAvailableUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
  };

  const logout = async () => {
    if (isLiveFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    // Switch to default parent demo persona
    setCurrentUser(SEED_USERS[0]);
  };

  const resetPassword = async (email: string) => {
    console.log(`Password reset instructions simulated for ${email}`);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        switchUserRole,
        setUser: setCurrentUser,
        login,
        register,
        logout,
        resetPassword,
        isLiveFirebase: isLiveFirebaseConfigured,
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
