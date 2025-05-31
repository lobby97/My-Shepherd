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

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useSettingsStore();
  const { history, addToHistory } = usePlayerStore();
  
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
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
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
    paddingBottom: 120, // Extra space for mini player
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