import React from 'react';
import { Bed, Square, Sofa, Utensils, Bath, MapPin, ChevronRight, Trash2, Pencil, Heart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  onDelete: (id: string) => void;
  onEdit: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, onDelete, onEdit }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      className="glass rounded-[3rem] overflow-hidden transition-all group flex flex-col h-full border-white/5 hover:border-orange-500/30"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] overflow-hidden m-4 rounded-[2.5rem]">
        {property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-white/20 gap-2">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
               <MapPin size={24} />
            </div>
          </div>
        )}
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
                <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-white shadow-xl border border-white/10">
                    {property.offerType}
                </div>
                
                {property.remoteId && (
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-xl border ${
                        property.remoteStatus === 'approved' ? 'bg-emerald-500 border-emerald-400 text-white' :
                        property.remoteStatus === 'rejected' ? 'bg-rose-500 border-rose-400 text-white' :
                        'bg-amber-500 border-amber-400 text-white animate-pulse'
                    }`}>
                        <div className="w-1 h-1 rounded-full bg-white animate-ping" />
                        {property.remoteStatus === 'approved' ? 'No Ar' : 'Análise IA'}
                    </div>
                )}
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-orange-500 transition-all border border-white/10"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(property.id); }}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-white/10"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
      </div>

      <div className="px-8 pb-10 pt-2 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-3">
           <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{property.type}</span>
           <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">ID: {property.id.slice(0,4)}</span>
        </div>
        
        <h3 className="text-2xl font-serif font-bold text-white mb-2 line-clamp-1">{property.title}</h3>
        <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-6">
          <MapPin size={12} className="text-orange-500/50" />
          <span className="truncate">{property.address}</span>
        </p>

        <div className="grid grid-cols-4 gap-2 mb-8 bg-white/5 p-4 rounded-3xl border border-white/5">
           {[
             { label: 'm²', val: property.size },
             { label: 'Dorm', val: property.bedrooms },
             { label: 'Suíte', val: property.suites },
             { label: 'Vagas', val: property.parkingSpaces }
           ].map((item, id) => (
             <div key={id} className="flex flex-col items-center">
                <span className="text-[8px] uppercase font-black text-white/20 tracking-widest leading-none mb-1">{item.label}</span>
                <span className="text-sm font-bold text-white">{item.val}</span>
             </div>
           ))}
        </div>

        <div className="mt-auto flex items-end justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-tighter mb-1">Valor do Ativo</span>
              <span className="text-2xl font-black text-white leading-none tracking-tighter">{formatPrice(property.price)}</span>
           </div>
           <button className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all">
              <ChevronRight size={24} />
           </button>
        </div>
      </div>
    </motion.div>
  );
};
