import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

interface UserContextType {
  profile: UserProfile;
  updateProfile: (newProfile: UserProfile) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Edy Investi',
    creci: '987456-F',
    photo: '',
    email: 'contato@iamobil.com.br',
    phone: '(11) 99999-9999'
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('iamobil_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      }
    }
  }, []);

  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('iamobil_profile', JSON.stringify(newProfile));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('iamobil_profile');
    localStorage.removeItem('iamobil_properties'); // Opcional: limpa cache de imóveis também
    setProfile({
      name: 'Edy Investi',
      creci: '987456-F',
      photo: '',
      email: 'contato@iamobil.com.br',
      phone: '(11) 99999-9999'
    });
  }, []);

  return (
    <UserContext.Provider value={{ profile, updateProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
