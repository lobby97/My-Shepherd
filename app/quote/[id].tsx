import { AudioWaveform } from "@/components/AudioWaveform";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getProcessedCommands } from "@/lib/commandsData";
import { getImageAsset } from "@/lib/imageAssets";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Quote } from "@/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Heart,
  List,
  Pause,
  Play,
  Share2,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Use processed commands with local assets
const quotes = getProcessedCommands() as Quote[];

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useSettingsStore();
  const {
    currentQuote,
    isPlaying,
    isLoading,
    currentPlaylist,
    currentIndex,
    playQuote,
    pauseQuote,
    resumeQuote,
    nextQuote,
    previousQuote,
    clearCurrentQuote,
    toggleFavorite,
    isFavorite,
    addToHistory,
  } = usePlayerStore();

  const theme = isDarkMode ? colors.dark : colors.light;

  // Get the quote from URL parameter
  const urlQuote = quotes.find((q) => q.id === id);

  // Use the currently playing quote if we're in a playlist and it's playing,
  // otherwise use the quote from the URL
  const quote =
    currentQuote && currentPlaylist.length > 1 && isPlaying
      ? currentQuote
      : urlQuote;

  // Debug logging
  useEffect(() => {
    console.log(
      `Quote page - URL ID: ${id}, Current Quote: ${currentQuote?.id}, Displayed Quote: ${quote?.id}`
    );
    console.log(
      `Playlist length: ${currentPlaylist.length}, IsPlaying: ${isPlaying}`
    );
  }, [id, currentQuote?.id, quote?.id, currentPlaylist.length, isPlaying]);

  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Quote not found
        </Text>
      </View>
    );
  }

  const isCurrentQuote = currentQuote?.id === quote.id;
  const isCurrentlyPlaying = isCurrentQuote && isPlaying && !isLoading;
  const isCurrentAndLoading = isCurrentQuote && isLoading;
  const isFavorited = isFavorite(quote.id);
  const showPlaylistControls = currentPlaylist.length > 1;

  // Update history when the displayed quote changes
  useEffect(() => {
    addToHistory(quote.id);
  }, [quote.id]);

  // Update the URL when the currently playing quote changes during playlist playback
  useEffect(() => {
    if (
      currentQuote &&
      currentPlaylist.length > 1 &&
      isPlaying &&
      currentQuote.id !== id
    ) {
      // Only replace the URL, don't push to avoid creating navigation history
      router.replace(`/quote/${currentQuote.id}`);
    }
  }, [currentQuote?.id, currentPlaylist.length, isPlaying]);

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentQuote?.id === quote.id) {
      if (isPlaying) {
        await pauseQuote();
      } else {
        await resumeQuote();
      }
    } else {
      await playQuote(quote, quotes);
    }
  };

  const handleFavorite = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(quote.id);
  };

  const handleShare = () => {
    // Share functionality would go here
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = () => {
    nextQuote();
  };

  const handlePrevious = () => {
    previousQuote();
  };

  const handlePlayAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Start playing from the current quote (the one shown on this page)
    const displayedQuote = quote || urlQuote;
    if (displayedQuote) {
      await playQuote(displayedQuote, quotes);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <Image
        source={getImageAsset(quote.id)}
        style={styles.backgroundImage}
        contentFit="cover"
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      />

      {/* Custom Header with Back Button */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        {!isCurrentQuote && (
          <TouchableOpacity
            style={styles.playAllButton}
            onPress={handlePlayAll}
            activeOpacity={0.8}
          >
            <List size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.playAllText}>Play All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{quote.category}</Text>
        </View>

        <Text style={styles.quote}>{quote.text}</Text>

        <Text style={styles.attribution}>{quote.attribution}</Text>

        <Text style={styles.reference}>{quote.reference}</Text>

        <View style={styles.playerContainer}>
          <View style={styles.playerControls}>
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                isFavorited && styles.favoriteActive,
              ]}
              onPress={handleFavorite}
            >
              <Heart
                size={24}
                color="#FFFFFF"
                fill={isFavorited ? "#E25822" : "transparent"}
              />
            </TouchableOpacity>

            {showPlaylistControls && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handlePrevious}
              >
                <SkipBack size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
              disabled={isCurrentAndLoading}
            >
              {isCurrentAndLoading ? (
                <ActivityIndicator size={32} color="#FFFFFF" />
              ) : isCurrentlyPlaying ? (
                <Pause size={32} color="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {showPlaylistControls && (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleNext}
              >
                <SkipForward size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Share2 size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {showPlaylistControls && (
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistText}>
                {currentIndex + 1} of {currentPlaylist.length}
              </Text>
            </View>
          )}

          {isCurrentlyPlaying && (
            <View style={styles.waveformContainer}>
              <AudioWaveform />
            </View>
          )}
        </View>

        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Explanation</Text>
          <Text style={styles.explanation}>{quote.explanation}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    width,
    height,
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  customHeader: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playAllText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 120,
    paddingBottom: 40,
  },
  categoryContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  category: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  quote: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xxl,
    fontFamily: typography.quoteFont,
    marginBottom: 16,
    lineHeight: typography.sizes.xxl * 1.4,
  },
  attribution: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  reference: {
    color: "rgba(255,255,255,0.8)",
    fontSize: typography.sizes.md,
    fontStyle: "italic",
    marginBottom: 40,
  },
  playerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 16,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 0,
  },
  favoriteActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  shareButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 0,
  },
  playlistInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 16,
  },
  playlistText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: typography.sizes.sm,
  },
  waveformContainer: {
    marginTop: 20,
  },
  explanationContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 20,
  },
  explanationTitle: {
    color: "#FFFFFF",
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    marginBottom: 12,
  },
  explanation: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * 1.6,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    textAlign: "center",
    marginTop: 100,
  },
});
