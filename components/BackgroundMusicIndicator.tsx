import { typography } from "@/constants/typography";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface BackgroundMusicIndicatorProps {
  show?: boolean; // Only show in development
}

export const BackgroundMusicIndicator: React.FC<
  BackgroundMusicIndicatorProps
> = ({ show = __DEV__ }) => {
  const { isBackgroundMusicPlaying } = usePlayerStore();
  const { enableBackgroundMusic } = useSettingsStore();

  if (!show) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Background Music Status</Text>
      <Text style={styles.status}>
        Setting: {enableBackgroundMusic ? "✅ Enabled" : "❌ Disabled"}
      </Text>
      <Text style={styles.status}>
        Playing: {isBackgroundMusicPlaying ? "🎶 Yes" : "⏸️ No"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  title: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    fontWeight: "bold",
    marginBottom: 4,
  },
  status: {
    color: "#FFFFFF",
    fontSize: typography.sizes.xs,
    marginBottom: 2,
  },
});
