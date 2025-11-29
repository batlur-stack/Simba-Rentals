import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User, UserRole } from '../types';
import { MockDB } from '../services/mockDatabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('simba_active_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = async (email: string, role: UserRole) => {
    const foundUser = MockDB.findUserByEmail(email);
    if (foundUser) {
      if (foundUser.status === 'REJECTED') {
        return "Account suspended or rejected. Contact Admin.";
      }
      // In a real app, check password hash here
      setUser(foundUser);
      localStorage.setItem('simba_active_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: Partial<User>) => {
    const exists = MockDB.findUserByEmail(userData.email || '');
    if (exists) return false;

    // Logic for status is handled in MockDB.addUser based on role
    // However, for type safety, we create the user object here fully if needed, 
    // but MockDB.addUser modifies it.
    const newUser: User = {
      id: `user-${Date.now()}`,
      joinedDate: new Date().toISOString(),
      name: userData.name!,
      email: userData.email!,
      role: userData.role!,
      phone: userData.phone,
      status: 'PENDING' // Default, will be overridden by MockDB for Tenants/Admins
    };
    
    MockDB.addUser(newUser);
    return true; 
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('simba_active_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};