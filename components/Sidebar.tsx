import React from 'react';
import { Home, PlusSquare, User, CreditCard, Layout, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  profile: { name: string; creci: string; photo?: string };
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, profile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Carteira', icon: Home },
    { id: 'form', label: 'Novo Imóvel', icon: PlusSquare },
    { id: 'business-card', label: 'Cartão Digital', icon: CreditCard },
    { id: 'profile', label: 'Configurações', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 z-50">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/20">
          IA
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-serif font-bold text-white tracking-tight">IAmobil</span>
          <span className="text-[9px] font-black uppercase text-orange-500 tracking-[0.3em] leading-none">Gestor Premium</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
              currentView === item.id 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={currentView === item.id ? 'text-white' : 'group-hover:text-orange-500 transition-colors'} />
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            {currentView === item.id && <motion.div layoutId="active-indicator"><ChevronRight size={16} /></motion.div>}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center overflow-hidden">
              {profile.photo ? (
                <img src={profile.photo} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-orange-500 font-black text-xs">{profile.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-white truncate">{profile.name || 'Edy Investi'}</span>
              <span className="text-[10px] text-gray-500 font-medium">{profile.creci || '987456-F'}</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest">
            <LogOut size={14} /> Sair da Conta
          </button>
        </div>
      </div>
    </aside>
  );
};
