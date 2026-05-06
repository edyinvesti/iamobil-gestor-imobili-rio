import React from 'react';
import { Plus, Search, Home as HomeIcon, LayoutGrid, Filter, TrendingUp, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';

interface DashboardProps {
  properties: Property[];
  onAddClick: () => void;
  onPropertyClick: (property: Property) => void;
  onDelete: (id: string) => void;
  onEdit: (property: Property) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  properties, 
  onAddClick, 
  onPropertyClick,
  onDelete,
  onEdit
}) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalValue = properties.reduce((acc, p) => acc + p.price, 0);
  const syncedCount = properties.filter(p => p.remoteStatus === 'approved').length;
  const pendingCount = properties.filter(p => p.remoteStatus === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center gap-2">
                <Zap size={12} className="text-orange-500" />
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Corretor Parceiro</span>
             </div>
             <div className="h-[1px] w-12 bg-white/10" />
             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[10px] font-black uppercase text-white/60 tracking-tight">Status ao vivo</span>
             </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl lg:text-8xl font-serif font-bold text-white leading-none tracking-tighter">
              Sua <span className="text-gradient italic font-normal">Carteira</span>
            </h1>
            <p className="text-gray-500 text-lg lg:text-xl max-w-xl font-medium leading-relaxed mt-4">
              Gerencie seus ativos imobiliários sincronizados em tempo real com a <span className="text-orange-500 font-bold">IA inteligênciamobil</span>.
            </p>
          </div>
        </div>

        <button
          onClick={onAddClick}
          className="group relative flex items-center justify-center gap-4 px-12 py-6 bg-white text-black rounded-3xl font-black shadow-2xl hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-widest w-full lg:w-auto"
        >
          <Plus size={18} /> Adicionar Imóvel
          <div className="absolute inset-0 rounded-3xl group-hover:blur-xl group-hover:bg-orange-500/30 transition-all -z-10" />
        </button>
      </header>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          { label: 'Total em Carteira', value: formatCurrency(totalValue), icon: TrendingUp, color: 'text-white' },
          { label: 'Ativos Sincronizados', value: `${syncedCount}/${properties.length}`, sub: 'IA Conectada', icon: ShieldCheck, color: 'text-emerald-500' },
          { label: 'Em Análise IA', value: pendingCount, icon: Zap, color: 'text-amber-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-10 rounded-[2.5rem] flex flex-col justify-between group hover:border-white/10 transition-colors"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em]">{stat.label}</span>
              <stat.icon size={18} className="text-white/20 group-hover:text-orange-500 transition-colors" />
            </div>
            <div className={`text-4xl font-bold tracking-tighter ${stat.color}`}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-16">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-orange-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Pesquisar locais..."
            className="w-full pl-16 pr-6 py-6 rounded-[2rem] border border-white/5 bg-white/5 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 outline-none transition-all font-medium text-white placeholder:text-gray-600"
          />
        </div>
        <div className="flex gap-4">
          <button className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <Filter size={20} />
          </button>
          <button className="p-6 bg-orange-500 text-white rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-[4rem] p-32 flex flex-col items-center justify-center text-center space-y-8 border-dashed border-white/5"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-orange-500 ring-1 ring-white/10">
            <HomeIcon size={40} />
          </div>
          <div className="max-w-sm space-y-3">
            <h3 className="text-3xl font-serif font-bold text-white">Carteira Vazia</h3>
            <p className="text-gray-500 font-medium">Cadastre seu primeiro imóvel para iniciar o processamento de inteligência imobiliária.</p>
          </div>
          <button
            onClick={onAddClick}
            className="px-12 py-5 bg-white text-black rounded-2xl font-black hover:bg-orange-500 hover:text-white transition-all text-xs uppercase tracking-widest"
          >
            Começar Agora
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => onPropertyClick(property)}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
