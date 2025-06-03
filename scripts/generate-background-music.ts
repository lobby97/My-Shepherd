#!/usr/bin/env bun

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Configuration
const CONFIG = {
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "",
  OUTPUT_MUSIC_DIR: "../assets/music",
  MUSIC_BASE_URL: "https://example.com/music", // Update this to your actual base URL
  TEST_MODE: true, // Set to false to generate all music tracks
};

interface MusicTrack {
  id: string;
  name: string;
  description: string;
  prompt: string;
  filename: string;
}

// Predefined music tracks for different moods/contexts
const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "peaceful_ambient",
    name: "Peaceful Ambient",
    description: "Gentle ambient music for peaceful contemplation",
    prompt:
      "Soft, peaceful ambient music with gentle piano and warm strings, suitable for meditation and spiritual reflection, no drums, calming and serene",
    filename: "peaceful_ambient.mp3",
  },
  {
    id: "uplifting_orchestral",
    name: "Uplifting Orchestral",
    description: "Inspiring orchestral music for uplifting moments",
    prompt:
      "Uplifting orchestral music with strings and woodwinds, inspiring and hopeful, suitable for motivational spiritual content, moderate tempo",
    filename: "uplifting_orchestral.mp3",
  },
  {
    id: "contemplative_piano",
    name: "Contemplative Piano",
    description: "Solo piano for deep reflection",
    prompt:
      "Contemplative solo piano music, gentle and reflective, perfect for deep spiritual contemplation, slow tempo, emotional depth",
    filename: "contemplative_piano.mp3",
  },
  {
    id: "worship_atmosphere",
    name: "Worship Atmosphere",
    description: "Atmospheric music for worship and prayer",
    prompt:
      "Atmospheric worship music with subtle choir voices, reverb-heavy ambience, suitable for prayer and worship, ethereal and sacred",
    filename: "worship_atmosphere.mp3",
  },
  {
    id: "gentle_guitar",
    name: "Gentle Acoustic Guitar",
    description: "Soft acoustic guitar for intimate moments",
    prompt:
      "Gentle acoustic guitar fingerpicking, warm and intimate, suitable for personal reflection and spiritual growth, no percussion",
    filename: "gentle_guitar.mp3",
  },
];

class BackgroundMusicGenerator {
  private tracks: MusicTrack[] = MUSIC_TRACKS;

