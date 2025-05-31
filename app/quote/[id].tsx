import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Play, Pause, Heart, Share2 } from 'lucide-react-native';
import { quotes } from '@/mocks/quotes';
import { usePlayerStore } from '@/store/playerStore';
import { AudioWaveform } from '@/components/AudioWaveform';
import { typography } from '@/constants/typography';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { 
    currentQuote, 
    isPlaying, 
    playQuote, 
    pauseQuote, 
    resumeQuote, 
    toggleFavorite, 
    isFavorite,
    addToHistory
  } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const quote = quotes.find(q => q.id === id);
  
  if (!quote) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Quote not found</Text>
      </View>
    );
  }
  
  const isCurrentQuote = currentQuote?.id === quote.id;
  const isCurrentlyPlaying = isCurrentQuote && isPlaying;
  const isFavorited = isFavorite(quote.id);
  
  useEffect(() => {
    addToHistory(quote.id);
  }, [quote.id]);
  
  const handlePlayPause = () => {
    if (isCurrentQuote) {
      isPlaying ? pauseQuote() : resumeQuote();
    } else {
      playQuote(quote);
    }
  };
  
  const handleFavorite = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleFavorite(quote.id);
  };
  
  const handleShare = () => {
    // Share functionality would go here
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "",
          headerTransparent: true,
          headerStyle: {
            backgroundColor: 'rgba(0,0,0,0.3)',
          },
          headerTintColor: "#FFFFFF",
          headerBackTitle: "Back",
          headerTitleStyle: {
            color: "#FFFFFF",
          },
        }}
      />
      
      <Image 
        source={{ uri: quote.imageUrl }} 
        style={styles.backgroundImage}
        contentFit="cover"
      />
      
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
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
              style={[styles.favoriteButton, isFavorited && styles.favoriteActive]} 
              onPress={handleFavorite}
            >
              <Heart 
                size={24} 
                color="#FFFFFF" 
                fill={isFavorited ? '#E25822' : 'transparent'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.playButton} 
              onPress={handlePlayPause}
            >
              {isCurrentlyPlaying ? (
                <Pause size={32} color="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShare}
            >
              <Share2 size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
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

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    width,
    height,
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  categoryContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  category: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  quote: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xxl,
    fontFamily: typography.quoteFont,
    marginBottom: 16,
    lineHeight: typography.sizes.xxl * 1.4,
  },
  attribution: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  reference: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: typography.sizes.md,
    fontStyle: 'italic',
    marginBottom: 40,
  },
  playerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  shareButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformContainer: {
    marginTop: 20,
  },
  explanationContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
  },
  explanationTitle: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 12,
  },
  explanation: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * 1.6,
  },
  errorText: {
    fontSize: typography.sizes.lg,
    textAlign: 'center',
    marginTop: 100,
  },
});