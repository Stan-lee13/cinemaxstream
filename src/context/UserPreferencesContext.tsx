
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserPreferences {
  defaultMovieProvider: string;
  defaultSeriesProvider: string;
  defaultAnimeProvider: string;
  enableAutoSwitch: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  defaultMovieProvider: 'vidsrc.su',
  defaultSeriesProvider: 'vidsrc.xyz',
  defaultAnimeProvider: 'vidsrc.xyz',
  enableAutoSwitch: false,
  theme: 'system',
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('user_preferences', defaultPreferences);
  
  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev: UserPreferences) => {
      return { ...prev, ...newPrefs } as UserPreferences;
    });
  };
  
  const value = {
    preferences,
    updatePreferences,
  };
  
  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
