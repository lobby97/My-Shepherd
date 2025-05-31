// ===================================================================
// 🎯 MANUAL ARRAY INPUT - Paste your IDs here for easy regeneration
// ===================================================================
const MANUAL_IDS: number[] = [
  6, 8, 10, 17, 18, 20, 25, 26, 27, 29, 41, 54, 61, 76, 85, 88, 90, 91, 93, 94,
  95, 119, 121, 122, 124, 126, 130, 142, 145, 147, 148, 157, 160, 161, 171, 181,
  193, 194, 195, 200,
];

// If MANUAL_IDS is empty, the script will use command line arguments instead
// ===================================================================

import * as fs from "fs/promises";
import * as path from "path";

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

interface FluxResponse {
  id: string;
  status: string;
  result?: {
    sample: string;
  };
}

class FluxImageRegenerator {
  private apiKey: string;
  private baseUrl = "https://api.us1.bfl.ai";
  private assetsDir: string;
  private imagesDir: string;

  constructor(apiKey: string, projectRoot: string) {
    this.apiKey = apiKey;
    this.assetsDir = path.join(projectRoot, "assets");
    this.imagesDir = path.join(this.assetsDir, "images/jesus-commands");
  }

  async ensureDirectoriesExist(): Promise<void> {
    try {
      await fs.access(this.imagesDir);
    } catch {
      await fs.mkdir(this.imagesDir, { recursive: true });
    }
  }

