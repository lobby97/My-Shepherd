import commandsJson from "../assets/jesus_commands.json";
import { getAudioAsset, hasAudioAsset } from "./audioAssets";
import { getImageAsset } from "./imageAssets";

export interface JesusCommand {
  id: string;
  text: string;
  attribution: string;
  category: string;
  explanation: string;
  image_prompt: string;
  voice_prompt: string;
  imageUrl: string; // Original placeholder URL
  audioUrl: string; // Original placeholder URL
  reference: string;
  // Local asset references
  localImageAsset?: any;
  localAudioAsset?: any;
  hasLocalImage: boolean;
  hasLocalAudio: boolean;
}

// Process the JSON data to include local asset references
export function getProcessedCommands(): JesusCommand[] {
  return commandsJson.map((command) => ({
    ...command,
    localImageAsset: getImageAsset(command.id),
    localAudioAsset: getAudioAsset(command.id),
    hasLocalImage: getImageAsset(command.id) !== getImageAsset("default"),
    hasLocalAudio: hasAudioAsset(command.id),
  }));
}

// Get a specific command by ID
export function getCommandById(id: string): JesusCommand | undefined {
  const commands = getProcessedCommands();
  return commands.find((command) => command.id === id);
}

// Get commands by category
export function getCommandsByCategory(category: string): JesusCommand[] {
  const commands = getProcessedCommands();
  return commands.filter((command) => command.category === category);
}

// Get all unique categories
export function getCategories(): string[] {
  const commands = getProcessedCommands();
  const categories = commands.map((command) => command.category);
  return [...new Set(categories)].sort();
}

// Category icons mapping
const categoryIcons: Record<string, string> = {
  "Kingdom of God": "👑",
  "Prayer & Faith": "🙏",
  "Love & Commandments": "❤️",
  "Obedience & Discipleship": "👣",
  "Repentance & Righteousness": "🌿",
  Salvation: "✝️",
  Wisdom: "📜",
  "Healing & Miracles": "🌱",
  "Peace & Courage": "🕊️",
  "Judgment, Mercy & Forgiveness": "⚖️",
  "Humility & Service": "🙌",
  "Provision & Trust": "🍞",
  "Truth & Word": "📖",
  "Blessings & Beatitudes": "✨",
  "Evangelism & Discipleship": "📢",
  "Holy Spirit": "🔥",
  "Judgment Day & Watchfulness": "⏰",
  "Worship & Spirit": "🎵",
  "Unity & Oneness": "🤝",
  "Resurrection & Eternal Life": "🌅",
};

// Get category objects with icons and descriptions
export function getCategoryObjects() {
  const categoryNames = getCategories();
  return categoryNames.map((name, index) => ({
    id: (index + 1).toString(),
    name,
    icon: categoryIcons[name] || "📖",
    description: `Teachings about ${name.toLowerCase()}`,
  }));
}

// Get random command
export function getRandomCommand(): JesusCommand {
  const commands = getProcessedCommands();
  const randomIndex = Math.floor(Math.random() * commands.length);
  return commands[randomIndex];
}

// Search commands by text
export function searchCommands(query: string): JesusCommand[] {
  const commands = getProcessedCommands();
  const lowercaseQuery = query.toLowerCase();

  return commands.filter(
    (command) =>
      command.text.toLowerCase().includes(lowercaseQuery) ||
      command.explanation.toLowerCase().includes(lowercaseQuery) ||
      command.category.toLowerCase().includes(lowercaseQuery) ||
      command.reference.toLowerCase().includes(lowercaseQuery)
  );
}

// Get commands that have both image and audio
export function getCommandsWithAssets(): JesusCommand[] {
  const commands = getProcessedCommands();
  return commands.filter(
    (command) => command.hasLocalImage && command.hasLocalAudio
  );
}

// Statistics
export function getAssetStats() {
  const commands = getProcessedCommands();
  const totalCommands = commands.length;
  const commandsWithImages = commands.filter((c) => c.hasLocalImage).length;
  const commandsWithAudio = commands.filter((c) => c.hasLocalAudio).length;
  const commandsWithBoth = commands.filter(
    (c) => c.hasLocalImage && c.hasLocalAudio
  ).length;

  return {
    totalCommands,
    commandsWithImages,
    commandsWithAudio,
    commandsWithBoth,
    imagePercentage: Math.round((commandsWithImages / totalCommands) * 100),
    audioPercentage: Math.round((commandsWithAudio / totalCommands) * 100),
    bothPercentage: Math.round((commandsWithBoth / totalCommands) * 100),
  };
}
