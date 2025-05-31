import { getAudioAsset } from "@/lib/audioAssets";
import { Quote } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, AVPlaybackStatus } from "expo-av";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PlayerState {
  currentQuote: Quote | null;
  isPlaying: boolean;
  currentPlaylist: Quote[];
  currentIndex: number;
  favorites: string[];
  history: string[];
  sound: Audio.Sound | null;
  isLoading: boolean;
  playQuote: (quote: Quote, playlist?: Quote[]) => void;
  pauseQuote: () => void;
  resumeQuote: () => void;
  nextQuote: () => void;
  previousQuote: () => void;
  clearCurrentQuote: () => void;
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
      sound: null,
      isLoading: false,

      playQuote: async (quote, playlist = []) => {
        const { sound: currentSound } = get();

        try {
          set({ isLoading: true });

          // Stop and unload previous sound
          if (currentSound) {
            await currentSound.unloadAsync();
            set({ sound: null });
          }

          // Get the audio asset for this quote
          const audioAsset = getAudioAsset(quote.id);

          if (!audioAsset) {
            console.log(`No audio available for quote ${quote.id}`);
            set({ isLoading: false });
            return;
          }

          // Create and load new sound
          const { sound: newSound } = await Audio.Sound.createAsync(audioAsset);

          // Set up playback status listener
          newSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
            if (status.isLoaded) {
              set({ isPlaying: status.isPlaying });

              // Handle when audio finishes
              if (status.didJustFinish) {
                console.log("Audio finished, checking for next track...");
                const { currentPlaylist, currentIndex } = get();

                console.log(
                  `Current index: ${currentIndex}, playlist length: ${currentPlaylist.length}`
                );

                // Auto-play next song if in playlist
                if (currentPlaylist.length > 1) {
                  const nextIndex = (currentIndex + 1) % currentPlaylist.length;
                  const nextQuote = currentPlaylist[nextIndex];

                  console.log(
                    `Next index: ${nextIndex}, next quote: ${nextQuote?.id}`
                  );

                  if (nextQuote) {
                    console.log(`Auto-playing next quote: ${nextQuote.id}`);
                    // Auto-play next quote
                    get().playQuote(nextQuote, currentPlaylist);
                    return;
                  }
                }

                // If no next song, stop playing
                console.log("No next track, stopping playback");
                set({ isPlaying: false });
              }
            }
          });

          // Update state
          const currentPlaylist = playlist.length > 0 ? playlist : [quote];
          const currentIndex = currentPlaylist.findIndex(
            (q) => q.id === quote.id
          );

          set({
            currentQuote: quote,
            isPlaying: false, // Will be set to true by status listener
            currentPlaylist,
            currentIndex: currentIndex >= 0 ? currentIndex : 0,
            sound: newSound,
            isLoading: false,
          });

          // Start playing
          await newSound.playAsync();
        } catch (error) {
          console.error("Error playing audio:", error);
          set({ isLoading: false, isPlaying: false });
        }
      },

      pauseQuote: async () => {
        const { sound } = get();
        if (sound) {
          try {
            await sound.pauseAsync();
          } catch (error) {
            console.error("Error pausing audio:", error);
          }
        }
      },

      resumeQuote: async () => {
        const { sound } = get();
        if (sound) {
          try {
            await sound.playAsync();
          } catch (error) {
            console.error("Error resuming audio:", error);
          }
        }
      },

      nextQuote: () => {
        const { currentPlaylist, currentIndex } = get();

        if (currentPlaylist.length === 0) return;

        const nextIndex = (currentIndex + 1) % currentPlaylist.length;
        const nextQuote = currentPlaylist[nextIndex];

        if (nextQuote) {
          // Play next quote
          get().playQuote(nextQuote, currentPlaylist);

          // Add to history
          get().addToHistory(nextQuote.id);
        }
      },

      previousQuote: () => {
        const { currentPlaylist, currentIndex } = get();

        if (currentPlaylist.length === 0) return;

        const prevIndex =
          currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1;
        const prevQuote = currentPlaylist[prevIndex];

        if (prevQuote) {
          // Play previous quote
          get().playQuote(prevQuote, currentPlaylist);

          // Add to history
          get().addToHistory(prevQuote.id);
        }
      },

      clearCurrentQuote: async () => {
        const { sound } = get();

        // Stop and unload sound
        if (sound) {
          try {
            await sound.unloadAsync();
          } catch (error) {
            console.error("Error unloading sound:", error);
          }
        }

        set({
          currentQuote: null,
          isPlaying: false,
          currentPlaylist: [],
          currentIndex: 0,
          sound: null,
        });
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
    }),
    {
      name: "player-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Don't persist the sound object and loading state
        currentQuote: state.currentQuote,
        isPlaying: false, // Reset playing state on load
        currentPlaylist: state.currentPlaylist,
        currentIndex: state.currentIndex,
        favorites: state.favorites,
        history: state.history,
      }),
    }
  )
);
