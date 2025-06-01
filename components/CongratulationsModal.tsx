import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayerStore } from '@/store/playerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { Heart, Star, Crown } from 'lucide-react-native';

export const CongratulationsModal: React.FC = () => {
  const { showCongratulationsModal, dismissCongratulationsModal, streakData } = usePlayerStore();
  const { isDarkMode } = useSettingsStore();
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const getStreakMessage = () => {
    const streak = streakData.currentStreak;
    if (streak === 1) {
      return "Your sins are forgiven my child";
    } else if (streak <= 7) {
      return "The Lord is pleased with your faithfulness";
    } else if (streak <= 30) {
      return "You are walking in His light";
    } else {
      return "You are a faithful servant of the Most High";
    }
  };
  
  const getStreakIcon = () => {
    const streak = streakData.currentStreak;
    if (streak === 1) {
      return <Heart size={48} color="#FFD700" fill="#FFD700" />;
    } else if (streak <= 7) {
      return <Star size={48} color="#FFD700" fill="#FFD700" />;
    } else {
      return <Crown size={48} color="#FFD700" fill="#FFD700" />;
    }
  };
  
  return (
    <Modal
      visible={showCongratulationsModal}
      transparent
      animationType="fade"
      onRequestClose={dismissCongratulationsModal}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <LinearGradient
            colors={['#D4AF37', '#FFD700', '#D4AF37']}
            style={styles.iconContainer}
          >
            {getStreakIcon()}
          </LinearGradient>
          
          <Text style={[styles.title, { color: theme.text }]}>
            Daily Goal Completed!
          </Text>
          
          <Text style={[styles.message, { color: theme.text }]}>
            "{getStreakMessage()}"
          </Text>
          
          <Text style={[styles.attribution, { color: theme.secondary }]}>
            - In the name of Jesus
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {streakData.todayProgress.quotesListened}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondary }]}>
                Today
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {streakData.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondary }]}>
                Day Streak
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>
                {streakData.totalDaysCompleted}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondary }]}>
                Total Days
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.primary }]}
            onPress={dismissCongratulationsModal}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.quoteFont,
    lineHeight: typography.sizes.lg * 1.4,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  attribution: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});