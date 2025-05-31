import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Play, Pause, X } from 'lucide-react-native';
import { usePlayerStore } from '@/store/playerStore';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { useSettingsStore } from '@/store/settingsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MiniPlayer: React.FC = () => {
  const { currentQuote, isPlaying, pauseQuote, resumeQuote } = usePlayerStore();
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
  
  const tabBarHeight = Platform.select({
    ios: 65 + insets.bottom,
    android: 65,
    web: 70,
    default: 70,
  });
  
  return (
    <View style={[styles.container, { bottom: tabBarHeight + 8 }]}>
      <TouchableOpacity
        style={[
          styles.playerContainer, 
          { 
            backgroundColor: theme.card, 
            borderColor: theme.border,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: currentQuote.imageUrl }}
          style={styles.image}
          contentFit="cover"
        />
        <View style={styles.content}>
          <Text 
            style={[styles.text, { color: theme.text }]} 
            numberOfLines={1}
          >
            {currentQuote.text}
          </Text>
          <Text style={[styles.category, { color: theme.secondary }]}>
            {currentQuote.category}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          {isPlaying ? (
            <Pause size={18} color={theme.primary} />
          ) : (
            <Play size={18} color={theme.primary} />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 500,
  },
  playerContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 36,
    height: 36,
    borderRadius: 4,
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
    fontWeight: '500',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});