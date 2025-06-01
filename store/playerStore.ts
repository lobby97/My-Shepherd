import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '@/types';

interface PlayerState {
  currentQuote: Quote | null;
  isPlaying: boolean;
  currentPlaylist: Quote[];
  currentIndex: number;
  favorites: string[];
  history: string[];
  playQuote: (quote: Quote, playlist?: Quote[]) => void;
  pauseQuote: () => void;
  resumeQuote: () => void;
  nextQuote: () => void;
  previousQuote: () => void;
  toggleFavorite: (quoteId: string) => void;
  isFavorite: (quoteId: string) => boolean;
  addToHistory: (quoteId: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentQuote: null,
      isPlaying: false,
      currentPlaylist: [],
      currentIndex: 0,
      favorites: [],
      history: [],
      
      playQuote: (quote, playlist = []) => {
        const currentPlaylist = playlist.length > 0 ? playlist : [quote];
        const currentIndex = currentPlaylist.findIndex(q => q.id === quote.id);
        
        set({ 
          currentQuote: quote, 
          isPlaying: true,
          currentPlaylist,
          currentIndex: currentIndex >= 0 ? currentIndex : 0
        });
      },
      
      pauseQuote: () => set({ isPlaying: false }),
      
      resumeQuote: () => set({ isPlaying: true }),
      
      nextQuote: () => {
        const { currentPlaylist, currentIndex } = get();
        
        if (currentPlaylist.length === 0) return;
        
        const nextIndex = (currentIndex + 1) % currentPlaylist.length;
        const nextQuote = currentPlaylist[nextIndex];
        
        if (nextQuote) {
          set({
            currentQuote: nextQuote,
            currentIndex: nextIndex,
            isPlaying: true
          });
          
          // Add to history
          get().addToHistory(nextQuote.id);
        }
      },
      
      previousQuote: () => {
        const { currentPlaylist, currentIndex } = get();
        
        if (currentPlaylist.length === 0) return;
        
        const prevIndex = currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1;
        const prevQuote = currentPlaylist[prevIndex];
        
        if (prevQuote) {
          set({
            currentQuote: prevQuote,
            currentIndex: prevIndex,
            isPlaying: true
          });
          
          // Add to history
          get().addToHistory(prevQuote.id);
        }
      },
      
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