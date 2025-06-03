import { getAudioAsset } from "@/lib/audioAssets";
import { getPeacefulAmbientMusic } from "@/lib/musicAssets";
import { Quote, StreakData } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PlayerState {
  currentQuote: Quote | null;
  isPlaying: boolean;
  currentPlaylist: Quote[];
  currentIndex: number;
  favorites: string[];
  history: string[];
  streakData: StreakData;
  showCongratulationsModal: boolean;
  audioPlayer: any;
  backgroundMusicPlayer: any;
  isBackgroundMusicPlaying: boolean;
  setAudioPlayer: (player: any) => void;
  setBackgroundMusicPlayer: (player: any) => void;
  playQuote: (quote: Quote, playlist?: Quote[]) => void;
  pauseQuote: () => void;
  resumeQuote: () => void;
  nextQuote: () => void;
  previousQuote: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  toggleFavorite: (quoteId: string) => void;
  isFavorite: (quoteId: string) => boolean;
  addToHistory: (quoteId: string) => void;
  incrementDailyProgress: () => void;
  resetDailyProgressIfNeeded: () => void;
  dismissCongratulationsModal: () => void;
  getTodayDateString: () => string;
}

const getTodayDateString = (): string => {
  return new Date().toISOString().split("T")[0];
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
      audioPlayer: null,
      backgroundMusicPlayer: null,
      isBackgroundMusicPlaying: false,

      getTodayDateString,

      setAudioPlayer: (player) => {
        set({ audioPlayer: player });
      },

      setBackgroundMusicPlayer: (player) => {
        set({ backgroundMusicPlayer: player });
      },

      startBackgroundMusic: async () => {
        const { backgroundMusicPlayer, isBackgroundMusicPlaying } = get();
        if (backgroundMusicPlayer && !isBackgroundMusicPlaying) {
          try {
            const musicAsset = getPeacefulAmbientMusic();
            console.log("Starting background music:", !!musicAsset);
            if (musicAsset) {
              await backgroundMusicPlayer.replace(musicAsset);
              backgroundMusicPlayer.loop = true;
              backgroundMusicPlayer.volume = 0.3; // Lower volume for background
              await backgroundMusicPlayer.play();
              set({ isBackgroundMusicPlaying: true });
              console.log("Background music started successfully");
            }
          } catch (error) {
            console.error("Error starting background music:", error);
          }
        } else if (isBackgroundMusicPlaying) {
          console.log("Background music is already playing");
        }
      },

      stopBackgroundMusic: async () => {
        const { backgroundMusicPlayer, isBackgroundMusicPlaying } = get();
        if (backgroundMusicPlayer && isBackgroundMusicPlaying) {
          try {
            console.log("Stopping background music");
            await backgroundMusicPlayer.pause();
            set({ isBackgroundMusicPlaying: false });
            console.log("Background music stopped successfully");
          } catch (error) {
            console.error("Error stopping background music:", error);
          }
        }
      },

      playQuote: async (quote, playlist = []) => {
        console.log("playQuote called with quote:", quote.id);
        const { audioPlayer } = get();
        console.log("audioPlayer available:", !!audioPlayer);

        const currentPlaylist = playlist.length > 0 ? playlist : [quote];
        const currentIndex = currentPlaylist.findIndex(
          (q) => q.id === quote.id
        );

        set({
          currentQuote: quote,
          isPlaying: true,
          currentPlaylist,
          currentIndex: currentIndex >= 0 ? currentIndex : 0,
        });

        // Play the actual audio
        if (audioPlayer) {
          try {
            const audioAsset = getAudioAsset(quote.id);
            console.log(
              "Audio asset found:",
              !!audioAsset,
              "for quote:",
              quote.id
            );
            if (audioAsset) {
              console.log("Attempting to replace and play audio...");
              await audioPlayer.replace(audioAsset);
              await audioPlayer.play();
              console.log("Audio should be playing now");
            } else {
              console.log(`No audio available for quote ${quote.id}`);
            }
          } catch (error) {
            console.error("Error playing audio:", error);
          }
        } else {
          console.log("No audio player available in store");
        }

        // Increment daily progress when playing a quote
        get().incrementDailyProgress();
      },

      pauseQuote: () => {
        const { audioPlayer } = get();
        set({ isPlaying: false });
        if (audioPlayer) {
          audioPlayer.pause();
        }
      },

      resumeQuote: () => {
        const { audioPlayer } = get();
        set({ isPlaying: true });
        if (audioPlayer) {
          audioPlayer.play();
        }
      },

      nextQuote: async () => {
        console.log("nextQuote called");
        const { currentPlaylist, currentIndex, audioPlayer } = get();
        console.log(
          "Playlist length:",
          currentPlaylist.length,
          "Current index:",
          currentIndex
        );

        if (currentPlaylist.length === 0) {
          console.log("No playlist available");
          return;
        }

        const nextIndex = (currentIndex + 1) % currentPlaylist.length;
        const nextQuote = currentPlaylist[nextIndex];
        console.log("Next index:", nextIndex, "Next quote:", nextQuote?.id);

        if (nextQuote) {
          // Update current quote and index, but don't set isPlaying yet
          // Let AudioProvider sync the isPlaying state when audio actually starts
          set({
            currentQuote: nextQuote,
            currentIndex: nextIndex,
            // Removed: isPlaying: true,
          });

          // Play the next audio
          if (audioPlayer) {
            try {
              const audioAsset = getAudioAsset(nextQuote.id);
              console.log("Next audio asset found:", !!audioAsset);
              if (audioAsset) {
                console.log("Replacing and playing next audio...");
                await audioPlayer.replace(audioAsset);
                await audioPlayer.play();
                console.log("Next audio started playing");
                // AudioProvider will sync isPlaying: true when it detects the audio is playing
              }
            } catch (error) {
              console.error("Error playing next audio:", error);
              // If there's an error, ensure we don't leave the UI in a stuck state
              set({ isPlaying: false });
            }
          }

          // Add to history
          get().addToHistory(nextQuote.id);
          // Increment daily progress
          get().incrementDailyProgress();
        }
      },

      previousQuote: async () => {
        console.log("previousQuote called");
        const { currentPlaylist, currentIndex, audioPlayer } = get();
        console.log(
          "Playlist length:",
          currentPlaylist.length,
          "Current index:",
          currentIndex
        );

        if (currentPlaylist.length === 0) {
          console.log("No playlist available");
          return;
        }

        const prevIndex =
          currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1;
        const prevQuote = currentPlaylist[prevIndex];
        console.log(
          "Previous index:",
          prevIndex,
          "Previous quote:",
          prevQuote?.id
        );

        if (prevQuote) {
          // Update current quote and index, but don't set isPlaying yet
          set({
            currentQuote: prevQuote,
            currentIndex: prevIndex,
            // Removed: isPlaying: true,
          });

          // Play the previous audio
          if (audioPlayer) {
            try {
              const audioAsset = getAudioAsset(prevQuote.id);
              console.log("Previous audio asset found:", !!audioAsset);
              if (audioAsset) {
                console.log("Replacing and playing previous audio...");
                await audioPlayer.replace(audioAsset);
                await audioPlayer.play();
                console.log("Previous audio started playing");
                // AudioProvider will sync isPlaying: true when it detects the audio is playing
              }
            } catch (error) {
              console.error("Error playing previous audio:", error);
              set({ isPlaying: false });
            }
          }

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
        const history = [
          quoteId,
          ...get().history.filter((id) => id !== quoteId),
        ];
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
          const yesterdayString = yesterday.toISOString().split("T")[0];

          let newCurrentStreak = streakData.currentStreak;

          // If yesterday was completed, maintain streak
          // If not, reset streak to 0
          if (
            streakData.lastCompletedDate !== yesterdayString &&
            streakData.currentStreak > 0
          ) {
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
          ...streakData.dailyProgress.filter((p) => p.date !== today),
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
      name: "player-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Exclude audio players from persistence since they can't be serialized
      partialize: (state) => ({
        currentQuote: state.currentQuote,
        isPlaying: state.isPlaying,
        currentPlaylist: state.currentPlaylist,
        currentIndex: state.currentIndex,
        favorites: state.favorites,
        history: state.history,
        streakData: state.streakData,
        showCongratulationsModal: state.showCongratulationsModal,
        // Don't persist: audioPlayer, backgroundMusicPlayer, isBackgroundMusicPlaying
      }),
      onRehydrateStorage: () => (state) => {
        // Reset daily progress if needed when app loads
        if (state) {
          state.resetDailyProgressIfNeeded();
        }
      },
    }
  )
);
