import { useState, useEffect, useCallback } from 'react';
import { Property } from '../types';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage AND Cloud Sync
  useEffect(() => {
    let localProps: Property[] = [];
    const savedProperties = localStorage.getItem('iamobil_properties');
    if (savedProperties) {
      try {
        localProps = JSON.parse(savedProperties);
        setProperties(localProps);
      } catch (e) {
        console.error("Erro ao carregar os dados:", e);
      }
    }
    
    // Background cloud sync
    const fetchCloudData = async () => {
      const savedProfile = localStorage.getItem('iamobil_profile');
      if (!savedProfile) {
         setLoading(false);
         return;
      }
      
      let creci = '';
      try { creci = JSON.parse(savedProfile).creci; } catch(e){}
      if (!creci) {
         setLoading(false);
         return;
      }

      // @ts-ignore
      const API_BASE = (import.meta as any).env.VITE_API_URL || '';
      try {
        const res = await fetch(`${API_BASE}/api/partner/properties?creci=${encodeURIComponent(creci)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.properties) {
            // Merge logic: properties from Cloud supersede local, but we keep local-only items (drafts)
            const cloudItems = Array.isArray(data.properties) ? data.properties : [];
            const cloudIds = new Set(cloudItems.map((p: Property) => p.id));
            const merged = [...cloudItems];
            
            localProps.forEach(lp => {
              // If not found in cloud, keep it
              if (!cloudIds.has(lp.id) && !cloudIds.has(lp.remoteId || '')) {
                merged.push(lp);
              }
            });
            
            setProperties(merged);
            localStorage.setItem('iamobil_properties', JSON.stringify(merged));
          }
        }
      } catch(e) {
        console.error("Erro ao sincronizar imóveis da nuvem:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCloudData();
  }, []);

  // Save properties to localStorage
  const saveProperties = useCallback((newProperties: Property[]) => {
    try {
      setProperties(newProperties);
      localStorage.setItem('iamobil_properties', JSON.stringify(newProperties));
    } catch (e) {
      console.warn("Storage quota exceeded, saving state only in memory", e);
      // Fallback: update state anyway so UI works even if storage fails
      setProperties(newProperties);
    }
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
    
    // Non-blocking background sync
    (async () => {
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
            setProperties(prev => prev.map(p => 
              p.id === property.id ? { ...p, remoteId: data.propertyId, remoteStatus: 'pending' as const } : p
            ));
            // Trigger storage update with the remote ID
            const latest = properties.map(p => p.id === property.id ? { ...p, remoteId: data.propertyId } : p);
            localStorage.setItem('iamobil_properties', JSON.stringify(latest));
          }
        } catch (e: any) {
          console.error("Erro na integração em background:", e);
        }
    })();
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
