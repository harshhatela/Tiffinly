import { useState, useEffect, useCallback } from 'react';
import { db, DEFAULT_SETTINGS } from '../db/db';
import { supabase, isCloudEnabled } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);

  const loadSettings = useCallback(async () => {
    if (user && isCloudEnabled()) {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();
      if (!error && data) {
        const mapped = {
          id: 1,
          serviceName:   data.service_name,
          whatsappName:  data.whatsapp_name,
          meals:         data.meals,
          onboardingComplete: !!data.service_name,
        };
        setSettings(mapped);
        await db.settings.put(mapped);
      } else {
        const cached = await db.settings.get(1);
        setSettings(cached || DEFAULT_SETTINGS);
      }
    } else {
      const local = await db.settings.get(1);
      setSettings(local || DEFAULT_SETTINGS);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = async (partial) => {
    const updated = { ...settings, ...partial };
    setSettings(updated); // optimistic update

    if (user && isCloudEnabled()) {
      await supabase.from('profiles').update({
        service_name:  updated.serviceName,
        whatsapp_name: updated.whatsappName,
        meals:         updated.meals,
      }).eq('id', user.id);
    }
    await db.settings.put(updated); // always cache locally too
  };

  return { settings, loading, saveSettings, refreshSettings: loadSettings };
}
