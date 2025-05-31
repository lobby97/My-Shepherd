import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlayerStore } from '@/store/playerStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Moon, Sun, Music, Bell, Heart, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationService } from '@/services/notificationService';
import { NotificationTimeManager } from '@/components/NotificationTimeManager';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const { 
    isDarkMode, 
    playbackSpeed, 
    enableBackgroundMusic, 
    dailyNotifications,
    notificationTimes,
    toggleDarkMode,
    setPlaybackSpeed,
    toggleBackgroundMusic,
    toggleDailyNotifications
  } = useSettingsStore();
  
  const {
    isAutoPlayEnabled,
    autoPlayMode,
    toggleAutoPlay,
    setAutoPlayMode
  } = usePlayerStore();
  
  const insets = useSafeAreaInsets();
  const [notificationCount, setNotificationCount] = useState(0);
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const playbackOptions = [0.75, 1.0, 1.25, 1.5];
  const autoPlayModes = [
    { value: 'all', label: 'All Teachings' },
    { value: 'category', label: 'Current Category' },
    { value: 'favorites', label: 'Favorites Only' }
  ];

  useEffect(() => {
    // Check scheduled notifications count
    const checkNotifications = async () => {
      const scheduled = await NotificationService.getScheduledNotifications();
      setNotificationCount(scheduled.length);
    };
    
    checkNotifications();
  }, [dailyNotifications, notificationTimes]);

  const handleNotificationToggle = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Available',
        'Notifications are not supported on web browsers.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!dailyNotifications) {
      // About to enable notifications
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily quotes.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    await toggleDailyNotifications();
  };
  
  const enabledNotificationTimes = notificationTimes.filter(t => t.enabled);
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.secondary }]}>
          Customize your experience
        </Text>
      </View>
      
      <View style={[styles.section, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Appearance
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            {isDarkMode ? (
              <Moon size={22} color={theme.text} style={styles.settingIcon} />
            ) : (
              <Sun size={22} color={theme.text} style={styles.settingIcon} />
            )}
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      <View style={[styles.section, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Audio & Playback
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Music size={22} color={theme.text} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Background Music
            </Text>
          </View>
          <Switch
            value={enableBackgroundMusic}
            onValueChange={toggleBackgroundMusic}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Play size={22} color={theme.text} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Auto-play
            </Text>
          </View>
          <Switch
            value={isAutoPlayEnabled}
            onValueChange={toggleAutoPlay}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        <Text style={[styles.subSectionTitle, { color: theme.text }]}>
          Playback Speed
        </Text>
        <View style={styles.speedOptions}>
          {playbackOptions.map(speed => (
            <TouchableOpacity
              key={speed}
              style={[
                styles.speedOption,
                playbackSpeed === speed && [styles.speedOptionActive, { backgroundColor: theme.primary }]
              ]}
              onPress={() => setPlaybackSpeed(speed)}
            >
              <Text
                style={[
                  styles.speedText,
                  playbackSpeed === speed ? styles.speedTextActive : { color: theme.text }
                ]}
              >
                {speed}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={[styles.subSectionTitle, { color: theme.text }]}>
          Auto-play Mode
        </Text>
        <View style={styles.autoPlayModes}>
          {autoPlayModes.map(mode => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.autoPlayModeOption,
                { borderColor: theme.border },
                autoPlayMode === mode.value && [styles.autoPlayModeActive, { backgroundColor: theme.primary }]
              ]}
              onPress={() => setAutoPlayMode(mode.value as 'all' | 'category' | 'favorites')}
            >
              <Text
                style={[
                  styles.autoPlayModeText,
                  autoPlayMode === mode.value ? styles.autoPlayModeTextActive : { color: theme.text }
                ]}
              >
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={[styles.section, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Notifications
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLabelContainer}>
            <Bell size={22} color={theme.text} style={styles.settingIcon} />
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                Daily Notifications
              </Text>
              {Platform.OS !== 'web' && dailyNotifications && (
                <Text style={[styles.settingSubtext, { color: theme.secondary }]}>
                  {enabledNotificationTimes.length} times scheduled
                </Text>
              )}
              {Platform.OS === 'web' && (
                <Text style={[styles.settingSubtext, { color: theme.secondary }]}>
                  Not available on web
                </Text>
              )}
            </View>
          </View>
          <Switch
            value={dailyNotifications && Platform.OS !== 'web'}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor="#FFFFFF"
            disabled={Platform.OS === 'web'}
          />
        </View>
        
        {Platform.OS !== 'web' && dailyNotifications && (
          <NotificationTimeManager isDarkMode={isDarkMode} />
        )}
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.supportButton, { backgroundColor: theme.primary }]} 
          activeOpacity={0.8}
        >
          <View style={styles.supportContent}>
            <View style={styles.supportIconContainer}>
              <View style={[styles.heartIconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Heart size={32} color="#FFFFFF" fill="rgba(255,255,255,0.3)" />
              </View>
            </View>
            
            <View style={styles.supportTextContainer}>
              <Text style={styles.supportTitle}>Pledge Your Support</Text>
              <Text style={styles.supportDescription}>
                Help us keep this app free, ad-free, and growing with new features. Your support makes a real difference in bringing God's word to more hearts.
              </Text>
              
              <View style={styles.supportFeatures}>
                <Text style={styles.supportFeature}>• Keep the app completely free</Text>
                <Text style={styles.supportFeature}>• Add more teachings and categories</Text>
                <Text style={styles.supportFeature}>• Improve audio quality and features</Text>
              </View>
              
              <View style={styles.supportCta}>
                <Text style={styles.supportCtaText}>Every contribution counts 🙏</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.version, { color: theme.secondary }]}>
        Version 1.0.0
      </Text>
      
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
  },
  settingSubtext: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  speedOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  speedOptionActive: {
    backgroundColor: '#223C63',
  },
  speedText: {
    fontSize: typography.sizes.md,
  },
  speedTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  autoPlayModes: {
    gap: 8,
  },
  autoPlayModeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  autoPlayModeActive: {
    backgroundColor: '#223C63',
  },
  autoPlayModeText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  autoPlayModeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  supportButton: {
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  supportContent: {
    padding: 28,
  },
  supportIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heartIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  supportTextContainer: {
    alignItems: 'center',
  },
  supportTitle: {
    color: '#FFFFFF',
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: typography.quoteFont,
  },
  supportDescription: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * 1.6,
    marginBottom: 24,
    textAlign: 'center',
  },
  supportFeatures: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  supportFeature: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.sizes.sm,
    marginBottom: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  supportCta: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  supportCtaText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    marginTop: 16,
  },
  footer: {
    height: 20,
  },
});