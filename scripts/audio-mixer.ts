#!/usr/bin/env bun

import { spawn } from "child_process";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

export interface AudioMixerOptions {
  speechVolume?: number;
  musicVolume?: number;
  outputFormat?: string;
  sampleRate?: number;
  elevenLabsApiKey?: string;
}

export class AudioMixer {
  private defaultOptions: AudioMixerOptions = {
    speechVolume: 1.0,
    musicVolume: 0.2,
    outputFormat: "mp3",
    sampleRate: 44100,
    elevenLabsApiKey: "",
  };

  constructor(private options: AudioMixerOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Check if FFmpeg is available on the system
   */
  public async checkFFmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpeg = spawn("ffmpeg", ["-version"]);

      ffmpeg.on("error", () => {
        resolve(false);
      });

      ffmpeg.on("close", (code) => {
        resolve(code === 0);
      });
    });
  }

  /**
   * Generate background music using ElevenLabs Sound Generation API
   */
  public async generateBackgroundMusicWithElevenLabs(
    duration: number,
    category: string,
    outputPath: string
  ): Promise<void> {
    console.log(`🎵 Generating AI background music for ${category}...`);

    try {
      const prompt = this.getCategoryMusicPrompt(category, duration);

      const response = await fetch(
        "https://api.elevenlabs.io/v1/sound-generation",
        {
          method: "POST",
          headers: {
            "Xi-Api-Key": this.options.elevenLabsApiKey || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: prompt,
            duration_seconds: Math.min(duration, 22), // ElevenLabs max duration
            prompt_influence: 0.3,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `ElevenLabs Sound API error: ${response.status} - ${errorText}`
        );
      }

      const audioBuffer = await response.arrayBuffer();
      writeFileSync(outputPath, Buffer.from(audioBuffer));

      console.log(`✅ AI background music generated: ${outputPath}`);
    } catch (error) {
      console.warn(
        `⚠️  Failed to generate AI music, falling back to simple tones: ${error}`
      );
      // Fallback to simple tone generation
      await this.generateSimpleBackgroundMusic(duration, category, outputPath);
    }
  }

  /**
   * Generate simple background music using FFmpeg (fallback)
   */
  public async generateSimpleBackgroundMusic(
    duration: number,
    category: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Generate different tones based on category
      const toneFreq = this.getCategoryFrequency(category);
      const harmonicFreq = toneFreq * 1.5; // Add a harmonic

      const ffmpegArgs = [
        "-f",
        "lavfi",
        "-i",
        `sine=frequency=${toneFreq}:duration=${duration}`,
        "-f",
        "lavfi",
        "-i",
        `sine=frequency=${harmonicFreq}:duration=${duration}`,
        "-filter_complex",
        `[0:a]volume=0.3[a1];[1:a]volume=0.1[a2];[a1][a2]amix=inputs=2[out]`,
        "-map",
        "[out]",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        "-y", // Overwrite output file
        outputPath,
      ];

      const ffmpeg = spawn("ffmpeg", ffmpegArgs);

      ffmpeg.stderr.on("data", (data) => {
        // FFmpeg outputs to stderr, we can ignore most of it
        // process.stderr.write(data);
      });

      ffmpeg.on("error", (error) => {
        reject(new Error(`FFmpeg error: ${error.message}`));
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Get audio duration in seconds
   */
  public async getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v",
        "quiet",
        "-show_entries",
        "format=duration",
        "-of",
        "csv=p=0",
        filePath,
      ]);

      let output = "";

      ffprobe.stdout.on("data", (data) => {
        output += data.toString();
      });

      ffprobe.on("error", (error) => {
        reject(new Error(`FFprobe error: ${error.message}`));
      });

      ffprobe.on("close", (code) => {
        if (code === 0) {
          const duration = parseFloat(output.trim());
          resolve(duration);
        } else {
          reject(new Error(`FFprobe exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Mix speech and background music
   */
  public async mixAudio(
    speechPath: string,
    musicPath: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const { speechVolume, musicVolume } = this.options;

      const ffmpegArgs = [
        "-i",
        speechPath,
        "-i",
        musicPath,
        "-filter_complex",
        `[0:a]volume=${speechVolume}[speech];[1:a]volume=${musicVolume}[music];[speech][music]amix=inputs=2:duration=first[out]`,
        "-map",
        "[out]",
        "-c:a",
        "libmp3lame",
        "-b:a",
        "128k",
        "-y", // Overwrite output file
        outputPath,
      ];

      const ffmpeg = spawn("ffmpeg", ffmpegArgs);

      ffmpeg.stderr.on("data", (data) => {
        // Log FFmpeg progress if needed
        // process.stderr.write(data);
      });

      ffmpeg.on("error", (error) => {
        reject(new Error(`FFmpeg mixing error: ${error.message}`));
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`FFmpeg mixing exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Process speech buffer and background music into final audio
   */
  public async processAudioBuffers(
    speechBuffer: Buffer,
    commandId: string,
    category: string,
    outputDir: string
  ): Promise<string> {
    const tempDir = join(outputDir, "temp");
    const finalOutputPath = join(outputDir, `command_${commandId}.mp3`);

    // Create temp directory if it doesn't exist
    if (!existsSync(tempDir)) {
      require("fs").mkdirSync(tempDir, { recursive: true });
    }

    const tempSpeechPath = join(tempDir, `speech_${commandId}.mp3`);
    const tempMusicPath = join(tempDir, `music_${commandId}.mp3`);

    try {
      // Write speech buffer to temporary file
      writeFileSync(tempSpeechPath, speechBuffer);

      // Get speech duration
      const speechDuration = await this.getAudioDuration(tempSpeechPath);

      // Generate background music with the same duration using ElevenLabs
      if (this.options.elevenLabsApiKey) {
        await this.generateBackgroundMusicWithElevenLabs(
          speechDuration,
          category,
          tempMusicPath
        );
      } else {
        // Fallback to simple background music
        await this.generateSimpleBackgroundMusic(
          speechDuration,
          category,
          tempMusicPath
        );
      }

      // Mix speech and background music
      await this.mixAudio(tempSpeechPath, tempMusicPath, finalOutputPath);

      // Clean up temporary files
      this.cleanupTempFiles([tempSpeechPath, tempMusicPath]);

      return finalOutputPath;
    } catch (error) {
      // Clean up temporary files on error
      this.cleanupTempFiles([tempSpeechPath, tempMusicPath]);
      throw error;
    }
  }

  /**
   * Get music prompt based on category for ElevenLabs sound generation
   */
  private getCategoryMusicPrompt(category: string, duration: number): string {
    const categoryMusicMap: Record<string, string> = {
      "Repentance & Righteousness":
        "Soft, contemplative ambient music with gentle strings and subtle reverb, peaceful and reflective atmosphere for spiritual contemplation",
      "Obedience & Discipleship":
        "Uplifting acoustic guitar with warm harmonies, inspiring and encouraging background music for following a path",
      "Blessings & Beatitudes":
        "Gentle piano with soft choir harmonies, blessed and serene atmosphere, celestial and peaceful ambient sounds",
      "Kingdom of God":
        "Majestic orchestral strings with golden warmth, regal and divine atmosphere, inspiring heavenly ambiance",
      "Judgment, Mercy & Forgiveness":
        "Warm strings with compassionate tones, healing and reconciling atmosphere, gentle and forgiving ambient music",
      "Truth & Word":
        "Clear bell tones with harmonious undertones, pure and crystalline ambient music, enlightening and wise atmosphere",
      "Love & Commandments":
        "Warm acoustic guitar with heart-centered melodies, loving and compassionate ambient music, embracing atmosphere",
      "Humility & Service":
        "Gentle acoustic instruments with humble, serving spirit, modest and caring ambient background music",
      "Prayer & Faith":
        "Soft organ with ethereal reverb, prayerful and meditative atmosphere, spiritual and transcendent ambient music",
      "Healing & Miracles":
        "Healing frequencies with gentle chimes, restorative and miraculous ambient music, hope-filled atmosphere",
      "Parables & Teaching":
        "Wise acoustic guitar with storytelling feel, educational and enlightening ambient music, thoughtful atmosphere",
      "End Times & Prophecy":
        "Deep atmospheric sounds with prophetic undertones, mysterious and reverent ambient music, anticipatory mood",
      "Eternal Life":
        "Timeless orchestral music with eternal feel, infinite and everlasting ambient atmosphere, transcendent and peaceful",
      "Trials & Suffering":
        "Comforting strings with supportive harmonies, consoling and strengthening ambient music, hope through difficulty",
      "Wisdom & Understanding":
        "Contemplative piano with deep resonance, wise and insightful ambient music, understanding and clarity",
    };

    const basePrompt =
      categoryMusicMap[category] ||
      "Peaceful ambient music with gentle harmonies, spiritual and contemplative atmosphere";
    return `${basePrompt}, subtle background music, low volume, ${Math.round(
      duration
    )} seconds duration`;
  }

  /**
   * Get frequency based on category for background music (fallback)
   */
  private getCategoryFrequency(category: string): number {
    const categoryFreqMap: Record<string, number> = {
      "Repentance & Righteousness": 220, // A3
      "Obedience & Discipleship": 246.94, // B3
      "Blessings & Beatitudes": 261.63, // C4
      "Kingdom of God": 293.66, // D4
      "Judgment, Mercy & Forgiveness": 329.63, // E4
      "Truth & Word": 349.23, // F4
      "Love & Commandments": 392.0, // G4
      "Humility & Service": 440.0, // A4
      "Prayer & Faith": 493.88, // B4
      "Healing & Miracles": 523.25, // C5
      "Parables & Teaching": 587.33, // D5
      "End Times & Prophecy": 659.25, // E5
      "Eternal Life": 698.46, // F5
      "Trials & Suffering": 783.99, // G5
      "Wisdom & Understanding": 880.0, // A5
    };

    return categoryFreqMap[category] || 440.0; // Default to A4
  }

  /**
   * Clean up temporary files
   */
  private cleanupTempFiles(filePaths: string[]): void {
    filePaths.forEach((filePath) => {
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch (error) {
          console.warn(`Warning: Could not delete temporary file ${filePath}`);
        }
      }
    });
  }
}

export default AudioMixer;
