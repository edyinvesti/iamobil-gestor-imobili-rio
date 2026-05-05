import { SplashScreen } from "./components/SplashScreen";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from "react";
import { Dashboard } from "./components/Dashboard";
import { PropertyForm } from "./components/PropertyForm";
import { PropertyDetails } from "./components/PropertyDetails";
import { Sidebar } from "./components/Sidebar";
import { BottomBar } from "./components/BottomBar";
import { BusinessCard } from "./components/BusinessCard";
import { Property, UserProfile } from "./types";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileForm } from "./components/ProfileForm";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { User, Bell, Search } from "lucide-react";

export default function App() {
  const [showSplash, setShowSplash] = React.useState(true);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [view, setView] = useState<'dashboard' | 'form' | 'details' | 'profile' | 'business-card' | 'search'>('dashboard');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Edy Investi',
    creci: '987456-F',
    photo: ''
  });

  // STRESS TEST HOOK (Ctrl+Shift+L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
        const stressProps: Property[] = [];
        stressProps.push({
          id: crypto.randomUUID(),
          title: "BIG TITLE TEST QUEBRA LAYOUT O MAIOR TÃ TULO DO MUNDO COM EMOJIS GIGANTES E TEXTO LONGO PRA VER SE ENCAIXA BEM NO COMPONENTE ðŸš€ ðŸ ¢ðŸ”¥",
          type: "Apartamento",
          offerType: "Venda",
          price: 999999999999.99,
          size: 10000,
          bedrooms: 50,
          suites: 50,
          livingRooms: 10,
          kitchens: 5,
          parkingSpaces: 100,
          address: "Rua do Estresse, 999 - Bairro QA",
          description: "Teste de estresse com texto muito longo ðŸ ¢ðŸ ¡ðŸ ¢ðŸ”¥ðŸ”¥ðŸ”¥\n\n ".repeat(5),
          images: [],
          amenities: ["Piscina de Ouro", "Heliponto Triplo", "Cinema 4D"],
          createdAt: new Date().toISOString(),
          status: "disponivel",
          remoteStatus: "pending"
        });
        for (let i = 0; i < 110; i++) {
          stressProps.push({
            id: crypto.randomUUID(),
            title: `ImÃ³vel Carga #${i}`,
            type: i % 2 === 0 ? "Casa" : "Apartamento",
            offerType: i % 3 === 0 ? "Aluguel" : "Venda",
            price: 500000 + (Math.random() * 500000),
            size: 50 + i,
            bedrooms: 2,
            suites: 1,
            livingRooms: 1,
            kitchens: 1,
            parkingSpaces: 1,
            address: `Rua Carga Pesada ${i}00`,
            description: "DescriÃ§Ã£o gerada para o teste de carga...",
            images: [],
            amenities: ["Piscina", "Churrasqueira"],
            createdAt: new Date().toISOString(),
            status: "disponivel",
            remoteStatus: i % 4 === 0 ? "approved" : "pending"
          });
        }
        localStorage.setItem('iamobil_properties', JSON.stringify(stressProps));
        window.location.reload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load from localStorage

  useEffect(() => {
    const savedProperties = localStorage.getItem('iamobil_properties');
    if (savedProperties) {
      try {
        setProperties(JSON.parse(savedProperties));
      } catch (e) {
        console.error("Erro ao carregar os dados:", e);
      }
    }

    const savedProfile = localStorage.getItem('iamobil_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      }
    }
  }, []);

  // Listen for custom navigation events
  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail) setView(e.detail);
    };
    window.addEventListener('change-view', handleViewChange);
    return () => window.removeEventListener('change-view', handleViewChange);
  }, []);

  // Save properties to localStorage
  const saveProperties = (newProperties: Property[]) => {
    setProperties(newProperties);
    localStorage.setItem('iamobil_properties', JSON.stringify(newProperties));
  };

  // Save profile to localStorage
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('iamobil_profile', JSON.stringify(newProfile));
    setView('dashboard');
  };

  const handleSaveProperty = async (property: Property) => {
    const exists = properties.find(p => p.id === property.id);
    let updated;
    if (exists) {
      updated = properties.map(p => p.id === property.id ? property : p);
    } else {
      const newProp = { ...property, remoteStatus: 'unknown' as const };
      updated = [newProp, ...properties];
    }
    
    saveProperties(updated);
    
    const API_BASE = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_BASE}/api/partner/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...property,
          brokerName: profile.name,
          brokerCreci: profile.creci
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const finalUpdated = updated.map(p => 
          p.id === property.id ? { ...p, remoteId: data.propertyId, remoteStatus: 'pending' as const } : p
        );
        saveProperties(finalUpdated);
      }
    } catch (e: any) {
      console.error("Erro na integraÃ§Ã£o:", e);
    }
    
    setView('dashboard');
  };

  // Polling for statuses
  useEffect(() => {
    const checkStatuses = async () => {
      const pendingIds = properties
        .filter(p => p.remoteId && p.remoteStatus !== 'approved' && p.remoteStatus !== 'rejected')
        .map(p => p.remoteId);

      if (pendingIds.length === 0) return;

      const API_BASE = import.meta.env.VITE_API_URL || '';
      try {
        const res = await fetch(`${API_BASE}/api/partner/properties/status?ids=${pendingIds.join(',')}`);
        if (res.ok) {
          const { statuses } = await res.json();
          let changed = false;
          const updatedProps = properties.map(p => {
            if (p.remoteId && statuses[p.remoteId] && statuses[p.remoteId] !== p.remoteStatus) {
              changed = true;
              return { ...p, remoteStatus: statuses[p.remoteId] };
            }
            return p;
          });
          if (changed) saveProperties(updatedProps);
        }
      } catch (err) { /* silent */ }
    };

    const interval = setInterval(checkStatuses, 10000);
    return () => clearInterval(interval);
  }, [properties]);

  if (showSplash) return <SplashScreen onEnter={() => setShowSplash(false)} />;

  return (
    <div className="min-h-screen bg-[#030303] flex text-white font-sans selection:bg-orange-500 selection:text-white">
      <Sidebar currentView={view} onViewChange={setView} profile={profile} />
      
      <div className="flex-1 flex flex-col min-h-screen relative">
        {/* Top Header for Mobile & Desktop context */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 bg-black/20 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold">IA</div>
            <span className="font-serif font-bold text-lg">IAmobil</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             Sistema Operacional
          </div>

          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#030303]" />
             </button>
             <div className="w-[1px] h-4 bg-white/10" />
             <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] font-black text-gray-500 uppercase tracking-tighter leading-none mb-1">Status ao vivo</p>
                   <p className="text-xs font-bold text-white leading-none">Corretor Parceiro</p>
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 pb-32 lg:pb-12">
          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Dashboard 
                   properties={properties} 
                   onAddClick={() => { setSelectedProperty(null); setView('form'); }}
                   onPropertyClick={(p) => { setSelectedProperty(p); setView('details'); }}
                   onDelete={setPropertyToDelete}
                   onEdit={(p) => { setSelectedProperty(p); setView('form'); }}
                />
              </motion.div>
            )}

            {view === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="p-6 lg:p-12">
                <PropertyForm 
                   onSave={handleSaveProperty}
                   onCancel={() => setView('dashboard')}
                   initialData={selectedProperty || undefined}
                />
              </motion.div>
            )}

            {view === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 lg:p-12">
                <ProfileForm profile={profile} onSave={saveProfile} onCancel={() => setView('dashboard')} />
              </motion.div>
            )}

            {view === 'business-card' && (
              <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-0">
                 <BusinessCard profile={profile} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {view === 'details' && selectedProperty && (
            <PropertyDetails 
               property={selectedProperty}
               profile={profile}
               onClose={() => setView('dashboard')}
            />
          )}
        </AnimatePresence>

        <BottomBar currentView={view} onViewChange={setView} />
      </div>

      <ConfirmationModal
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={() => {
          if (propertyToDelete) {
            saveProperties(properties.filter(p => p.id !== propertyToDelete));
            setPropertyToDelete(null);
          }
        }}
        title="Excluir ImÃ³vel"
        message="Tem certeza que deseja remover este imÃ³vel da sua carteira?"
      />
    </div>
  );
}
