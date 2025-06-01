import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getImageAsset } from "@/lib/imageAssets";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const MiniPlayer: React.FC = () => {
  const {
    currentQuote,
    isPlaying,
    currentPlaylist,
    pauseQuote,
    resumeQuote,
    nextQuote,
    previousQuote,
  } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = isDarkMode ? colors.dark : colors.light;

  if (!currentQuote) return null;

  const handlePlayPause = () => {
    isPlaying ? pauseQuote() : resumeQuote();
  };

  const handlePress = () => {
    router.push(`/quote/${currentQuote.id}`);
  };

  const handleNext = () => {
    nextQuote();
  };

  const handlePrevious = () => {
    previousQuote();
  };

  const tabBarHeight = Platform.select({
    ios: 65 + insets.bottom,
    android: 65,
    web: 70,
    default: 70,
  });

  const showPlaylistControls = currentPlaylist.length > 1;

  return (
    <View style={[styles.container, { bottom: tabBarHeight + 8 }]}>
      <TouchableOpacity
        style={[
          styles.playerContainer,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Image
          source={getImageAsset(currentQuote.id)}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.content}>
          <Text style={[styles.text, { color: theme.text }]} numberOfLines={1}>
            {currentQuote.text}
          </Text>
          <Text style={[styles.category, { color: theme.secondary }]}>
            {currentQuote.category}
          </Text>
        </View>

        <View style={styles.controls}>
          {showPlaylistControls && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePrevious}
            >
              <SkipBack size={16} color={theme.primary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            {isPlaying ? (
              <Pause size={18} color={theme.primary} />
            ) : (
              <Play size={18} color={theme.primary} />
            )}
          </TouchableOpacity>

          {showPlaylistControls && (
            <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
              <SkipForward size={16} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 500,
  },
  playerContainer: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.quoteFont,
    marginBottom: 2,
  },
  category: {
    fontSize: typography.sizes.xs,
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
});
