import { useState, useEffect, useCallback } from 'react';
import { Property } from '../types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, []);

  // Save properties to localStorage
  const saveProperties = useCallback((newProperties: Property[]) => {
    setProperties(newProperties);
    localStorage.setItem('iamobil_properties', JSON.stringify(newProperties));
  }, []);

  const handleSaveProperty = useCallback(async (property: Property, profile: { name: string, creci: string }) => {
    const exists = properties.find(p => p.id === property.id);
    let updated: Property[];
    
    if (exists) {
      updated = properties.map(p => p.id === property.id ? property : p);
    } else {
      const newProp: Property = { ...property, remoteStatus: 'pending' };
      updated = [newProp, ...properties];
    }
    
    saveProperties(updated);
    
    // @ts-ignore
    const API_BASE = (import.meta as any).env.VITE_API_URL || '';
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
      console.error("Erro na integração:", e);
    }
  }, [properties, saveProperties]);

  const deleteProperty = useCallback((id: string) => {
    const updated = properties.filter(p => p.id !== id);
    saveProperties(updated);
  }, [properties, saveProperties]);

  // Polling for statuses
  useEffect(() => {
    const checkStatuses = async () => {
      const pendingIds = properties
        .filter(p => p.remoteId && p.remoteStatus !== 'approved' && p.remoteStatus !== 'rejected')
        .map(p => p.remoteId);

      if (pendingIds.length === 0) return;

      // @ts-ignore
      const API_BASE = (import.meta as any).env.VITE_API_URL || '';
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
  }, [properties, saveProperties]);

  return {
    properties,
    loading,
    saveProperty: handleSaveProperty,
    deleteProperty,
    setProperties: saveProperties
  };
}
