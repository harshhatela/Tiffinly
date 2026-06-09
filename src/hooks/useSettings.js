import { useState, useEffect } from 'react';
import { db, DEFAULT_SETTINGS } from '../db/db';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        let s = await db.settings.get(1);
        if (!s) {
          await db.settings.add(DEFAULT_SETTINGS);
          s = DEFAULT_SETTINGS;
        }
        setSettings(s);
      } catch (err) {
        console.error('Error loading settings:', err);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (partial) => {
    try {
      const updated = { ...settings, ...partial };
      await db.settings.put(updated);
      setSettings(updated);
      return updated;
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  return { settings, loading, saveSettings };
}
