import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useRef } from "react";

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer();
  const backgroundMusicPlayer = useAudioPlayer();
  const setAudioPlayer = usePlayerStore((state) => state.setAudioPlayer);
  const setBackgroundMusicPlayer = usePlayerStore(
    (state) => state.setBackgroundMusicPlayer
  );
  const startBackgroundMusic = usePlayerStore(
    (state) => state.startBackgroundMusic
  );
  const stopBackgroundMusic = usePlayerStore(
    (state) => state.stopBackgroundMusic
  );
  const { enableBackgroundMusic } = useSettingsStore();
  const wasPlayingForBgMusicRef = useRef(false);
  const wasPlayingForTransitionRef = useRef(false);
  const isTransitioningRef = useRef(false);
  const hasActivePlaylistRef = useRef(false);

  useEffect(() => {
    console.log(
      "AudioProvider: Initializing. AudioPlayer available:",
      !!audioPlayer
    );
    setAudioPlayer(audioPlayer);
  }, [audioPlayer, setAudioPlayer]);

  useEffect(() => {
    console.log(
      "AudioProvider: Initializing background music player. Available:",
      !!backgroundMusicPlayer
    );
    setBackgroundMusicPlayer(backgroundMusicPlayer);
  }, [backgroundMusicPlayer, setBackgroundMusicPlayer]);

  // Handle background music based on settings - only start/stop based on setting change
  useEffect(() => {
    const { isPlaying, currentQuote } = usePlayerStore.getState();

    if (enableBackgroundMusic && isPlaying && currentQuote) {
      // Start background music when setting is enabled and there's active playback
      console.log(
        "AudioProvider: Starting background music (setting enabled + active playback)"
      );
      startBackgroundMusic();
    } else if (!enableBackgroundMusic) {
      // Stop background music when setting is disabled
      console.log(
        "AudioProvider: Stopping background music (setting disabled)"
      );
      stopBackgroundMusic();
    }
  }, [enableBackgroundMusic, startBackgroundMusic, stopBackgroundMusic]);

  // Monitor playback state changes to manage background music
  useEffect(() => {
    const monitorPlaybackForBackgroundMusic = () => {
      const { isPlaying, currentQuote, currentPlaylist } =
        usePlayerStore.getState();
      const hasActiveSession = currentQuote && currentPlaylist.length > 0;

      if (enableBackgroundMusic) {
        // Start background music when session begins
        if (isPlaying && hasActiveSession && !wasPlayingForBgMusicRef.current) {
          console.log(
            "AudioProvider: Teaching session started, starting background music"
          );
          startBackgroundMusic();
          hasActivePlaylistRef.current = true;
        }

        // Stop background music only when session completely ends
        if (
          !isPlaying &&
          wasPlayingForBgMusicRef.current &&
          !isTransitioningRef.current
        ) {
          // Add a small delay to distinguish between transitions and actual stops
          setTimeout(() => {
            const currentState = usePlayerStore.getState();
            // Only stop if we're still not playing and not transitioning after the delay
            if (!currentState.isPlaying && !isTransitioningRef.current) {
              console.log(
                "AudioProvider: Teaching session ended, stopping background music"
              );
              stopBackgroundMusic();
              hasActivePlaylistRef.current = false;
            }
          }, 1000); // 1 second delay to allow for transitions
        }
      }

      wasPlayingForBgMusicRef.current = isPlaying;
    };

    if (audioPlayer) {
      const intervalId = setInterval(monitorPlaybackForBackgroundMusic, 500);
      return () => clearInterval(intervalId);
    }
  }, [
    audioPlayer,
    enableBackgroundMusic,
    startBackgroundMusic,
    stopBackgroundMusic,
  ]);

  useEffect(() => {
    const monitorAndHandleAudioState = () => {
      const store = usePlayerStore.getState(); // Get fresh state each interval
      const isDevicePlaying = audioPlayer?.playing || false;
      const storeIsPlaying = store.isPlaying;
      const storeCurrentQuoteId = store.currentQuote?.id;

      // Scenario 1: Successfully transitioned - new track is now playing
      if (isTransitioningRef.current && isDevicePlaying) {
        console.log(
          "AudioProvider: Transition successful, new track started. Resetting transition flag."
        );
        isTransitioningRef.current = false;
        if (!storeIsPlaying) {
          // If store isn't yet reflecting playback (e.g., due to timing), sync it.
          usePlayerStore.setState({ isPlaying: true });
        }
      }
      // Scenario 2: Transition might have failed or ended (nextQuote errored / no new audio started)
      else if (
        isTransitioningRef.current &&
        !isDevicePlaying &&
        !storeIsPlaying
      ) {
        console.log(
          "AudioProvider: Transition seems to have failed (device & store not playing). Resetting flag."
        );
        isTransitioningRef.current = false;
      }

      // Scenario 3: Standard state synchronization (when NOT in a transition)
      if (!isTransitioningRef.current && isDevicePlaying !== storeIsPlaying) {
        console.log(
          `AudioProvider: Syncing state. Device: ${isDevicePlaying}, Store: ${storeIsPlaying}. Setting store to ${isDevicePlaying}.`
        );
        usePlayerStore.setState({ isPlaying: isDevicePlaying });
      }

      // Scenario 4: Detect track finish to INITIATE a transition
      if (
        wasPlayingForTransitionRef.current && // Was playing in the last tick
        !isDevicePlaying && // Is NOT playing now on the device
        storeIsPlaying && // Store THOUGHT it should be playing (this implies user didn't pause)
        storeCurrentQuoteId &&
        !isTransitioningRef.current // Not already trying to transition
      ) {
        console.log(
          `AudioProvider: Track finished for Quote ID: ${storeCurrentQuoteId}. Device not playing. Store intended play: ${storeIsPlaying}.`
        );

        const currentPlaylist = store.currentPlaylist;
        const currentIndex = store.currentIndex;

        if (currentIndex < currentPlaylist.length - 1) {
          console.log(
            `AudioProvider: Initiating transition to next quote. Current Idx: ${currentIndex}, Playlist Len: ${currentPlaylist.length}`
          );
          isTransitioningRef.current = true; // Mark as actively transitioning
          store.nextQuote(); // This will attempt to load & play the next track.
          // It handles its own errors by setting store.isPlaying = false.
        } else {
          console.log(
            "AudioProvider: End of playlist reached after track finished. Stopping playback."
          );
          // isTransitioningRef is already false, no need to set it.
          // The sync logic (Scenario 3) will set isPlaying to false if it isn't already.
          if (storeIsPlaying) {
            // If store somehow still thinks it's playing
            usePlayerStore.setState({ isPlaying: false });
          }
        }
      }

      wasPlayingForTransitionRef.current = isDevicePlaying;
    };

    if (audioPlayer) {
      console.log("AudioProvider: Starting audio state monitoring interval.");
      const intervalId = setInterval(monitorAndHandleAudioState, 350); // Adjusted interval timing
      return () => {
        console.log("AudioProvider: Clearing audio state monitoring interval.");
        clearInterval(intervalId);
      };
    }
  }, [audioPlayer]); // Effect only re-runs if audioPlayer instance changes

  return <>{children}</>;
};
