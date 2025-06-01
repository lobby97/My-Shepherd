import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getImageAsset } from "@/lib/imageAssets";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Quote } from "@/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Pause, Play } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface QuoteCardProps {
  quote: Quote;
  onPress?: () => void;
  compact?: boolean;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onPress,
  compact = false,
}) => {
  const {
    currentQuote,
    isPlaying,
    playQuote,
    pauseQuote,
    resumeQuote,
    toggleFavorite,
    isFavorite,
  } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();

  const theme = isDarkMode ? colors.dark : colors.light;

  const isCurrentQuote = currentQuote?.id === quote.id;
  const isCurrentlyPlaying = isCurrentQuote && isPlaying;
  const isFavorited = isFavorite(quote.id);

  const handlePlayPause = () => {
    if (isCurrentQuote) {
      isPlaying ? pauseQuote() : resumeQuote();
    } else {
      playQuote(quote);
    }
  };

  const handleFavorite = () => {
    toggleFavorite(quote.id);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: theme.card }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={getImageAsset(quote.id)}
          style={styles.compactImage}
          contentFit="cover"
        />
        <View style={styles.compactContent}>
          <Text
            style={[styles.compactText, { color: theme.text }]}
            numberOfLines={2}
          >
            {quote.text}
          </Text>
          <Text style={[styles.compactCategory, { color: theme.secondary }]}>
            {quote.category}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.compactPlayButton}
          onPress={handlePlayPause}
        >
          {isCurrentlyPlaying ? (
            <Pause size={20} color={theme.text} />
          ) : (
            <Play size={20} color={theme.text} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={getImageAsset(quote.id)}
        style={styles.image}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{quote.category}</Text>
        </View>
        <Text style={styles.quote}>{quote.text}</Text>
        <Text style={styles.attribution}>{quote.attribution}</Text>
        <Text style={styles.reference}>{quote.reference}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorited && styles.favoriteActive,
            ]}
            onPress={handleFavorite}
          >
            <Heart
              size={24}
              color={isFavorited ? "#E25822" : "#FFFFFF"}
              fill={isFavorited ? "#E25822" : "transparent"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            {isCurrentlyPlaying ? (
              <Pause size={28} color="#FFFFFF" />
            ) : (
              <Play size={28} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
    marginVertical: 8,
    height: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  categoryContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  category: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: "600",
  },
  quote: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xl,
    fontFamily: typography.quoteFont,
    marginBottom: 12,
    lineHeight: typography.sizes.xl * 1.4,
  },
  attribution: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  reference: {
    color: "rgba(255,255,255,0.8)",
    fontSize: typography.sizes.sm,
    fontStyle: "italic",
    marginBottom: 20,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    position: "absolute",
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  compactContainer: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    marginVertical: 6,
    height: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 80,
    height: 80,
  },
  compactContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  compactText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.quoteFont,
    marginBottom: 4,
  },
  compactCategory: {
    fontSize: typography.sizes.xs,
    fontWeight: "500",
  },
  compactPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
});
