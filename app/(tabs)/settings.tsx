import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Moon, Sun, Music, Bell, Info, Heart } from 'lucide-react-native';

export default function SettingsScreen() {
  const { 
    isDarkMode, 
    playbackSpeed, 
    enableBackgroundMusic, 
    dailyNotifications,
    toggleDarkMode,
    setPlaybackSpeed,
    toggleBackgroundMusic,
    toggleDailyNotifications
  } = useSettingsStore();
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const playbackOptions = [0.75, 1.0, 1.25, 1.5];
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.section, { borderBottomColor: theme.border }]}>
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
            <Bell size={22} color={theme.text} style={styles.settingIcon} />
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Daily Notifications
            </Text>
          </View>
          <Switch
            value={dailyNotifications}
            onValueChange={toggleDailyNotifications}
            trackColor={{ false: '#767577', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>
      
      <View style={[styles.section, { borderBottomColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
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
      </View>
      
      <View style={styles.section}>
        <TouchableOpacity style={styles.aboutRow}>
          <Info size={22} color={theme.text} style={styles.settingIcon} />
          <Text style={[styles.aboutText, { color: theme.text }]}>About</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.aboutRow}>
          <Heart size={22} color={theme.text} style={styles.settingIcon} />
          <Text style={[styles.aboutText, { color: theme.text }]}>Support</Text>
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
    padding: 16,
    paddingBottom: 120, // Extra space for mini player
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 16,
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
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: typography.sizes.md,
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
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutText: {
    fontSize: typography.sizes.md,
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