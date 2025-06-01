import { QuoteCard } from "@/components/QuoteCard";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getProcessedCommands, JesusCommand } from "@/lib/commandsData";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useRouter } from "expo-router";
import { BookmarkIcon, Play } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, addToHistory, playQuote } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();
  const insets = useSafeAreaInsets();

  const theme = isDarkMode ? colors.dark : colors.light;

  // Get processed commands with local assets
  const quotes = getProcessedCommands();

  const favoriteQuotes = quotes.filter((quote: JesusCommand) =>
    favorites.includes(quote.id)
  );

  const handleQuotePress = (id: string) => {
    addToHistory(id);
    router.push(`/quote/${id}`);
  };

  const handlePlayAllFavorites = () => {
    if (favoriteQuotes.length > 0) {
      playQuote(favoriteQuotes[0], favoriteQuotes);
      router.push(`/quote/${favoriteQuotes[0].id}`);
    }
  };

  if (favoriteQuotes.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
          <Text style={[styles.subtitle, { color: theme.secondary }]}>
            Your saved teachings
          </Text>
        </View>

        <View style={styles.emptyContent}>
          <BookmarkIcon size={64} color={theme.secondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
            Tap the heart icon on any quote to add it to your favorites
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
            <Text style={[styles.subtitle, { color: theme.secondary }]}>
              Your saved teachings
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.playAllButton, { backgroundColor: theme.primary }]}
            onPress={handlePlayAllFavorites}
            activeOpacity={0.8}
          >
            <Play size={16} color="#FFFFFF" />
            <Text style={styles.playAllButtonText}>Play All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {favoriteQuotes.map((quote: JesusCommand) => (
        <QuoteCard
          key={quote.id}
          quote={quote}
          onPress={() => handleQuotePress(quote.id)}
        />
      ))}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180, // Extra space for bigger mini player and tab bar
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.quoteFont,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: 16,
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playAllButtonText: {
    color: "#FFFFFF",
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    height: 20,
  },
});
