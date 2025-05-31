#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Configuration
const CONFIG = {
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "",
  VOICE_ID: "NFG5qt843uXKj4pFvR7C", // You can change this to different voice IDs
  MODEL_ID: "eleven_multilingual_v2",
  OUTPUT_FORMAT: "mp3_44100_128",
  INPUT_JSON_PATH: "../assets/jesus_commands.json",
  OUTPUT_AUDIO_DIR: "../assets/audio",
  AUDIO_BASE_URL: "https://example.com/audio", // Update this to your actual base URL
  TEST_MODE: true, // Set to false to generate all audios
  TEST_IDS: ["1", "2", "3"], // IDs to test with
};

interface JesusCommand {
  id: string;
  text: string;
  attribution: string;
  category: string;
  explanation: string;
  image_prompt: string;
  voice_prompt: string;
  imageUrl: string;
  audioUrl: string;
  reference: string;
}

class AudioGenerator {
  private commands: JesusCommand[] = [];

  constructor() {
    this.loadCommands();
    this.ensureDirectoryExists();
  }

  private loadCommands(): void {
    try {
      const jsonContent = readFileSync(CONFIG.INPUT_JSON_PATH, "utf8");
      this.commands = JSON.parse(jsonContent);
      console.log(`✅ Loaded ${this.commands.length} commands from JSON`);
    } catch (error) {
      console.error("❌ Error loading JSON file:", error);
      process.exit(1);
    }
  }

  private ensureDirectoryExists(): void {
    if (!existsSync(CONFIG.OUTPUT_AUDIO_DIR)) {
      mkdirSync(CONFIG.OUTPUT_AUDIO_DIR, { recursive: true });
      console.log(`✅ Created output directory: ${CONFIG.OUTPUT_AUDIO_DIR}`);
    }
  }

  private checkApiKey(): boolean {
    if (!CONFIG.ELEVENLABS_API_KEY) {
      console.error("❌ ELEVENLABS_API_KEY environment variable is not set!");
      console.log("📝 Set your API key:");
      console.log("   export ELEVENLABS_API_KEY=your-api-key-here");
      return false;
    }
    return true;
  }

  private audioExists(id: string): boolean {
    const filename = `command_${id}.mp3`;
    const audioPath = join(CONFIG.OUTPUT_AUDIO_DIR, filename);
    return existsSync(audioPath);
  }

