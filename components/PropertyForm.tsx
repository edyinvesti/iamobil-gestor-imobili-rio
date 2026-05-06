import React, { useState } from 'react';
import { Property, PropertyType, OfferType, PropertyStatus, AreaUnit } from '../types';
import { X, Save, Camera, MapPin, Ruler, Bed, Bath, Car, Trash2, CheckCircle2, Sparkles, Loader2, Tag, DollarSign, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageStream } from '../services/gemini';

interface PropertyFormProps {
    onSave: (property: Property) => void;
    onCancel: () => void;
    initialData?: Property;
}

const AMENITIES_OPTIONS = [
    'Piscina', 'Churrasqueira', 'Academia', 'Portaria 24h', 
    'Salão de Festas', 'Ar Condicionado', 'Mobiliado', 'Varanda Gourmet',
    'Elevador', 'Jardim', 'Pet Friendly', 'Sistema de Alarme'
];

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        type: initialData?.type || 'Apartamento' as PropertyType,
        offerType: initialData?.offerType || 'Venda' as OfferType,
        price: initialData?.price || 0,
        status: initialData?.status || 'Disponível' as PropertyStatus,
        address: initialData?.address || '',
        size: initialData?.size || 0,
        sizeUnit: initialData?.sizeUnit || 'm²' as AreaUnit,
        bedrooms: initialData?.bedrooms || 0,
        suites: initialData?.suites || 0,
        livingRooms: initialData?.livingRooms || 0,
        kitchens: initialData?.kitchens || 0,
        bathrooms: initialData?.bathrooms || 0,
        parkingSpaces: initialData?.parkingSpaces || 0,
        description: initialData?.description || '',
        amenities: initialData?.amenities || [] as string[],
    });
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);

    const generateAiDescription = async () => {
        if (!formData.title || !formData.type) {
            alert("Por favor, preencha ao menos o título e o tipo do imóvel.");
            return;
        }

        setIsGeneratingAi(true);
        try {
            const prompt = `Gere uma descrição de alto luxo, persuasiva e profissional para um imóvel:
            Título: ${formData.title}
            Tipo: ${formData.type}
            Área: ${formData.size}m²
            Quartos: ${formData.bedrooms} (Suítes: ${formData.suites})
            Valor: R$ ${formData.price}
            Vagas: ${formData.parkingSpaces}
            Endereço: ${formData.address}
            Seja elegante e use o tom da IAmobil. Máximo 4 parágrafos.`;

            const result = await sendMessageStream(prompt, []);
            let fullText = "";
            for await (const chunk of result) {
                fullText += chunk.text;
                setFormData(prev => ({ ...prev, description: fullText }));
            }
        } catch (err) {
            console.error("Erro ao gerar:", err);
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImages(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            images,
            createdAt: initialData?.createdAt || Date.now(),
        } as Property);
    };

    return (
        <form onSubmit={handleSubmit} className="glass rounded-[3rem] p-8 lg:p-12 max-w-4xl mx-auto space-y-12 border-white/5 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 left-0 w-full h-1 premium-gradient" />
            
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-white">
                        {initialData ? 'Editar Registro' : 'Novo Ativo'}
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-2">Dados certificados para a rede IAmobil.</p>
                </div>
                <button type="button" onClick={onCancel} className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <X size={20} />
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Imagens */}
                <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                       <Camera size={12} /> Galeria de Mídia
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                                <button 
                                    type="button"
                                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                    className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                        {images.length < 10 && (
                            <label className="aspect-video rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 hover:border-orange-500/30 transition-all text-gray-600 hover:text-orange-500">
                                <Camera size={24} />
                                <span className="text-[10px] font-black uppercase">Adicionar</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Informações Gerais</label>
                        <input
                            required
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white focus:ring-1 focus:ring-orange-500 outline-none font-medium placeholder:text-gray-700"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Título do Anúncio"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 text-white outline-none font-bold appearance-none cursor-pointer"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as PropertyType })}
                            >
                                <option className="bg-black" value="Apartamento">Apartamento</option>
                                <option className="bg-black" value="Casa">Casa</option>
                                <option className="bg-black" value="Terreno">Terreno</option>
                                <option className="bg-black" value="Comercial">Comercial</option>
                                <option className="bg-black" value="Rural">Rural</option>
                            </select>
                            <select
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-4 text-white outline-none font-bold appearance-none cursor-pointer text-orange-500"
                                value={formData.offerType}
                                onChange={e => setFormData({ ...formData, offerType: e.target.value as OfferType })}
                            >
                                <option className="bg-black" value="Venda">Venda</option>
                                <option className="bg-black" value="Aluguel">Aluguel</option>
                            </select>
                        </div>
                        <div className="relative">
                           <DollarSign size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" />
                           <input
                            required
                            type="number"
                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white focus:ring-1 focus:ring-orange-500 outline-none font-black text-xl"
                            value={formData.price || ''}
                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                            placeholder="Valor"
                           />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Localização Premium
                 </label>
                 <input
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-full px-8 py-5 text-white focus:ring-1 focus:ring-orange-500 outline-none font-medium placeholder:text-gray-700"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Endereço, Bairro, Cidade..."
                 />
            </div>

            <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                   {[
                     { label: 'Área (m²)', icon: Square, key: 'size' },
                     { label: 'Quartos', icon: Bed, key: 'bedrooms' },
                     { label: 'Suítes', icon: CheckCircle2, key: 'suites' },
                     { label: 'Vagas', icon: Car, key: 'parkingSpaces' }
                   ].map(item => (
                     <div key={item.key} className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-500">
                           <item.icon size={14} />
                           <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                        </div>
                        <input
                           type="number"
                           className="w-full bg-transparent border-b border-white/10 py-2 text-2xl font-bold outline-none focus:border-orange-500 transition-colors"
                           value={(formData as any)[item.key] || ''}
                           onChange={e => setFormData({ ...formData, [item.key]: Number(e.target.value) })}
                        />
                     </div>
                   ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Descrição do Ativo</label>
                   <button 
                    type="button"
                    onClick={generateAiDescription}
                    disabled={isGeneratingAi}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
                   >
                     {isGeneratingAi ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                     Redigir com IA
                   </button>
                </div>
                <textarea
                    className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-8 text-white focus:ring-1 focus:ring-orange-500 outline-none font-medium text-sm leading-relaxed min-h-[150px] placeholder:text-gray-700"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Destaque as características exclusivas..."
                />
            </div>

            <div className="pt-8 flex flex-col md:flex-row gap-4">
                <button
                    type="submit"
                    className="flex-1 premium-gradient py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-orange-500/20 active:scale-[0.98] transition-all"
                >
                    Finalizar e Sincronizar
                </button>
            </div>
        </form>
    );
};
