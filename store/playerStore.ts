import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '@/types';

interface PlayerState {
  currentQuote: Quote | null;
  isPlaying: boolean;
  favorites: string[];
  history: string[];
  playQuote: (quote: Quote) => void;
  pauseQuote: () => void;
  resumeQuote: () => void;
  toggleFavorite: (quoteId: string) => void;
  isFavorite: (quoteId: string) => boolean;
  addToHistory: (quoteId: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentQuote: null,
      isPlaying: false,
      favorites: [],
      history: [],
      
      playQuote: (quote) => set({ currentQuote: quote, isPlaying: true }),
      
      pauseQuote: () => set({ isPlaying: false }),
      
      resumeQuote: () => set({ isPlaying: true }),
      
      toggleFavorite: (quoteId) => {
        const favorites = [...get().favorites];
        const index = favorites.indexOf(quoteId);
        
        if (index === -1) {
          favorites.push(quoteId);
        } else {
          favorites.splice(index, 1);
        }
        
        set({ favorites });
      },
      
      isFavorite: (quoteId) => {
        return get().favorites.includes(quoteId);
      },
      
      addToHistory: (quoteId) => {
        const history = [quoteId, ...get().history.filter(id => id !== quoteId)];
        if (history.length > 20) history.pop();
        set({ history });
      }
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);