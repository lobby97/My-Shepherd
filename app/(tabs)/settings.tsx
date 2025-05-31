import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { usePlayerStore } from '@/store/playerStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Moon, Sun, Music, Bell, Info, Heart, Play, Star, Coffee } from 'lucide-react-native';
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
        <TouchableOpacity style={styles.aboutRow}>
          <Info size={22} color={theme.text} style={styles.settingIcon} />
          <Text style={[styles.aboutText, { color: theme.text }]}>About</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.supportButton, { backgroundColor: theme.primary }]} activeOpacity={0.8}>
          <View style={styles.supportContent}>
            <View style={styles.supportIconContainer}>
              <Coffee size={20} color="#FFFFFF" />
              <Star size={16} color="#FFFFFF" style={styles.starIcon} />
            </View>
            <View style={styles.supportTextContainer}>
              <Text style={styles.supportTitle}>Pledge your Support</Text>
              <Text style={styles.supportSubtitle}>Help us keep this app free and growing</Text>
            </View>
            <Heart size={20} color="#FFFFFF" />
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
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  aboutText: {
    fontSize: typography.sizes.md,
  },
  supportButton: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportIconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  starIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  supportSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: typography.sizes.sm,
    fontWeight: '500',
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