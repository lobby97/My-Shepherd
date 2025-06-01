import { usePlayerStore } from "@/store/playerStore";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useRef } from "react";

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer();
  const setAudioPlayer = usePlayerStore((state) => state.setAudioPlayer);
  const wasPlayingRef = useRef(false);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    console.log(
      "AudioProvider: Initializing. AudioPlayer available:",
      !!audioPlayer
    );
    setAudioPlayer(audioPlayer);
  }, [audioPlayer, setAudioPlayer]);

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
        wasPlayingRef.current && // Was playing in the last tick
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

      wasPlayingRef.current = isDevicePlaying;
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
