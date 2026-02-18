import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  heroModelUrl: string;
  updateHeroModel: (url: string) => void;
}

// Using local model 'scene.gltf'
const DEFAULT_MODEL_URL = '/models/scene.gltf';

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [heroModelUrl, setHeroModelUrl] = useState<string>(() => {
    // Return default directly to ensure we use local model first
    return DEFAULT_MODEL_URL;
  });

  const updateHeroModel = (url: string) => {
    setHeroModelUrl(url);
    try {
      if (typeof window !== 'undefined') {
        // Only persist if it's not a blob URL (which is temporary)
        if (!url.startsWith('blob:')) {
            window.localStorage.setItem('atellas_hero_model_v7', url);
        }
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  return (
    <SettingsContext.Provider value={{ heroModelUrl, updateHeroModel }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
