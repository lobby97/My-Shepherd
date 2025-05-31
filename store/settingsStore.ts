import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  isDarkMode: boolean;
  playbackSpeed: number;
  enableBackgroundMusic: boolean;
  dailyNotifications: boolean;
  toggleDarkMode: () => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleBackgroundMusic: () => void;
  toggleDailyNotifications: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      playbackSpeed: 1.0,
      enableBackgroundMusic: false,
      dailyNotifications: true,
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      
      toggleBackgroundMusic: () => set((state) => ({ 
        enableBackgroundMusic: !state.enableBackgroundMusic 
      })),
      
      toggleDailyNotifications: () => set((state) => ({ 
        dailyNotifications: !state.dailyNotifications 
      })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);