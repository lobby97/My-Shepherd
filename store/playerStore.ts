import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, StreakData, DailyProgress } from '@/types';

interface PlayerState {
  currentQuote: Quote | null;
  isPlaying: boolean;
  currentPlaylist: Quote[];
  currentIndex: number;
  favorites: string[];
  history: string[];
  streakData: StreakData;
  showCongratulationsModal: boolean;
  playQuote: (quote: Quote, playlist?: Quote[]) => void;
  pauseQuote: () => void;
  resumeQuote: () => void;
  nextQuote: () => void;
  previousQuote: () => void;
  toggleFavorite: (quoteId: string) => void;
  isFavorite: (quoteId: string) => boolean;
  addToHistory: (quoteId: string) => void;
  incrementDailyProgress: () => void;
  resetDailyProgressIfNeeded: () => void;
  dismissCongratulationsModal: () => void;
  getTodayDateString: () => string;
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const createInitialStreakData = (): StreakData => {
  const today = getTodayDateString();
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysCompleted: 0,
    dailyProgress: [],
    lastCompletedDate: null,
    todayProgress: {
      date: today,
      quotesListened: 0,
      completed: false,
    },
  };
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentQuote: null,
      isPlaying: false,
      currentPlaylist: [],
      currentIndex: 0,
      favorites: [],
      history: [],
      streakData: createInitialStreakData(),
      showCongratulationsModal: false,
      
      getTodayDateString,
      
      playQuote: (quote, playlist = []) => {
        const currentPlaylist = playlist.length > 0 ? playlist : [quote];
        const currentIndex = currentPlaylist.findIndex(q => q.id === quote.id);
        
        set({ 
          currentQuote: quote, 
          isPlaying: true,
          currentPlaylist,
          currentIndex: currentIndex >= 0 ? currentIndex : 0
        });
        
        // Increment daily progress when playing a quote
        get().incrementDailyProgress();
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
          // Increment daily progress
          get().incrementDailyProgress();
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
          // Increment daily progress
          get().incrementDailyProgress();
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
      },
      
      resetDailyProgressIfNeeded: () => {
        const { streakData } = get();
        const today = getTodayDateString();
        
        if (streakData.todayProgress.date !== today) {
          // New day - check if we need to update streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];
          
          let newCurrentStreak = streakData.currentStreak;
          
          // If yesterday was completed, maintain streak
          // If not, reset streak to 0
          if (streakData.lastCompletedDate !== yesterdayString && streakData.currentStreak > 0) {
            newCurrentStreak = 0;
          }
          
          set({
            streakData: {
              ...streakData,
              currentStreak: newCurrentStreak,
              todayProgress: {
                date: today,
                quotesListened: 0,
                completed: false,
              },
            },
          });
        }
      },
      
      incrementDailyProgress: () => {
        get().resetDailyProgressIfNeeded();
        
        const { streakData } = get();
        const today = getTodayDateString();
        
        const newQuotesListened = streakData.todayProgress.quotesListened + 1;
        const wasCompleted = streakData.todayProgress.completed;
        const isNowCompleted = newQuotesListened >= 3;
        
        // Update today's progress
        const updatedTodayProgress = {
          ...streakData.todayProgress,
          quotesListened: newQuotesListened,
          completed: isNowCompleted,
        };
        
        // Update daily progress history
        const updatedDailyProgress = [
          ...streakData.dailyProgress.filter(p => p.date !== today),
          updatedTodayProgress,
        ].slice(-30); // Keep last 30 days
        
        let newCurrentStreak = streakData.currentStreak;
        let newLongestStreak = streakData.longestStreak;
        let newTotalDaysCompleted = streakData.totalDaysCompleted;
        let newLastCompletedDate = streakData.lastCompletedDate;
        
        // If just completed today (first time)
        if (isNowCompleted && !wasCompleted) {
          newCurrentStreak = streakData.currentStreak + 1;
          newTotalDaysCompleted = streakData.totalDaysCompleted + 1;
          newLastCompletedDate = today;
          
          if (newCurrentStreak > newLongestStreak) {
            newLongestStreak = newCurrentStreak;
          }
          
          // Show congratulations modal
          set({ showCongratulationsModal: true });
        }
        
        set({
          streakData: {
            ...streakData,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            totalDaysCompleted: newTotalDaysCompleted,
            lastCompletedDate: newLastCompletedDate,
            dailyProgress: updatedDailyProgress,
            todayProgress: updatedTodayProgress,
          },
        });
      },
      
      dismissCongratulationsModal: () => {
        set({ showCongratulationsModal: false });
      },
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Reset daily progress if needed when app loads
        if (state) {
          state.resetDailyProgressIfNeeded();
        }
      },
    }
  )
);