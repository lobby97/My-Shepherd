import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAudioAsset } from "../lib/audioAssets";
import { getImageAsset } from "../lib/imageAssets";

interface JesusCommand {
  id: string;
  text: string;
  attribution: string;
  category: string;
  explanation: string;
  reference: string;
}

interface Props {
  command: JesusCommand;
}

export function JesusCommandCard({ command }: Props) {
  const player = useAudioPlayer();
  const [isLoading, setIsLoading] = useState(false);

  const playAudio = async () => {
    try {
      setIsLoading(true);
      const audioAsset = getAudioAsset(command.id);

      if (!audioAsset) {
        console.log(`No audio available for command ${command.id}`);
        setIsLoading(false);
        return;
      }

      player.replace(audioAsset);
      player.play();
      setIsLoading(false);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsLoading(false);
    }
  };

  const pauseAudio = async () => {
    player.pause();
  };

  const stopAudio = async () => {
    player.seekTo(0);
    player.pause();
  };

  const imageSource = getImageAsset(command.id);

  return (
    <View style={styles.card}>
      {/* Image */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.text}>{command.text}</Text>

        <View style={styles.metadata}>
          <Text style={styles.category}>{command.category}</Text>
          <Text style={styles.reference}>{command.reference}</Text>
        </View>

        <Text style={styles.explanation}>{command.explanation}</Text>

        {/* Audio Controls */}
        <View style={styles.audioControls}>
          <TouchableOpacity
            style={[
              styles.audioButton,
              isLoading && styles.audioButtonDisabled,
            ]}
            onPress={player.playing ? pauseAudio : playAudio}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass" size={24} color="#666" />
            ) : player.playing ? (
              <Ionicons name="pause" size={24} color="#fff" />
            ) : (
              <Ionicons name="play" size={24} color="#fff" />
            )}
          </TouchableOpacity>

          {player.playing && (
            <TouchableOpacity style={styles.stopButton} onPress={stopAudio}>
              <Ionicons name="stop" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    lineHeight: 24,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  category: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reference: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  explanation: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 16,
  },
  audioControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  audioButton: {
    backgroundColor: "#007AFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  audioButtonDisabled: {
    backgroundColor: "#ccc",
  },
  stopButton: {
    backgroundColor: "#FF3B30",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
