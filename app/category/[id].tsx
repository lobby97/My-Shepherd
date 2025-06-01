import { colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { getCategoryObjects, getCommandsByCategory } from "@/lib/commandsData";
import { getImageAsset } from "@/lib/imageAssets";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, List, Pause, Play } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    addToHistory,
    currentQuote,
    isPlaying,
    playQuote,
    pauseQuote,
    resumeQuote,
  } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();

  const theme = isDarkMode ? colors.dark : colors.light;

  // Get categories and find the selected one
  const categories = getCategoryObjects();
  const category = categories.find((c) => c.id === id);

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Category not found
        </Text>
      </View>
    );
  }

  // Get commands for this category
  const categoryQuotes = getCommandsByCategory(category.name);

  const handleQuotePress = (quoteId: string) => {
    addToHistory(quoteId);
    router.push(`/quote/${quoteId}`);
  };

  const handlePlayPause = (quote: any) => {
    const isCurrentQuote = currentQuote?.id === quote.id;
    const isCurrentlyPlaying = isCurrentQuote && isPlaying;

    if (isCurrentQuote) {
      isPlaying ? pauseQuote() : resumeQuote();
    } else {
      playQuote(quote, categoryQuotes);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handlePlayAllCategory = () => {
    if (categoryQuotes.length > 0) {
      playQuote(categoryQuotes[0], categoryQuotes);
      router.push(`/quote/${categoryQuotes[0].id}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View
        style={[styles.customHeader, { backgroundColor: theme.background }]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.muted }]}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color={theme.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {category.name}
        </Text>
        <TouchableOpacity
          style={[styles.playAllButton, { backgroundColor: theme.primary }]}
          onPress={handlePlayAllCategory}
          activeOpacity={0.8}
        >
          <List size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.muted }]}>
          <Text style={styles.icon}>{category.icon}</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>
          {category.name}
        </Text>
        <Text style={[styles.description, { color: theme.secondary }]}>
          {category.description}
        </Text>
      </View>

      <View style={styles.teachingsContainer}>
        <View style={styles.teachingsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Teachings ({categoryQuotes.length})
          </Text>
        </View>

        {categoryQuotes.length > 0 ? (
          categoryQuotes.map((quote) => {
            const isCurrentQuote = currentQuote?.id === quote.id;
            const isCurrentlyPlaying = isCurrentQuote && isPlaying;

            return (
              <TouchableOpacity
                key={quote.id}
                style={[
                  styles.teachingItem,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => handleQuotePress(quote.id)}
                activeOpacity={0.7}
              >
                <Image
                  source={getImageAsset(quote.id)}
                  style={styles.teachingImage}
                  contentFit="cover"
                />
                <View style={styles.teachingContent}>
                  <Text
                    style={[styles.teachingText, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {quote.text}
                  </Text>
                  <Text
                    style={[
                      styles.teachingReference,
                      { color: theme.secondary },
                    ]}
                  >
                    {quote.reference}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.playButtonSmall,
                    { backgroundColor: theme.muted },
                  ]}
                  onPress={() => handlePlayPause(quote)}
                >
                  {isCurrentlyPlaying ? (
                    <Pause size={20} color={theme.primary} />
                  ) : (
                    <Play size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: theme.secondary }]}>
            No teachings found in this category
          </Text>
        )}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  playAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.quoteFont,
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: typography.sizes.md,
    textAlign: "center",
  },
  teachingsContainer: {
    paddingHorizontal: 16,
  },
  teachingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: "600",
  },
  teachingItem: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teachingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  teachingContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  teachingText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.quoteFont,
    marginBottom: 4,
    lineHeight: typography.sizes.md * 1.3,
  },
  teachingReference: {
    fontSize: typography.sizes.sm,
    fontStyle: "italic",
  },
  playButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: typography.sizes.md,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    textAlign: "center",
    marginTop: 100,
  },
  footer: {
    height: 180, // Extra space for bigger mini player and tab bar
  },
});
