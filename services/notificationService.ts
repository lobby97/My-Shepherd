import { getRandomCommand } from "@/lib/commandsData";
import { NotificationTime } from "@/store/settingsStore";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === "web") {
      console.log("Notifications not supported on web");
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  }

  static async scheduleCustomNotifications(
    notificationTimes: NotificationTime[]
  ): Promise<void> {
    if (Platform.OS === "web") {
      console.log("Notifications not supported on web");
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log(
        "Cancelled all previous notifications before scheduling new ones."
      );

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log("Notification permissions not granted, cannot schedule.");
        return;
      }

      let scheduledCount = 0;
      for (const time of notificationTimes) {
        if (time.enabled) {
          const now = new Date();
          let intendedNotificationDate = new Date();
          intendedNotificationDate.setHours(time.hour, time.minute, 0, 0);

          console.log(
            `Processing ${time.label} for ${time.hour}:${time.minute}`
          );
          console.log(`  Current system time (now): ${now.toLocaleString()}`);
          console.log(
            `  Initial intended fire time today: ${intendedNotificationDate.toLocaleString()}`
          );

          if (intendedNotificationDate.getTime() <= now.getTime()) {
            // Log that it's for tomorrow, but the trigger will just be hour/minute daily
            let tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(time.hour, time.minute, 0, 0);
            console.log(
              `  Time is past for today. Daily repeat at ${time.hour}:${
                time.minute
              } will start tomorrow: ${tomorrow.toLocaleString()}`
            );
          }

          // Use DailyTriggerInput for daily repeating notifications
          const trigger: Notifications.DailyTriggerInput = {
            // @ts-expect-error Linter has issues with 'SchedulableTriggerInputTypes.DAILY' vs literal 'daily'
            type: "daily",
            hour: time.hour,
            minute: time.minute,
          };

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `${time.label} ${this.getTimeEmoji(time.hour)}`,
              body: this.getRandomQuoteText(),
              sound: true,
            },
            trigger,
          });
          scheduledCount++;
          // The 'intendedNotificationDate' might be misleading if the OS handles the 'first fire' differently for repeats.
          // What matters is that it's scheduled for H:M daily.
          console.log(
            `  Scheduled: ${time.label} (ID: ${notificationId}). Daily trigger for H:${time.hour} M:${time.minute}.`
          );
        }
      }

      console.log(`${scheduledCount} notifications scheduled successfully.`);
      const allScheduled =
        await Notifications.getAllScheduledNotificationsAsync();
      console.log(
        "Currently scheduled by OS:",
        JSON.stringify(allScheduled, null, 2)
      );
    } catch (error) {
      console.error("Error scheduling notifications:", error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === "web") {
      return;
    }

    try {
      // It's safer to ensure permissions exist before trying to cancel.
      // On some iOS versions, this can crash if permissions have never been granted.
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        console.log("Permissions not granted, no notifications to cancel.");
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
    }
  }

  static getRandomQuoteText(): string {
    const randomQuote = getRandomCommand();
    // Truncate long quotes for notification
    const maxLength = 100;
    if (randomQuote.text.length > maxLength) {
      return randomQuote.text.substring(0, maxLength) + "...";
    }
    return randomQuote.text;
  }

  static getTimeEmoji(hour: number): string {
    if (hour >= 5 && hour < 12) return "🌅";
    if (hour >= 12 && hour < 17) return "☀️";
    if (hour >= 17 && hour < 21) return "🌆";
    return "🌙";
  }

  static async getScheduledNotifications() {
    if (Platform.OS === "web") {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  }
}
