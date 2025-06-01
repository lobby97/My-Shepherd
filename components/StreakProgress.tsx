import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Flame, Target, Calendar } from 'lucide-react-native';

interface StreakProgressProps {
  onPress?: () => void;
}

export const StreakProgress: React.FC<StreakProgressProps> = ({ onPress }) => {
  const { streakData } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const progressPercentage = Math.min((streakData.todayProgress.quotesListened / 3) * 100, 100);
  const remaining = Math.max(3 - streakData.todayProgress.quotesListened, 0);
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Target size={20} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>Daily Progress</Text>
        </View>
        
        <View style={styles.streakContainer}>
          <Flame size={16} color="#FF6B35" />
          <Text style={[styles.streakText, { color: theme.text }]}>
            {streakData.currentStreak}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: streakData.todayProgress.completed ? '#4CAF50' : theme.primary,
                width: `${progressPercentage}%` 
              }
            ]} 
          />
        </View>
        
        <Text style={[styles.progressText, { color: theme.secondary }]}>
          {streakData.todayProgress.completed 
            ? "Goal completed! 🎉" 
            : `${remaining} more to complete daily goal`
          }
        </Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.text }]}>
            {streakData.todayProgress.quotesListened}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondary }]}>Today</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.text }]}>
            {streakData.longestStreak}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondary }]}>Best</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.text }]}>
            {streakData.totalDaysCompleted}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondary }]}>Total</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginLeft: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
});