  constructor() {
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!existsSync(CONFIG.OUTPUT_MUSIC_DIR)) {
      mkdirSync(CONFIG.OUTPUT_MUSIC_DIR, { recursive: true });
      console.log(`✅ Created output directory: ${CONFIG.OUTPUT_MUSIC_DIR}`);
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

  private musicExists(track: MusicTrack): boolean {
    const musicPath = join(CONFIG.OUTPUT_MUSIC_DIR, track.filename);
    return existsSync(musicPath);
  }

  private async generateMusic(track: MusicTrack): Promise<Buffer> {
    console.log(`🎵 Generating music: ${track.name}...`);
    console.log(`📝 Prompt: ${track.prompt}`);

    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/sound-generation",
        {
          method: "POST",
          headers: {
            "Xi-Api-Key": CONFIG.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: track.prompt,
            duration_seconds: 22, // Generate 22-second tracks (API maximum)
            prompt_influence: 0.3,
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
        `✅ Music generated for ${track.name} (${audioBuffer.byteLength} bytes)`
      );

      return Buffer.from(audioBuffer);
    } catch (error) {
      console.error(`❌ Error generating music for ${track.name}:`, error);
      throw error;
    }
  }

  private saveMusic(audioBuffer: Buffer, track: MusicTrack): string {
    const filepath = join(CONFIG.OUTPUT_MUSIC_DIR, track.filename);

    try {
      writeFileSync(filepath, audioBuffer);
      console.log(`💾 Music saved: ${filepath}`);
      return `${CONFIG.MUSIC_BASE_URL}/${track.filename}`;
    } catch (error) {
      console.error(`❌ Error saving music for ${track.name}:`, error);
      throw error;
    }
  }

  public async generateMusicTrack(track: MusicTrack): Promise<void> {
    console.log(`\n🎯 Processing track: ${track.name}`);
    console.log(`📄 Description: ${track.description}`);

    // Skip if already exists
    if (this.musicExists(track)) {
      console.log(`⏭️  Music already exists for ${track.name}, skipping...`);
      return;
    }

    try {
      // Generate music
      const musicBuffer = await this.generateMusic(track);

      // Save music file
      const musicUrl = this.saveMusic(musicBuffer, track);

      console.log(`🎉 Successfully generated: ${track.name}`);
      console.log(`🔗 URL: ${musicUrl}`);
    } catch (error) {
      console.error(`❌ Failed to process track ${track.name}:`, error);
      throw error;
    }
  }

  public async generateTestMusic(): Promise<void> {
    console.log("🧪 TEST MODE: Generating first track only");

    const testTrack = this.tracks[0];
    await this.generateMusicTrack(testTrack);

    console.log("\n✅ Test completed!");
  }

  public async generateAllMusic(): Promise<void> {
    console.log(
      `🚀 PRODUCTION MODE: Generating all ${this.tracks.length} music tracks`
    );

    let processedCount = 0;

    for (const track of this.tracks) {
      try {
        console.log(
          `\n📈 Progress: ${processedCount + 1}/${this.tracks.length}`
        );

        await this.generateMusicTrack(track);
        processedCount++;

        // Add a delay between requests to respect API rate limits
        if (processedCount < this.tracks.length) {
          console.log("⏱️  Waiting 3 seconds before next generation...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Skipping track ${track.name} due to error`);
        continue;
      }
    }

    console.log(`\n🎉 COMPLETED! Generated ${processedCount} music tracks.`);
  }

  public async checkStatus(): Promise<void> {
    console.log("📊 Background Music Generation Status");
    console.log("====================================\n");

    let existingCount = 0;
    let missingCount = 0;
    const missingTracks: string[] = [];

    for (const track of this.tracks) {
      if (this.musicExists(track)) {
        existingCount++;
        console.log(`✅ ${track.name} - EXISTS`);
      } else {
        missingCount++;
        missingTracks.push(track.name);
        console.log(`❌ ${track.name} - MISSING`);
      }
    }

    console.log(`\n📈 Status Summary:`);
    console.log(`   Total tracks: ${this.tracks.length}`);
    console.log(`   ✅ Music files exist: ${existingCount}`);
    console.log(`   ❌ Music files missing: ${missingCount}`);

    if (missingCount > 0) {
      console.log(`\n📝 Missing music tracks:`);
      missingTracks.forEach((name) => console.log(`   • ${name}`));
      console.log(`\n🔄 To generate missing music files, run:`);
      console.log(`   bun run generate-background-music.ts --production`);
    } else {
      console.log(`\n🎉 All music files are present!`);
    }
  }

  public listAvailableTracks(): void {
    console.log("🎵 Available Music Tracks");
    console.log("========================\n");

    this.tracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.name}`);
      console.log(`   📄 Description: ${track.description}`);
      console.log(`   📁 Filename: ${track.filename}`);
      console.log(`   📝 Prompt: ${track.prompt}`);
      console.log(`   ✅ Exists: ${this.musicExists(track) ? "Yes" : "No"}`);
      console.log();
    });
  }

  public async run(): Promise<void> {
    console.log("🎵 Voice of the Shepherd - Background Music Generator");
    console.log("====================================================\n");

    try {
      // Check API key
      if (!this.checkApiKey()) {
        process.exit(1);
      }

      if (CONFIG.TEST_MODE) {
        await this.generateTestMusic();
      } else {
        await this.generateAllMusic();
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
Voice of the Shepherd - Background Music Generator

Usage:
  bun run generate-background-music.ts [options]

Options:
  --test               Run in test mode (generates first track only)
  --production         Run in production mode (generates all tracks)
  --status             Check status of music generation
  --list               List all available music tracks
  --help, -h           Show this help message

Environment:
  ELEVENLABS_API_KEY   Your ElevenLabs API key (required)

Examples:
  bun run generate-background-music.ts --test           # Test with first track
  bun run generate-background-music.ts --status         # Check status
  bun run generate-background-music.ts --list           # List available tracks
  bun run generate-background-music.ts --production     # Generate all tracks

Note:
  - Music tracks are 22 seconds long (ElevenLabs API maximum)
  - Generated files are saved in ../assets/music/
  - Existing files are skipped to avoid regeneration
    `);
    return;
  }

  const generator = new BackgroundMusicGenerator();

  // Handle status check
  if (args.includes("--status")) {
    await generator.checkStatus();
    return;
  }

  // Handle list tracks
  if (args.includes("--list")) {
    generator.listAvailableTracks();
    return;
  }

  // Override config based on command line arguments
  if (args.includes("--production")) {
    CONFIG.TEST_MODE = false;
  }

  if (args.includes("--test")) {
    CONFIG.TEST_MODE = true;
  }

  await generator.run();
}

// Run the script
if (typeof require !== "undefined" && require.main === module) {
  main().catch(console.error);
}

export { BackgroundMusicGenerator, CONFIG, MUSIC_TRACKS };
