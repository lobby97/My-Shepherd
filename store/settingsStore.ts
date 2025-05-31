import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from '@/services/notificationService';

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
    (set, get) => ({
      isDarkMode: false,
      playbackSpeed: 1.0,
      enableBackgroundMusic: false,
      dailyNotifications: true,
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
      
      toggleBackgroundMusic: () => set((state) => ({ 
        enableBackgroundMusic: !state.enableBackgroundMusic 
      })),
      
      toggleDailyNotifications: async () => {
        const currentState = get().dailyNotifications;
        const newState = !currentState;
        
        set({ dailyNotifications: newState });
        
        if (newState) {
          await NotificationService.scheduleDailyNotifications();
        } else {
          await NotificationService.cancelAllNotifications();
        }
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Schedule notifications if they're enabled when the app loads
        if (state?.dailyNotifications) {
          NotificationService.scheduleDailyNotifications();
        }
      },
    }
  )
);