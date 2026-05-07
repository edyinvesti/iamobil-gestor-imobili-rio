import React, { useState } from 'react';
import { Property, PropertyType, OfferType, PropertyStatus, AreaUnit } from '../types';
import { X, Camera, MapPin, Bed, Trash2, CheckCircle2, DollarSign, Square, Target } from 'lucide-react';

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
    const [isSaving, setIsSaving] = useState(false);
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
        setIsSaving(true);
        // Delay slight to let the UI show "Salvando" before navigation
        setTimeout(() => {
            onSave({
                ...formData,
                id: initialData?.id || crypto.randomUUID(),
                images,
                createdAt: initialData?.createdAt || Date.now(),
            } as Property);
        }, 100);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                        {initialData ? 'Editar Imóvel' : 'Novo Imóvel'}
                    </h2>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                        <Target size={10} /> Certificação IAmobil Gestor Premium
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/5"
                >
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Grid Superior: Fotos e Dados Principais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Fotos */}
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6 h-full">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2">
                            <Camera size={12} className="text-orange-500" /> Galeria de Fotos ({images.length})
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                    <button
                                        type="button"
                                        onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-video rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-white/5 hover:border-orange-500/30 transition-all text-gray-700 hover:text-orange-500 bg-black/20">
                                <Camera size={18} />
                                <span className="text-[8px] font-black uppercase">Adicionar</span>
                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center mt-4">
                            Dica: Use fotos horizontais para melhor visualização
                        </p>
                    </div>

                    {/* Dados Principais */}
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-6">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Dados do Ativo</p>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Título do Anúncio</label>
                            <input
                                required
                                className="w-full bg-black/40 border border-emerald-500/10 rounded-2xl px-5 py-4 text-white text-base font-bold outline-none focus:ring-1 focus:ring-orange-500 focus:bg-black/60 transition-all placeholder:text-gray-800"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Apartamento frente mar na Riviera"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Tipo</label>
                                <select
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 text-white text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-black/60"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as PropertyType })}
                                >
                                    <option className="bg-black" value="Apartamento">Apartamento</option>
                                    <option className="bg-black" value="Casa">Casa</option>
                                    <option className="bg-black" value="Terreno">Terreno</option>
                                    <option className="bg-black" value="Comercial">Comercial</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Operação</label>
                                <select
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-4 text-orange-500 text-sm font-bold outline-none appearance-none cursor-pointer hover:bg-black/60"
                                    value={formData.offerType}
                                    onChange={e => setFormData({ ...formData, offerType: e.target.value as OfferType })}
                                >
                                    <option className="bg-black text-white" value="Venda">Venda</option>
                                    <option className="bg-black text-white" value="Aluguel">Aluguel</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Valor do Ativo</label>
                            <div className="relative">
                                <DollarSign size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                                <input
                                    required
                                    type="number"
                                    className="w-full bg-black/60 border border-orange-500/10 rounded-2xl pl-14 pr-5 py-5 text-white text-2xl font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                                    value={formData.price || ''}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Inferior: Endereço e Detalhes Técnicos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Localização e Descrição */}
                    <div className="space-y-8">
                        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-5">
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Localização</p>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Endereço</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" />
                                    <input
                                        required
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold outline-none focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-gray-800"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Endereço completo"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Descrição Certificada</label>
                            <textarea
                                className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white text-sm font-bold outline-none focus:ring-1 focus:ring-orange-500 transition-all min-h-[140px] placeholder:text-gray-800 resize-none leading-relaxed"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva os detalhes e diferenciais deste ativo..."
                            />
                        </div>
                    </div>

                    {/* Especificações Técnicas */}
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 space-y-8">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Especificações Técnicas</p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1 flex items-center gap-1"><Square size={10} /> Área m²</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-5 text-white text-xl font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all text-center"
                                    value={formData.size || ''}
                                    onChange={e => setFormData({ ...formData, size: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1 flex items-center gap-1"><Bed size={10} /> Quartos</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-5 text-white text-xl font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all text-center"
                                    value={formData.bedrooms || ''}
                                    onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest pl-1">Suítes</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-3 text-white text-sm font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all text-center"
                                    value={formData.suites || ''}
                                    onChange={e => setFormData({ ...formData, suites: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest pl-1">Banheiros</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-3 text-white text-sm font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all text-center"
                                    value={formData.bathrooms || ''}
                                    onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest pl-1">Salas</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-3 text-white text-sm font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all text-center"
                                    value={formData.livingRooms || ''}
                                    onChange={e => setFormData({ ...formData, livingRooms: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest pl-1">Cozinhas</label>
                                <input
                                    type="number"
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-3 text-white text-sm font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all text-center"
                                    value={formData.kitchens || ''}
                                    onChange={e => setFormData({ ...formData, kitchens: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Vagas de Garagem</label>
                            <input
                                type="number"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-5 text-white text-xl font-black outline-none focus:ring-1 focus:ring-orange-500 transition-all"
                                value={formData.parkingSpaces || ''}
                                onChange={e => setFormData({ ...formData, parkingSpaces: Number(e.target.value) })}
                                placeholder="Quantidade de vagas"
                            />
                        </div>
                    </div>
                </div>

                {/* Botão de Salvar - Agora centralizado e proeminente */}
                <div className="pt-8 flex justify-center">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full max-w-md h-20 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800 disabled:scale-95 rounded-[30px] font-black text-sm uppercase tracking-[0.4em] text-white shadow-2xl shadow-orange-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                    >
                        <CheckCircle2 size={24} className={`${isSaving ? 'animate-spin' : 'group-hover:scale-110'} transition-transform`} />
                        {isSaving ? 'Publicando...' : 'Finalizar e Publicar Ativo'}
                    </button>
                </div>
            </form>
        </div>
    );
};
