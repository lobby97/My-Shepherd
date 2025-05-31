import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getImageAsset } from "@/lib/imageAssets";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const MiniPlayer: React.FC = () => {
  const { isDarkMode } = useSettingsStore();
  const {
    currentQuote,
    isPlaying,
    isLoading,
    currentPlaylist,
    currentIndex,
    pauseQuote,
    resumeQuote,
    nextQuote,
    previousQuote,
    clearCurrentQuote,
  } = usePlayerStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = isDarkMode ? colors.dark : colors.light;

  if (!currentQuote) return null;

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) {
      await pauseQuote();
    } else {
      await resumeQuote();
    }
  };

  const handlePress = () => {
    if (currentQuote) {
      router.push(`/quote/${currentQuote.id}`);
    }
  };

  const handleNext = () => {
    if (currentPlaylist.length > 1) {
      nextQuote();
    }
  };

  const handlePrevious = () => {
    if (currentPlaylist.length > 1) {
      previousQuote();
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await clearCurrentQuote();
  };

  const tabBarHeight = Platform.select({
    ios: 65 + insets.bottom,
    android: 65,
    web: 70,
    default: 70,
  });

  const showPlaylistControls = currentPlaylist.length > 1;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: tabBarHeight + 8,
          backgroundColor: theme.card,
          borderTopColor: theme.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image
          source={getImageAsset(currentQuote.id)}
          style={styles.image}
          contentFit="cover"
        />

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {currentQuote.text}
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.secondary }]}
            numberOfLines={1}
          >
            {currentQuote.category}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size={24} color={theme.text} />
          ) : isPlaying ? (
            <Pause size={24} color={theme.text} />
          ) : (
            <Play size={24} color={theme.text} />
          )}
        </TouchableOpacity>

        {showPlaylistControls && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePrevious}
          >
            <SkipBack size={20} color={theme.text} />
          </TouchableOpacity>
        )}

        {showPlaylistControls && (
          <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
            <SkipForward size={20} color={theme.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
          <X size={20} color={theme.secondary} />
        </TouchableOpacity>
      </View>
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
    borderTopWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    flex: 1,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.quoteFont,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    fontWeight: "500",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
});
