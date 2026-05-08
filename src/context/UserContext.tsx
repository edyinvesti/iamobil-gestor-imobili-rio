import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';

interface UserContextType {
  profile: UserProfile;
  updateProfile: (newProfile: UserProfile) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'https://iamobil-cloud-1.onrender.com';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    creci: '',
    photo: '',
    email: '',
    phone: ''
  });

  // Carregar do LocalStorage inicialmente
  useEffect(() => {
    const savedProfile = localStorage.getItem('iamobil_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Erro ao carregar perfil local:", e);
      }
    }
  }, []);

  // Sincronizar com a Nuvem se houver um CRECI mas o perfil estiver incompleto
  useEffect(() => {
    const fetchCloudProfile = async () => {
      if (!profile.creci || (profile.name && profile.phone)) return;

      try {
        console.log(`[UserContext] Buscando perfil na nuvem para CRECI: ${profile.creci}`);
        const response = await fetch(`${API_URL}/api/partner/register?creci=${encodeURIComponent(profile.creci)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.broker) {
            console.log("[UserContext] Perfil encontrado na nuvem:", data.broker);
            const cloudProfile = {
              creci: data.broker.creci,
              name: data.broker.name || '',
              email: data.broker.email || '',
              phone: data.broker.phone || '',
              photo: data.broker.photo || ''
            };
            setProfile(cloudProfile);
            localStorage.setItem('iamobil_profile', JSON.stringify(cloudProfile));
          }
        }
      } catch (error) {
        console.error("[UserContext] Erro ao sincronizar perfil com nuvem:", error);
      }
    };

    fetchCloudProfile();
  }, [profile.creci, profile.name, profile.phone]);

  const syncToCloud = async (userData: UserProfile) => {
    if (!userData.creci || !userData.name) return;
    
    try {
      await fetch(`${API_URL}/api/partner/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      console.log("[UserContext] Perfil sincronizado com a nuvem.");
    } catch (error) {
      console.error("[UserContext] Falha ao enviar perfil para nuvem:", error);
    }
  };

  const updateProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('iamobil_profile', JSON.stringify(newProfile));
    syncToCloud(newProfile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('iamobil_profile');
    localStorage.removeItem('iamobil_properties');
    setProfile({
      name: '',
      creci: '',
      photo: '',
      email: '',
      phone: ''
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
