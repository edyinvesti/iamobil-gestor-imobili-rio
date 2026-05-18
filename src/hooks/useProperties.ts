import { useState, useEffect, useCallback, useRef } from 'react';
import { Property } from '../types';
import { getApiUrl } from '../utils';

interface RawPropertyInput {
  id?: string;
  size?: number;
  area?: number;
  address?: string;
  location?: string;
  images?: string[] | string;
  imagePath?: string;
  amenities?: string[];
  [key: string]: unknown;
}

function normalizeProperty(p: RawPropertyInput): Property {
  return {
    ...p,
    id: p.id || crypto.randomUUID(),
    size: p.size ?? p.area ?? 0,
    address: p.address ?? p.location ?? '',
    images: (() => {
      let imgs: string[] = [];
      if (Array.isArray(p.images)) imgs = p.images;
      else if (typeof p.images === 'string') { try { imgs = JSON.parse(p.images); } catch { imgs = []; } }
      if (imgs.length === 0 && p.imagePath) imgs = [p.imagePath];
      return imgs;
    })(),
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
  } as Property;
}

export interface SyncStatus {
  syncing: boolean;
  lastSync: number | null;
  error: string | null;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncing: false,
    lastSync: null,
    error: null
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    
    const fetchCloudData = async () => {
      const savedProfile = localStorage.getItem('iamobil_profile');
      if (!savedProfile) {
         setLoading(false);
         return;
      }
      
      let profileData: { name: string, creci: string } = { name: '', creci: '' };
      try { profileData = JSON.parse(savedProfile); } catch(e){}
      const { creci, name } = profileData;

      if (!creci) {
         setLoading(false);
         return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));
      const API_BASE = getApiUrl();
      
