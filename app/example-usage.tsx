import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JesusCommandCard } from "../components/JesusCommandCard";
import {
  getAssetStats,
  getCommandsWithAssets,
  getRandomCommand,
} from "../lib/commandsData";

export default function ExampleUsage() {
  const [currentCommand, setCurrentCommand] = useState(getRandomCommand());
  const [assetStats, setAssetStats] = useState(getAssetStats());
  const [showOnlyWithAssets, setShowOnlyWithAssets] = useState(false);

  useEffect(() => {
    setAssetStats(getAssetStats());
  }, []);

  const getNextRandomCommand = () => {
    if (showOnlyWithAssets) {
      const commandsWithAssets = getCommandsWithAssets();
      if (commandsWithAssets.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * commandsWithAssets.length
        );
        setCurrentCommand(commandsWithAssets[randomIndex]);
      }
    } else {
      setCurrentCommand(getRandomCommand());
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Jesus Commands</Text>
          <Text style={styles.subtitle}>Example Usage with Local Assets</Text>
        </View>

        {/* Asset Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Asset Statistics</Text>
          <Text style={styles.statsText}>
            Total Commands: {assetStats.totalCommands}
          </Text>
          <Text style={styles.statsText}>
            Commands with Images: {assetStats.commandsWithImages} (
            {assetStats.imagePercentage}%)
          </Text>
          <Text style={styles.statsText}>
            Commands with Audio: {assetStats.commandsWithAudio} (
            {assetStats.audioPercentage}%)
          </Text>
          <Text style={styles.statsText}>
            Commands with Both: {assetStats.commandsWithBoth} (
            {assetStats.bothPercentage}%)
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.button}
            onPress={getNextRandomCommand}
          >
            <Text style={styles.buttonText}>Random Command</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, showOnlyWithAssets && styles.buttonActive]}
            onPress={() => {
              setShowOnlyWithAssets(!showOnlyWithAssets);
              if (!showOnlyWithAssets) {
                // Switch to commands with assets
                const commandsWithAssets = getCommandsWithAssets();
                if (commandsWithAssets.length > 0) {
                  const randomIndex = Math.floor(
                    Math.random() * commandsWithAssets.length
                  );
                  setCurrentCommand(commandsWithAssets[randomIndex]);
                }
              }
            }}
          >
            <Text
              style={[
                styles.buttonText,
                showOnlyWithAssets && styles.buttonTextActive,
              ]}
            >
              {showOnlyWithAssets ? "All Commands" : "Only With Assets"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Command Card */}
        <JesusCommandCard command={currentCommand} />

        {/* Asset Info */}
        <View style={styles.assetInfo}>
          <Text style={styles.assetInfoTitle}>
            Asset Information for Command #{currentCommand.id}
          </Text>
          <Text style={styles.assetInfoText}>
            Has Local Image: {currentCommand.hasLocalImage ? "✅" : "❌"}
          </Text>
          <Text style={styles.assetInfoText}>
            Has Local Audio: {currentCommand.hasLocalAudio ? "✅" : "❌"}
          </Text>
          {!currentCommand.hasLocalImage && (
            <Text style={styles.warningText}>
              Using fallback image (jesus-command-test.jpg)
            </Text>
          )}
          {!currentCommand.hasLocalAudio && (
            <Text style={styles.warningText}>
              No audio available for this command
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  statsText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonActive: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonTextActive: {
    color: "#fff",
  },
  assetInfo: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  assetInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  assetInfoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: "#FF9500",
    fontStyle: "italic",
    marginTop: 4,
  },
});
