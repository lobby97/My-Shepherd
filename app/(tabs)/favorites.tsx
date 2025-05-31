import { QuoteCard } from "@/components/QuoteCard";
import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getProcessedCommands } from "@/lib/commandsData";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Quote } from "@/types";
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

// Use processed commands with local assets
const quotes = getProcessedCommands() as Quote[];

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, addToHistory, playQuote } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();
  const insets = useSafeAreaInsets();

  const theme = isDarkMode ? colors.dark : colors.light;

  const favoriteQuotes = quotes.filter((quote) => favorites.includes(quote.id));

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

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BookmarkIcon size={32} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Favorites</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.secondary }]}>
          Your saved teachings
        </Text>
      </View>

      {favoriteQuotes.length > 0 ? (
        <>
          <TouchableOpacity
            style={[
              styles.playAllCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={handlePlayAllFavorites}
            activeOpacity={0.8}
          >
            <View
              style={[styles.playAllIcon, { backgroundColor: theme.primary }]}
            >
              <Play size={24} color="#FFFFFF" />
            </View>
            <View style={styles.playAllContent}>
              <Text style={[styles.playAllTitle, { color: theme.text }]}>
                Play All Favorites
              </Text>
              <Text
                style={[styles.playAllSubtitle, { color: theme.secondary }]}
              >
                Listen to your {favoriteQuotes.length} favorite teachings
              </Text>
            </View>
          </TouchableOpacity>

          {favoriteQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              onPress={() => handleQuotePress(quote.id)}
            />
          ))}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <BookmarkIcon size={64} color={theme.muted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Favorites Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
            Tap the heart icon on any teaching to add it to your favorites
          </Text>
        </View>
      )}

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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playAllCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 20,
  },
  playAllIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  playAllContent: {
    marginLeft: 12,
  },
  playAllTitle: {
    fontSize: typography.sizes.md,
    fontWeight: "600",
    marginBottom: 4,
  },
  playAllSubtitle: {
    fontSize: typography.sizes.sm,
  },
  content: {
    paddingBottom: 180, // Extra space for bigger mini player and tab bar
  },
});
