#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Configuration
const CONFIG = {
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "",
  VOICE_ID: "NFG5qt843uXKj4pFvR7C",
  MODEL_ID: "eleven_multilingual_v2",
  OUTPUT_FORMAT: "mp3_44100_128",
  INPUT_JSON_PATH: "../assets/jesus_commands.json",
  OUTPUT_AUDIO_DIR: "../assets/audio",
  AUDIO_BASE_URL: "https://example.com/audio",
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

class AudioGeneratorResumable {
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

  public async resumeGeneration(
    forceRegenerate: boolean = false
  ): Promise<void> {
    console.log("🔄 Audio Generation Resume Mode");
    console.log("===============================\n");

    if (forceRegenerate) {
      console.log("⚠️  FORCE MODE: Regenerating ALL audio files");
    } else {
      console.log("🔄 Resume mode enabled - skipping existing audio files");
    }

    // Check API key
    if (!this.checkApiKey()) {
      process.exit(1);
    }

    let skippedCount = 0;
    const toProcess: JesusCommand[] = [];

    // Determine which commands need processing
    for (const command of this.commands) {
      const exists = this.audioExists(command.id);
      if (exists && !forceRegenerate) {
        console.log(`⏭️  Skipping ID ${command.id} - audio already exists`);
        skippedCount++;
      } else {
        toProcess.push(command);
      }
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`   Total commands: ${this.commands.length}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   To process: ${toProcess.length}`);

    if (toProcess.length === 0) {
      console.log("\n🎉 No audio files need to be generated!");
      return;
    }

    console.log(
      `\n🚀 Starting generation of ${toProcess.length} audio files...\n`
    );

    const updatedCommands: JesusCommand[] = [];
    let processedCount = 0;
    let errorCount = 0;

    for (const command of toProcess) {
      try {
        console.log(`📈 Progress: ${processedCount + 1}/${toProcess.length}`);

        const updatedCommand = await this.generateAudioForCommand(command);
        updatedCommands.push(updatedCommand);
        processedCount++;

        // Add delay between requests to respect API rate limits
        if (processedCount < toProcess.length) {
          console.log("⏳ Waiting 2 seconds before next request...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // Save progress every 10 commands
        if (processedCount % 10 === 0) {
          this.updateJsonWithAudioUrls(updatedCommands);
          console.log(
            `💾 Progress saved: ${processedCount} commands processed`
          );
        }
      } catch (error) {
        console.error(`❌ Failed to process command ${command.id}:`, error);
        errorCount++;

        // Continue with next command instead of stopping
        console.log("🔄 Continuing with next command...\n");
        continue;
      }
    }

    // Final update of JSON file
    if (updatedCommands.length > 0) {
      this.updateJsonWithAudioUrls(updatedCommands);
    }

    console.log(`\n🎉 Resume generation completed!`);
    console.log(`   Successfully processed: ${processedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Skipped (already existed): ${skippedCount}`);

    if (errorCount > 0) {
      console.log(
        `\n⚠️  ${errorCount} commands failed. You can run the resume script again to retry them.`
      );
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Voice of the Shepherd - Audio Generator (Resume Mode)

Usage:
  bun run generate-audio-resume.ts [options]

Options:
  --status             Check status of audio generation
  --force              Force regenerate all audio files (ignore existing ones)
  --help, -h           Show this help message

Environment:
  ELEVENLABS_API_KEY   Your ElevenLabs API key (required)

Examples:
  bun run generate-audio-resume            # Resume generation (skip existing)
  bun run generate-audio-resume --status   # Check status only
  bun run generate-audio-resume --force    # Regenerate all files
    `);
    return;
  }

  const generator = new AudioGeneratorResumable();

  if (args.includes("--status")) {
    await generator.checkStatus();
  } else {
    const forceRegenerate = args.includes("--force");
    await generator.resumeGeneration(forceRegenerate);
  }
}

// Run the script
if (typeof require !== "undefined" && require.main === module) {
  main().catch(console.error);
}

export { AudioGeneratorResumable, CONFIG };
