import { useState, useEffect, useCallback } from 'react';
import { Property } from '../types';
import { getApiUrl } from '../utils';

/** Normalizes property data coming from the backend to match the frontend Property type. */
function normalizeProperty(p: any): Property {
  return {
    ...p,
    // Backend stores area as 'area', frontend expects 'size'
    size: p.size ?? p.area ?? 0,
    // Backend stores address as 'location', frontend expects 'address'
    address: p.address ?? p.location ?? '',
    // Ensure images is always an array; fall back to imagePath if empty
    images: (() => {
      let imgs: string[] = [];
      if (Array.isArray(p.images)) imgs = p.images;
      else if (typeof p.images === 'string') { try { imgs = JSON.parse(p.images); } catch { imgs = []; } }
      // If still empty, use imagePath as the cover image
      if (imgs.length === 0 && p.imagePath) imgs = [p.imagePath];
      return imgs;
    })(),
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
  } as Property;
}

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

      const API_BASE = getApiUrl();
      try {
        const res = await fetch(`${API_BASE}/api/partner/properties?creci=${encodeURIComponent(creci)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.properties) {
            // Merge logic: properties from Cloud supersede local, but we keep local-only items (drafts)
            // Also filter out items that were deleted locally
            const deletedIds = new Set<string>(JSON.parse(localStorage.getItem('iamobil_deleted_ids') || '[]'));
            const cloudItems = Array.isArray(data.properties)
              ? data.properties
                  .filter((p: any) => !deletedIds.has(p.id))
                  .map(normalizeProperty)
              : [];

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
        const API_BASE = getApiUrl();
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
    const propertyToDelete = properties.find(p => p.id === id);
    const updated = properties.filter(p => p.id !== id);
    saveProperties(updated);

    // Persist deleted ID so cloud sync doesn't re-import it
    const deletedIds: string[] = JSON.parse(localStorage.getItem('iamobil_deleted_ids') || '[]');
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      localStorage.setItem('iamobil_deleted_ids', JSON.stringify(deletedIds));
    }

    // Cloud sync for deletion
    if (propertyToDelete && (propertyToDelete.remoteId || propertyToDelete.id.startsWith('prop_'))) {
      (async () => {
        const API_BASE = getApiUrl();
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

  // Polling for statuses
  useEffect(() => {
    const checkStatuses = async () => {
      const pendingIds = properties
        .filter(p => p.remoteId && p.remoteStatus !== 'approved' && p.remoteStatus !== 'rejected')
        .map(p => p.remoteId);

      if (pendingIds.length === 0) return;

      const API_BASE = getApiUrl();
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
