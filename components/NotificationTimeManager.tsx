import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Plus, Clock, Trash2, Edit3, RotateCcw } from 'lucide-react-native';
import { useSettingsStore, NotificationTime } from '@/store/settingsStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

interface NotificationTimeManagerProps {
  isDarkMode: boolean;
}

export const NotificationTimeManager: React.FC<NotificationTimeManagerProps> = ({ isDarkMode }) => {
  const { 
    notificationTimes, 
    addNotificationTime, 
    removeNotificationTime, 
    toggleNotificationTime,
    updateNotificationTime,
    resetToDefaultTimes
  } = useSettingsStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTime, setEditingTime] = useState<NotificationTime | null>(null);
  const [newHour, setNewHour] = useState('8');
  const [newMinute, setNewMinute] = useState('0');
  const [newLabel, setNewLabel] = useState('');
  
  const theme = isDarkMode ? colors.dark : colors.light;
  
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };
  
  const handleAddTime = () => {
    const hour = parseInt(newHour);
    const minute = parseInt(newMinute);
    
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      Alert.alert('Invalid Time', 'Please enter a valid time (0-23 hours, 0-59 minutes)');
      return;
    }
    
    if (!newLabel.trim()) {
      Alert.alert('Missing Label', 'Please enter a label for this notification');
      return;
    }
    
    addNotificationTime(hour, minute, newLabel.trim());
    setShowAddModal(false);
    setNewHour('8');
    setNewMinute('0');
    setNewLabel('');
  };
  
  const handleEditTime = (time: NotificationTime) => {
    setEditingTime(time);
    setNewHour(time.hour.toString());
    setNewMinute(time.minute.toString());
    setNewLabel(time.label);
    setShowAddModal(true);
  };
  
  const handleUpdateTime = () => {
    if (!editingTime) return;
    
    const hour = parseInt(newHour);
    const minute = parseInt(newMinute);
    
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      Alert.alert('Invalid Time', 'Please enter a valid time (0-23 hours, 0-59 minutes)');
      return;
    }
    
    if (!newLabel.trim()) {
      Alert.alert('Missing Label', 'Please enter a label for this notification');
      return;
    }
    
    updateNotificationTime(editingTime.id, hour, minute, newLabel.trim());
    setShowAddModal(false);
    setEditingTime(null);
    setNewHour('8');
    setNewMinute('0');
    setNewLabel('');
  };
  
  const handleRemoveTime = (time: NotificationTime) => {
    Alert.alert(
      'Remove Notification',
      `Are you sure you want to remove "${time.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeNotificationTime(time.id) }
      ]
    );
  };
  
  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'This will replace all your custom notification times with the default times (8 AM, 12 PM, 8 PM). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetToDefaultTimes }
      ]
    );
  };
  
  const closeModal = () => {
    setShowAddModal(false);
    setEditingTime(null);
    setNewHour('8');
    setNewMinute('0');
    setNewLabel('');
  };
  
  const enabledCount = notificationTimes.filter(t => t.enabled).length;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Notification Times ({enabledCount} active)
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: theme.muted }]}
            onPress={handleResetToDefaults}
          >
            <RotateCcw size={16} color={theme.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.timesList} showsVerticalScrollIndicator={false}>
        {notificationTimes.map(time => (
          <View key={time.id} style={[styles.timeItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
              style={styles.timeContent}
              onPress={() => toggleNotificationTime(time.id)}
            >
              <View style={styles.timeInfo}>
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {formatTime(time.hour, time.minute)}
                </Text>
                <Text style={[styles.labelText, { color: theme.secondary }]}>
                  {time.label}
                </Text>
              </View>
              <View style={[
                styles.enabledIndicator,
                { backgroundColor: time.enabled ? theme.primary : theme.muted }
              ]}>
                {time.enabled && <View style={styles.enabledDot} />}
              </View>
            </TouchableOpacity>
            
            <View style={styles.timeActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.muted }]}
                onPress={() => handleEditTime(time)}
              >
                <Edit3 size={14} color={theme.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.muted }]}
                onPress={() => handleRemoveTime(time)}
              >
                <Trash2 size={14} color={theme.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingTime ? 'Edit Notification' : 'Add Notification Time'}
            </Text>
            
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Hour (0-23)</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: theme.muted, color: theme.text }]}
                  value={newHour}
                  onChangeText={setNewHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <Text style={[styles.timeSeparator, { color: theme.text }]}>:</Text>
              <View style={styles.timeInputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Minute (0-59)</Text>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: theme.muted, color: theme.text }]}
                  value={newMinute}
                  onChangeText={setNewMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>
            
            <View style={styles.labelInputContainer}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Label</Text>
              <TextInput
                style={[styles.labelInput, { backgroundColor: theme.muted, color: theme.text }]}
                value={newLabel}
                onChangeText={setNewLabel}
                placeholder="e.g., Morning Prayer"
                placeholderTextColor={theme.secondary}
                maxLength={30}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.muted }]}
                onPress={closeModal}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={editingTime ? handleUpdateTime : handleAddTime}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {editingTime ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timesList: {
    maxHeight: 200,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  timeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  labelText: {
    fontSize: typography.sizes.sm,
  },
  enabledIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  enabledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  timeActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    marginBottom: 8,
  },
  timeInput: {
    width: 60,
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  labelInputContainer: {
    marginBottom: 20,
  },
  labelInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: typography.sizes.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});