  async createImageRequest(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/flux-kontext-pro`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 1024,
        aspect_ratio: "1:1",
        output_format: "jpeg",
        safety_tolerance: 2,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create image request: ${response.status} ${response.statusText}`
      );
    }

    const data: FluxResponse = await response.json();
    return data.id;
  }

  async pollForResult(
    requestId: string,
    maxAttempts: number = 60
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      const response = await fetch(
        `${this.baseUrl}/v1/get_result?id=${requestId}`,
        {
          headers: {
            accept: "application/json",
            "x-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to poll result: ${response.status} ${response.statusText}`
        );
      }

      const data: FluxResponse = await response.json();

      console.log(`Attempt ${attempt + 1}: Status - ${data.status}`);

      if (data.status === "Ready" && data.result?.sample) {
        return data.result.sample;
      } else if (data.status !== "Pending" && data.status !== "Queued") {
        throw new Error(`Unexpected status: ${data.status}`);
      }
    }

    throw new Error("Timeout waiting for image generation");
  }

  async downloadImage(imageUrl: string, filename: string): Promise<string> {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imagePath = path.join(this.imagesDir, filename);
    await fs.writeFile(imagePath, buffer);

    return imagePath;
  }

  async generateImage(prompt: string, id: string): Promise<string> {
    // Add instruction to prevent text generation in images
    const enhancedPrompt = `${prompt}. Do not insert texts, words, letters, or any written characters in the image.`;

    console.log(`\n🎨 Regenerating image for ID ${id}...`);
    console.log(`Prompt: ${enhancedPrompt.substring(0, 100)}...`);

    try {
      // Create request
      const requestId = await this.createImageRequest(enhancedPrompt);
      console.log(`✅ Request created with ID: ${requestId}`);

      // Poll for result
      const imageUrl = await this.pollForResult(requestId);
      console.log(`✅ Image generated successfully`);

      // Download and save image
      const filename = `jesus-command-${id}.jpg`;
      await this.downloadImage(imageUrl, filename);
      console.log(`✅ Image saved as: ${filename}`);

      return `./assets/images/jesus-commands/${filename}`;
    } catch (error) {
      console.error(`❌ Error regenerating image for ID ${id}:`, error);
      throw error;
    }
  }

  async regenerateSpecificImages(targetIds: string[]): Promise<void> {
    console.log("🔄 Starting selective image regeneration...");
    console.log(`🎯 Target IDs: ${targetIds.join(", ")}`);

    // Ensure directories exist
    await this.ensureDirectoriesExist();

    // Read JSON file
    const jsonPath = path.join(this.assetsDir, "jesus_commands.json");
    const jsonContent = await fs.readFile(jsonPath, "utf-8");
    const commands: JesusCommand[] = JSON.parse(jsonContent);

    console.log(`📖 Found ${commands.length} total commands`);

    // Find commands that match the target IDs
    const commandsToRegenerate = commands.filter((cmd) =>
      targetIds.includes(cmd.id)
    );
    const foundIds = commandsToRegenerate.map((cmd) => cmd.id);
    const missingIds = targetIds.filter((id) => !foundIds.includes(id));

    console.log(`\n📊 Regeneration Summary:`);
    console.log(`   Requested IDs: ${targetIds.length}`);
    console.log(`   Found for regeneration: ${commandsToRegenerate.length}`);
    console.log(`   IDs found: ${foundIds.join(", ")}`);

    if (missingIds.length > 0) {
      console.log(`   ⚠️  Missing IDs: ${missingIds.join(", ")}`);
    }

    if (commandsToRegenerate.length === 0) {
      console.log("❌ No valid IDs found for regeneration");
      return;
    }

    // Create backup of existing images
    const backupDir = path.join(this.imagesDir, "backup");
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    let successCount = 0;
    let errorCount = 0;
    const results: { id: string; success: boolean; error?: string }[] = [];

    for (let i = 0; i < commandsToRegenerate.length; i++) {
      const command = commandsToRegenerate[i];
      console.log(
        `\n📍 Regenerating ${i + 1}/${commandsToRegenerate.length} - ID: ${
          command.id
        }`
      );

      try {
        // Backup existing image if it exists
        const existingImagePath = path.join(
          this.imagesDir,
          `jesus-command-${command.id}.jpg`
        );
        try {
          await fs.access(existingImagePath);
          const backupPath = path.join(
            backupDir,
            `jesus-command-${command.id}-backup-${Date.now()}.jpg`
          );
          await fs.copyFile(existingImagePath, backupPath);
          console.log(
            `💾 Backed up existing image to: ${path.basename(backupPath)}`
          );
        } catch {
          console.log(`ℹ️  No existing image found for ID ${command.id}`);
        }

        // Generate new image
        const imagePath = await this.generateImage(
          command.image_prompt,
          command.id
        );

        results.push({ id: command.id, success: true });
        successCount++;
        console.log(`✅ Successfully regenerated ID ${command.id}`);

        // Add a small delay between requests to be respectful to the API
        if (i < commandsToRegenerate.length - 1) {
          console.log("⏳ Waiting 3 seconds before next request...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to regenerate ID ${command.id}:`, error);

        results.push({ id: command.id, success: false, error: errorMessage });
        errorCount++;
      }
    }

    // Read the current updated JSON or create from original
    let updatedJsonPath = path.join(
      this.assetsDir,
      "jesus_commands_updated.json"
    );
    let updatedCommands: JesusCommand[];

    try {
      const updatedContent = await fs.readFile(updatedJsonPath, "utf-8");
      updatedCommands = JSON.parse(updatedContent);
    } catch {
      // If updated JSON doesn't exist, use original
      updatedCommands = [...commands];
      console.log(
        "ℹ️  Using original JSON as base (updated version not found)"
      );
    }

    // Update only the successfully regenerated images
    for (const result of results) {
      if (result.success) {
        const commandIndex = updatedCommands.findIndex(
          (cmd) => cmd.id === result.id
        );
        if (commandIndex !== -1) {
          updatedCommands[
            commandIndex
          ].imageUrl = `./assets/images/jesus-commands/jesus-command-${result.id}.jpg`;
        }
      }
    }

    // Save updated JSON
    await fs.writeFile(
      updatedJsonPath,
      JSON.stringify(updatedCommands, null, 2)
    );

    console.log("\n🎉 Selective regeneration complete!");
    console.log(`✅ Successfully regenerated: ${successCount} images`);
    console.log(`❌ Failed: ${errorCount} images`);

    if (successCount > 0) {
      console.log(`💾 Updated JSON saved to: jesus_commands_updated.json`);
      console.log(
        `💾 Backup images saved to: assets/images/jesus-commands/backup/`
      );
    }

    // Show detailed results
    if (results.length > 0) {
      console.log("\n📋 Detailed Results:");
      for (const result of results) {
        if (result.success) {
          console.log(`   ✅ ID ${result.id}: Success`);
        } else {
          console.log(`   ❌ ID ${result.id}: Failed - ${result.error}`);
        }
      }
    }
  }
}

// Main execution
async function main() {
  const apiKey = process.env.BFL_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: BFL_API_KEY environment variable is required");
    console.log(
      'Please set your API key: export BFL_API_KEY="your_api_key_here"'
    );
    process.exit(1);
  }

  // Determine which IDs to use - prioritize manual array
  let targetIds: string[];
  let inputMethod: string;

  if (MANUAL_IDS.length > 0) {
    // Use manual array from the top of the file
    targetIds = MANUAL_IDS.map((id) => id.toString());
    inputMethod = "📝 Manual Array";
    console.log("🎯 Using manual array from script file");
  } else {
    // Fall back to command line arguments
    targetIds = process.argv.slice(2);
    inputMethod = "💻 Command Line";

    if (targetIds.length === 0) {
      console.error("❌ Error: No IDs provided");
      console.log("\n🔧 Two ways to provide IDs:");
      console.log(
        "\n1️⃣  Edit the script file and add IDs to MANUAL_IDS array:"
      );
      console.log("   const MANUAL_IDS: number[] = [6, 8, 10, 17, 18, 20];");
      console.log("\n2️⃣  Or provide IDs as command line arguments:");
      console.log("   bun run regenerate-specific 1 5 10 25");
      process.exit(1);
    }
    console.log("🎯 Using command line arguments");
  }

  console.log(`📊 Input Method: ${inputMethod}`);
  console.log(`🔢 Total IDs: ${targetIds.length}`);
  console.log(`🎯 Regenerating images for IDs: ${targetIds.join(", ")}`);

  const projectRoot = process.cwd().replace("/scripts", ""); // Go back to project root
  const regenerator = new FluxImageRegenerator(apiKey, projectRoot);

  try {
    await regenerator.regenerateSpecificImages(targetIds);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { FluxImageRegenerator };
