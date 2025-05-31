#!/usr/bin/env bun

import { existsSync, readFileSync } from "fs";

// Test configuration
const TEST_CONFIG = {
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "", // Your API key
  VOICE_ID: "NFG5qt843uXKj4pFvR7C",
  TEST_TEXT: "Hello, this is a test of the audio generation system.",
  JSON_PATH: "../assets/jesus_commands.json",
};

class AudioSetupTester {
  constructor() {
    // No AudioMixer needed for simple speech generation
  }

  async testElevenLabsSpeechAPI(): Promise<boolean> {
    console.log("🔍 Testing ElevenLabs Speech API...");

    if (!TEST_CONFIG.ELEVENLABS_API_KEY) {
      console.log("❌ ELEVENLABS_API_KEY environment variable is not set!");
      console.log("📝 Set your API key:");
      console.log("   export ELEVENLABS_API_KEY=your-api-key-here");
      return false;
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${TEST_CONFIG.VOICE_ID}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "Xi-Api-Key": TEST_CONFIG.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: TEST_CONFIG.TEST_TEXT,
            model_id: "eleven_multilingual_v2",
          }),
        }
      );

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        console.log(
          `✅ ElevenLabs Speech API is working (received ${audioBuffer.byteLength} bytes)`
        );
        return true;
      } else {
        const errorText = await response.text();
        console.log(
          `❌ ElevenLabs Speech API error: ${response.status} - ${errorText}`
        );

        if (response.status === 401) {
          console.log("💡 Check your API key");
        } else if (response.status === 402) {
          console.log("💡 Insufficient credits in your ElevenLabs account");
        } else if (response.status === 429) {
          console.log("💡 Rate limit exceeded, try again later");
        }

        return false;
      }
    } catch (error) {
      console.log("❌ Error testing ElevenLabs Speech API:", error);
      return false;
    }
  }

  testJSONFile(): boolean {
    console.log("🔍 Testing JSON file access...");

    try {
      if (!existsSync(TEST_CONFIG.JSON_PATH)) {
        console.log(`❌ JSON file not found: ${TEST_CONFIG.JSON_PATH}`);
        return false;
      }

      const jsonContent = readFileSync(TEST_CONFIG.JSON_PATH, "utf8");
      const commands = JSON.parse(jsonContent);

      if (!Array.isArray(commands)) {
        console.log("❌ JSON file is not an array");
        return false;
      }

      if (commands.length === 0) {
        console.log("❌ JSON file is empty");
        return false;
      }

      // Check if first command has required fields
      const firstCommand = commands[0];
      const requiredFields = ["id", "text", "category"];
      const missingFields = requiredFields.filter(
        (field) => !firstCommand[field]
      );

      if (missingFields.length > 0) {
        console.log(
          `❌ JSON commands missing required fields: ${missingFields.join(
            ", "
          )}`
        );
        return false;
      }

      console.log(`✅ JSON file is valid (${commands.length} commands found)`);
      return true;
    } catch (error) {
      console.log("❌ Error reading JSON file:", error);
      return false;
    }
  }

  displaySystemInfo(): void {
    console.log("\n📋 System Information:");
    console.log(`   Node.js version: ${process.version}`);
    console.log(`   Platform: ${process.platform}`);
    console.log(`   Architecture: ${process.arch}`);
    console.log(`   Working directory: ${process.cwd()}`);
    console.log(
      `   API Key set: ${TEST_CONFIG.ELEVENLABS_API_KEY ? "✅ Yes" : "❌ No"}`
    );
  }

  async runAllTests(): Promise<void> {
    console.log("🧪 Audio Generation Setup Test");
    console.log("==============================\n");

    this.displaySystemInfo();

    const tests = [
      { name: "JSON File", test: () => this.testJSONFile() },
      {
        name: "ElevenLabs Speech API",
        test: () => this.testElevenLabsSpeechAPI(),
      },
    ];

    const results: { name: string; passed: boolean }[] = [];

    for (const { name, test } of tests) {
      console.log(`\n--- Testing ${name} ---`);
      try {
        const passed = await test();
        results.push({ name, passed });
      } catch (error) {
        console.log(`❌ Unexpected error in ${name} test:`, error);
        results.push({ name, passed: false });
      }
    }

    // Summary
    console.log("\n📊 Test Summary:");
    console.log("================");

    let allPassed = true;
    for (const { name, passed } of results) {
      const status = passed ? "✅ PASS" : "❌ FAIL";
      console.log(`   ${name}: ${status}`);
      if (!passed) allPassed = false;
    }

    console.log("\n🎯 Overall Result:");
    if (allPassed) {
      console.log(
        "✅ All tests passed! You're ready to generate speech audio."
      );
      console.log("\n🚀 Next steps:");
      console.log("   1. Run: bun run generate-audio-test");
      console.log("   2. Check the generated audio files");
      console.log("   3. If satisfied, run: bun run generate-audio-production");
    } else {
      console.log(
        "❌ Some tests failed. Please fix the issues above before proceeding."
      );
      console.log("\n🔧 Common fixes:");
      console.log("   - Set ELEVENLABS_API_KEY environment variable");
      console.log("   - Check your ElevenLabs API key and credits");
      console.log("   - Ensure the JSON file path is correct");
    }
  }
}

// Run the tests
async function main() {
  const tester = new AudioSetupTester();
  await tester.runAllTests();
}

if (typeof require !== "undefined" && require.main === module) {
  main().catch(console.error);
}

export default AudioSetupTester;