  private async generateSpeech(
    text: string,
    commandId: string
  ): Promise<Buffer> {
    console.log(`🎤 Generating speech for command ${commandId}...`);

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${CONFIG.VOICE_ID}?output_format=${CONFIG.OUTPUT_FORMAT}`,
        {
          method: "POST",
          headers: {
            "Xi-Api-Key": CONFIG.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: text,
            model_id: CONFIG.MODEL_ID,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ElevenLabs API error: ${response.status} - ${errorText}`
        );
      }

      const audioBuffer = await response.arrayBuffer();
      console.log(
        `✅ Speech generated for command ${commandId} (${audioBuffer.byteLength} bytes)`
      );

      return Buffer.from(audioBuffer);
    } catch (error) {
      console.error(
        `❌ Error generating speech for command ${commandId}:`,
        error
      );
      throw error;
    }
  }

  private saveAudio(audioBuffer: Buffer, commandId: string): string {
    const filename = `command_${commandId}.mp3`;
    const filepath = join(CONFIG.OUTPUT_AUDIO_DIR, filename);

    try {
      writeFileSync(filepath, audioBuffer);
      console.log(`💾 Audio saved: ${filepath}`);
      return `${CONFIG.AUDIO_BASE_URL}/${filename}`;
    } catch (error) {
      console.error(`❌ Error saving audio for command ${commandId}:`, error);
      throw error;
    }
  }

  private updateJsonWithAudioUrls(updatedCommands: JesusCommand[]): void {
    try {
      // Create a map of updated commands for easy lookup
      const updatesMap = new Map(
        updatedCommands.map((cmd) => [cmd.id, cmd.audioUrl])
      );

      // Update the original commands array
      const updatedArray = this.commands.map((command) => {
        if (updatesMap.has(command.id)) {
          return {
            ...command,
            audioUrl: updatesMap.get(command.id)!,
          };
        }
        return command;
      });

      // Write back to JSON file
      writeFileSync(
        CONFIG.INPUT_JSON_PATH,
        JSON.stringify(updatedArray, null, 2)
      );
      console.log(
        `✅ JSON file updated with ${updatedCommands.length} audio URLs`
      );
    } catch (error) {
      console.error("❌ Error updating JSON file:", error);
      throw error;
    }
  }

  public async generateAudioForCommand(
    command: JesusCommand
  ): Promise<JesusCommand> {
    console.log(
      `\n🎯 Processing command ${command.id}: "${command.text.substring(
        0,
        50
      )}..."`
    );

    try {
      // Generate speech
      const speechBuffer = await this.generateSpeech(command.text, command.id);

      // Save audio file
      const audioUrl = this.saveAudio(speechBuffer, command.id);

      // Return updated command
      return {
        ...command,
        audioUrl: audioUrl,
      };
    } catch (error) {
      console.error(`❌ Failed to process command ${command.id}:`, error);
      throw error;
    }
  }

  public async generateTestAudios(): Promise<void> {
    console.log(
      `🧪 TEST MODE: Generating audio for commands: ${CONFIG.TEST_IDS.join(
        ", "
      )}`
    );

    const testCommands = this.commands.filter((cmd) =>
      CONFIG.TEST_IDS.includes(cmd.id)
    );

    if (testCommands.length === 0) {
      console.log(
        `❌ No commands found with IDs: ${CONFIG.TEST_IDS.join(", ")}`
      );
      return;
    }

    const updatedCommands: JesusCommand[] = [];

    for (const command of testCommands) {
      try {
        const updatedCommand = await this.generateAudioForCommand(command);
        updatedCommands.push(updatedCommand);

        // Add a small delay between requests to be nice to the API
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Skipping command ${command.id} due to error`);
        continue;
      }
    }

    if (updatedCommands.length > 0) {
      this.updateJsonWithAudioUrls(updatedCommands);
      console.log(
        `\n✅ Test completed! Generated ${updatedCommands.length} audio files.`
      );
    }
  }

  public async generateAllAudios(): Promise<void> {
    console.log(
      `🚀 PRODUCTION MODE: Generating audio for all ${this.commands.length} commands`
    );

    const updatedCommands: JesusCommand[] = [];
    let processedCount = 0;

    for (const command of this.commands) {
      try {
        console.log(
          `\n📈 Progress: ${processedCount + 1}/${this.commands.length}`
        );

        const updatedCommand = await this.generateAudioForCommand(command);
        updatedCommands.push(updatedCommand);
        processedCount++;

        // Add a delay between requests to respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Save progress every 10 commands
        if (processedCount % 10 === 0) {
          this.updateJsonWithAudioUrls(updatedCommands);
          console.log(
            `💾 Progress saved: ${processedCount} commands processed`
          );
        }
      } catch (error) {
        console.error(`❌ Skipping command ${command.id} due to error`);
        continue;
      }
    }

    if (updatedCommands.length > 0) {
      this.updateJsonWithAudioUrls(updatedCommands);
      console.log(
        `\n🎉 COMPLETED! Generated ${updatedCommands.length} audio files.`
      );
    }
  }

  public async checkStatus(): Promise<void> {
    console.log("📊 Audio Generation Status Check");
    console.log("================================\n");

    let existingCount = 0;
    let missingCount = 0;
    const missingIds: string[] = [];

    for (const command of this.commands) {
      if (this.audioExists(command.id)) {
        existingCount++;
      } else {
        missingCount++;
        missingIds.push(command.id);
      }
    }

    console.log(`📈 Status Summary:`);
    console.log(`   Total commands: ${this.commands.length}`);
    console.log(`   ✅ Audio files exist: ${existingCount}`);
    console.log(`   ❌ Audio files missing: ${missingCount}`);

    if (missingCount > 0) {
      console.log(`\n📝 Missing audio files for IDs:`);
      console.log(
        `   ${missingIds.slice(0, 20).join(", ")}${
          missingIds.length > 20 ? "..." : ""
        }`
      );
      console.log(`\n🔄 To generate missing audio files, run:`);
      console.log(`   bun run generate-audio-resume`);
    } else {
      console.log(`\n🎉 All audio files are present!`);
    }
  }

  public async run(): Promise<void> {
    console.log("🎵 Voice of the Shepherd - Audio Generator");
    console.log("==========================================\n");

    try {
      // Check API key
      if (!this.checkApiKey()) {
        process.exit(1);
      }

      if (CONFIG.TEST_MODE) {
        await this.generateTestAudios();
      } else {
        await this.generateAllAudios();
      }
    } catch (error) {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Voice of the Shepherd - Audio Generator

Usage:
  bun run generate-audio.ts [options]

Options:
  --test                Run in test mode (generates only test IDs)
  --production         Run in production mode (generates all audios)
  --test-ids=1,2,3     Specify test IDs (comma-separated)
  --status             Check status of audio generation
  --help, -h           Show this help message

Environment:
  ELEVENLABS_API_KEY   Your ElevenLabs API key (required)

Examples:
  bun run generate-audio.ts --test           # Test with default IDs
  bun run generate-audio.ts --status         # Check status
  bun run generate-audio.ts --production     # Generate all

Resume functionality:
  Use 'bun run generate-audio-resume' to resume interrupted generation
    `);
    return;
  }

  const generator = new AudioGenerator();

  // Handle status check
  if (args.includes("--status")) {
    await generator.checkStatus();
    return;
  }

  // Override config based on command line arguments
  if (args.includes("--production")) {
    CONFIG.TEST_MODE = false;
  }

  if (args.includes("--test")) {
    CONFIG.TEST_MODE = true;
  }

  const testIdsArg = args.find((arg) => arg.startsWith("--test-ids="));
  if (testIdsArg) {
    CONFIG.TEST_IDS = testIdsArg.split("=")[1].split(",");
  }

  await generator.run();
}

// Run the script
if (typeof require !== "undefined" && require.main === module) {
  main().catch(console.error);
}

export { AudioGenerator, CONFIG };
