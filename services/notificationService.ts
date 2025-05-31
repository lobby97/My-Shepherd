import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { quotes } from '@/mocks/quotes';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  static async scheduleDailyNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web');
      return;
    }

    try {
      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      // Morning notification (8 AM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Morning Reflection 🌅",
          body: this.getRandomQuoteText(),
          sound: true,
        },
        trigger: {
          hour: 8,
          minute: 0,
          repeats: true,
        },
      });

      // Midday notification (12 PM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Midday Wisdom ☀️",
          body: this.getRandomQuoteText(),
          sound: true,
        },
        trigger: {
          hour: 12,
          minute: 0,
          repeats: true,
        },
      });

      // Evening notification (8 PM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Evening Peace 🌙",
          body: this.getRandomQuoteText(),
          sound: true,
        },
        trigger: {
          hour: 20,
          minute: 0,
          repeats: true,
        },
      });

      console.log('Daily notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  static getRandomQuoteText(): string {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    // Truncate long quotes for notification
    const maxLength = 100;
    if (randomQuote.text.length > maxLength) {
      return randomQuote.text.substring(0, maxLength) + '...';
    }
    return randomQuote.text;
  }

  static async getScheduledNotifications() {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}