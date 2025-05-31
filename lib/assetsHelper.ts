// Helper functions to manage local assets
export function getAudioPath(commandId: string): any {
  // Return the require statement for the audio file
  return require(`../assets/audio/command_${commandId}.mp3`);
}

export function getImagePath(commandId: string): any {
  // Check if image exists in jesus-commands folder, fallback to default
  try {
    return require(`../assets/images/jesus-commands/command_${commandId}.jpg`);
  } catch (error) {
    // Fallback to default image if specific image doesn't exist
    return require(`../assets/images/jesus-command-test.jpg`);
  }
}

// Alternative approach using a mapping object for better performance
const audioAssets: { [key: string]: any } = {
  "1": require("../assets/audio/command_1.mp3"),
  "2": require("../assets/audio/command_2.mp3"),
  "3": require("../assets/audio/command_3.mp3"),
  "4": require("../assets/audio/command_4.mp3"),
  "5": require("../assets/audio/command_5.mp3"),
  // Add all your audio files here...
  // This is more performant than dynamic requires
};

const imageAssets: { [key: string]: any } = {
  default: require("../assets/images/jesus-command-test.jpg"),
  icon: require("../assets/images/icon.png"),
  splash: require("../assets/images/splash-icon.png"),
  // Add specific command images here when available
};

export function getAudioAsset(commandId: string): any {
  return audioAssets[commandId] || null;
}

export function getImageAsset(commandId: string): any {
  return imageAssets[commandId] || imageAssets["default"];
}

// Generate the complete mapping for all available audio files
export function generateAudioMapping(): { [key: string]: any } {
  const mapping: { [key: string]: any } = {};

  // Based on your audio files (command_1.mp3 to command_223.mp3)
  for (let i = 1; i <= 223; i++) {
    try {
      mapping[i.toString()] = require(`../assets/audio/command_${i}.mp3`);
    } catch (error) {
      console.warn(`Audio file command_${i}.mp3 not found`);
    }
  }

  return mapping;
}