      if (!API_BASE) {
        setLoading(false);
        setSyncStatus({ syncing: false, lastSync: null, error: 'API não configurada' });
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE}/api/partner/properties?creci=${encodeURIComponent(creci)}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.properties) {
            const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('iamobil_deleted_ids') || '[]'));
            const cloudItems = Array.isArray(data.properties)
              ? data.properties
                  .filter((p: RawPropertyInput) => !deletedIds.has(p.id || '') && !(typeof p.id === 'string' && p.id.includes("prop_migrated")))
                  .map(normalizeProperty)
              : [];

            const cloudIds = new Set(cloudItems.map((p: Property) => p.id));
            
            const merged = [...cloudItems];
            const localOnly: Property[] = [];
            
            localProps.forEach(lp => {
              if (!lp.remoteId) {
                if (!cloudIds.has(lp.id)) {
                  merged.push(lp);
                  localOnly.push(lp);
                }
              }
            });
            
            setProperties(merged);
            localStorage.setItem('iamobil_properties', JSON.stringify(merged));
            setSyncStatus({ syncing: false, lastSync: Date.now(), error: null });

            if (localOnly.length > 0) {
              console.log(`[Sync] Sincronizando ${localOnly.length} imóveis locais...`);
              for (const prop of localOnly) {
                try {
                  const response = await fetch(`${API_BASE}/api/partner/properties`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...prop, brokerName: name, brokerCreci: creci })
                  });
                  if (response.ok) {
                    const result = await response.json();
                    setProperties(prev => prev.map(p => 
                      p.id === prop.id ? { ...p, remoteId: result.propertyId, remoteStatus: 'pending' } : p
                    ));
                  }
                } catch (e) {
                  console.error("Erro ao sincronizar imóvel:", prop.title, e);
                }
              }
            }
          }
        } else {
          setSyncStatus({ syncing: false, lastSync: null, error: 'Falha ao conectar com a nuvem' });
        }
      } catch(e: any) {
        if (e.name !== 'AbortError') {
          console.error("Erro ao sincronizar:", e);
          setSyncStatus({ syncing: false, lastSync: null, error: 'Erro de conexão' });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchCloudData();
  }, []);

  const saveProperties = useCallback((newProperties: Property[]) => {
    try {
      setProperties(newProperties);
      localStorage.setItem('iamobil_properties', JSON.stringify(newProperties));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
      setProperties(newProperties);
    }
  }, []);

  const handleSaveProperty = useCallback(async (property: Property, profile: { name: string, creci: string }) => {
    setProperties(prev => {
      const exists = prev.find(p => p.id === property.id);
      let updated: Property[];
      if (exists) {
        updated = prev.map(p => p.id === property.id ? property : p);
      } else {
        const newProp: Property = { ...property, remoteStatus: 'pending' };
        updated = [newProp, ...prev];
      }
      return updated;
    });
    
    setSyncStatus(prev => ({ ...prev, syncing: true }));
    
    (async () => {
        const API_BASE = getApiUrl();
        if (!API_BASE) {
          setSyncStatus({ syncing: false, lastSync: null, error: 'API não configurada' });
          return;
        }
        
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
            setSyncStatus({ syncing: false, lastSync: Date.now(), error: null });
          } else {
            setSyncStatus({ syncing: false, lastSync: null, error: 'Erro ao salvar na nuvem' });
          }
        } catch (e: any) {
          console.error("Erro na integração:", e);
          setSyncStatus({ syncing: false, lastSync: null, error: 'Erro de conexão' });
        }
    })();
  }, []);

  const deleteProperty = useCallback((id: string) => {
    const propertyToDelete = properties.find(p => p.id === id);
    const updated = properties.filter(p => p.id !== id);
    saveProperties(updated);

    const deletedIds: string[] = JSON.parse(localStorage.getItem('iamobil_deleted_ids') || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem('iamobil_deleted_ids', JSON.stringify(deletedIds));
    }

    if (propertyToDelete && (propertyToDelete.remoteId || propertyToDelete.id.startsWith('prop_'))) {
      (async () => {
        const API_BASE = getApiUrl();
        if (!API_BASE) return;
        try {
          const targetId = propertyToDelete.remoteId || propertyToDelete.id;
          await fetch(`${API_BASE}/api/partner/properties?id=${targetId}`, {
            method: "DELETE"
          });
        } catch (e) {
          console.error("Erro ao deletar da nuvem:", e);
        }
      })();
    }
  }, [properties, saveProperties]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const pendingIds = properties
      .filter(p => p.remoteId && p.remoteStatus !== 'approved' && p.remoteStatus !== 'rejected')
      .map(p => p.remoteId);

    if (pendingIds.length === 0) return;

    const checkStatuses = async () => {
      const API_BASE = getApiUrl();
      if (!API_BASE) return;
      
      try {
        const res = await fetch(`${API_BASE}/api/partner/properties/status?ids=${pendingIds.join(',')}`);
        if (res.ok) {
          const { statuses } = await res.json();
          setProperties(prev => {
            let changed = false;
            const updated = prev.map(p => {
              if (p.remoteId && statuses[p.remoteId] && statuses[p.remoteId] !== p.remoteStatus) {
                changed = true;
                return { ...p, remoteStatus: statuses[p.remoteId] };
              }
              return p;
            });
            if (changed) {
              localStorage.setItem('iamobil_properties', JSON.stringify(updated));
            }
            return updated;
          });
        }
      } catch (err) { /* silent */ }
    };

    checkStatuses();
    intervalRef.current = setInterval(checkStatuses, 60000);
    
    const handleVisibility = () => {
      if (!document.hidden) checkStatuses();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const forceSync = useCallback(() => {
    localStorage.removeItem('iamobil_properties');
    localStorage.removeItem('iamobil_deleted_ids');
    window.location.reload();
  }, []);

  return {
    properties,
    loading,
    syncStatus,
    saveProperty: handleSaveProperty,
    deleteProperty,
    forceSync,
    setProperties: saveProperties
  };
}