import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { QuoteCard } from '@/components/QuoteCard';
import { quotes } from '@/mocks/quotes';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Shuffle } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useSettingsStore();
  const { history, addToHistory, playQuote } = usePlayerStore();
  const insets = useSafeAreaInsets();
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  // Get a random quote for the daily feature
  const dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Get recent quotes from history
  const recentQuotes = history
    .slice(0, 5)
    .map(id => quotes.find(q => q.id === id))
    .filter(Boolean);
  
  const handleQuotePress = (id: string) => {
    addToHistory(id);
    router.push(`/quote/${id}`);
  };

  const handlePlayAll = () => {
    // Start playing from the first quote with all quotes as playlist
    playQuote(quotes[0], quotes);
    router.push(`/quote/${quotes[0].id}`);
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Voice of the Shepherd</Text>
        <Text style={[styles.subtitle, { color: theme.secondary }]}>
          Today's Word
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.dailyContainer}
        onPress={() => handleQuotePress(dailyQuote.id)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: dailyQuote.imageUrl }} 
          style={styles.dailyImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
        <View style={styles.dailyContent}>
          <View style={styles.dailyBadge}>
            <Text style={styles.dailyBadgeText}>Daily Quote</Text>
          </View>
          <Text style={styles.dailyQuote}>{dailyQuote.text}</Text>
          <Text style={styles.dailyReference}>{dailyQuote.reference}</Text>
        </View>
      </TouchableOpacity>

      {/* Play All Section */}
      <View style={styles.playAllSection}>
        <TouchableOpacity 
          style={[styles.playAllCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={handlePlayAll}
          activeOpacity={0.8}
        >
          <View style={[styles.playAllIconContainer, { backgroundColor: theme.primary }]}>
            <Shuffle size={24} color="#FFFFFF" />
          </View>
          <View style={styles.playAllContent}>
            <Text style={[styles.playAllTitle, { color: theme.text }]}>Play All Teachings</Text>
            <Text style={[styles.playAllSubtitle, { color: theme.secondary }]}>
              Listen to all {quotes.length} teachings in sequence
            </Text>
          </View>
          <View style={[styles.playAllButton, { backgroundColor: theme.primary }]}>
            <Play size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Teachings</Text>
        {quotes.slice(0, 3).map(quote => (
          <QuoteCard 
            key={quote.id} 
            quote={quote} 
            onPress={() => handleQuotePress(quote.id)}
          />
        ))}
      </View>
      
      {recentQuotes.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recently Viewed</Text>
          {recentQuotes.map(quote => (
            <QuoteCard 
              key={quote?.id} 
              quote={quote!} 
              compact 
              onPress={() => handleQuotePress(quote!.id)}
            />
          ))}
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
  title: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.quoteFont,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: 16,
  },
  dailyContainer: {
    height: 240,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  dailyImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  dailyContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  dailyBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dailyBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  dailyQuote: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
    fontFamily: typography.quoteFont,
    marginBottom: 8,
    lineHeight: typography.sizes.lg * 1.4,
  },
  dailyReference: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
  },
  playAllSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  playAllCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playAllIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  playAllContent: {
    flex: 1,
  },
  playAllTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  playAllSubtitle: {
    fontSize: typography.sizes.sm,
  },
  playAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  footer: {
    height: 20,
  },
});