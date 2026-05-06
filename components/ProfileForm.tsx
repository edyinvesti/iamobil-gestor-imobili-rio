import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, CreditCard, Camera, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileFormProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, photo: event.target?.result as string }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white p-6 md:p-10 rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl max-w-xl mx-auto border-0 md:border md:border-gray-100 min-h-screen md:min-h-0"
    >
      <div className="flex justify-between items-center mb-10 border-b border-gray-50 pb-8 mt-12 md:mt-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">Meu Perfil</h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">Suas informações profissionais no IAmobil.</p>
        </div>
        <button onClick={onCancel} className="p-4 hover:bg-gray-100 rounded-full transition-all md:block hidden">
          <X size={28} className="text-gray-300" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-orange-50 border-4 border-white shadow-xl flex items-center justify-center">
              {formData.photo ? (
                <img src={formData.photo} alt={formData.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={64} className="text-orange-200" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-3 bg-orange-500 text-white rounded-full shadow-lg cursor-pointer hover:bg-orange-600 transition-colors">
              <Camera size={20} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Foto de Perfil</p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              placeholder="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              required
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-gray-600"
            />
          </div>

          <div className="relative">
            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              placeholder="Registro Profissional (CRECI)"
              value={formData.creci}
              onChange={(e) => setFormData(p => ({ ...p, creci: e.target.value }))}
              required
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-gray-600"
            />
          </div>

          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold tracking-widest text-[10px]">ID Telegram</div>
            <input
              type="text"
              placeholder="Opcional (para avisos no celular)"
              value={formData.telegramId || ''}
              onChange={(e) => setFormData(p => ({ ...p, telegramId: e.target.value }))}
              className="w-full pl-28 pr-6 py-5 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-gray-600"
            />
          </div>
        </div>

        <div className="pt-6 flex gap-4">
           <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-5 border border-gray-100 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all md:hidden"
          >
            Voltar
          </button>
          <button
            type="submit"
            className="flex-1 py-5 bg-orange-500 text-white rounded-2xl font-black shadow-xl shadow-orange-200 hover:bg-orange-600 hover:-translate-y-1 active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Check size={18} /> Salvar Perfil
          </button>
        </div>
      </form>
    </motion.div>
  );
};
